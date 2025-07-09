"use client"

import { useEffect, useState } from "react"
import { supabaseService } from "@/lib/supabase-enhanced"
import { useAuth } from "./useAuth"

interface UserStatistics {
  total_assignments: number
  completed_assignments: number
  total_subjects: number
  total_study_hours: number
  current_streak: number
  longest_streak: number
  assignments_due_today: number
  assignments_overdue: number
  average_productivity: number
  study_sessions_this_week: number
  goals_achieved: number
  total_goals: number
}

export function useAnalytics() {
  const { user } = useAuth()
  const [statistics, setStatistics] = useState<UserStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatistics = async () => {
    if (!user) return

    console.log("[useAnalytics] Fetching statistics for user:", user.id)
    setLoading(true)
    setError(null)

    try {
      const stats = await supabaseService.getUserStatistics(user.id)
      if (stats) {
        console.log("[useAnalytics] Statistics fetched:", stats)
        setStatistics(stats)
      }
    } catch (err) {
      console.error("[useAnalytics] Error fetching statistics:", err)
      setError("Failed to fetch statistics")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatistics()
  }, [user])

  const trackEvent = async (eventType: string, eventData?: any) => {
    if (!user) return

    console.log("[useAnalytics] Tracking event:", { eventType, eventData })

    try {
      await supabaseService.trackEvent(user.id, eventType, eventData)
    } catch (err) {
      console.error("[useAnalytics] Error tracking event:", err)
    }
  }

  const refreshStatistics = () => {
    fetchStatistics()
  }

  return {
    statistics,
    loading,
    error,
    trackEvent,
    refreshStatistics,
  }
}
