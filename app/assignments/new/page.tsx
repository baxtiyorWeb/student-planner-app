"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase, type Subject } from "@/lib/supabase";

export default function NewAssignmentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject_id: "",
    deadline: "",
    priority: "medium",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSubjects();
    }
  }, [user]);

  const fetchSubjects = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .eq("user_id", user.id)
        .order("name");

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    try {
      const { error } = await supabase.from("assignments").insert({
        user_id: user.id,
        subject_id: formData.subject_id,
        title: formData.title,
        description: formData.description,
        deadline: formData.deadline,
        priority: formData.priority,
      });

      if (error) throw error;

      // Send notification if deadline is within 3 days
      const deadlineDate = new Date(formData.deadline);
      const today = new Date();
      const diffTime = deadlineDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 3 && diffDays >= 0) {
        // Schedule notification
        await fetch("/api/send-notification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            type: "deadline_reminder",
            assignmentId: formData.subject_id, // This would be the actual assignment ID in real implementation
          }),
        });
      }

      router.push("/assignments");
    } catch (error) {
      console.error("Error creating assignment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  if (subjects.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link href="/dashboard">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </Link>
              <span className="text-2xl font-bold text-gray-900">
                StudyFlow
              </span>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Avval fan qo'shing
                </h2>
                <p className="text-gray-600 mb-6">
                  Topshiriq qo'shish uchun kamida bitta fan bo'lishi kerak.
                </p>
                <div className="flex space-x-4 justify-center">
                  <Link href="/subjects/new">
                    <Button>Fan qo'shish</Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="outline">Dashboard</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/dashboard">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </Link>
            <span className="text-2xl font-bold text-gray-900">StudyFlow</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/assignments">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Topshiriqlar ro'yxatiga qaytish
            </Button>
          </Link>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Yangi Topshiriq Qo'shish
              </CardTitle>
              <CardDescription>
                Yangi topshiriq ma'lumotlarini kiriting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Topshiriq nomi */}
                <div className="space-y-2">
                  <Label htmlFor="title">Topshiriq nomi *</Label>
                  <Input
                    id="title"
                    placeholder="Masalan: Integral hisobini yakunlash"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                  />
                </div>

                {/* Tavsif */}
                <div className="space-y-2">
                  <Label htmlFor="description">Tavsif</Label>
                  <Textarea
                    id="description"
                    placeholder="Topshiriq haqida batafsil ma'lumot..."
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={4}
                  />
                </div>

                {/* Fan tanlash */}
                <div className="space-y-2">
                  <Label htmlFor="subject">Fan *</Label>
                  <Select
                    value={formData.subject_id}
                    onValueChange={(value) =>
                      handleInputChange("subject_id", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Fan tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          <div className="flex items-center space-x-2">
                            <div
                              className={`w-3 h-3 rounded-full ${subject.color}`}
                            ></div>
                            <span>{subject.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Deadline */}
                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline *</Label>
                  <Input
                    id="deadline"
                    type="date"
                    min={today}
                    value={formData.deadline}
                    onChange={(e) =>
                      handleInputChange("deadline", e.target.value)
                    }
                    required
                  />
                </div>

                {/* Muhimlik darajasi */}
                <div className="space-y-2">
                  <Label htmlFor="priority">Muhimlik darajasi</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) =>
                      handleInputChange("priority", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <span>Yuqori</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <span>O'rta</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="low">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span>Past</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Preview */}
                {formData.title && formData.subject_id && (
                  <div className="space-y-2">
                    <Label>Ko'rinish</Label>
                    <div className="p-4 border rounded-lg bg-white">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {formData.title}
                          </h3>
                          {formData.description && (
                            <p className="text-gray-600 mt-1">
                              {formData.description}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 mt-3">
                            <div className="flex items-center space-x-2">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  subjects.find(
                                    (s) => s.id === formData.subject_id
                                  )?.color || "bg-gray-500"
                                }`}
                              ></div>
                              <span className="text-sm text-gray-600">
                                {
                                  subjects.find(
                                    (s) => s.id === formData.subject_id
                                  )?.name
                                }
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  formData.priority === "high"
                                    ? "bg-red-500"
                                    : formData.priority === "medium"
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                                }`}
                              ></div>
                              <span className="text-sm text-gray-600">
                                {formData.priority === "high"
                                  ? "Yuqori"
                                  : formData.priority === "medium"
                                    ? "O'rta"
                                    : "Past"}
                              </span>
                            </div>
                            {formData.deadline && (
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  {formData.deadline}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex space-x-4 pt-4">
                  <Button
                    type="submit"
                    disabled={
                      !formData.title ||
                      !formData.subject_id ||
                      !formData.deadline ||
                      isLoading
                    }
                    className="flex-1"
                  >
                    {isLoading ? "Qo'shilmoqda..." : "Topshiriq Qo'shish"}
                  </Button>
                  <Link href="/assignments">
                    <Button type="button" variant="outline">
                      Bekor qilish
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
