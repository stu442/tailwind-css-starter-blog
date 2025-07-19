#!/usr/bin/env node

import dotenv from 'dotenv'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// .env 파일 로드
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 환경변수 확인
function checkEnvVars() {
  const required = ['RESEND_API_KEY', 'RESEND_AUDIENCE_ID']
  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    console.error('❌ 필수 환경변수가 설정되지 않았습니다:')
    missing.forEach((key) => console.error(`   - ${key}`))
    process.exit(1)
  }
}

// 블로그 글 목록 가져오기
async function getAllPosts() {
  try {
    // Contentlayer 데이터 파일 읽기
    const contentlayerPath = join(__dirname, '../.contentlayer/generated/Blog/_index.json')
    const data = readFileSync(contentlayerPath, 'utf8')
    const posts = JSON.parse(data)

    return posts
      .filter((post) => !post.draft) // 초안 제외
      .sort((a, b) => new Date(b.date) - new Date(a.date)) // 최신순 정렬
      .map((post) => ({
        title: post.title,
        slug: post.slug,
        date: post.date,
        summary: post.summary || '',
      }))
  } catch (error) {
    console.error('❌ 블로그 글 목록을 가져오지 못했습니다:', error.message)
    console.error('   💡 먼저 "yarn build"를 실행해서 Contentlayer 데이터를 생성하세요.')
    process.exit(1)
  }
}

// 글 찾기 (slug 또는 제목으로)
function findPost(posts, query) {
  // slug로 정확히 매칭
  let post = posts.find((p) => p.slug === query)
  if (post) return post

  // 제목으로 부분 매칭 (대소문자 무시)
  const lowerQuery = query.toLowerCase()
  post = posts.find((p) => p.title.toLowerCase().includes(lowerQuery))
  if (post) return post

  return null
}

// 구독자 목록 가져오기
async function getSubscribers() {
  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    const response = await resend.contacts.list({
      audienceId: process.env.RESEND_AUDIENCE_ID,
    })

    // Resend API 응답 구조: { data: { object: 'list', data: [...] }, error: null }
    const subscribers = response.data?.data

    if (!subscribers || !Array.isArray(subscribers)) {
      throw new Error('구독자 데이터를 가져오지 못했습니다.')
    }

    return subscribers
  } catch (error) {
    console.error('❌ 구독자 목록 조회 실패:', error.message)
    process.exit(1)
  }
}

// 언구독 URL 생성
function generateUnsubscribeUrl(email, baseUrl = 'https://frogsoo.vercel.app') {
  const encodedEmail = encodeURIComponent(email)
  return `${baseUrl}/unsubscribe?email=${encodedEmail}`
}

// 이메일 HTML 생성 (React Email 컴포넌트 사용)
async function generateEmailHtml(post, email) {
  const unsubscribeUrl = generateUnsubscribeUrl(email)

  // 날짜 포맷팅
  const postDate = new Date(post.date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // 블로그 글 URL 생성
  const postUrl = `https://frogsoo.vercel.app/blog/${post.slug}`

  try {
    // tsx 파일을 동적으로 import하여 컴포넌트 로드
    const NewPostNotificationModule = await import('../emails/NewPostNotification.tsx')
    const NewPostNotification = NewPostNotificationModule.default

    // React Email 컴포넌트를 HTML로 렌더링
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

    return emailHtml
  } catch (error) {
    console.error('React Email 컴포넌트 로드 실패:', error.message)

    // React Email 컴포넌트 로드에 실패할 경우 fallback HTML 생성
    return generateFallbackEmailHtml(post, postUrl, postDate, unsubscribeUrl)
  }
}

// Fallback HTML 이메일 템플릿 (React Email 컴포넌트 로드 실패 시 사용)
function generateFallbackEmailHtml(post, postUrl, postDate, unsubscribeUrl) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>새 글: ${post.title}</title>
</head>
<body style="font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif; background-color: #ffffff; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; padding: 32px 0;">
      <img src="https://frogsoo.vercel.app/static/images/logo.png" width="40" height="40" alt="@dev_frogsoo.blog" style="margin-bottom: 16px;">
      <h1 style="color: #333; font-size: 24px; font-weight: bold; margin: 0;">@dev_frogsoo.blog</h1>
    </div>
    
    <div style="padding: 0 48px;">
      <h2 style="color: #333; font-size: 20px; font-weight: bold; margin: 0 0 24px 0;">🎉 새로운 글이 발행되었습니다!</h2>
      
      <p style="color: #666; font-size: 14px; line-height: 24px; margin: 0 0 12px 0;">
        <strong>제목:</strong> ${post.title}
      </p>
      
      <p style="color: #666; font-size: 14px; line-height: 24px; margin: 0 0 12px 0;">
        <strong>작성일:</strong> ${postDate}
      </p>
      
      <div style="color: #333; font-size: 16px; line-height: 26px; margin: 24px 0; padding: 16px; background-color: #f8f9fa; border-radius: 6px; border: 1px solid #e9ecef;">
        ${post.summary || '새로운 글이 발행되었습니다.'}
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${postUrl}" style="background-color: #0066cc; border-radius: 5px; color: #fff; font-size: 16px; font-weight: bold; text-decoration: none; display: inline-block; padding: 12px 32px;">
          글 읽어보기
        </a>
      </div>

      <hr style="border-color: #e6e6e6; margin: 20px 0;">
      
      <p style="color: #666; font-size: 14px; line-height: 24px; margin: 16px 0;">
        안녕하세요! dev_frogsoo입니다.<br>
        새로운 글을 발행했으니 한번 읽어보시면 좋을 것 같아요.
      </p>
    </div>

    <div style="padding: 0 48px;">
      <hr style="border-color: #e6e6e6; margin: 20px 0;">
      <p style="color: #666; font-size: 12px; line-height: 20px; margin: 16px 0 8px 0; text-align: center;">
        더 이상 이메일을 받고 싶지 않으시다면 
        <a href="${unsubscribeUrl}" style="color: #0066cc; text-decoration: underline;">여기서 구독을 취소</a>
        하실 수 있습니다.
      </p>
      <p style="color: #999; font-size: 11px; line-height: 16px; margin: 8px 0 0 0; text-align: center;">
        @dev_frogsoo.blog • dev_frogsoo • stu44229@gmail.com
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

// 이메일 발송
async function sendNotificationEmail(post, email, isTest = false) {
  const resend = new Resend(process.env.RESEND_API_KEY)

  // React Email 컴포넌트로 HTML 생성
  const emailHtml = await generateEmailHtml(post, email)

  // 이메일 발송
  const response = await resend.emails.send({
    from: 'dev_frogsoo <noreply@frogsoo.vercel.app>',
    to: email,
    subject: `${isTest ? '[테스트] ' : ''}📝 새 글: ${post.title}`,
    html: emailHtml,
  })

  if (!response.data) {
    throw new Error(`이메일 발송 실패: ${response.error?.message || '알 수 없는 오류'}`)
  }

  return response
}

// 글 목록 출력
function listPosts(posts) {
  console.log('\n📝 블로그 글 목록:')
  console.log(''.padEnd(60, '─'))

  posts.slice(0, 10).forEach((post, index) => {
    const date = new Date(post.date).toLocaleDateString('ko-KR')
    console.log(`${(index + 1).toString().padStart(2)}. ${post.title} (${post.slug})`)
    console.log(`    📅 ${date}`)
    if (post.summary) {
      console.log(`    💭 ${post.summary.slice(0, 60)}${post.summary.length > 60 ? '...' : ''}`)
    }
    console.log('')
  })

  if (posts.length > 10) {
    console.log(`... 그 외 ${posts.length - 10}개 글이 더 있습니다.`)
  }
}

// 구독자 목록 출력
function listSubscribers(subscribers) {
  console.log('👥 구독자 목록:')
  console.log(''.padEnd(60, '─'))
  const activeCount = subscribers.filter((s) => !s.unsubscribed).length
  console.log(`📊 총 구독자 수: ${subscribers.length}명 (활성: ${activeCount}명)
`)

  if (subscribers.length === 0) {
    console.log('구독자가 없습니다.')
    return
  }

  subscribers.forEach((subscriber, index) => {
    const createdDate = subscriber.created_at
      ? new Date(subscriber.created_at).toLocaleDateString('ko-KR')
      : '알 수 없음'

    const status = subscriber.unsubscribed ? '❌ 구독 취소' : '✅ 구독 중'

    console.log(`${(index + 1).toString().padStart(3)}. ${subscriber.email}`)
    console.log(`     ${status}`)
    console.log(`     📅 구독일: ${createdDate}`)
    if (subscriber.first_name || subscriber.last_name) {
      const name = [subscriber.first_name, subscriber.last_name].filter(Boolean).join(' ')
      console.log(`     👤 이름: ${name}`)
    }
    console.log('')
  })
}

// 이메일 미리보기 생성
async function generateEmailPreview(post) {
  const testEmail = 'preview@example.com'
  const emailHtml = await generateEmailHtml(post, testEmail)

  // 임시 디렉토리 생성 (없으면)
  const tempDir = join(__dirname, '../.temp')
  try {
    await import('fs').then(({ mkdirSync }) => {
      mkdirSync(tempDir, { recursive: true })
    })
  } catch (error) {
    // 디렉토리가 이미 존재하거나 생성에 실패해도 계속 진행
  }

  // 타임스탬프를 포함한 고유 파일명 생성
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('.')[0]
  const filename = `newsletter-preview-${timestamp}.html`
  const previewPath = join(tempDir, filename)

  // 미리보기 파일 저장
  writeFileSync(previewPath, emailHtml, 'utf8')

  console.log('📧 이메일 미리보기가 생성되었습니다!')
  console.log(`📁 파일 위치: ${previewPath}`)
  console.log(`📝 글 제목: "${post.title}"`)
  console.log('🌐 브라우저에서 파일을 열어 확인하세요.')

  // macOS에서 자동으로 브라우저 열기
  try {
    const { spawn } = await import('child_process')
    spawn('open', [previewPath], { stdio: 'ignore' })
    console.log('🚀 기본 브라우저에서 미리보기를 열었습니다.')
  } catch (error) {
    console.log('💡 수동으로 브라우저에서 파일을 여세요.')
  }

  // 7일 이상 된 오래된 미리보기 파일들 정리
  await cleanupOldPreviewFiles(tempDir)
}

// 오래된 미리보기 파일 정리
async function cleanupOldPreviewFiles(tempDir) {
  try {
    const { readdirSync, statSync, unlinkSync } = await import('fs')
    const files = readdirSync(tempDir)
    const now = Date.now()
    const weekAgo = 7 * 24 * 60 * 60 * 1000 // 7일을 밀리초로

    let cleanedCount = 0
    files.forEach((file) => {
      if (file.startsWith('newsletter-preview-')) {
        const filePath = join(tempDir, file)
        const stats = statSync(filePath)
        if (now - stats.mtime.getTime() > weekAgo) {
          unlinkSync(filePath)
          cleanedCount++
        }
      }
    })

    if (cleanedCount > 0) {
      console.log(`🧹 ${cleanedCount}개의 오래된 미리보기 파일을 정리했습니다.`)
    }
  } catch (error) {
    // 정리 실패 시 조용히 무시 (중요하지 않은 기능)
  }
}

// 메인 함수
async function main() {
  const args = process.argv.slice(2)

  // 도움말
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
📧 뉴스레터 발송 도구

사용법:
  yarn newsletter:send <글제목|slug>        # 뉴스레터 발송
  yarn newsletter:list                      # 글 목록 보기
  yarn newsletter:subscribers               # 구독자 목록 보기  
  yarn newsletter:help                      # 도움말 보기
  yarn newsletter:send <글> --test <이메일>   # 테스트 발송
  yarn newsletter:send <글> --preview       # 이메일 미리보기
  yarn newsletter:dev                       # React Email 개발 서버

예시:
  yarn newsletter:send "cute-go"            # slug로 발송
  yarn newsletter:send "귀여운 Go 언어"      # 제목으로 검색해서 발송
  yarn newsletter:list                      # 블로그 글 목록
  yarn newsletter:subscribers               # 구독자 목록
  yarn newsletter:send cute-go --test test@example.com  # 테스트 발송
  yarn newsletter:send cute-go --preview    # 이메일 미리보기
  yarn newsletter:dev                       # React Email 개발 서버 실행

환경변수:
  RESEND_API_KEY      - Resend API 키
  RESEND_AUDIENCE_ID  - 구독자 목록 ID
`)
    return
  }

  // 글 목록 보기 (환경변수 없어도 가능)
  if (args.includes('--list')) {
    const posts = await getAllPosts()
    listPosts(posts)
    return
  }

  // 구독자 목록 보기 (환경변수 필요)
  if (args.includes('--subscribers')) {
    checkEnvVars()
    console.log('👥 구독자 목록 조회 중...')
    const subscribers = await getSubscribers()
    listSubscribers(subscribers)
    return
  }

  // 발송할 글 찾기
  const query = args[0]
  if (!query) {
    console.error('❌ 발송할 글을 지정해주세요.')
    console.log('   💡 "yarn newsletter:send --help"로 사용법을 확인하세요.')
    process.exit(1)
  }

  const posts = await getAllPosts()
  const post = findPost(posts, query)

  if (!post) {
    console.error(`❌ "${query}"와 일치하는 글을 찾을 수 없습니다.`)
    console.log('\n💡 사용 가능한 글 목록:')
    listPosts(posts)
    process.exit(1)
  }

  // 미리보기 생성
  if (args.includes('--preview')) {
    console.log(`🎨 "${post.title}" 이메일 미리보기 생성 중...`)
    try {
      await generateEmailPreview(post)
    } catch (error) {
      console.error('❌ 미리보기 생성 실패:', error.message)
      process.exit(1)
    }
    return
  }

  // 환경변수 체크 (실제 발송이나 테스트 발송 시에만 필요)
  checkEnvVars()

  // 테스트 발송
  const testIndex = args.indexOf('--test')
  if (testIndex !== -1 && args[testIndex + 1]) {
    const testEmail = args[testIndex + 1]
    console.log(`📧 테스트 이메일 발송 중... (${testEmail})`)

    try {
      await sendNotificationEmail(post, testEmail, true)
      console.log('✅ 테스트 이메일이 성공적으로 발송되었습니다!')
    } catch (error) {
      console.error('❌ 테스트 이메일 발송 실패:', error.message)
      process.exit(1)
    }
    return
  }

  // 실제 발송
  console.log(`📧 선택된 글: "${post.title}" (${post.slug})`)
  console.log(`📅 발행일: ${new Date(post.date).toLocaleDateString('ko-KR')}`)
  if (post.summary) {
    console.log(`💭 요약: ${post.summary}`)
  }

  // 구독자 목록 가져오기
  console.log('\n👥 구독자 목록 조회 중...')
  const allSubscribers = await getSubscribers()

  if (allSubscribers.length === 0) {
    console.log('⚠️  구독자가 없어서 이메일을 발송하지 않습니다.')
    return
  }

  const activeSubscribers = allSubscribers.filter((s) => !s.unsubscribed)

  if (activeSubscribers.length === 0) {
    console.log(`⚠️  활성 구독자가 없어서 이메일을 발송하지 않습니다. (총 ${allSubscribers.length}명 중)`)
    return
  }

  console.log(`📊 총 구독자 수: ${allSubscribers.length}명 (실제 발송 대상: ${activeSubscribers.length}명)`)

  // 확인 요청
  console.log('\n⚠️  실제로 모든 구독자에게 뉴스레터를 발송하시겠습니까?')
  console.log('   계속하려면 "yes"를 입력하세요.')

  const readline = await import('readline')
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  const answer = await new Promise((resolve) => {
    rl.question('> ', resolve)
  })
  rl.close()

  if (answer.toLowerCase() !== 'yes') {
    console.log('❌ 발송이 취소되었습니다.')
    return
  }

  // 이메일 발송
  console.log('\n📧 뉴스레터 발송 중...')
  let successCount = 0
  let errorCount = 0
  const errors = []

  for (const subscriber of activeSubscribers) {
    try {
      await sendNotificationEmail(post, subscriber.email)
      successCount++
      process.stdout.write(`✅ ${successCount}/${activeSubscribers.length}\r`)
    } catch (error) {
      errorCount++
      const errorMessage = `${subscriber.email}: ${error.message}`
      errors.push(errorMessage)
      process.stdout.write(`❌ 실패: ${errorCount}, 성공: ${successCount}/${activeSubscribers.length}\r`)
    }
  }

  console.log('\n')
  console.log('📊 발송 완료!')
  console.log(`   ✅ 성공: ${successCount}개`)
  console.log(`   ❌ 실패: ${errorCount}개`)

  if (errors.length > 0 && errors.length <= 5) {
    console.log('\n❌ 실패한 이메일들:')
    errors.forEach((error) => console.log(`   - ${error}`))
  }

  if (successCount > 0) {
    console.log('\n🎉 뉴스레터 발송이 완료되었습니다!')
  }
}

// 스크립트 실행
main().catch((error) => {
  console.error('💥 예상치 못한 오류가 발생했습니다:', error.message)
  process.exit(1)
})
