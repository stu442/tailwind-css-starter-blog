import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

interface PostData {
  title: string
  slug: string
  date: string
  summary: string
}

interface KVData {
  posts: PostData[]
  createdAt: number
  status: string
}

// Redis 클라이언트 초기화
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function POST(request: NextRequest) {
  try {
    console.log('Build Hook 실행됨 - 새 글 이메일 알림 처리 시작')

    // 1. Redis에서 pending 상태의 새 글들 조회
    const pendingPosts = await getAllPendingPosts()

    if (pendingPosts.length === 0) {
      console.log('처리할 새 글이 없습니다.')
      return NextResponse.json({
        success: true,
        message: '처리할 새 글이 없습니다.',
        processedCount: 0,
      })
    }

    console.log(
      `${pendingPosts.length}개의 새 글 발견:`,
      pendingPosts.map((p) => p.title).join(', ')
    )

    // 2. 이메일 발송 API 호출
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://frogsoo.vercel.app'

    const response = await fetch(`${baseUrl}/api/newsletter/notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.WEBHOOK_SECRET}`,
      },
      body: JSON.stringify({
        posts: pendingPosts,
        source: 'build-hook',
      }),
    })

    const emailResult = await response.json()

    if (!response.ok) {
      console.error('이메일 발송 실패:', emailResult)
      return NextResponse.json(
        {
          success: false,
          error: '이메일 발송 실패',
          details: emailResult,
        },
        { status: 500 }
      )
    }

    console.log('이메일 발송 성공:', emailResult)

    // 3. 처리된 글들을 Redis에서 삭제
    await cleanupProcessedPosts()

    return NextResponse.json({
      success: true,
      message: `${pendingPosts.length}개의 새 글에 대한 이메일 알림이 발송되었습니다.`,
      processedCount: pendingPosts.length,
      emailResult,
    })
  } catch (error) {
    console.error('Build Hook 처리 중 오류:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Build Hook 처리 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

async function getAllPendingPosts(): Promise<PostData[]> {
  try {
    // pending-posts로 시작하는 모든 키 조회
    const keys = await redis.keys('pending-posts:*')

    if (keys.length === 0) {
      return []
    }

    // 각 키에 대한 데이터 조회 및 합치기
    const allPosts: PostData[] = []
    const cutoffTime = Date.now() - 30 * 60 * 1000 // 30분 전까지만 처리

    for (const key of keys) {
      const data = (await redis.get(key)) as KVData
      if (data && data.status === 'pending' && data.createdAt > cutoffTime) {
        allPosts.push(...data.posts)
      }
    }

    return allPosts
  } catch (error) {
    console.error('Pending posts 조회 중 오류:', error)
    return []
  }
}

async function cleanupProcessedPosts(): Promise<void> {
  try {
    // pending-posts로 시작하는 모든 키 삭제
    const keys = await redis.keys('pending-posts:*')

    if (keys.length > 0) {
      // 각 키를 개별적으로 삭제
      for (const key of keys) {
        await redis.del(key)
      }
      console.log(`${keys.length}개의 처리된 글 정보를 Redis에서 삭제했습니다.`)
    }
  } catch (error) {
    console.error('Redis 정리 중 오류:', error)
  }
}

// GET 요청으로 현재 pending posts 상태 확인
export async function GET() {
  try {
    const pendingPosts = await getAllPendingPosts()

    return NextResponse.json({
      pendingPostsCount: pendingPosts.length,
      pendingPosts: pendingPosts.map((p) => ({ title: p.title, slug: p.slug })),
    })
  } catch (error) {
    console.error('Pending posts 조회 중 오류:', error)
    return NextResponse.json(
      { error: 'Pending posts 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
