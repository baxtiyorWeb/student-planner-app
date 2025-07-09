import { type NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabase } from "@/lib/supabase";

const resend = new Resend(process.env.RESEND_API_KEY || 
  "re_2CASf3S3_12yno3HLnPF4kHEtKhaa4vy5"
);

export async function POST(request: NextRequest) {
  try {
    const { userId, type, assignmentId } = await request.json();

    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let emailContent = {
      subject: "",
      html: "",
    };

    if (type === "deadline_reminder" && assignmentId) {
      const { data: assignment } = await supabase
        .from("assignments")
        .select("*, subject:subjects(*)")
        .eq("id", assignmentId)
        .maybeSingle();

      if (assignment) {
        emailContent = {
          subject: `Deadline yaqinlashmoqda: ${assignment.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4F46E5;">StudyFlow - Deadline Eslatmasi</h2>
              <p>Salom ${user.name},</p>
              <p>Sizning <strong>"${assignment.title}"</strong> topshirig'ingiz deadline'i yaqinlashmoqda.</p>
              <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Fan:</strong> ${assignment.subject?.name}</p>
                <p><strong>Deadline:</strong> ${new Date(assignment.deadline).toLocaleDateString("uz-UZ")}</p>
                <p><strong>Muhimlik:</strong> ${assignment.priority === "high" ? "Yuqori" : assignment.priority === "medium" ? "O'rta" : "Past"}</p>
              </div>
              <p>Topshiriqni vaqtida bajarish uchun <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="color: #4F46E5;">dashboard</a>ga o'ting.</p>
              <p>Muvaffaqiyatlar tilaymiz!</p>
              <p><strong>StudyFlow jamoasi</strong></p>
            </div>
          `,
        };
      }
    }

    // Send email
    const { data, error } = await resend.emails.send({
      from: "StudyFlow <noreply@studyflow.uz>",
      to: [user.email],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    if (error) {
      console.error("Email send error:", error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    // Save notification to database
    await supabase.from("notifications").insert({
      user_id: userId,
      assignment_id: assignmentId,
      type,
      title: emailContent.subject,
      message: "Email yuborildi",
      sent_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Notification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
