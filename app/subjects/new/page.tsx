"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  BookOpen,
  Palette,
  Target,
  AlertCircle,
  Crown,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const COLORS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
];

export default function NewSubjectPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { canAddMoreSubjects, usage, limits, isProUser, refreshUsage } =
    useSubscription();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: COLORS[0],
    target_grade: "",
    user_id: user?.id || "", // user_id ni avtomatik qo'shish
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [canAdd, setCanAdd] = useState(true);

  useEffect(() => {
    checkLimit();
  }, [usage, limits]);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) console.log("[Auth] State changed, session:", session);
        else console.log("[Auth] No session");
      }
    );
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  const checkLimit = async () => {
    console.log("[NewSubject] Checking subject limit");
    try {
      const result = await canAddMoreSubjects();
      console.log("[NewSubject] Can add more subjects:", result);
      setCanAdd(result);
    } catch (error) {
      console.error("[NewSubject] Error checking limit:", error);
      setCanAdd(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("Please log in to create a subject");
      return;
    }

    const { data: session } = await supabase.auth.getSession();
    if (!session) {
      setError("Session not found, please log in again");
      router.push("/login");
      return;
    }

    if (!canAdd) {
      setError(
        "You've reached your subject limit. Upgrade to Pro for more subjects."
      );
      return;
    }

    if (!formData.name.trim()) {
      setError("Subject name is required");
      return;
    }

    console.log("[NewSubject] Creating subject:", formData);
    console.log("[NewSubject] Cookies sent:", document.cookie);
    if (!document.cookie.includes("sb-access-token")) {
      console.log("[NewSubject] No session cookie, redirecting to login");
      router.push("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.session?.access_token}`, // To'g'ri tokenni ishlatish
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const result = await res.json();
      console.log("[NewSubject] API response:", result);

      if (!res.ok) {
        throw new Error(result.error || "Failed to create subject");
      }

      console.log("[NewSubject] Subject created successfully");
      refreshUsage();
      router.push("/subjects");
    } catch (error) {
      console.error("[NewSubject] Error creating subject:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create subject"
      );
    } finally {
      setLoading(false);
    }
  };

  const usagePercentage = (usage.subjects / limits.subjects) * 100;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-lg font-semibold mb-2">
                Authentication Required
              </h2>
              <p className="text-muted-foreground mb-4">
                Please log in to create a subject.
              </p>
              <Button asChild>
                <Link href="/login">Go to Login</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4 hover:bg-white/50">
            <Link href="/subjects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Subjects
            </Link>
          </Button>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create New Subject
            </h1>
            <p className="text-gray-600">
              Add a new subject to organize your studies
            </p>
          </div>
        </div>

        {/* Usage Stats */}
        <Card className="mb-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Subject Usage</span>
              </div>
              {!isProUser() && (
                <Badge
                  variant="outline"
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0"
                >
                  <Crown className="mr-1 h-3 w-3" />
                  Free Plan
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  Subjects: {usage.subjects} / {limits.subjects}
                </span>
                <span>{Math.round(usagePercentage)}%</span>
              </div>
              <Progress value={usagePercentage} className="h-2" />
            </div>

            {!canAdd && (
              <Alert className="mt-4 border-orange-200 bg-orange-50">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  You've reached your subject limit.
                  <Link href="/pricing" className="font-medium underline ml-1">
                    Upgrade to Pro
                  </Link>{" "}
                  for unlimited subjects.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Form */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-indigo-600" />
              Subject Details
            </CardTitle>
            <CardDescription>
              Fill in the information for your new subject
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="animate-shake">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Subject Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Mathematics, Physics, History"
                  className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
                  disabled={loading || !canAdd}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of the subject..."
                  className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
                  disabled={loading || !canAdd}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_grade">Target Grade</Label>
                <Input
                  id="target_grade"
                  value={formData.target_grade}
                  onChange={(e) =>
                    setFormData({ ...formData, target_grade: e.target.value })
                  }
                  placeholder="e.g., A+, 95%, Excellent"
                  className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
                  disabled={loading || !canAdd}
                />
              </div>

              <div className="space-y-3">
                <Label>Color Theme</Label>
                <div className="grid grid-cols-8 gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full transition-all duration-200 hover:scale-110 ${
                        formData.color === color
                          ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                          : ""
                      }`}
                      style={{ backgroundColor: color }}
                      disabled={loading || !canAdd}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !canAdd}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </div>
                  ) : (
                    "Create Subject"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
