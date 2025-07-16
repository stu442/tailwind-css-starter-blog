import { NextRequest, NextResponse } from 'next/server'
import { removeContactFromAudience } from '@/lib/resend'

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

    // Remove contact from Resend audience
    const audienceId = process.env.RESEND_AUDIENCE_ID

    if (!audienceId) {
      return NextResponse.json({ error: 'Audience ID is not configured' }, { status: 500 })
    }

    try {
      const response = await removeContactFromAudience(email, audienceId)

      if (response.error) {
        // Check if error is because contact doesn't exist
        if (
          response.error.message?.includes('not found') ||
          response.error.message?.includes('does not exist')
        ) {
          return NextResponse.json(
            { error: 'Email not found in subscription list' },
            { status: 404 }
          )
        }

        console.error('Resend API error:', response.error)
        return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 })
      }

      return NextResponse.json(
        {
          message: 'Successfully unsubscribed',
        },
        { status: 200 }
      )
    } catch (error: unknown) {
      console.error('Error unsubscribing email:', error)

      // Handle specific Resend errors
      if (
        error instanceof Error &&
        (error.message?.includes('not found') || error.message?.includes('does not exist'))
      ) {
        return NextResponse.json({ error: 'Email not found in subscription list' }, { status: 404 })
      }

      return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error processing unsubscribe request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Newsletter unsubscribe endpoint' })
}
