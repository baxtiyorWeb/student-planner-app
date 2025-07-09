import { loadStripe } from "@stripe/stripe-js";
import Stripe from "stripe";
import { supabase } from "@/lib/supabase";

if (!process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set");
}

export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
  typescript: true,
});

export const STRIPE_PRICE_IDS = {
  pro_monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || "price_1234567890",
  pro_yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || "price_0987654321",
};

export const STRIPE_WEBHOOKS = {
  ENDPOINT_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,
};

export const createCheckoutSession = async (
  priceId: string,
  userId: string
) => {
  const data = await supabase.auth.getSession();
  const response = await fetch("/api/stripe/create-checkout-session", {
    method: "POST",

    headers: {
      Authorization: `Bearer ${data.data.session?.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      priceId,
      userId,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create checkout session");
  }

  return response.json();
};

export const createPortalSession = async (customerId: string) => {
  const response = await fetch("/api/stripe/create-portal-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customerId,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create portal session");
  }

  return response.json();
};

export const getStripeCustomerByEmail = async (email: string) => {
  const customers = await stripe.customers.list({
    email,
    limit: 1,
  });
  return customers.data[0] || null;
};

export const createStripeCustomer = async (email: string, name?: string) => {
  return await stripe.customers.create({
    email,
    name,
  });
};

export const getOrCreateStripeCustomer = async (
  email: string,
  name?: string,
  userId?: string
) => {
  let customer = await getStripeCustomerByEmail(email);
  if (!customer) {
    customer = await createStripeCustomer(email, name);
  }
  if (userId && customer) {
    // Supabase users jadvalini yangilash (agar stripe_customer_id bo‘sh bo‘lsa)
    const { error } = await supabase
      .from("users")
      .update({ stripe_customer_id: customer.id })
      .eq("id", userId);
    if (error) {
      console.error("Failed to update stripe_customer_id:", error);
    }
  }
  return customer;
};
