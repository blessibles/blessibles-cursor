import { NextResponse } from 'next/server';
import { supabase } from '../../../../../../utils/supabaseClient';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function rewriteLinksForClickTracking(html: string, campaignId: string, subscriberId: string) {
  return html.replace(/<a\s+([^>]*?)href=["']([^"']+)["']([^>]*)>/gi, (match, pre, href, post) => {
    // Only rewrite http/https links
    if (!/^https?:\/\//i.test(href)) return match;
    const trackingUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/newsletter/click/${campaignId}/${encodeURIComponent(subscriberId)}?url=${encodeURIComponent(href)}`;
    return `<a ${pre}href=\"${trackingUrl}\"${post}>`;
  });
}

interface Subscriber {
  email: string;
}

interface ErrorLogEntry {
  email: string;
  error: string;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const { campaignId } = await request.json();
    if (!campaignId) {
      return NextResponse.json({ error: 'Missing campaignId' }, { status: 400 });
    }

    // Fetch campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('newsletter_campaigns')
      .select('id, subject, content, status')
      .eq('id', campaignId)
      .single();
    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }
    if (campaign.status === 'sent' || campaign.status === 'sending') {
      return NextResponse.json({ error: 'Campaign already sent or sending' }, { status: 400 });
    }

    // Update status to 'sending'
    await supabase
      .from('newsletter_campaigns')
      .update({ status: 'sending' })
      .eq('id', campaignId);

    // Fetch all confirmed, non-unsubscribed subscribers
    const { data: subscribers, error: subError } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('confirmed', true)
      .eq('unsubscribed', false);
    if (subError) throw subError;

    let sentCount = 0;
    const errorLog: ErrorLogEntry[] = [];
    for (const sub of subscribers as Subscriber[]) {
      try {
        const pixelUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/newsletter/open/${campaign.id}/${encodeURIComponent(sub.email)}`;
        let htmlWithPixel = campaign.content + `<img src=\"${pixelUrl}\" width=\"1\" height=\"1\" style=\"display:none\" alt=\"\" />`;
        htmlWithPixel = rewriteLinksForClickTracking(htmlWithPixel, campaign.id, sub.email);
        await resend.emails.send({
          from: 'Blessibles <newsletter@blessibles.com>',
          to: sub.email,
          subject: campaign.subject,
          html: htmlWithPixel,
        });
        sentCount++;
      } catch (err: unknown) {
        let errorMsg = 'Unknown error';
        if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
          errorMsg = (err as { message: string }).message;
        }
        errorLog.push({ email: sub.email, error: errorMsg });
      }
    }

    // Update campaign status and stats
    await supabase
      .from('newsletter_campaigns')
      .update({
        status: errorLog.length === 0 ? 'sent' : 'failed',
        sent_at: new Date().toISOString(),
        sent_count: sentCount,
        error: errorLog.length ? JSON.stringify(errorLog) : null,
      })
      .eq('id', campaignId);

    return NextResponse.json({
      message: `Campaign sent to ${sentCount} subscribers.`,
      errors: errorLog
    });
  } catch (error: unknown) {
    console.error('Send campaign error:', error);
    return NextResponse.json({ error: 'Failed to send campaign' }, { status: 500 });
  }
} 