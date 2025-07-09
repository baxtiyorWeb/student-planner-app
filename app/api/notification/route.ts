import { type NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { supabaseService } from "@/lib/supabase-enhanced";

export async function GET(request: NextRequest) {
  console.log("[API] GET /api/notifications - Request received");

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const limit = searchParams.get("limit");

    console.log("[API] GET /api/notifications - Params:", {
      userId,
      unreadOnly,
      limit,
    });

    if (!userId) {
      console.log("[API] GET /api/notifications - Missing userId");
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId);

    if (unreadOnly) {
      query = query.is("read_at", null);
    }

    query = query.order("created_at", { ascending: false });

    if (limit) {
      query = query.limit(Number.parseInt(limit));
    }

    const { data, error } = await query;

    if (error) {
      console.error("[API] GET /api/notifications - Database error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("[API] GET /api/notifications - Success:", {
      count: data?.length,
    });
    return NextResponse.json({ data });
  } catch (error) {
    console.error("[API] GET /api/notifications - Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log("[API] POST /api/notifications - Request received");

  try {
    const notificationData = await request.json();
    console.log("[API] POST /api/notifications - Data:", notificationData);

    if (
      !notificationData.user_id ||
      !notificationData.title ||
      !notificationData.type
    ) {
      console.log("[API] POST /api/notifications - Missing required fields");
      return NextResponse.json(
        { error: "User ID, title, and type are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("notifications")
      .insert(notificationData)
      .select()
      .single();

    if (error) {
      console.error("[API] POST /api/notifications - Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("[API] POST /api/notifications - Success:", data);
    return NextResponse.json({ data });
  } catch (error) {
    console.error("[API] POST /api/notifications - Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  console.log("[API] PUT /api/notifications - Request received");

  try {
    const { id, action } = await request.json();
    console.log("[API] PUT /api/notifications - Data:", { id, action });

    if (!id) {
      console.log("[API] PUT /api/notifications - Missing notification ID");
      return NextResponse.json(
        { error: "Notification ID required" },
        { status: 400 }
      );
    }

    if (action === "markAsRead") {
      const { error } = await supabaseService.markNotificationAsRead(id);

      if (error) {
        console.error(
          "[API] PUT /api/notifications - Mark as read error:",
          error
        );
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      console.log("[API] PUT /api/notifications - Marked as read successfully");
      return NextResponse.json({ success: true });
    }

    console.log("[API] PUT /api/notifications - Invalid action:", action);
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[API] PUT /api/notifications - Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
