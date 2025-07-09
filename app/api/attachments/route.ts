import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { supabaseService } from "@/lib/supabase-enhanced"

export async function GET(request: NextRequest) {
  console.log("[API] GET /api/attachments - Request received")

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const assignmentId = searchParams.get("assignmentId")

    console.log("[API] GET /api/attachments - Params:", { userId, assignmentId })

    if (!userId) {
      console.log("[API] GET /api/attachments - Missing userId")
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    let query = supabase.from("attachments").select("*").eq("user_id", userId)

    if (assignmentId) {
      query = query.eq("assignment_id", assignmentId)
    }

    query = query.order("uploaded_at", { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error("[API] GET /api/attachments - Database error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[API] GET /api/attachments - Success:", { count: data?.length })
    return NextResponse.json({ data })
  } catch (error) {
    console.error("[API] GET /api/attachments - Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  console.log("[API] POST /api/attachments - Request received")

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const userId = formData.get("userId") as string
    const assignmentId = formData.get("assignmentId") as string

    console.log("[API] POST /api/attachments - Data:", {
      fileName: file?.name,
      fileSize: file?.size,
      userId,
      assignmentId,
    })

    if (!file || !userId || !assignmentId) {
      console.log("[API] POST /api/attachments - Missing required fields")
      return NextResponse.json({ error: "File, User ID, and Assignment ID are required" }, { status: 400 })
    }

    // Generate unique file path
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${userId}/${assignmentId}/${fileName}`

    console.log("[API] POST /api/attachments - Uploading file:", filePath)

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseService.uploadFile(file, filePath)

    if (uploadError) {
      console.error("[API] POST /api/attachments - Upload error:", uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Get public URL
    const fileUrl = supabaseService.getFileUrl(filePath)

    // Save attachment record to database
    const { data, error } = await supabase
      .from("attachments")
      .insert({
        user_id: userId,
        assignment_id: assignmentId,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        file_url: fileUrl,
      })
      .select()
      .single()

    if (error) {
      console.error("[API] POST /api/attachments - Database error:", error)
      // Clean up uploaded file if database insert fails
      await supabaseService.deleteFile(filePath)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[API] POST /api/attachments - Success:", data)
    return NextResponse.json({ data })
  } catch (error) {
    console.error("[API] POST /api/attachments - Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  console.log("[API] DELETE /api/attachments - Request received")

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const userId = searchParams.get("userId")

    console.log("[API] DELETE /api/attachments - Params:", { id, userId })

    if (!id || !userId) {
      console.log("[API] DELETE /api/attachments - Missing required params")
      return NextResponse.json({ error: "Attachment ID and User ID required" }, { status: 400 })
    }

    // Get attachment info first
    const { data: attachment, error: fetchError } = await supabase
      .from("attachments")
      .select("file_url")
      .eq("id", id)
      .eq("user_id", userId)
      .single()

    if (fetchError) {
      console.error("[API] DELETE /api/attachments - Fetch error:", fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!attachment) {
      console.log("[API] DELETE /api/attachments - Attachment not found")
      return NextResponse.json({ error: "Attachment not found" }, { status: 404 })
    }

    // Extract file path from URL
    const filePath = attachment.file_url.split("/").slice(-3).join("/")

    // Delete from storage
    await supabaseService.deleteFile(filePath)

    // Delete from database
    const { error } = await supabase.from("attachments").delete().eq("id", id).eq("user_id", userId)

    if (error) {
      console.error("[API] DELETE /api/attachments - Database error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[API] DELETE /api/attachments - Success")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] DELETE /api/attachments - Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
