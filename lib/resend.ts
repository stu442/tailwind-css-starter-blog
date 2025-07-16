import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not set')
}

export const resend = new Resend(process.env.RESEND_API_KEY)

// Helper function to add contact to audience
export async function addContactToAudience(email: string, audienceId?: string) {
  try {
    if (audienceId) {
      // Add to specific audience
      const response = await resend.contacts.create({
        email,
        audienceId,
      })
      return response
    } else {
      // For now, we'll require audienceId - update this when Resend supports adding contacts without audienceId
      throw new Error('Audience ID is required for adding contacts')
    }
  } catch (error) {
    console.error('Error adding contact:', error)
    throw error
  }
}

// Helper function to remove contact from audience
export async function removeContactFromAudience(email: string, audienceId?: string) {
  try {
    if (audienceId) {
      // Remove from specific audience
      const response = await resend.contacts.remove({
        email,
        audienceId,
      })
      return response
    } else {
      // For now, we'll require audienceId - update this when Resend supports removing contacts without audienceId
      throw new Error('Audience ID is required for removing contacts')
    }
  } catch (error) {
    console.error('Error removing contact:', error)
    throw error
  }
}

// Helper function to generate unsubscribe URL
export function generateUnsubscribeUrl(email: string, baseUrl: string) {
  const encodedEmail = encodeURIComponent(email)
  return `${baseUrl}/unsubscribe?email=${encodedEmail}`
}
