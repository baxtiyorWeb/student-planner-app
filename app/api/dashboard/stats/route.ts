import { type NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    console.log("[Dashboard Stats API] Request received");

    // Get the authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log(
        "[Dashboard Stats API] Missing or invalid authorization header"
      );
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    console.log(
      "[Dashboard Stats API] Token extracted:",
      token.substring(0, 20) + "..."
    );

    // Verify the token and get user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.log("[Dashboard Stats API] Auth error:", authError);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    console.log("[Dashboard Stats API] User authenticated:", user.id);

    // Call the database function to get stats
    const { data: stats, error: statsError } = await supabase.rpc(
      "get_dashboard_stats",
      {
        user_uuid: user.id,
      }
    );

    if (statsError) {
      console.error("[Dashboard Stats API] Error fetching stats:", statsError);
      return NextResponse.json(
        { error: "Failed to fetch dashboard stats" },
        { status: 500 }
      );
    }

    console.log("[Dashboard Stats API] Stats fetched successfully:", stats);
    return NextResponse.json(stats);
  } catch (error) {
    console.error("[Dashboard Stats API] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
