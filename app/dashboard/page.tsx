"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  BookOpen,
  Clock,
  Plus,
  Bell,
  CheckCircle2,
  TrendingUp,
  Target,
  Zap,
  Crown,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase, type Assignment, type Subject } from "@/lib/supabase";
import { createPortalSession } from "@/lib/stripe";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const {
    userProfile,
    isPro,
    loading: subscriptionLoading,
  } = useSubscription();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [todayAssignments, setTodayAssignments] = useState<Assignment[]>([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState<Assignment[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && !authLoading) {
      fetchData();
    }
  }, [user, authLoading]);

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch subjects
      const { data: subjectsData } = await supabase
        .from("subjects")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // Fetch today's assignments
      const today = new Date().toISOString().split("T")[0];
      const { data: todayData } = await supabase
        .from("assignments")
        .select("*, subject:subjects(*)")
        .eq("user_id", user.id)
        .eq("deadline", today)
        .eq("completed", false);

      // Fetch upcoming assignments
      const { data: upcomingData } = await supabase
        .from("assignments")
        .select("*, subject:subjects(*)")
        .eq("user_id", user.id)
        .gt("deadline", today)
        .eq("completed", false)
        .order("deadline", { ascending: true })
        .limit(5);

      setSubjects(subjectsData || []);
      setTodayAssignments(todayData || []);
      setUpcomingAssignments(upcomingData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAssignment = async (id: string) => {
    try {
      const assignment = todayAssignments.find((a) => a.id === id);
      if (!assignment) return;

      const { error } = await supabase
        .from("assignments")
        .update({
          completed: !assignment.completed,
          completed_at: !assignment.completed ? new Date().toISOString() : null,
        })
        .eq("id", id);

      if (!error) {
        setTodayAssignments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a))
        );
      }
    } catch (error) {
      console.error("Error updating assignment:", error);
    }
  };

  const handleManageSubscription = async () => {
    if (!userProfile?.stripe_customer_id) return;

    try {
      const { url } = await createPortalSession(userProfile.stripe_customer_id);
      window.location.href = url;
    } catch (error) {
      console.error("Error opening billing portal:", error);
    }
  };

  if (authLoading || subscriptionLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // useAuth will redirect to login
  }

  const completedToday = todayAssignments.filter((a) => a.completed).length;
  const totalToday = todayAssignments.length;
  const progressPercentage =
    totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">StudyFlow</h1>
                <p className="text-xs text-gray-500">
                  Professional Study Planner
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {isPro && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                  <Crown className="h-3 w-3 mr-1" />
                  Pro
                </Badge>
              )}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
              </Button>
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src={user.user_metadata?.avatar_url || "/placeholder.svg"}
                />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm">
                  {user.user_metadata?.name?.charAt(0) || user.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Xush kelibsiz,{" "}
                <span className="text-indigo-600">
                  {user.user_metadata?.name || "Talaba"}!
                </span>
              </h1>
              <p className="text-gray-600 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                Bugun {totalToday}ta topshiriq kutilmoqda
              </p>
            </div>
            <div className="hidden md:block">
              <div className="text-right">
                <p className="text-sm text-gray-500">Bugungi sana</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date().toLocaleDateString("uz-UZ")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Alert */}
        {!isPro && subjects.length >= 3 && (
          <Card className="mb-8 border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Crown className="h-8 w-8 text-yellow-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Bepul limit tugadi!
                    </h3>
                    <p className="text-gray-600">
                      Pro rejaga o'tib, cheksiz fanlar qo'shing
                    </p>
                  </div>
                </div>
                <Link href="/pricing">
                  <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                    Pro'ga o'tish
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 bg-gradient-to-br from-blue-500 to-cyan-500 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium opacity-90">
                Jami Fanlar
              </CardTitle>
              <BookOpen className="h-4 w-4 opacity-80" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">{subjects.length}</div>
              <p className="text-xs opacity-80 mt-1">
                {isPro ? "Cheksiz" : `${3 - subjects.length} qoldi`}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-green-500 to-emerald-500 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium opacity-90">
                Bugungi Vazifalar
              </CardTitle>
              <Target className="h-4 w-4 opacity-80" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">{totalToday}</div>
              <p className="text-xs opacity-80 mt-1">Deadline bugun</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-purple-500 to-violet-500 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium opacity-90">
                Bajarilgan
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 opacity-80" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">{completedToday}</div>
              <p className="text-xs opacity-80 mt-1">Bugun bajarilgan</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-orange-500 to-red-500 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium opacity-90">
                Samaradorlik
              </CardTitle>
              <TrendingUp className="h-4 w-4 opacity-80" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">
                {Math.round(progressPercentage)}%
              </div>
              <p className="text-xs opacity-80 mt-1">Bugungi progress</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Focus */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Bugungi Focus</CardTitle>
                      <CardDescription>
                        Eng muhim topshiriqlaringiz
                      </CardDescription>
                    </div>
                  </div>
                  <Link href="/assignments/new">
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Qo'shish
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {todayAssignments.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Ajoyib!
                    </h3>
                    <p className="text-gray-500">
                      Bugun barcha topshiriqlar bajarilgan
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todayAssignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className={`group flex items-center space-x-4 p-4 rounded-xl border transition-all duration-200 ${
                          assignment.completed
                            ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                            : "bg-white hover:shadow-md border-gray-200 hover:border-indigo-300"
                        }`}
                      >
                        <button
                          onClick={() => toggleAssignment(assignment.id)}
                          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            assignment.completed
                              ? "bg-green-500 border-green-500 text-white"
                              : "border-gray-300 hover:border-indigo-500 group-hover:scale-110"
                          }`}
                        >
                          {assignment.completed && (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                        </button>

                        <div className="flex-1">
                          <h3
                            className={`font-semibold ${assignment.completed ? "line-through text-gray-500" : "text-gray-900"}`}
                          >
                            {assignment.title}
                          </h3>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm text-gray-600">
                              {assignment.subject?.name}
                            </span>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3 text-orange-500" />
                              <span className="text-sm text-orange-600 font-medium">
                                Bugun
                              </span>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            assignment.priority === "high"
                              ? "bg-red-100 text-red-700"
                              : assignment.priority === "medium"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                          }`}
                        >
                          {assignment.priority === "high"
                            ? "Yuqori"
                            : assignment.priority === "medium"
                              ? "O'rta"
                              : "Past"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Assignments */}
            {upcomingAssignments.length > 0 && (
              <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-indigo-600" />
                    <span>Kelayotgan Topshiriqlar</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingAssignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {assignment.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {assignment.subject?.name}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {new Date(assignment.deadline).toLocaleDateString(
                            "uz-UZ"
                          )}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subjects */}
            <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <CardTitle>Fanlarim</CardTitle>
                  <Link href="/subjects/new">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 bg-transparent"
                      disabled={!isPro && subjects.length >= 3}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {subjects.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500 mb-4">Hali fan qo'shilmagan</p>
                    <Link href="/subjects/new">
                      <Button size="sm">Birinchi fanni qo'shing</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {subjects.map((subject) => (
                      <Link key={subject.id} href={`/subjects/${subject.id}`}>
                        <div className="group p-3 rounded-lg bg-gradient-to-r hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-100 hover:border-transparent">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-4 h-4 rounded-full ${subject.color}`}
                            ></div>
                            <h3 className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                              {subject.name}
                            </h3>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-indigo-600" />
                  <span>Tezkor Amallar</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Link href="/assignments/new">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-indigo-100"
                    >
                      <Plus className="h-4 w-4 mr-3" />
                      Yangi Topshiriq
                    </Button>
                  </Link>
                  <Link href="/subjects/new">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-700 hover:from-green-100 hover:to-emerald-100"
                      disabled={!isPro && subjects.length >= 3}
                    >
                      <BookOpen className="h-4 w-4 mr-3" />
                      Fan Qo'shish
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 text-yellow-700 hover:from-yellow-100 hover:to-orange-100"
                    >
                      <Crown className="h-4 w-4 mr-3" />
                      {isPro ? "Obunani boshqarish" : "Pro'ga o'tish"}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Info */}
            {isPro && (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-yellow-50 to-orange-50">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Crown className="h-6 w-6 text-yellow-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Pro Foydalanuvchi
                      </h3>
                      <p className="text-sm text-gray-600">
                        Barcha imkoniyatlar ochiq
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                    onClick={handleManageSubscription}
                  >
                    Obunani boshqarish
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
