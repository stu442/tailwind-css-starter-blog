import { NextRequest, NextResponse } from 'next/server'
import { addContactToAudience, generateUnsubscribeUrl } from '@/lib/resend'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Add contact to Resend audience
    const audienceId = process.env.RESEND_AUDIENCE_ID

    if (!audienceId) {
      return NextResponse.json({ error: 'Audience ID is not configured' }, { status: 500 })
    }

    try {
      const response = await addContactToAudience(email, audienceId)

      if (response.error) {
        // Check if error is because contact already exists
        if (
          response.error.message?.includes('already exists') ||
          response.error.message?.includes('duplicate')
        ) {
          return NextResponse.json({ error: 'Email already subscribed' }, { status: 400 })
        }

        console.error('Resend API error:', response.error)
        return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
      }

      // Generate unsubscribe URL
      const baseUrl = req.nextUrl.origin
      const unsubscribeUrl = generateUnsubscribeUrl(email, baseUrl)

      return NextResponse.json(
        {
          message: 'Successfully subscribed',
          unsubscribeUrl,
        },
        { status: 200 }
      )
    } catch (error: unknown) {
      console.error('Error subscribing email:', error)

      // Handle specific Resend errors
      if (
        error instanceof Error &&
        (error.message?.includes('already exists') || error.message?.includes('duplicate'))
      ) {
        return NextResponse.json({ error: 'Email already subscribed' }, { status: 400 })
      }

      return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error processing request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Newsletter subscription endpoint' })
}
