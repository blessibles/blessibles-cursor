import { NextResponse } from 'next/server';
import { supabase } from '../../../../../utils/supabaseClient';

export async function GET() {
  try {
    // Get total subscribers
    const { count: total } = await supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true });

    // Get confirmed subscribers
    const { count: confirmed } = await supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('confirmed', true)
      .eq('unsubscribed', false);

    // Get unconfirmed subscribers
    const { count: unconfirmed } = await supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('confirmed', false)
      .eq('unsubscribed', false);

    // Get unsubscribed count
    const { count: unsubscribed } = await supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('unsubscribed', true);

    // Get recent subscribers (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { count: recentSubscribers } = await supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());

    // Time-series analytics for the last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 29); // 30 days including today

    // Helper to format date as YYYY-MM-DD
    const formatDate = (date: Date) => date.toISOString().slice(0, 10);

    // Fetch all relevant records in the last 30 days
    const { data: allSubs, error: allSubsError } = await supabase
      .from('newsletter_subscribers')
      .select('created_at, confirmed, unsubscribed, unsubscribed_at, confirmed, confirmed_at')
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (allSubsError) throw allSubsError;

    // Prepare time buckets
    const days: string[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo);
      d.setDate(d.getDate() + i);
      days.push(formatDate(d));
    }

    // Count new subscribers per day
    const newSubscribers = days.map(date => ({
      date,
      count: allSubs.filter(sub => formatDate(new Date(sub.created_at)) === date).length
    }));

    // Count confirmations per day (if you have confirmed_at, otherwise fallback to created_at for confirmed subs)
    const confirmedSubscribers = days.map(date => ({
      date,
      count: allSubs.filter(sub =>
        sub.confirmed &&
        ((sub.confirmed_at && formatDate(new Date(sub.confirmed_at)) === date) ||
         (!sub.confirmed_at && formatDate(new Date(sub.created_at)) === date))
      ).length
    }));

    // Count unsubscribes per day
    const unsubscribes = days.map(date => ({
      date,
      count: allSubs.filter(sub =>
        sub.unsubscribed &&
        sub.unsubscribed_at && formatDate(new Date(sub.unsubscribed_at)) === date
      ).length
    }));

    return NextResponse.json({
      total: total || 0,
      confirmed: confirmed || 0,
      unconfirmed: unconfirmed || 0,
      unsubscribed: unsubscribed || 0,
      recentSubscribers: recentSubscribers || 0,
      trends: {
        newSubscribers,
        confirmedSubscribers,
        unsubscribes
      }
    });

  } catch (error: unknown) {
    console.error('Error fetching newsletter stats:', error);
    let errorMsg = 'Failed to fetch newsletter statistics';
    if (error && typeof error === 'object' && 'message' in error && typeof (error as { message: unknown }).message === 'string') {
      errorMsg = (error as { message: string }).message;
    }
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
} 