import { NextResponse } from 'next/server';
import { supabase } from '../../../../../../utils/supabaseClient';

export async function GET(
  req: Request,
  { params }: { params: { campaignId: string; subscriberId: string } }
) {
  const { campaignId, subscriberId } = params;
  const url = new URL(req.url).searchParams.get('url');
  if (campaignId && subscriberId && url) {
    await supabase.from('newsletter_campaign_events').insert([
      {
        campaign_id: campaignId,
        subscriber_email: subscriberId,
        event_type: 'click',
        url,
      },
    ]);
    await supabase.rpc('increment_campaign_click_count', { campaign_id: campaignId });
  }
  if (!url) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 });
  }
  return NextResponse.redirect(url);
} 