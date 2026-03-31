import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
 try {
 const supabase = await createClient();
 const { data: { user } } = await supabase.auth.getUser();

 if (!user) {
 return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
 }

 const { data: profile } = await supabase.from('profiles').select('stripe_customer_id').eq('id', user.id).single();

 if (!profile || !profile.stripe_customer_id) {
 return NextResponse.json({ error: 'No active billing profile' }, { status: 404 });
 }

 const session = await stripe.billingPortal.sessions.create({
 customer: profile.stripe_customer_id,
 return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/subscription`,
 });

 return NextResponse.json({ url: session.url });
 } catch (err: any) {
 console.error('Portal error:', err);
 return NextResponse.json({ error: err.message }, { status: 500 });
 }
}
