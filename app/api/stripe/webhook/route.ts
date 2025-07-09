import { type NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";
import type Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log("Stripe webhook event:", event.type);

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Get customer details
        const customer = await stripe.customers.retrieve(customerId);
        if (!customer || customer.deleted) {
          console.error("Customer not found:", customerId);
          break;
        }

        const customerEmail = (customer as Stripe.Customer).email;
        if (!customerEmail) {
          console.error("Customer email not found");
          break;
        }

        // Update user subscription status
        const { error } = await supabase
          .from("users")
          .update({
            subscription_type: "pro",
            subscription_status:
              subscription.status === "active" ? "active" : "inactive",
            stripe_subscription_id: subscription.id,
            subscription_end_date: new Date(
              subscription.items.data[0].current_period_end * 1000
            ).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("email", customerEmail);

        if (error) {
          console.error("Error updating user subscription:", error);
        } else {
          console.log("User subscription updated successfully");
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Get customer details
        const customer = await stripe.customers.retrieve(customerId);
        if (!customer || customer.deleted) {
          console.error("Customer not found:", customerId);
          break;
        }

        const customerEmail = (customer as Stripe.Customer).email;
        if (!customerEmail) {
          console.error("Customer email not found");
          break;
        }

        // Update user subscription status to canceled
        const { error } = await supabase
          .from("users")
          .update({
            subscription_type: "free",
            subscription_status: "canceled",
            subscription_end_date: new Date(
              subscription.items.data[0].current_period_end * 1000
            ).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("email", customerEmail);

        if (error) {
          console.error("Error canceling user subscription:", error);
        } else {
          console.log("User subscription canceled successfully");
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Get customer details
        const customer = await stripe.customers.retrieve(customerId);
        if (!customer || customer.deleted) {
          console.error("Customer not found:", customerId);
          break;
        }

        const customerEmail = (customer as Stripe.Customer).email;
        if (!customerEmail) {
          console.error("Customer email not found");
          break;
        }

        // Update user subscription status to past_due
        const { error } = await supabase
          .from("users")
          .update({
            subscription_status: "past_due",
            updated_at: new Date().toISOString(),
          })
          .eq("email", customerEmail);

        if (error) {
          console.error("Error updating user payment status:", error);
        } else {
          console.log("User payment status updated to past_due");
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
