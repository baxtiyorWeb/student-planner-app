import { type NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  console.log("[API] GET /api/goals - Request received");

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const subjectId = searchParams.get("subjectId");
    const achieved = searchParams.get("achieved");

    console.log("[API] GET /api/goals - Params:", {
      userId,
      subjectId,
      achieved,
    });

    if (!userId) {
      console.log("[API] GET /api/goals - Missing userId");
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    let query = supabase
      .from("goals")
      .select(
        `
        *,
        subject:subjects(name, color)
      `
      )
      .eq("user_id", userId);

    if (subjectId) {
      query = query.eq("subject_id", subjectId);
    }

    if (achieved !== null) {
      query = query.eq("is_achieved", achieved === "true");
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("[API] GET /api/goals - Database error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("[API] GET /api/goals - Success:", { count: data?.length });
    return NextResponse.json({ data });
  } catch (error) {
    console.error("[API] GET /api/goals - Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log("[API] POST /api/goals - Request received");

  try {
    const goalData = await request.json();
    console.log("[API] POST /api/goals - Data:", goalData);

    if (!goalData.user_id || !goalData.title || !goalData.target_value) {
      console.log("[API] POST /api/goals - Missing required fields");
      return NextResponse.json(
        { error: "User ID, title, and target value are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("goals")
      .insert(goalData)
      .select(
        `
        *,
        subject:subjects(name, color)
      `
      )
      .single();

    if (error) {
      console.error("[API] POST /api/goals - Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("[API] POST /api/goals - Success:", data);
    return NextResponse.json({ data });
  } catch (error) {
    console.error("[API] POST /api/goals - Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  console.log("[API] PUT /api/goals - Request received");

  try {
    const { id, ...updateData } = await request.json();
    console.log("[API] PUT /api/goals - Data:", { id, updateData });

    if (!id) {
      console.log("[API] PUT /api/goals - Missing goal ID");
      return NextResponse.json({ error: "Goal ID required" }, { status: 400 });
    }

    // If marking as achieved, set achieved_at timestamp
    if (updateData.is_achieved === true && !updateData.achieved_at) {
      updateData.achieved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("goals")
      .update(updateData)
      .eq("id", id)
      .select(
        `
        *,
        subject:subjects(name, color)
      `
      )
      .single();

    if (error) {
      console.error("[API] PUT /api/goals - Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("[API] PUT /api/goals - Success:", data);
    return NextResponse.json({ data });
  } catch (error) {
    console.error("[API] PUT /api/goals - Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  console.log("[API] DELETE /api/goals - Request received");

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");

    console.log("[API] DELETE /api/goals - Params:", { id, userId });

    if (!id || !userId) {
      console.log("[API] DELETE /api/goals - Missing required params");
      return NextResponse.json(
        { error: "Goal ID and User ID required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("goals")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("[API] DELETE /api/goals - Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("[API] DELETE /api/goals - Success");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] DELETE /api/goals - Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
