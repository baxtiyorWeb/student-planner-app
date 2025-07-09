import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
console.log("[Supabase] Initializing client with URL:", supabaseUrl);
console.log("[Supabase] Anon Key:", supabaseAnonKey ? "Loaded" : "Not Loaded");

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  subscription_type: "free" | "pro";
  subscription_status?: "active" | "canceled" | "past_due";
  stripe_customer_id?: string;
  subscription_end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Assignment {
  id: string;
  user_id: string;
  subject_id: string;
  title: string;
  description?: string;
  deadline: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  subject?: Subject;
}

export interface Notification {
  id: string;
  user_id: string;
  assignment_id?: string;
  type: "deadline_reminder" | "assignment_due" | "subscription_reminder";
  title: string;
  message?: string;
  sent_at?: string;
  read_at?: string;
  created_at: string;
}

// Auth helpers
export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};
