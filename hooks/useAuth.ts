"use client";

import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  subscription_type: "free" | "pro";
  subscription_status: "active" | "inactive" | "canceled" | "past_due";
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
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

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  initialized: boolean;

  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (
    updates: Partial<UserProfile>
  ) => Promise<{ success: boolean; error?: string }>;
  fetchUserProfile: () => Promise<void>;
  _initializeAuth: () => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  initialized: false,
  _initializeAuth: async () => {
    if (get().initialized) return;

    set({ loading: true });
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session?.user) {
        set({ user: null, loading: false, initialized: true });
        return;
      }

      await get().fetchUserProfile();

      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          await get().fetchUserProfile();
        } else if (event === "SIGNED_OUT") {
          set({ user: null, loading: false, initialized: true });
        }
      });
    } catch (e: any) {
      set({ user: null, loading: false, initialized: true });
    }
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { success: false, error: error.message };
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        console.log("[Auth] Session yaratildi:", session);
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const userProfile: UserProfile = {
          id: user?.id || "",
          email: user?.email || "",
          name: user?.user_metadata?.name || "User",
          avatar_url: user?.user_metadata?.avatar_url,
          subscription_type: "free",
          subscription_status: "inactive",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          study_goal_hours: 0,
          daily_study_target: 2,
          notification_preferences: {
            email: true,
            push: true,
            deadline_days: 3,
          },
          last_active: new Date().toISOString(),
          total_study_hours: 0,
          streak_days: 0,
          longest_streak: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        set({ user: userProfile });
        // Cookie'ni tekshirish
        if (document.cookie.includes("sb-access-token")) {
          console.log("[Auth] sb-access-token cookie mavjud!");
        } else {
          console.error("[Auth] sb-access-token cookie yo'q!");
        }
      } else {
        console.error(
          "[Auth] Session yaratilmadi:",
          await supabase.auth.getSession()
        );
        return { success: false, error: "Session yaratilmadi" };
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || "Kutilmagan xatolik" };
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (email, password, name) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });

      if (error) return { success: false, error: error.message };

      if (data.user) {
        // Wait a bit for the trigger to create the profile
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await get().fetchUserProfile();
      }

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || "Unexpected error" };
    } finally {
      set({ loading: false });
    }
  },

  signInWithGoogle: async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) return { success: false, error: error.message };

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || "Unexpected error" };
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      set({ user: null, loading: false, initialized: true });
    }
  },

  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) return { success: false, error: "Not authenticated" };

    try {
      const { data, error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();

      if (error) return { success: false, error: error.message };

      set({ user: data });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || "Unexpected error" };
    }
  },

  fetchUserProfile: async () => {
    set({ loading: true });
    try {
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !authUser) {
        set({ user: null, loading: false, initialized: true });
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (profileError) {
        if (profileError.code === "PGRST116") {
          // Profile not found, create default profile
          const fallback: UserProfile = {
            id: authUser.id,
            email: authUser.email || "",
            name: authUser.user_metadata?.name || "User",
            subscription_type: "free",
            subscription_status: "inactive",
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            study_goal_hours: 0,
            daily_study_target: 2,
            notification_preferences: {
              email: true,
              push: true,
              deadline_days: 3,
            },
            total_study_hours: 0,
            streak_days: 0,
            longest_streak: 0,
            last_active: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const { error: insertError } = await supabase
            .from("users")
            .insert(fallback);

          if (!insertError) {
            set({ user: fallback, loading: false, initialized: true });
          } else {
            set({ user: null, loading: false, initialized: true });
          }
          return;
        } else {
          set({ user: null, loading: false, initialized: true });
          return;
        }
      }

      set({ user: profile, loading: false, initialized: true });
    } catch (e: any) {
      set({ user: null, loading: false, initialized: true });
    }
  },
}));

export const useIsAuthenticated = () => {
  const { user, initialized } = useAuth();
  return initialized && user !== null;
};
