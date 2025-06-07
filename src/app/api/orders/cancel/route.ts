import { NextResponse } from 'next/server';
import { supabase } from '../../../../utils/supabaseClient';

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First, verify the order belongs to the user and is in a cancellable state
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status !== 'Processing') {
      return NextResponse.json(
        { error: 'Only orders in Processing status can be cancelled' },
        { status: 400 }
      );
    }

    // Update the order status to Cancelled
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: 'Cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: 'Cancelled by customer'
      })
      .eq('id', orderId)
      .eq('user_id', user.id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to cancel order' },
        { status: 500 }
      );
    }

    // TODO: Send cancellation email to customer
    // TODO: Process refund if payment was already processed

    return NextResponse.json({ 
      message: 'Order cancelled successfully',
      orderId 
    });

  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 