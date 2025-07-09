import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser, supabase } from "@/lib/supabase";
import { supabaseService } from "@/lib/supabase-enhanced";
import { createServerSupabaseClient } from "@/lib/supabase-server";
export async function GET(request: NextRequest) {
  console.log("[API] GET /api/subjects - Request received");
  const { supabase, response } = createServerSupabaseClient(request);
  const authResult = await supabase.auth.getUser();
  if (!authResult.data.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const id = searchParams.get("id");

    console.log("[API] GET /api/subjects - Params:", { userId, id });

    if (id) {
      // Get single subject
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("[API] GET /api/subjects - Single subject error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      console.log(
        "[API] GET /api/subjects - Single subject success:",
        data?.id
      );
      return NextResponse.json({ data });
    }

    if (!userId) {
      console.log("[API] GET /api/subjects - Missing userId");
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Get all subjects for user
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .eq("user_id", userId)
      .eq("is_archived", false)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("[API] GET /api/subjects - Database error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("[API] GET /api/subjects - Success:", { count: data?.length });
    return NextResponse.json({ data });
  } catch (error) {
    console.error("[API] GET /api/subjects - Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { supabase, response } = createServerSupabaseClient(request);
  console.log(
    "[API] POST /api/subjects - Cookies received:",
    request.cookies
      .getAll()
      .map((c) => `${c.name}: ${c.value}`)
      .join(", ")
  );
  const authHeader = request.headers.get("Authorization");
  console.log("[API] POST /api/subjects - Authorization header:", authHeader);

  let authResult;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    authResult = await supabase.auth.getUser(token); // Token bilan tekshirish
  } else {
    authResult = await supabase.auth.getUser(); // Cookie'dan tekshirish
  }
  console.log("[API] POST /api/subjects - Auth Result:", authResult);

  try {
    const {
      data: { user },
      error: userError,
    } = authResult;

    if (userError || !user) {
      console.log("[API] POST /api/subjects - Unauthorized:", { userError });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subjectData = await request.json();
    console.log("[API] POST /api/subjects - Received data:", subjectData);

    if (!subjectData.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (subjectData.user_id && subjectData.user_id !== user.id) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 403 });
    }

    const { count } = await supabase
      .from("subjects")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    const { data, error } = await supabase
      .from("subjects")
      .insert([
        {
          ...subjectData,
          user_id: user.id,
          sort_order: (count || 0) + 1,
          study_hours: 0,
          is_archived: false,
        },
      ])
      .select();

    if (error) {
      console.error("[API] POST /api/subjects - Database error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("[API] POST /api/subjects - Success:", data);
    return response.json(); // To'g'ri ishlatish
  } catch (err) {
    console.error("POST /api/subjects error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
export async function PUT(request: NextRequest) {
  console.log("[API] PUT /api/subjects - Request received");

  try {
    const { id, ...updateData } = await request.json();
    console.log("[API] PUT /api/subjects - Data:", { id, updateData });

    if (!id) {
      console.log("[API] PUT /api/subjects - Missing subject ID");
      return NextResponse.json(
        { error: "Subject ID required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseService.updateSubject(id, updateData);

    if (error) {
      console.error("[API] PUT /api/subjects - Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("[API] PUT /api/subjects - Success:", data);
    return NextResponse.json({ data });
  } catch (error) {
    console.error("[API] PUT /api/subjects - Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  console.log("[API] DELETE /api/subjects - Request received");

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");

    console.log("[API] DELETE /api/subjects - Params:", { id, userId });

    if (!id || !userId) {
      console.log("[API] DELETE /api/subjects - Missing required params");
      return NextResponse.json(
        { error: "Subject ID and User ID required" },
        { status: 400 }
      );
    }

    const { error } = await supabaseService.deleteSubject(id, userId);

    if (error) {
      console.error("[API] DELETE /api/subjects - Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("[API] DELETE /api/subjects - Success");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] DELETE /api/subjects - Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
