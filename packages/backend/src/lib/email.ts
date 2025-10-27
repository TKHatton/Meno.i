/**
 * Email Service
 * Handles sending emails for account operations
 *
 * Uses Resend for email delivery in production
 * For development: logs to console
 */

import { Resend } from 'resend';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Send an email
 * For development: logs to console
 * For production: uses Resend
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // For development - log email to console
    if (process.env.NODE_ENV !== 'production' && !process.env.RESEND_API_KEY) {
      console.log('\n📧 ========== EMAIL (DEV MODE) ==========');
      console.log('To:', options.to);
      console.log('Subject:', options.subject);
      console.log('Body:', options.text);
      console.log('========================================\n');
      return true;
    }

    // For production: Use Resend
    if (!process.env.RESEND_API_KEY) {
      console.error('⚠️  RESEND_API_KEY not configured. Cannot send email.');
      console.log('To:', options.to, 'Subject:', options.subject);
      return false;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Note: You need to verify your domain in Resend dashboard
    // For testing, you can use: onboarding@resend.dev
    // For production, replace with your verified domain: noreply@yourdomain.com
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html || options.text,
    });

    if (error) {
      console.error('Resend error:', error);
      return false;
    }

    console.log('✅ Email sent successfully via Resend:', data?.id);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Send account deletion confirmation code email
 */
export async function sendDeletionConfirmationEmail(
  email: string,
  code: string
): Promise<boolean> {
  const subject = 'Confirm Account Deletion - MenoAI';

  const text = `
Hello,

You have requested to delete your MenoAI account.

Your confirmation code is: ${code}

This code will expire in 15 minutes.

If you did not request this, please ignore this email and your account will remain active.

Best regards,
The MenoAI Team
  `.trim();

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Confirm Account Deletion</h2>
      <p>You have requested to delete your MenoAI account.</p>
      <div style="background-color: #fee2e2; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
        <p style="margin: 0; font-size: 14px; color: #991b1b;">Your confirmation code is:</p>
        <p style="margin: 10px 0; font-size: 32px; font-weight: bold; color: #dc2626; letter-spacing: 4px;">${code}</p>
        <p style="margin: 0; font-size: 12px; color: #991b1b;">This code will expire in 15 minutes</p>
      </div>
      <p style="color: #666; font-size: 14px;">
        If you did not request this, please ignore this email and your account will remain active.
      </p>
      <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;">
      <p style="color: #999; font-size: 12px;">
        Best regards,<br>
        The MenoAI Team
      </p>
    </div>
  `;

  return sendEmail({ to: email, subject, text, html });
}
