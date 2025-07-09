import { type NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId");

    if (!subjectId) {
      return NextResponse.json(
        { error: "Subject ID is required" },
        { status: 400 }
      );
    }

    // Get all assignments for this subject
    const { data: assignments, error: assignmentsError } = await supabase
      .from("assignments")
      .select("*")
      .eq("subject_id", subjectId);

    if (assignmentsError) {
      console.error("Error fetching assignments:", assignmentsError);
      return NextResponse.json(
        { error: "Failed to fetch assignments" },
        { status: 500 }
      );
    }

    // Calculate stats
    const totalAssignments = assignments.length;
    const completedAssignments = assignments.filter(
      (a) => a.status === "completed"
    ).length;
    const pendingAssignments = assignments.filter(
      (a) => a.status === "pending"
    ).length;

    // Calculate overdue assignments
    const now = new Date();
    const overdueAssignments = assignments.filter(
      (a) => a.status === "pending" && new Date(a.due_date) < now
    ).length;

    // Calculate completion rate
    const completionRate =
      totalAssignments > 0
        ? Math.round((completedAssignments / totalAssignments) * 100)
        : 0;

    // Calculate average grade
    const gradesAssignments = assignments.filter(
      (a) => a.grade !== null && a.grade !== undefined
    );
    const averageGrade =
      gradesAssignments.length > 0
        ? Math.round(
            gradesAssignments.reduce((sum, a) => sum + a.grade, 0) /
              gradesAssignments.length
          )
        : 0;

    // Calculate upcoming deadlines (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcomingDeadlines = assignments.filter(
      (a) =>
        a.status === "pending" &&
        new Date(a.due_date) >= now &&
        new Date(a.due_date) <= nextWeek
    ).length;

    const stats = {
      totalAssignments,
      completedAssignments,
      pendingAssignments,
      overdueAssignments,
      completionRate,
      averageGrade,
      upcomingDeadlines,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching subject stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
