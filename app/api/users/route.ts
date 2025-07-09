import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  console.log("[API] GET /api/users - Request received")

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    console.log("[API] GET /api/users - Params:", { userId })

    if (!userId) {
      console.log("[API] GET /api/users - Missing userId")
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

    if (error) {
      console.error("[API] GET /api/users - Database error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[API] GET /api/users - Success:", data?.id)
    return NextResponse.json({ data })
  } catch (error) {
    console.error("[API] GET /api/users - Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  console.log("[API] PUT /api/users - Request received")

  try {
    const { id, ...updateData } = await request.json()
    console.log("[API] PUT /api/users - Data:", { id, updateData })

    if (!id) {
      console.log("[API] PUT /api/users - Missing user ID")
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const { data, error } = await supabase.from("users").update(updateData).eq("id", id).select().single()

    if (error) {
      console.error("[API] PUT /api/users - Error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[API] PUT /api/users - Success:", data)
    return NextResponse.json({ data })
  } catch (error) {
    console.error("[API] PUT /api/users - Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
