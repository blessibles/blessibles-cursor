import { NextResponse } from 'next/server';
import { getDownloadUrl } from '@/utils/storage';
import { supabase } from '@/utils/supabaseClient';

export async function POST(request: Request) {
  try {
    const { orderId, productId } = await request.json();

    // Verify the user has purchased this product
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('user_id, status')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== order.user_id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('name, file_key')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Generate a signed download URL
    const downloadUrl = await getDownloadUrl(product.file_key);

    // Log the download
    await supabase.from('downloads').insert([
      {
        user_id: user.id,
        order_id: orderId,
        product_id: productId,
        downloaded_at: new Date().toISOString(),
      },
    ]);

    return NextResponse.json({ downloadUrl });
  } catch (error) {
    console.error('Error generating download URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate download URL' },
      { status: 500 }
    );
  }
} 