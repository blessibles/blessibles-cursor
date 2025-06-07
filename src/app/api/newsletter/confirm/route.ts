import { NextResponse } from 'next/server';
import { supabase } from '../../../../utils/supabaseClient';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Missing confirmation token' },
        { status: 400 }
      );
    }

    // Find subscriber with this token
    const { data: subscriber, error: findError } = await supabase
      .from('newsletter_subscribers')
      .select('id, email, confirmed, metadata')
      .eq('confirmation_token', token)
      .single();

    if (findError || !subscriber) {
      return NextResponse.json(
        { error: 'Invalid or expired confirmation token' },
        { status: 400 }
      );
    }

    if (subscriber.confirmed) {
      return NextResponse.json(
        { message: 'Your subscription is already confirmed' }
      );
    }

    // Confirm subscription
    const { error: updateError } = await supabase
      .from('newsletter_subscribers')
      .update({
        confirmed: true,
        confirmation_token: null
      })
      .eq('id', subscriber.id);

    if (updateError) throw updateError;

    // Send welcome email
    const unsubscribeToken = subscriber.metadata?.unsubscribe_token || '';
    await resend.emails.send({
      from: 'Blessibles <newsletter@blessibles.com>',
      to: subscriber.email,
      subject: 'Welcome to Blessibles Newsletter!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1e40af; margin-bottom: 20px;">Welcome to Blessibles!</h1>
          <p style="color: #1e3a8a; margin-bottom: 20px;">
            Thank you for confirming your subscription to our newsletter. We're excited to have you as part of our community!
          </p>
          <p style="color: #374151; margin-bottom: 20px;">
            You'll receive updates, inspiration, and exclusive offers directly to your inbox.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
            If you ever wish to unsubscribe, you can do so at any time:
          </p>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/api/newsletter/unsubscribe?token=${unsubscribeToken}&email=${encodeURIComponent(subscriber.email)}"
             style="color: #6b7280; font-size: 14px; text-decoration: underline;">
            Unsubscribe
          </a>
          <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
            This email was sent to ${subscriber.email}. If you have any questions, please contact our support team.
          </p>
        </div>
      `
    });

    // Redirect to success page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/newsletter/confirmed`
    );

  } catch (error: unknown) {
    console.error('Newsletter confirmation error:', error);
    let errorMsg = 'Failed to confirm subscription';
    if (error && typeof error === 'object' && 'message' in error && typeof (error as { message: unknown }).message === 'string') {
      errorMsg = (error as { message: string }).message;
    }
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
} 