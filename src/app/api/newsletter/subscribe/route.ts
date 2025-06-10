import { NextResponse } from 'next/server';
import { supabase } from '../../../../utils/supabaseClient';
import { Resend } from 'resend';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request): Promise<Response> {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { email } = await request.json();

    // Validate email
    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Check if already subscribed
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id, confirmed, unsubscribed')
      .eq('email', email)
      .single();

    if (existing) {
      if (existing.unsubscribed) {
        // Resubscribe
        await supabase
          .from('newsletter_subscribers')
          .update({
            unsubscribed: false,
            unsubscribed_at: null,
            confirmed: true
          })
          .eq('id', existing.id);
      } else if (!existing.confirmed) {
        // Resend confirmation email
        await sendConfirmationEmail(email);
      } else {
        return NextResponse.json(
          { error: 'You are already subscribed to our newsletter' },
          { status: 400 }
        );
      }
    } else {
      // Insert new subscriber
      const { error: insertError } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email }]);

      if (insertError) throw insertError;

      // Send confirmation email
      await sendConfirmationEmail(email);
    }

    return NextResponse.json({
      message: 'Thank you for subscribing! Please check your email to confirm your subscription.'
    });

  } catch (error: unknown) {
    console.error('Newsletter subscription error:', error);
    let errorMsg = 'Failed to process subscription';
    if (error && typeof error === 'object' && 'message' in error && typeof (error as { message: unknown }).message === 'string') {
      errorMsg = (error as { message: string }).message;
    }
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}

async function sendConfirmationEmail(email: string) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const confirmationToken = crypto.randomUUID();
  const unsubscribeToken = crypto.randomUUID();
  
  // Store tokens
  await supabase
    .from('newsletter_subscribers')
    .update({ 
      confirmation_token: confirmationToken,
      metadata: { unsubscribe_token: unsubscribeToken }
    })
    .eq('email', email);

  // Send confirmation email
  await resend.emails.send({
    from: 'Blessibles <newsletter@blessibles.com>',
    to: email,
    subject: 'Confirm your subscription to Blessibles Newsletter',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e40af; margin-bottom: 20px;">Welcome to Blessibles!</h1>
        <p style="color: #1e3a8a; margin-bottom: 20px;">
          Thank you for subscribing to our newsletter. Please click the link below to confirm your subscription:
        </p>
        <div style="margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/api/newsletter/confirm?token=${confirmationToken}"
             style="background-color: #1d4ed8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Confirm Subscription
          </a>
        </div>
        <p style="color: #4b5563; font-size: 14px; margin-bottom: 20px;">
          If you did not request this subscription, you can safely ignore this email or click below to unsubscribe:
        </p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/api/newsletter/unsubscribe?token=${unsubscribeToken}&email=${encodeURIComponent(email)}"
           style="color: #6b7280; font-size: 14px; text-decoration: underline;">
          Unsubscribe
        </a>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          This email was sent to ${email}. If you have any questions, please contact our support team.
        </p>
      </div>
    `
  });
} 