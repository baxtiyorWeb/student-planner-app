"use client";

import { useEffect, useState } from "react";
import { supabase, type User } from "@/lib/supabase";
import { useAuth } from "./useAuth";

export function useSubscription() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    } else {
      setUserProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const isPro =
    userProfile?.subscription_type === "pro" &&
    userProfile?.subscription_status === "active";

  const canAddMoreSubjects = async () => {
    if (isPro) return true;

    const { count } = await supabase
      .from("subjects")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user?.id);

    return (count || 0) < 3;
  };

  return {
    userProfile,
    loading,
    isPro,
    canAddMoreSubjects,
    refetch: fetchUserProfile,
  };
}
