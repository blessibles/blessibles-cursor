import { NextResponse } from 'next/server';
import { supabase } from '../../../../utils/supabaseClient';

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Find subscriber with this email
    const { data: subscriber, error: findError } = await supabase
      .from('newsletter_subscribers')
      .select('id, email, unsubscribed')
      .eq('email', email)
      .single();

    if (findError || !subscriber) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      );
    }

    if (subscriber.unsubscribed) {
      return NextResponse.json(
        { message: 'You are already unsubscribed' }
      );
    }

    // Unsubscribe the user
    const { error: updateError } = await supabase
      .from('newsletter_subscribers')
      .update({
        unsubscribed: true,
        unsubscribed_at: new Date().toISOString()
      })
      .eq('id', subscriber.id);

    if (updateError) throw updateError;

    // Redirect to success page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/newsletter/unsubscribed`
    );

  } catch (error: unknown) {
    console.error('Newsletter unsubscribe error:', error);
    let errorMsg = 'Failed to process unsubscribe request';
    if (error && typeof error === 'object' && 'message' in error && typeof (error as { message: unknown }).message === 'string') {
      errorMsg = (error as { message: string }).message;
    }
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
} 