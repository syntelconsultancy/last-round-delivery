import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const payload = await req.json();
    console.log('MoMo Webhook received:', payload);

    const externalId = payload.externalId || payload.financialTransactionId;
    const status = payload.status;

    if (!externalId) {
      return new Response(JSON.stringify({ error: 'Missing externalId' }), { status: 400 });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const newOrderStatus = status === 'SUCCESSFUL' ? 'CONFIRMED' : 'PENDING_PAYMENT';

    const { error } = await supabaseAdmin
      .from('orders')
      .update({ status: newOrderStatus, payment_reference: payload.financialTransactionId })
      .eq('id', externalId);

    if (error) {
      throw new Error('Failed to update order status');
    }

    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
