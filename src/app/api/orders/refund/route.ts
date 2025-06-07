import { NextResponse } from 'next/server';
import { supabase } from '../../../../utils/supabaseClient';
import Stripe from 'stripe';
import { sendEmail } from '../../../../utils/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

interface OrderItem {
  downloaded_at?: string;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const { orderId, reason } = await request.json();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the order belongs to the user and is in a refundable state
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if order is eligible for refund
    const refundableStatuses = ['Completed', 'Shipped', 'Delivered'];
    if (!refundableStatuses.includes(order.status)) {
      return NextResponse.json(
        { error: 'Order is not eligible for refund' },
        { status: 400 }
      );
    }

    // Check if refunds are enabled in settings
    const { data: settingsRow, error: settingsError } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'refunds_enabled')
      .single();
    if (settingsError || !settingsRow || settingsRow.value.enabled === false) {
      return NextResponse.json(
        { error: 'Refunds are currently disabled.' },
        { status: 403 }
      );
    }

    // Check if any item in the order has been downloaded
    const { data: orderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .select('downloaded_at')
      .eq('order_id', orderId);
    if (orderItemsError) {
      return NextResponse.json(
        { error: 'Could not verify download status.' },
        { status: 500 }
      );
    }
    if (orderItems && (orderItems as OrderItem[]).some((item) => item.downloaded_at)) {
      return NextResponse.json(
        { error: 'Refunds are not allowed after a product has been downloaded.' },
        { status: 403 }
      );
    }

    // Create a support ticket for the refund request
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .insert([
        {
          user_id: user.id,
          order_id: orderId,
          subject: `Refund Request for Order #${orderId}`,
          message: reason || 'Customer requested refund',
          category: 'refund',
          priority: 'high',
          status: 'open',
        },
      ])
      .select()
      .single();

    if (ticketError) {
      return NextResponse.json(
        { error: 'Failed to create refund request' },
        { status: 500 }
      );
    }

    // Send email: Refund request received
    await sendEmail({
      to: user.email || '',
      subject: `Refund Request Received for Order #${orderId}`,
      html: `<p>Dear ${user.user_metadata?.name || 'Customer'},</p>
        <p>We have received your refund request for order <strong>#${orderId}</strong>.</p>
        <p>Reason: ${reason || 'No reason provided.'}</p>
        <p>Our team will review your request and notify you once it is processed.</p>
        <p>Blessings,<br/>Blessibles Support Team</p>`
    });

    // If the order has a Stripe payment intent, create a refund
    if (order.payment_intent_id) {
      try {
        const refund = await stripe.refunds.create({
          payment_intent: order.payment_intent_id,
          reason: 'requested_by_customer',
        });

        // Update the order with refund information
        await supabase
          .from('orders')
          .update({
            status: 'Refunded',
            refunded_at: new Date().toISOString(),
            refund_reason: reason,
            refund_id: refund.id,
          })
          .eq('id', orderId);

        // Update the support ticket
        await supabase
          .from('support_tickets')
          .update({
            status: 'resolved',
            resolved_at: new Date().toISOString(),
          })
          .eq('id', ticket.id);

        // Send email: Refund processed
        await sendEmail({
          to: user.email || '',
          subject: `Refund Processed for Order #${orderId}`,
          html: `<p>Dear ${user.user_metadata?.name || 'Customer'},</p>
            <p>Your refund for order <strong>#${orderId}</strong> has been processed successfully.</p>
            <p>Refund ID: ${refund.id}</p>
            <p>The amount will be returned to your original payment method within a few business days.</p>
            <p>Blessings,<br/>Blessibles Support Team</p>`
        });

        return NextResponse.json({
          message: 'Refund processed successfully',
          refundId: refund.id,
          ticketId: ticket.id,
        });
      } catch (stripeError: unknown) {
        // If Stripe refund fails, keep the ticket open for manual processing
        let errorMsg = 'Unknown error';
        if (stripeError && typeof stripeError === 'object' && 'message' in stripeError && typeof (stripeError as { message: unknown }).message === 'string') {
          errorMsg = (stripeError as { message: string }).message;
        }
        return NextResponse.json({
          message: 'Refund request received, will be processed manually',
          ticketId: ticket.id,
          error: errorMsg,
        });
      }
    }

    // If no payment intent, just return the ticket ID
    return NextResponse.json({
      message: 'Refund request received, will be processed manually',
      ticketId: ticket.id,
    });

  } catch (error) {
    console.error('Error processing refund request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 