import { type NextRequest, NextResponse } from "next/server";
import { stripe, getOrCreateStripeCustomer } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { priceId } = await request.json();

    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID is required" },
        { status: 400 }
      );
    }

    // Get the authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    // Verify the token and get user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get or create user profile
    let { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError && profileError.code === "PGRST116") {
      // User profile doesn't exist, create it
      const newProfile = {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || "User",
        subscription_type: "free",
        subscription_status: "inactive",
        timezone: "UTC",
        study_goal_hours: 0,
        daily_study_target: 2,
        notification_preferences: {
          email: true,
          push: true,
          deadline_days: 3,
        },
        total_study_hours: 0,
        streak_days: 0,
        longest_streak: 0,
        last_active: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: createdProfile, error: createError } = await supabase
        .from("users")
        .insert(newProfile)
        .select()
        .single();

      if (createError) {
        console.error("Error creating user profile:", createError);
        return NextResponse.json(
          { error: "Failed to create user profile" },
          { status: 500 }
        );
      }

      userProfile = createdProfile;
    } else if (profileError) {
      console.error("Error fetching user profile:", profileError);
      return NextResponse.json(
        { error: "Failed to fetch user profile" },
        { status: 500 }
      );
    }

    // Get or create Stripe customer
    let stripeCustomer;
    if (userProfile.stripe_customer_id) {
      try {
        stripeCustomer = await stripe.customers.retrieve(
          userProfile.stripe_customer_id
        );
      } catch (error) {
        console.log("Stripe customer not found, creating new one");
        stripeCustomer = null;
      }
    }

    if (!stripeCustomer) {
      stripeCustomer = await getOrCreateStripeCustomer(
        userProfile.email,
        userProfile.name
      );

      // Update user profile with Stripe customer ID
      await supabase
        .from("users")
        .update({ stripe_customer_id: stripeCustomer.id })
        .eq("id", user.id);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomer.id,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${request.nextUrl.origin}/dashboard?success=true`,
      cancel_url: `${request.nextUrl.origin}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
