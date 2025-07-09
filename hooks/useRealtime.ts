"use client"

import { useEffect, useState } from "react"
import { supabaseService } from "@/lib/supabase-enhanced"
import { useAuth } from "./useAuth"

export function useRealtime() {
  const { user } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    if (!user) return

    console.log("[useRealtime] Setting up real-time connections for user:", user.id)

    // Subscribe to assignments changes
    const assignmentsSubscription = supabaseService.subscribeToAssignments(user.id, (payload) => {
      console.log("[useRealtime] Assignment change:", payload)
      // Handle assignment changes
      window.dispatchEvent(new CustomEvent("assignmentChange", { detail: payload }))
    })

    // Subscribe to notifications
    const notificationsSubscription = supabaseService.subscribeToNotifications(user.id, (payload) => {
      console.log("[useRealtime] New notification:", payload)
      setNotifications((prev) => [payload.new, ...prev])

      // Show browser notification if supported
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(payload.new.title, {
          body: payload.new.message,
          icon: "/favicon.ico",
        })
      }
    })

    // Subscribe to study sessions
    const studySessionsSubscription = supabaseService.subscribeToStudySessions(user.id, (payload) => {
      console.log("[useRealtime] Study session change:", payload)
      window.dispatchEvent(new CustomEvent("studySessionChange", { detail: payload }))
    })

    setIsConnected(true)

    return () => {
      console.log("[useRealtime] Cleaning up real-time connections")
      assignmentsSubscription.unsubscribe()
      notificationsSubscription.unsubscribe()
      studySessionsSubscription.unsubscribe()
      setIsConnected(false)
    }
  }, [user])

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission()
      console.log("[useRealtime] Notification permission:", permission)
      return permission === "granted"
    }
    return false
  }

  return {
    isConnected,
    notifications,
    requestNotificationPermission,
  }
}
