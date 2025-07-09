"use client";

import { create } from "zustand";
import { useAuth } from "./useAuth";

interface SubscriptionLimits {
  subjects: number;
  assignments: number;
  studySessions: number;
  goals: number;
  attachments: number;
  attachmentSizeMB: number;
}

interface UsageStats {
  subjects: number;
  assignments: number;
  studySessions: number;
  goals: number;
  attachments: number;
  attachmentSizeMB: number;
}

interface SubscriptionState {
  user: any;
  loading: boolean;
  limits: SubscriptionLimits;
  usage: UsageStats;
  isPro: boolean;
  isProUser: () => boolean;
  getUsagePercentage: (type: keyof UsageStats) => number;
  canAddMoreSubjects: () => Promise<boolean>;
  canAddMoreAssignments: () => Promise<boolean>;
  canAddMoreStudySessions: () => Promise<boolean>;
  canAddMoreGoals: () => Promise<boolean>;
  canUploadAttachment: (sizeMB: number) => Promise<boolean>;
  refreshUsage: () => void;
  fetchUsage: () => Promise<void>;
}

const FREE_LIMITS: SubscriptionLimits = {
  subjects: 5,
  assignments: 20,
  studySessions: 10,
  goals: 3,
  attachments: 5,
  attachmentSizeMB: 5,
};

const PRO_LIMITS: SubscriptionLimits = {
  subjects: 50,
  assignments: 500,
  studySessions: 1000,
  goals: 50,
  attachments: 100,
  attachmentSizeMB: 100,
};

export const useSubscription = create<SubscriptionState>((set, get) => ({
  user: null,
  loading: false,
  limits: FREE_LIMITS,
  usage: {
    subjects: 0,
    assignments: 0,
    studySessions: 0,
    goals: 0,
    attachments: 0,
    attachmentSizeMB: 0,
  },
  isPro: false,

  isProUser: () => {
    const { user } = get();
    return (
      user?.subscription_type === "pro" &&
      user?.subscription_status === "active"
    );
  },

  getUsagePercentage: (type: keyof UsageStats) => {
    const { usage, limits } = get();
    const usageValue = usage[type];
    const limitValue = limits[type];
    return limitValue > 0 ? Math.round((usageValue / limitValue) * 100) : 0;
  },

  canAddMoreSubjects: async () => {
    const { limits, usage } = get();
    return usage.subjects < limits.subjects;
  },

  canAddMoreAssignments: async () => {
    const { limits, usage } = get();
    return usage.assignments < limits.assignments;
  },

  canAddMoreStudySessions: async () => {
    const { limits, usage } = get();
    return usage.studySessions < limits.studySessions;
  },

  canAddMoreGoals: async () => {
    const { limits, usage } = get();
    return usage.goals < limits.goals;
  },

  canUploadAttachment: async (sizeMB: number) => {
    const { limits, usage } = get();
    return (
      usage.attachments < limits.attachments &&
      sizeMB <= limits.attachmentSizeMB
    );
  },

  fetchUsage: async () => {
    const authState = useAuth.getState();
    const user = authState.user;

    if (!user) return;

    try {
      // Fetch actual usage from API or calculate from user data
      // For now, we'll use placeholder values
      set({
        usage: {
          subjects: 0,
          assignments: 0,
          studySessions: 0,
          goals: 0,
          attachments: 0,
          attachmentSizeMB: 0,
        },
      });
    } catch (error) {
      console.error("Error fetching usage:", error);
    }
  },

  refreshUsage: () => {
    const authState = useAuth.getState();
    const user = authState.user;

    if (user) {
      const isPro =
        user.subscription_type === "pro" &&
        user.subscription_status === "active";

      set({
        user,
        isPro,
        limits: isPro ? PRO_LIMITS : FREE_LIMITS,
      });

      // Fetch current usage
      get().fetchUsage();
    }
  },
}));

// Initialize subscription state when auth changes
useAuth.subscribe((state) => {
  const subscriptionState = useSubscription.getState();
  if (state.user) {
    const isPro =
      state.user.subscription_type === "pro" &&
      state.user.subscription_status === "active";

    useSubscription.setState({
      user: state.user,
      isPro,
      limits: isPro ? PRO_LIMITS : FREE_LIMITS,
    });

    // Refresh usage data
    subscriptionState.refreshUsage();
  }
});


