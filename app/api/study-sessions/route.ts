import { type NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase-enhanced";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  console.log("[API] GET /api/study-sessions - Request received");

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const active = searchParams.get("active") === "true";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    console.log("[API] GET /api/study-sessions - Params:", {
      userId,
      active,
      startDate,
      endDate,
    });

    if (!userId) {
      console.log("[API] GET /api/study-sessions - Missing userId");
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    let query = supabase
      .from("study_sessions")
      .select(
        `
        *,
        subject:subjects(name, color),
        assignment:assignments(title)
      `
      )
      .eq("user_id", userId);

    if (active) {
      query = query.is("end_time", null);
    }

    if (startDate) {
      query = query.gte("start_time", startDate);
    }

    if (endDate) {
      query = query.lte("start_time", endDate);
    }

    query = query.order("start_time", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("[API] GET /api/study-sessions - Database error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("[API] GET /api/study-sessions - Success:", {
      count: data?.length,
    });
    return NextResponse.json({ data });
  } catch (error) {
    console.error("[API] GET /api/study-sessions - Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log("[API] POST /api/study-sessions - Request received");

  try {
    const {
      action,
      userId,
      subjectId,
      assignmentId,
      sessionId,
      notes,
      productivityRating,
    } = await request.json();
    console.log("[API] POST /api/study-sessions - Data:", {
      action,
      userId,
      subjectId,
      assignmentId,
      sessionId,
    });

    if (!userId) {
      console.log("[API] POST /api/study-sessions - Missing userId");
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    if (action === "start") {
      if (!subjectId) {
        console.log(
          "[API] POST /api/study-sessions - Missing subjectId for start"
        );
        return NextResponse.json(
          { error: "Subject ID required to start session" },
          { status: 400 }
        );
      }

      const { data, error } = await supabaseService.startStudySession(
        userId,
        subjectId,
        assignmentId
      );

      if (error) {
        console.error("[API] POST /api/study-sessions - Start error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      console.log("[API] POST /api/study-sessions - Start success:", data);
      return NextResponse.json({ data });
    }

    if (action === "end") {
      if (!sessionId) {
        console.log(
          "[API] POST /api/study-sessions - Missing sessionId for end"
        );
        return NextResponse.json(
          { error: "Session ID required to end session" },
          { status: 400 }
        );
      }

      const { data, error } = await supabaseService.endStudySession(
        sessionId,
        notes,
        productivityRating
      );

      if (error) {
        console.error("[API] POST /api/study-sessions - End error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      console.log("[API] POST /api/study-sessions - End success:", data);
      return NextResponse.json({ data });
    }

    console.log("[API] POST /api/study-sessions - Invalid action:", action);
    return NextResponse.json(
      { error: "Invalid action. Use 'start' or 'end'" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[API] POST /api/study-sessions - Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
