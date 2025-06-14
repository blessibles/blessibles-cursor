import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  if (!email) {
    return new NextResponse('Missing email parameter.', { status: 400 });
  }

  // Find the user by email
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();
  if (userError || !userData) {
    return new NextResponse('User not found.', { status: 404 });
  }

  // Update user_preferences
  const { error: prefError } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: userData.id,
      marketing_emails: false,
      updated_at: new Date().toISOString(),
    });
  if (prefError) {
    return new NextResponse('Failed to update preferences.', { status: 500 });
  }

  return new NextResponse(
    `<html><body style="font-family:sans-serif;text-align:center;padding:2em;">
      <h1 style="color:#1a365d;">You have been unsubscribed</h1>
      <p style="color:#333;">You will no longer receive marketing emails from Blessibles.</p>
      <p style="color:#888;font-size:14px;">If this was a mistake, you can update your preferences in your <a href='https://blessibles.com/account/settings' style='color:#1d4ed8;'>account settings</a>.</p>
    </body></html>`,
    { status: 200, headers: { 'Content-Type': 'text/html' } }
  );
} 