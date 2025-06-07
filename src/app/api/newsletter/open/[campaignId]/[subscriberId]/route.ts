import { NextResponse } from 'next/server';
import { supabase } from '../../../../../../utils/supabaseClient';

// 1x1 transparent PNG
const pixel = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO2l2ZkAAAAASUVORK5CYII=',
  'base64'
);

export async function GET(
  req: Request,
  { params }: { params: { campaignId: string; subscriberId: string } }
) {
  const { campaignId, subscriberId } = params;
  // Increment open_count for the campaign
  if (campaignId && subscriberId) {
    await supabase.from('newsletter_campaign_events').insert([
      {
        campaign_id: campaignId,
        subscriber_email: subscriberId,
        event_type: 'open',
      },
    ]);
    await supabase.rpc('increment_campaign_open_count', { campaign_id: campaignId });
  }
  return new NextResponse(pixel, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Content-Length': pixel.length.toString(),
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Expires': '0',
      'Pragma': 'no-cache',
    },
  });
} 