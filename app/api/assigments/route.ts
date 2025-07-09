import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { supabaseService } from "@/lib/supabase-enhanced"

export async function GET(request: NextRequest) {
  console.log("[API] GET /api/assignments - Request received")

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const subjectId = searchParams.get("subjectId")
    const id = searchParams.get("id")

    console.log("[API] GET /api/assignments - Params:", { userId, subjectId, id })

    if (id) {
      // Get single assignment
      const { data, error } = await supabase
        .from("assignments")
        .select(`
          *,
          subject:subjects(*)
        `)
        .eq("id", id)
        .single()

      if (error) {
        console.error("[API] GET /api/assignments - Single assignment error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      console.log("[API] GET /api/assignments - Single assignment success:", data?.id)
      return NextResponse.json({ data })
    }

    let query = supabase.from("assignments").select(`
        *,
        subject:subjects(*)
      `)

    if (userId) {
      query = query.eq("user_id", userId)
    }

    if (subjectId) {
      query = query.eq("subject_id", subjectId)
    }

    query = query.order("deadline", { ascending: true })

    const { data, error } = await query

    if (error) {
      console.error("[API] GET /api/assignments - Database error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[API] GET /api/assignments - Success:", { count: data?.length })
    return NextResponse.json({ data })
  } catch (error) {
    console.error("[API] GET /api/assignments - Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  console.log("[API] POST /api/assignments - Request received")

  try {
    const assignmentData = await request.json()
    console.log("[API] POST /api/assignments - Data:", assignmentData)

    if (!assignmentData.user_id || !assignmentData.subject_id || !assignmentData.title) {
      console.log("[API] POST /api/assignments - Missing required fields")
      return NextResponse.json({ error: "User ID, subject ID, and title are required" }, { status: 400 })
    }

    const { data, error } = await supabaseService.createAssignment({
      ...assignmentData,
      completed: false,
      actual_hours: 0,
      tags: assignmentData.tags || [],
      attachment_urls: assignmentData.attachment_urls || [],
      reminder_sent: false,
      is_recurring: false,
    })

    if (error) {
      console.error("[API] POST /api/assignments - Error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[API] POST /api/assignments - Success:", data)
    return NextResponse.json({ data })
  } catch (error) {
    console.error("[API] POST /api/assignments - Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  console.log("[API] PUT /api/assignments - Request received")

  try {
    const { id, ...updateData } = await request.json()
    console.log("[API] PUT /api/assignments - Data:", { id, updateData })

    if (!id) {
      console.log("[API] PUT /api/assignments - Missing assignment ID")
      return NextResponse.json({ error: "Assignment ID required" }, { status: 400 })
    }

    // If marking as completed, add completed_at timestamp
    if (updateData.completed === true && !updateData.completed_at) {
      updateData.completed_at = new Date().toISOString()
    } else if (updateData.completed === false) {
      updateData.completed_at = null
    }

    const { data, error } = await supabaseService.updateAssignment(id, updateData)

    if (error) {
      console.error("[API] PUT /api/assignments - Error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[API] PUT /api/assignments - Success:", data)
    return NextResponse.json({ data })
  } catch (error) {
    console.error("[API] PUT /api/assignments - Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  console.log("[API] DELETE /api/assignments - Request received")

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const userId = searchParams.get("userId")

    console.log("[API] DELETE /api/assignments - Params:", { id, userId })

    if (!id || !userId) {
      console.log("[API] DELETE /api/assignments - Missing required params")
      return NextResponse.json({ error: "Assignment ID and User ID required" }, { status: 400 })
    }

    const { error } = await supabaseService.deleteAssignment(id, userId)

    if (error) {
      console.error("[API] DELETE /api/assignments - Error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[API] DELETE /api/assignments - Success")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] DELETE /api/assignments - Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
