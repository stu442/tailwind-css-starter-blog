import { NextRequest, NextResponse } from 'next/server'
import { resend, generateUnsubscribeUrl } from '@/lib/resend'
import { render } from '@react-email/render'
import NewPostNotification from '../../../../emails/NewPostNotification'

interface PostData {
  title: string
  slug: string
  date: string
  summary: string
}

interface NotifyRequest {
  posts: PostData[]
  testEmail?: string // 테스트용 이메일 주소
  source?: string // 호출 소스 (build-hook 등)
}

export async function POST(request: NextRequest) {
  try {
    // GitHub Actions에서의 인증 확인
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.WEBHOOK_SECRET

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: '인증되지 않은 요청입니다.' }, { status: 401 })
    }

    const body: NotifyRequest = await request.json()
    const { posts, testEmail, source } = body

    if (!posts || posts.length === 0) {
      return NextResponse.json({ error: '발송할 글 정보가 없습니다.' }, { status: 400 })
    }

    const audienceId = process.env.RESEND_AUDIENCE_ID
    if (!audienceId) {
      return NextResponse.json(
        { error: 'RESEND_AUDIENCE_ID가 설정되지 않았습니다.' },
        { status: 500 }
      )
    }

    // 테스트 모드인 경우
    if (testEmail) {
      return await sendTestEmail(posts[0], testEmail)
    }

    // 구독자 목록 가져오기
    const subscribersResponse = await resend.contacts.list({
      audienceId,
    })

    const subscribers = subscribersResponse.data
    if (!subscribers || !Array.isArray(subscribers) || subscribers.length === 0) {
      return NextResponse.json({
        success: true,
        message: '구독자가 없어서 이메일을 발송하지 않았습니다.',
        sentCount: 0,
      })
    }
    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    // 각 새 글에 대해 이메일 발송
    for (const post of posts) {
      console.log(`글 "${post.title}"에 대한 이메일 발송 시작... (소스: ${source || 'unknown'})`)

      // 각 구독자에게 개별 이메일 발송
      for (const subscriber of subscribers) {
        try {
          await sendNotificationEmail(post, subscriber.email)
          successCount++
        } catch (error) {
          errorCount++
          const errorMessage = `${subscriber.email}: ${error instanceof Error ? error.message : String(error)}`
          errors.push(errorMessage)
          console.error(`이메일 발송 실패 - ${errorMessage}`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `이메일 발송 완료`,
      sentCount: successCount,
      errorCount,
      totalPosts: posts.length,
      totalSubscribers: subscribers.length,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined, // 처음 10개 에러만 반환
    })
  } catch (error) {
    console.error('이메일 발송 중 오류:', error)
    return NextResponse.json(
      {
        error: '이메일 발송 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

async function sendNotificationEmail(post: PostData, email: string) {
  const unsubscribeUrl = generateUnsubscribeUrl(email, 'https://frogsoo.vercel.app')

  // 날짜 포맷팅
  const postDate = post.date
    ? new Date(post.date).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

  // 블로그 글 URL 생성
  const postUrl = `https://frogsoo.vercel.app/blog/${post.slug}`

  // React 컴포넌트를 HTML로 렌더링
  const emailHtml = await render(
    NewPostNotification({
      postTitle: post.title,
      postSummary: post.summary || '새로운 글이 발행되었습니다.',
      postUrl,
      postDate,
      unsubscribeUrl,
      blogName: '@dev_frogsoo.blog',
      authorName: 'dev_frogsoo',
    })
  )

  // 이메일 발송
  const response = await resend.emails.send({
    from: 'dev_frogsoo <noreply@frogsoo.vercel.app>',
    to: email,
    subject: `📝 새 글: ${post.title}`,
    html: emailHtml,
  })

  if (!response.data) {
    throw new Error(`이메일 발송 실패: ${response.error?.message || '알 수 없는 오류'}`)
  }

  return response
}

async function sendTestEmail(post: PostData, testEmail: string) {
  try {
    await sendNotificationEmail(post, testEmail)

    return NextResponse.json({
      success: true,
      message: `테스트 이메일이 ${testEmail}로 발송되었습니다.`,
      sentCount: 1,
      testMode: true,
    })
  } catch (error) {
    console.error('테스트 이메일 발송 실패:', error)
    return NextResponse.json(
      {
        error: '테스트 이메일 발송에 실패했습니다.',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

// GET 요청으로 구독자 수 확인
export async function GET() {
  try {
    const audienceId = process.env.RESEND_AUDIENCE_ID
    if (!audienceId) {
      return NextResponse.json(
        { error: 'RESEND_AUDIENCE_ID가 설정되지 않았습니다.' },
        { status: 500 }
      )
    }

    const response = await resend.contacts.list({
      audienceId,
    })

    const subscribers = response.data
    const subscriberCount = Array.isArray(subscribers) ? subscribers.length : 0

    return NextResponse.json({
      subscriberCount,
      subscribers: subscribers || [],
    })
  } catch (error) {
    console.error('구독자 정보 조회 중 오류:', error)
    return NextResponse.json({ error: '구독자 정보를 가져올 수 없습니다.' }, { status: 500 })
  }
}
