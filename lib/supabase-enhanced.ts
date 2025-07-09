import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL! || "https://pbsqjlxqlvywhzhorvmc.supabase.co"!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBic3FqbHhxbHZ5d2h6aG9ydm1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzNjY4OTgsImV4cCI6MjA2Njk0Mjg5OH0.QiF9qMJVchfh2RIf_xsS_XUUe0POVg4xfX5pFYaVa9w"!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Enhanced Database Types
export interface EnhancedUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  subscription_type: "free" | "pro";
  subscription_status?: "active" | "inactive" | "canceled" | "past_due";
  stripe_customer_id?: string;
  subscription_end_date?: string;
  timezone: string;
  study_goal_hours: number;
  daily_study_target: number;
  notification_preferences: {
    email: boolean;
    push: boolean;
    deadline_days: number;
  };
  last_active: string;
  total_study_hours: number;
  streak_days: number;
  longest_streak: number;
  created_at: string;
  updated_at: string;
}

export interface EnhancedSubject {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  color: string;
  target_grade?: string;
  study_hours: number;
  is_archived: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface EnhancedAssignment {
  id: string;
  user_id: string;
  subject_id: string;
  title: string;
  description?: string;
  deadline: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
  completed_at?: string;
  estimated_hours: number;
  actual_hours: number;
  difficulty_level: number;
  tags: string[];
  attachment_urls: string[];
  notes?: string;
  reminder_sent: boolean;
  is_recurring: boolean;
  recurrence_pattern?: any;
  created_at: string;
  updated_at: string;
  subject?: EnhancedSubject;
}

export interface StudySession {
  id: string;
  user_id: string;
  subject_id: string;
  assignment_id?: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  notes?: string;
  productivity_rating?: number;
  break_time_minutes: number;
  created_at: string;
  subject?: EnhancedSubject;
  assignment?: EnhancedAssignment;
}

export interface Goal {
  id: string;
  user_id: string;
  subject_id?: string;
  title: string;
  description?: string;
  target_value: number;
  current_value: number;
  unit: string;
  target_date?: string;
  is_achieved: boolean;
  achieved_at?: string;
  created_at: string;
  updated_at: string;
  subject?: EnhancedSubject;
}

export interface UserAnalytics {
  id: string;
  user_id: string;
  event_type: string;
  event_data: any;
  created_at: string;
}

export interface Attachment {
  id: string;
  user_id: string;
  assignment_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_url: string;
  uploaded_at: string;
}

export interface StudyStreak {
  id: string;
  user_id: string;
  streak_date: string;
  study_minutes: number;
  created_at: string;
}

export interface EnhancedNotification {
  id: string;
  user_id: string;
  assignment_id?: string;
  type: string;
  title: string;
  message?: string;
  priority: number;
  action_url?: string;
  metadata?: any;
  scheduled_for?: string;
  delivery_method: string;
  sent_at?: string;
  read_at?: string;
  created_at: string;
}

// Enhanced Supabase client with real-time capabilities
export class SupabaseService {
  private client = supabase;

  // Debug logging
  private log(message: string, data?: any) {
    console.log(`[SupabaseService] ${message}`, data || "");
  }

  private logError(message: string, error: any) {
    console.error(`[SupabaseService ERROR] ${message}`, error);
  }

  // Real-time subscriptions
  subscribeToAssignments(userId: string, callback: (payload: any) => void) {
    this.log("Setting up assignments subscription", { userId });
    return this.client
      .channel("assignments")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "assignments",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          this.log("Assignments change received", payload);
          callback(payload);
        }
      )
      .subscribe();
  }

  subscribeToNotifications(userId: string, callback: (payload: any) => void) {
    this.log("Setting up notifications subscription", { userId });
    return this.client
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          this.log("New notification received", payload);
          callback(payload);
        }
      )
      .subscribe();
  }

  subscribeToStudySessions(userId: string, callback: (payload: any) => void) {
    this.log("Setting up study sessions subscription", { userId });
    return this.client
      .channel("study_sessions")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "study_sessions",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          this.log("Study session change received", payload);
          callback(payload);
        }
      )
      .subscribe();
  }

  // Analytics tracking
  async trackEvent(userId: string, eventType: string, eventData?: any) {
    this.log("Tracking event", { userId, eventType, eventData });

    const { error } = await this.client.from("user_analytics").insert({
      user_id: userId,
      event_type: eventType,
      event_data: eventData,
    });

    if (error) {
      this.logError("Error tracking event", error);
    } else {
      this.log("Event tracked successfully");
    }
  }

  // Get user statistics
  async getUserStatistics(userId: string) {
    this.log("Fetching user statistics", { userId });

    const { data, error } = await this.client.rpc("get_user_statistics", {
      user_uuid: userId,
    });

    if (error) {
      this.logError("Error fetching statistics", error);
      return null;
    }

    this.log("Statistics fetched successfully", data);
    return data;
  }

  // Study session management
  async startStudySession(
    userId: string,
    subjectId: string,
    assignmentId?: string
  ) {
    this.log("Starting study session", { userId, subjectId, assignmentId });

    const { data, error } = await this.client
      .from("study_sessions")
      .insert({
        user_id: userId,
        subject_id: subjectId,
        assignment_id: assignmentId,
        start_time: new Date().toISOString(),
      })
      .select()
      .single();

    if (!error) {
      this.log("Study session started successfully", data);
      await this.trackEvent(userId, "study_session_started", {
        subject_id: subjectId,
        assignment_id: assignmentId,
      });
    } else {
      this.logError("Error starting study session", error);
    }

    return { data, error };
  }

  async endStudySession(
    sessionId: string,
    notes?: string,
    productivityRating?: number
  ) {
    this.log("Ending study session", { sessionId, notes, productivityRating });

    const endTime = new Date().toISOString();

    // First get the session to calculate duration
    const { data: session } = await this.client
      .from("study_sessions")
      .select("start_time, user_id")
      .eq("id", sessionId)
      .single();

    if (!session) {
      this.logError("Session not found", { sessionId });
      return { error: "Session not found" };
    }

    const startTime = new Date(session.start_time);
    const duration = Math.round(
      (new Date(endTime).getTime() - startTime.getTime()) / (1000 * 60)
    );

    this.log("Calculated session duration", { duration });

    const { data, error } = await this.client
      .from("study_sessions")
      .update({
        end_time: endTime,
        duration_minutes: duration,
        notes,
        productivity_rating: productivityRating,
      })
      .eq("id", sessionId)
      .select()
      .single();

    if (!error) {
      this.log("Study session ended successfully", data);

      // Update study streak
      await this.updateStudyStreak(session.user_id, duration);

      await this.trackEvent(session.user_id, "study_session_completed", {
        session_id: sessionId,
        duration_minutes: duration,
        productivity_rating: productivityRating,
      });
    } else {
      this.logError("Error ending study session", error);
    }

    return { data, error };
  }

  async updateStudyStreak(userId: string, studyMinutes: number) {
    this.log("Updating study streak", { userId, studyMinutes });

    const today = new Date().toISOString().split("T")[0];

    const { error } = await this.client.from("study_streaks").upsert(
      {
        user_id: userId,
        streak_date: today,
        study_minutes: studyMinutes,
      },
      {
        onConflict: "user_id,streak_date",
        ignoreDuplicates: false,
      }
    );

    if (error) {
      this.logError("Error updating study streak", error);
    } else {
      this.log("Study streak updated successfully");
    }

    return { error };
  }

  // Advanced queries
  async getAssignmentsWithAnalytics(userId: string) {
    this.log("Fetching assignments with analytics", { userId });

    const { data, error } = await this.client
      .from("assignments")
      .select(
        `
        *,
        subject:subjects(*),
        study_sessions(duration_minutes),
        attachments(*)
      `
      )
      .eq("user_id", userId)
      .order("deadline", { ascending: true });

    if (error) {
      this.logError("Error fetching assignments with analytics", error);
    } else {
      this.log("Assignments with analytics fetched successfully", {
        count: data?.length,
      });
    }

    return { data, error };
  }

  async getSubjectProgress(userId: string, subjectId: string) {
    this.log("Fetching subject progress", { userId, subjectId });

    const { data, error } = await this.client
      .from("assignments")
      .select("completed, estimated_hours, actual_hours")
      .eq("user_id", userId)
      .eq("subject_id", subjectId);

    if (error) {
      this.logError("Error fetching subject progress", error);
      return { error };
    }

    const total = data.length;
    const completed = data.filter((a) => a.completed).length;
    const totalEstimated = data.reduce(
      (sum, a) => sum + (a.estimated_hours || 0),
      0
    );
    const totalActual = data.reduce((sum, a) => sum + (a.actual_hours || 0), 0);

    const progressData = {
      total_assignments: total,
      completed_assignments: completed,
      completion_rate: total > 0 ? (completed / total) * 100 : 0,
      total_estimated_hours: totalEstimated,
      total_actual_hours: totalActual,
      efficiency_rate:
        totalEstimated > 0 ? (totalEstimated / totalActual) * 100 : 0,
    };

    this.log("Subject progress calculated", progressData);

    return {
      data: progressData,
      error: null,
    };
  }

  async getStudyCalendarData(
    userId: string,
    startDate: string,
    endDate: string
  ) {
    this.log("Fetching study calendar data", { userId, startDate, endDate });

    const { data, error } = await this.client
      .from("study_sessions")
      .select(
        `
        *,
        subject:subjects(name, color),
        assignment:assignments(title)
      `
      )
      .eq("user_id", userId)
      .gte("start_time", startDate)
      .lte("start_time", endDate)
      .order("start_time", { ascending: true });

    if (error) {
      this.logError("Error fetching study calendar data", error);
    } else {
      this.log("Study calendar data fetched successfully", {
        count: data?.length,
      });
    }

    return { data, error };
  }

  // Notification management
  async markNotificationAsRead(notificationId: string) {
    this.log("Marking notification as read", { notificationId });

    const { error } = await this.client
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", notificationId);

    if (error) {
      this.logError("Error marking notification as read", error);
    } else {
      this.log("Notification marked as read successfully");
    }

    return { error };
  }

  async getUnreadNotifications(userId: string) {
    this.log("Fetching unread notifications", { userId });

    const { data, error } = await this.client
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .is("read_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      this.logError("Error fetching unread notifications", error);
    } else {
      this.log("Unread notifications fetched successfully", {
        count: data?.length,
      });
    }

    return { data, error };
  }

  // File management
  async uploadFile(file: File, path: string) {
    this.log("Uploading file", { fileName: file.name, path, size: file.size });

    const { data, error } = await this.client.storage
      .from("attachments")
      .upload(path, file);

    if (error) {
      this.logError("Error uploading file", error);
    } else {
      this.log("File uploaded successfully", data);
    }

    return { data, error };
  }

  async deleteFile(path: string) {
    this.log("Deleting file", { path });

    const { error } = await this.client.storage
      .from("attachments")
      .remove([path]);

    if (error) {
      this.logError("Error deleting file", error);
    } else {
      this.log("File deleted successfully");
    }

    return { error };
  }

  async getFileUrl(path: string) {
    this.log("Getting file URL", { path });

    const { data } = this.client.storage.from("attachments").getPublicUrl(path);

    this.log("File URL generated", { url: data.publicUrl });
    return data.publicUrl;
  }

  // CRUD operations
  async createAssignment(assignmentData: Partial<EnhancedAssignment>) {
    this.log("Creating assignment", assignmentData);

    const { data, error } = await this.client
      .from("assignments")
      .insert(assignmentData)
      .select(
        `
        *,
        subject:subjects(*)
      `
      )
      .single();

    if (error) {
      this.logError("Error creating assignment", error);
    } else {
      this.log("Assignment created successfully", data);
      await this.trackEvent(assignmentData.user_id!, "assignment_created", {
        assignment_id: data.id,
      });
    }

    return { data, error };
  }

  async updateAssignment(id: string, updateData: Partial<EnhancedAssignment>) {
    this.log("Updating assignment", { id, updateData });

    const { data, error } = await this.client
      .from("assignments")
      .update(updateData)
      .eq("id", id)
      .select(
        `
        *,
        subject:subjects(*)
      `
      )
      .single();

    if (error) {
      this.logError("Error updating assignment", error);
    } else {
      this.log("Assignment updated successfully", data);
      await this.trackEvent(data.user_id, "assignment_updated", {
        assignment_id: id,
      });
    }

    return { data, error };
  }

  async deleteAssignment(id: string, userId: string) {
    this.log("Deleting assignment", { id, userId });

    const { error } = await this.client
      .from("assignments")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      this.logError("Error deleting assignment", error);
    } else {
      this.log("Assignment deleted successfully");
      await this.trackEvent(userId, "assignment_deleted", {
        assignment_id: id,
      });
    }

    return { error };
  }

  async createSubject(subjectData: Partial<EnhancedSubject>) {
    this.log("Creating subject", subjectData);

    const { data, error } = await this.client
      .from("subjects")
      .insert(subjectData)
      .select()
      .single();

    if (error) {
      this.logError("Error creating subject", error);
    } else {
      this.log("Subject created successfully", data);
      await this.trackEvent(subjectData.user_id!, "subject_created", {
        subject_id: data.id,
      });
    }

    return { data, error };
  }

  async updateSubject(id: string, updateData: Partial<EnhancedSubject>) {
    this.log("Updating subject", { id, updateData });

    const { data, error } = await this.client
      .from("subjects")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      this.logError("Error updating subject", error);
    } else {
      this.log("Subject updated successfully", data);
      await this.trackEvent(data.user_id, "subject_updated", {
        subject_id: id,
      });
    }

    return { data, error };
  }

  async deleteSubject(id: string, userId: string) {
    this.log("Deleting subject", { id, userId });

    const { error } = await this.client
      .from("subjects")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      this.logError("Error deleting subject", error);
    } else {
      this.log("Subject deleted successfully");
      await this.trackEvent(userId, "subject_deleted", { subject_id: id });
    }

    return { error };
  }
}

export const supabaseService = new SupabaseService();
