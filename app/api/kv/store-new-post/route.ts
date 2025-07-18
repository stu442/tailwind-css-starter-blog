import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

interface PostData {
  title: string
  slug: string
  date: string
  summary: string
}

interface StoreRequest {
  posts: PostData[]
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
    // GitHub Actions에서의 인증 확인
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.WEBHOOK_SECRET

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: '인증되지 않은 요청입니다.' }, { status: 401 })
    }

    const body: StoreRequest = await request.json()
    const { posts } = body

    if (!posts || posts.length === 0) {
      return NextResponse.json({ error: '저장할 글 정보가 없습니다.' }, { status: 400 })
    }

    const timestamp = Date.now()
    const kvKey = `pending-posts:${timestamp}`

    // Redis에 새 글 정보 저장
    const kvData = {
      posts,
      createdAt: timestamp,
      status: 'pending',
    }

    // 1시간 후 자동 삭제되도록 설정
    await redis.set(kvKey, kvData, { ex: 3600 })

    console.log(`새 글 정보가 Redis에 저장되었습니다: ${kvKey}`)
    console.log('저장된 글들:', posts.map((p) => p.title).join(', '))

    return NextResponse.json({
      success: true,
      message: `${posts.length}개의 새 글 정보가 Redis에 저장되었습니다.`,
      key: kvKey,
      postsCount: posts.length,
      posts: posts.map((p) => ({ title: p.title, slug: p.slug })),
    })
  } catch (error) {
    console.error('Redis 저장 중 오류:', error)
    return NextResponse.json(
      {
        error: 'Redis 저장 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

// GET 요청으로 저장된 pending posts 조회
export async function GET() {
  try {
    // pending-posts로 시작하는 모든 키 조회
    const keys = await redis.keys('pending-posts:*')

    if (keys.length === 0) {
      return NextResponse.json({
        pendingPosts: [],
        count: 0,
      })
    }

    // 각 키에 대한 데이터 조회
    const pendingPosts: (KVData & { key: string })[] = []
    for (const key of keys) {
      const data = (await redis.get(key)) as KVData
      if (data) {
        pendingPosts.push({
          key,
          ...data,
        })
      }
    }

    return NextResponse.json({
      pendingPosts,
      count: pendingPosts.length,
    })
  } catch (error) {
    console.error('Redis 조회 중 오류:', error)
    return NextResponse.json({ error: 'Redis 조회 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
