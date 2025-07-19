import * as React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
  Img,
} from '@react-email/components'

interface NewPostNotificationProps {
  postTitle: string
  postSummary: string
  postUrl: string
  postDate: string
  unsubscribeUrl: string
  blogName?: string
  authorName?: string
}

export default function NewPostNotification({
  postTitle = '새로운 블로그 글이 발행되었습니다',
  postSummary = '새로운 글이 발행되었습니다. 지금 확인해보세요!',
  postUrl = 'https://frogsoo.vercel.app/',
  postDate = new Date().toLocaleDateString('ko-KR'),
  unsubscribeUrl = 'https://frogsoo.vercel.app/unsubscribe',
  blogName = '@dev_frogsoo.blog',
  authorName = 'dev_frogsoo',
}: NewPostNotificationProps) {
  const previewText = `${postTitle} - ${blogName}`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src="https://frogsoo.vercel.app/static/images/logo.png"
              width="40"
              height="40"
              alt={blogName}
              style={logo}
            />
            <Heading style={h1}>{blogName}</Heading>
          </Section>

          <Section style={content}>
            <Heading style={h2}>🎉 새로운 글이 발행되었습니다!</Heading>
            
            <Text style={postInfo}>
              <strong>제목:</strong> {postTitle}
            </Text>
            
            <Text style={postInfo}>
              <strong>작성일:</strong> {postDate}
            </Text>
            
            <Text style={summary}>
              {postSummary}
            </Text>

            <Section style={buttonContainer}>
              <Link href={postUrl} style={button}>
                글 읽어보기
              </Link>
            </Section>

            <Hr style={hr} />
            
            <Text style={footer}>
              안녕하세요! {authorName}입니다.<br />
              새로운 글을 발행했으니 한번 읽어보시면 좋을 것 같아요.
            </Text>
          </Section>

          <Section style={unsubscribeSection}>
            <Hr style={hr} />
            <Text style={unsubscribeText}>
              더 이상 이메일을 받고 싶지 않으시다면{' '}
              <Link href={unsubscribeUrl} style={unsubscribeLink}>
                여기서 구독을 취소
              </Link>
              하실 수 있습니다.
            </Text>
            <Text style={addressText}>
              {blogName} • {authorName} • stu44229@gmail.com
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const header = {
  padding: '32px 0',
  textAlign: 'center' as const,
}

const logo = {
  margin: '0 auto',
  marginBottom: '16px',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
  padding: '0',
}

const content = {
  padding: '0 48px',
}

const h2 = {
  color: '#333',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 24px 0',
}

const postInfo = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0 0 12px 0',
}

const summary = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '24px 0',
  padding: '16px',
  backgroundColor: '#f8f9fa',
  borderRadius: '6px',
  border: '1px solid #e9ecef',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#0066cc',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
}

const hr = {
  borderColor: '#e6e6e6',
  margin: '20px 0',
}

const footer = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '16px 0',
}

const unsubscribeSection = {
  padding: '0 48px',
}

const unsubscribeText = {
  color: '#666',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '16px 0 8px 0',
  textAlign: 'center' as const,
}

const unsubscribeLink = {
  color: '#0066cc',
  textDecoration: 'underline',
}

const addressText = {
  color: '#999',
  fontSize: '11px',
  lineHeight: '16px',
  margin: '8px 0 0 0',
  textAlign: 'center' as const,
}