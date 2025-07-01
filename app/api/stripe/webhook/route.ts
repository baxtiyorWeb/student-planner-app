import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabase";

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature")!;

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionChange(
          event.data.object as Stripe.Subscription
        );
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionCanceled(
          event.data.object as Stripe.Subscription
        );
        break;
      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    );
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (error) {
    console.error("Supabase user fetch error:", error);
    return;
  }

  if (!user) {
    console.log("User not found for customer:", customerId);
    return;
  }

  const subscriptionEndDate = subscription.cancel_at
    ? new Date(subscription.cancel_at * 1000).toISOString()
    : subscription.cancel_at_period_end
      ? new Date(Number(subscription.cancel_at_period_end) * 1000).toISOString()
      : null;

  console.log("subscriptionEndDate", subscriptionEndDate);

  // --- O'zgartirilgan qism ---
  const priceId = subscription.items.data[0].price.id;
  let subscriptionType = "free";

  // .env fayldan PRO tarif IDlarini olamiz
  const PRO_MONTHLY_PRICE_ID =
    process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID;
  const PRO_YEARLY_PRICE_ID =
    process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID;

  if (priceId === PRO_MONTHLY_PRICE_ID || priceId === PRO_YEARLY_PRICE_ID) {
    subscriptionType = "pro";
  }
  // --- O'zgartirilgan qism tugadi ---

  const { error: updateError } = await supabase
    .from("users")
    .update({
      subscription_type: subscriptionType, // Yangi aniqlangan subscriptionType ni ishlatamiz
      subscription_status: subscription.status,
      subscription_end_date: subscriptionEndDate,
    })
    .eq("id", user.id);

  if (updateError) {
    console.error("Supabase user update error:", updateError);
  }
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (error) {
    console.error("Supabase user fetch error:", error);
    return;
  }

  if (!user) {
    console.log("User not found for customer:", customerId);
    return;
  }

  const { error: updateError } = await supabase
    .from("users")
    .update({
      subscription_type: "free",
      subscription_status: "canceled",
      subscription_end_date: null,
    })
    .eq("id", user.id);

  if (updateError) {
    console.error("Supabase user update error:", updateError);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log("Payment succeeded:", invoice.id);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log("Payment failed:", invoice.id);
}
