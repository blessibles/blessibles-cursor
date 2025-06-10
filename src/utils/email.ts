import { Resend } from 'resend';

// Remove module-level initialization
// const resend = new Resend(process.env.RESEND_API_KEY || '');

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set. Email not sent.');
    return { error: 'Email service not configured.' };
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const { data, error } = await resend.emails.send({
      from: 'Blessibles <no-reply@blessibles.com>',
      to,
      subject,
      html,
    });
    if (error) {
      console.error('Resend error:', error);
      return { error };
    }
    return { data };
  } catch (err) {
    console.error('Error sending email:', err);
    return { error: err };
  }
} 