import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const resend = new Resend(process.env.RESEND_API_KEY!);

interface Campaign {
  id: string;
  subject: string;
  content: string;
}

interface Subscriber {
  email: string;
}

interface ErrorLogEntry {
  email: string;
  error: string;
}

async function sendScheduledCampaigns() {
  const now = new Date().toISOString();
  // Find all scheduled campaigns due to send
  const { data: campaigns, error: campaignError } = await supabase
    .from('newsletter_campaigns')
    .select('id, subject, content')
    .eq('status', 'scheduled')
    .lte('scheduled_for', now);
  if (campaignError) {
    console.error('Error fetching scheduled campaigns:', campaignError);
    return;
  }
  if (!campaigns || campaigns.length === 0) {
    console.log('No scheduled campaigns to send.');
    return;
  }
  for (const campaign of campaigns as Campaign[]) {
    console.log(`Sending campaign: ${campaign.id} - ${campaign.subject}`);
    // Update status to 'sending'
    await supabase
      .from('newsletter_campaigns')
      .update({ status: 'sending' })
      .eq('id', campaign.id);
    // Fetch all confirmed, non-unsubscribed subscribers who have opted in to marketing emails
    const { data: subscribers, error: subError } = await supabase
      .from('newsletter_subscribers')
      .select('email, user:user_id(user_preferences(marketing_emails))')
      .eq('confirmed', true)
      .eq('unsubscribed', false);
    if (subError) {
      console.error('Error fetching subscribers:', subError);
      continue;
    }
    let sentCount = 0;
    const errorLog: ErrorLogEntry[] = [];
    for (const sub of (subscribers as any[])) {
      // Only send if user_preferences.marketing_emails is true (or if no user record, default to false)
      const optedIn = sub.user?.user_preferences?.marketing_emails === true;
      if (!optedIn) continue;
      try {
        const pixelUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/newsletter/open/${campaign.id}/${encodeURIComponent(sub.email)}`;
        const htmlWithPixel = campaign.content + `<img src=\"${pixelUrl}\" width=\"1\" height=\"1\" style=\"display:none\" alt=\"\" />`;
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
      .eq('id', campaign.id);
    console.log(`Campaign ${campaign.id} sent to ${sentCount} subscribers. Errors: ${errorLog.length}`);
  }
}

sendScheduledCampaigns().then(() => process.exit(0)); 