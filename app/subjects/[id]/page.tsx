"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  MoreHorizontal,
  Plus,
  Target,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

interface Subject {
  id: string;
  name: string;
  description: string;
  color: string;
  created_at: string;
  user_id: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  subject_id: string;
}

interface SubjectStats {
  totalAssignments: number;
  completedAssignments: number;
  upcomingDeadlines: number;
  averageGrade: number;
  studyHours: number;
  completionRate: number;
}

export default function SubjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [stats, setStats] = useState<SubjectStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchSubjectData();
    }
  }, [user, authLoading, router, params.id]);

  const fetchSubjectData = async () => {
    try {
      // Fetch subject details
      const subjectResponse = await fetch(`/api/subjects/${params.id}`);
      if (subjectResponse.ok) {
        const subjectData = await subjectResponse.json();
        setSubject(subjectData);
      }

      // Fetch assignments
      const assignmentsResponse = await fetch(
        `/api/assignments?subject_id=${params.id}`
      );
      if (assignmentsResponse.ok) {
        const assignmentsData = await assignmentsResponse.json();
        setAssignments(assignmentsData);
      }

      // Fetch stats
      const statsResponse = await fetch(`/api/subjects/stats?id=${params.id}`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error("Error fetching subject data:", error);
      toast.error("Failed to load subject data");
    } finally {
      setLoading(false);
    }
  };

  const toggleAssignmentComplete = async (
    assignmentId: string,
    completed: boolean
  ) => {
    try {
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed }),
      });

      if (response.ok) {
        setAssignments((prev) =>
          prev.map((assignment) =>
            assignment.id === assignmentId
              ? { ...assignment, completed }
              : assignment
          )
        );
        toast.success(
          completed
            ? "Assignment completed!"
            : "Assignment marked as incomplete"
        );
        fetchSubjectData(); // Refresh stats
      } else {
        toast.error("Failed to update assignment");
      }
    } catch (error) {
      toast.error("Failed to update assignment");
    }
  };

  const deleteSubject = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this subject? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/subjects/${params.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Subject deleted successfully");
        router.push("/subjects");
      } else {
        toast.error("Failed to delete subject");
      }
    } catch (error) {
      toast.error("Failed to delete subject");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="border-b bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-8 w-8" />
                <div>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="mt-1 h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!user || !subject) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Subject not found
          </h2>
          <p className="mt-2 text-gray-600">
            The subject you're looking for doesn't exist.
          </p>
          <Button asChild className="mt-4">
            <Link href="/subjects">Back to Subjects</Link>
          </Button>
        </div>
      </div>
    );
  }

  const completionRate = stats
    ? (stats.completedAssignments / Math.max(stats.totalAssignments, 1)) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/subjects">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Subjects
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {subject.name}
                </h1>
                <p className="text-sm text-gray-500">{subject.description}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/subjects/${subject.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Subject
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={deleteSubject}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Subject
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Assignments
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.totalAssignments || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completed
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.completedAssignments || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Study Hours
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.studyHours || 0}h
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completion Rate
                  </CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(completionRate)}%
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Progress Overview</CardTitle>
                  <CardDescription>
                    Your progress in this subject
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Assignment Completion
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(completionRate)}%
                      </span>
                    </div>
                    <Progress value={completionRate} className="h-2" />
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">
                        Completed: {stats?.completedAssignments || 0}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">
                        Remaining:{" "}
                        {(stats?.totalAssignments || 0) -
                          (stats?.completedAssignments || 0)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Assignments</CardTitle>
                  <CardDescription>
                    Your latest assignments in this subject
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {assignments.slice(0, 5).map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              assignment.completed
                                ? "bg-green-500"
                                : "bg-orange-500"
                            }`}
                          />
                          <div>
                            <p className="text-sm font-medium">
                              {assignment.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              Due:{" "}
                              {new Date(
                                assignment.due_date
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            assignment.priority === "high"
                              ? "destructive"
                              : assignment.priority === "medium"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {assignment.priority}
                        </Badge>
                      </div>
                    ))}
                    {assignments.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No assignments yet
                      </p>
                    )}
                  </div>
                  <Button
                    asChild
                    className="w-full mt-4 bg-transparent"
                    variant="outline"
                  >
                    <Link href={`/assignments/new?subject_id=${subject.id}`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Assignment
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="assignments">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">All Assignments</h2>
                <Button asChild>
                  <Link href={`/assignments/new?subject_id=${subject.id}`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Assignment
                  </Link>
                </Button>
              </div>

              <div className="space-y-3">
                {assignments.map((assignment) => (
                  <Card key={assignment.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Switch
                            checked={assignment.completed}
                            onCheckedChange={(checked) =>
                              toggleAssignmentComplete(assignment.id, checked)
                            }
                          />
                          <div>
                            <h3
                              className={`font-medium ${assignment.completed ? "line-through text-gray-500" : ""}`}
                            >
                              {assignment.title}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {assignment.description}
                            </p>
                            <p className="text-xs text-gray-400">
                              Due:{" "}
                              {new Date(
                                assignment.due_date
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              assignment.priority === "high"
                                ? "destructive"
                                : assignment.priority === "medium"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {assignment.priority}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/assignments/${assignment.id}/edit`}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {assignments.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No assignments yet
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Get started by creating your first assignment for this
                        subject.
                      </p>
                      <Button asChild>
                        <Link
                          href={`/assignments/new?subject_id=${subject.id}`}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Create Assignment
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                  <CardDescription>
                    Your performance over time in this subject
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Average Grade</span>
                      <span className="text-2xl font-bold">
                        {stats?.averageGrade || 0}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Study Hours</span>
                      <span className="text-2xl font-bold">
                        {stats?.studyHours || 0}h
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Completion Rate
                      </span>
                      <span className="text-2xl font-bold">
                        {Math.round(completionRate)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Study Insights</CardTitle>
                  <CardDescription>
                    Insights to help improve your performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {completionRate >= 80 && (
                      <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-green-800">
                            Great Progress!
                          </p>
                          <p className="text-sm text-green-600">
                            You're doing excellent work in this subject.
                          </p>
                        </div>
                      </div>
                    )}
                    {completionRate < 50 && (
                      <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-orange-800">
                            Needs Attention
                          </p>
                          <p className="text-sm text-orange-600">
                            Consider spending more time on this subject.
                          </p>
                        </div>
                      </div>
                    )}
                    {stats?.upcomingDeadlines &&
                      stats.upcomingDeadlines > 0 && (
                        <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                          <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-800">
                              Upcoming Deadlines
                            </p>
                            <p className="text-sm text-blue-600">
                              You have {stats.upcomingDeadlines} assignment
                              {stats.upcomingDeadlines > 1 ? "s" : ""} due soon.
                            </p>
                          </div>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
