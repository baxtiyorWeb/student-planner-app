import { type NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { supabaseService } from "@/lib/supabase-enhanced";

export async function GET(request: NextRequest) {
  console.log("[API] GET /api/analytics - Request received");

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    console.log("[API] GET /api/analytics - Params:", {
      userId,
      type,
      startDate,
      endDate,
    });

    if (!userId) {
      console.log("[API] GET /api/analytics - Missing userId");
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    if (type === "study-time") {
      // Get study time analytics
      let query = supabase
        .from("study_sessions")
        .select(
          `
          start_time,
          duration_minutes,
          subject:subjects(name, color)
        `
        )
        .eq("user_id", userId)
        .not("duration_minutes", "is", null);

      if (startDate) {
        query = query.gte("start_time", startDate);
      }

      if (endDate) {
        query = query.lte("start_time", endDate);
      }

      query = query.order("start_time", { ascending: true });

      const { data, error } = await query;

      if (error) {
        console.error("[API] GET /api/analytics - Study time error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      console.log("[API] GET /api/analytics - Study time success:", {
        count: data?.length,
      });
      return NextResponse.json({ data });
    }

    if (type === "completion-rate") {
      // Get completion rate analytics
      let query = supabase
        .from("assignments")
        .select(
          `
          completed,
          completed_at,
          deadline,
          subject:subjects(name, color)
        `
        )
        .eq("user_id", userId);

      if (startDate) {
        query = query.gte("created_at", startDate);
      }

      if (endDate) {
        query = query.lte("created_at", endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error(
          "[API] GET /api/analytics - Completion rate error:",
          error
        );
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      console.log("[API] GET /api/analytics - Completion rate success:", {
        count: data?.length,
      });
      return NextResponse.json({ data });
    }

    if (type === "subject-progress") {
      // Get subject progress analytics
      const { data: subjects, error: subjectsError } = await supabase
        .from("subjects")
        .select("id, name, color")
        .eq("user_id", userId)
        .eq("is_archived", false);

      if (subjectsError) {
        console.error(
          "[API] GET /api/analytics - Subjects error:",
          subjectsError
        );
        return NextResponse.json(
          { error: subjectsError.message },
          { status: 500 }
        );
      }

      const progressData = [];

      for (const subject of subjects) {
        const { data: progress } = await supabaseService.getSubjectProgress(
          userId,
          subject.id
        );
        progressData.push({
          ...subject,
          ...progress,
        });
      }

      console.log("[API] GET /api/analytics - Subject progress success:", {
        count: progressData.length,
      });
      return NextResponse.json({ data: progressData });
    }

    console.log("[API] GET /api/analytics - Invalid type:", type);
    return NextResponse.json(
      { error: "Invalid analytics type" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[API] GET /api/analytics - Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log("[API] POST /api/analytics - Request received");

  try {
    const { userId, eventType, eventData } = await request.json();
    console.log("[API] POST /api/analytics - Data:", {
      userId,
      eventType,
      eventData,
    });

    if (!userId || !eventType) {
      console.log("[API] POST /api/analytics - Missing required fields");
      return NextResponse.json(
        { error: "User ID and event type are required" },
        { status: 400 }
      );
    }

    await supabaseService.trackEvent(userId, eventType, eventData);

    console.log("[API] POST /api/analytics - Event tracked successfully");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] POST /api/analytics - Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
