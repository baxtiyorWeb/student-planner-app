"use client";

import { useState, useEffect } from "react";
import { supabaseService, type StudySession } from "@/lib/supabase-enhanced";
import { useAuth } from "./useAuth";

export function useStudySession() {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState<StudySession | null>(
    null
  );
  const [isActive, setIsActive] = useState(false);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && currentSession) {
      interval = setInterval(() => {
        const startTime = new Date(currentSession.start_time).getTime();
        const now = new Date().getTime();
        const elapsed = Math.floor((now - startTime) / 1000 / 60); // minutes
        setDuration(elapsed);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, currentSession]);

  const startSession = async (subjectId: string, assignmentId?: string) => {
    if (!user) return { error: "User not authenticated" };

    console.log("[useStudySession] Starting session:", {
      subjectId,
      assignmentId,
    });
    setLoading(true);

    try {
      const { data, error } = await supabaseService.startStudySession(
        user.id,
        subjectId,
        assignmentId
      );

      if (error) {
        console.error("[useStudySession] Error starting session:", error);
        return { error };
      }

      console.log("[useStudySession] Session started:", data);
      setCurrentSession(data);
      setIsActive(true);
      setDuration(0);

      return { data };
    } catch (err) {
      console.error("[useStudySession] Unexpected error:", err);
      return { error: "Unexpected error occurred" };
    } finally {
      setLoading(false);
    }
  };

  const endSession = async (notes?: string, productivityRating?: number) => {
    if (!currentSession) return { error: "No active session" };

    console.log("[useStudySession] Ending session:", {
      notes,
      productivityRating,
    });
    setLoading(true);

    try {
      const { data, error } = await supabaseService.endStudySession(
        currentSession.id,
        notes,
        productivityRating
      );

      if (error) {
        console.error("[useStudySession] Error ending session:", error);
        return { error };
      }

      console.log("[useStudySession] Session ended:", data);
      setCurrentSession(null);
      setIsActive(false);
      setDuration(0);

      return { data };
    } catch (err) {
      console.error("[useStudySession] Unexpected error:", err);
      return { error: "Unexpected error occurred" };
    } finally {
      setLoading(false);
    }
  };

  const pauseSession = () => {
    console.log("[useStudySession] Pausing session");
    setIsActive(false);
  };

  const resumeSession = () => {
    console.log("[useStudySession] Resuming session");
    setIsActive(true);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return {
    currentSession,
    isActive,
    duration,
    loading,
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    formatDuration,
  };
}
