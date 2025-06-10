import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../utils/supabaseClient';

export async function GET(req: NextRequest, { params }: { params: Promise<{ orderItemId: string }> }) {
  const { orderItemId } = await params;
  try {
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the order item and verify ownership
    const { data: orderItem, error: itemError } = await supabase
      .from('order_items')
      .select('*, order:order_id(user_id)')
      .eq('id', orderItemId)
      .single();
    if (itemError || !orderItem) {
      return NextResponse.json({ error: 'Order item not found' }, { status: 404 });
    }
    if (orderItem.order.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (!orderItem.download_url) {
      return NextResponse.json({ error: 'No download available for this item.' }, { status: 404 });
    }

    // Update downloaded_at if not already set
    if (!orderItem.downloaded_at) {
      await supabase
        .from('order_items')
        .update({ downloaded_at: new Date().toISOString() })
        .eq('id', orderItemId);
    }

    // Redirect to the actual file (or stream it, if needed)
    return NextResponse.redirect(orderItem.download_url);
  } catch (error) {
    console.error('Error in download route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 