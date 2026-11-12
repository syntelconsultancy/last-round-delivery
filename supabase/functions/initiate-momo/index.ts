import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const { storeId, items, customerPhone, deliveryLat, deliveryLng, landmarkNote, customerNrc } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let subtotal = 0;
    const orderItemsToInsert = [];

    for (const item of items) {
      const { data: inv, error: invErr } = await supabaseAdmin
        .from('store_inventory')
        .select('*')
        .eq('store_id', storeId)
        .eq('product_id', item.productId)
        .single();

      if (invErr || !inv) {
        return new Response(JSON.stringify({ error: 'Inventory item not found' }), { status: 404 });
      }

      if (inv.stock_quantity < item.quantity) {
        return new Response(JSON.stringify({ error: 'Insufficient stock for product' }), { status: 400 });
      }

      subtotal += Number(inv.price_zmw) * item.quantity;
      orderItemsToInsert.push({
        inventory_id: inv.id,
        quantity: item.quantity,
        unit_price_zmw: inv.price_zmw
      });
    }

    const deliveryFee = 35.00;
    const total = subtotal + deliveryFee;

    let { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('phone', customerPhone)
      .single();

    if (!profile) {
      const { data: newProf, error: profErr } = await supabaseAdmin
        .from('profiles')
        .insert({ phone: customerPhone, role: 'customer' })
        .select('id')
        .single();
      if (profErr) throw new Error(profErr.message);
      profile = newProf;
    }

    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_id: profile.id,
        store_id: storeId,
        subtotal_zmw: subtotal,
        delivery_fee_zmw: deliveryFee,
        total_zmw: total,
        delivery_lat: deliveryLat,
        delivery_lng: deliveryLng,
        landmark_note: landmarkNote,
        delivery_pin: Math.floor(1000 + Math.random() * 9000).toString(),
        customer_nrc: customerNrc,
        status: 'PENDING_PAYMENT'
      })
      .select('id')
      .single();

    if (orderErr) throw new Error(orderErr.message);

    for (const oi of orderItemsToInsert) {
      oi.order_id = order.id;
    }
    const { error: itemsErr } = await supabaseAdmin.from('order_items').insert(orderItemsToInsert);
    if (itemsErr) throw new Error(itemsErr.message);

    const paymentReference = 'MOMO-' + Date.now();

    return new Response(JSON.stringify({ 
      success: true, 
      orderId: order.id, 
      paymentReference,
      message: 'Order placed. Prompting customer for MTN Mobile Money payment.' 
    }), { headers: { 'Content-Type': 'application/json' } });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
