import { readFileSync } from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import { render } from '@react-email/render'
import siteMetadata from '../data/siteMetadata.js'
import { resend } from '../lib/resend.js'
import NewPostEmail from '../components/emails/NewPostEmail.js'

const feedUrl = new URL('feed.xml', siteMetadata.siteUrl).href
const localFeedPath = path.join('public', 'feed.xml')

function parseFeed(xml) {
  const items = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1]
    const guid = (block.match(/<guid>(.*?)<\/guid>/) || [])[1]
    const link = (block.match(/<link>(.*?)<\/link>/) || [])[1]
    const title = (block.match(/<title>(.*?)<\/title>/) || [])[1]
    const pubDate = (block.match(/<pubDate>(.*?)<\/pubDate>/) || [])[1]
    items.push({ guid, link, title, pubDate })
  }
  return items
}

async function getPreviousFeed() {
  try {
    const res = await fetch(feedUrl)
    if (!res.ok) throw new Error(`Failed to fetch ${feedUrl}`)
    return await res.text()
  } catch (err) {
    console.error('Could not fetch previous feed:', err)
    return ''
  }
}

async function sendEmail(post, recipients) {
  const html = render(NewPostEmail({ title: post.title, link: post.link }))
  await resend.emails.send({
    from: siteMetadata.email,
    to: recipients,
    subject: `[새 글] ${post.title}`,
    html,
  })
}

async function notifyNewPosts() {
  const prevXml = await getPreviousFeed()
  const prevItems = parseFeed(prevXml)
  const prevGuids = new Set(prevItems.map((i) => i.guid))

  const newXml = readFileSync(localFeedPath, 'utf8')
  const newItems = parseFeed(newXml)
  const newPosts = newItems.filter((i) => !prevGuids.has(i.guid))

  if (newPosts.length === 0) {
    console.log('No new posts found.')
    return
  }

  const audienceId = process.env.RESEND_AUDIENCE_ID
  if (!audienceId) {
    console.warn('RESEND_AUDIENCE_ID not set. Skipping email notifications.')
    return
  }

  const { data: contacts } = await resend.contacts.list({ audienceId })
  const emails = contacts.map((c) => c.email)

  for (const post of newPosts) {
    await sendEmail(post, emails)
    console.log(`Sent notification for ${post.title}`)
  }
}

export default notifyNewPosts
