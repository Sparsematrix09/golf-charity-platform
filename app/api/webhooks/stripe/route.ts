import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  try {
    const session = event.data.object as any;

    console.log(`Processing Stripe event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
      case 'customer.subscription.created': {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription || session.id,
          { expand: ['default_payment_method'] }
        );

        let supabaseUUID = session.metadata?.supabaseUUID || session.client_reference_id;
        let planType = session.metadata?.planType;

        if (!supabaseUUID && subscription.metadata) {
          supabaseUUID = subscription.metadata.supabaseUUID;
          planType = subscription.metadata.planType;
        }

        if (!supabaseUUID) {
          const customer = await stripe.customers.retrieve(subscription.customer as string);
          if ((customer as any).metadata?.supabaseUUID) {
            supabaseUUID = (customer as any).metadata.supabaseUUID;
          }
        }

        if (supabaseUUID) {
          // Update profile status
          await supabaseAdmin
            .from('profiles')
            .update({
              stripe_customer_id: subscription.customer,
              subscription_status: subscription.status,
            })
            .eq('id', supabaseUUID);

          // Insert or update subscription record
          await supabaseAdmin
            .from('subscriptions')
            .upsert({
              user_id: supabaseUUID,
              stripe_customer_id: subscription.customer,
              stripe_subscription_id: subscription.id,
              status: subscription.status,
              plan: planType || 'monthly',
              renewal_date: new Date(subscription.current_period_end * 1000).toISOString(),
            }, { onConflict: 'stripe_subscription_id' });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = session;
        let supabaseUUID = subscription.metadata?.supabaseUUID;

        if (!supabaseUUID) {
          const customer = await stripe.customers.retrieve(subscription.customer as string);
          if ((customer as any).metadata?.supabaseUUID) {
            supabaseUUID = (customer as any).metadata.supabaseUUID;
          }
        }

        if (supabaseUUID) {
          await supabaseAdmin
            .from('profiles')
            .update({ subscription_status: subscription.status })
            .eq('id', supabaseUUID);

          await supabaseAdmin
            .from('subscriptions')
            .update({
              status: subscription.status,
              renewal_date: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = session;
        let supabaseUUID = subscription.metadata?.supabaseUUID;

        if (!supabaseUUID) {
          const customer = await stripe.customers.retrieve(subscription.customer as string);
          if ((customer as any).metadata?.supabaseUUID) {
            supabaseUUID = (customer as any).metadata.supabaseUUID;
          }
        }

        if (supabaseUUID) {
          await supabaseAdmin
            .from('profiles')
            .update({ subscription_status: 'canceled' })
            .eq('id', supabaseUUID);

          await supabaseAdmin
            .from('subscriptions')
            .update({ status: 'canceled' })
            .eq('stripe_subscription_id', subscription.id);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
