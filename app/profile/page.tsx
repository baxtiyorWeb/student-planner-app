"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { User, CreditCard, Settings, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, updateProfile } = useAuth();
  const { isPro } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    timezone: "",
    daily_study_target: 2,
    notification_preferences: {
      email: true,
      push: true,
      deadline_days: 3,
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        timezone:
          user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        daily_study_target: user.daily_study_target || 2,
        notification_preferences: user.notification_preferences || {
          email: true,
          push: true,
          deadline_days: 3,
        },
      });
    }
  }, [user, authLoading, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await updateProfile({
        name: formData.name,
        timezone: formData.timezone,
        daily_study_target: formData.daily_study_target,
        notification_preferences: formData.notification_preferences,
      });

      if (error) {
        toast.error(error);
      } else {
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    if (!user) return;

    try {
      const response = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();

      if (response.ok) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to open billing portal");
      }
    } catch (error) {
      toast.error("Failed to open billing portal");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Profile Settings
                </h1>
                <p className="text-sm text-gray-500">
                  Manage your account and preferences
                </p>
              </div>
            </div>
            <Badge variant={isPro ? "default" : "secondary"}>
              {isPro ? "Pro" : "Free"}
            </Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">
              <User className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="subscription">
              <CreditCard className="h-4 w-4 mr-2" />
              Subscription
            </TabsTrigger>
            <TabsTrigger value="preferences">
              <Settings className="h-4 w-4 mr-2" />
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
                <CardDescription>
                  Update your personal information and profile details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage
                        src={user.avatar_url || "/placeholder.svg"}
                        alt={user.name}
                      />
                      <AvatarFallback className="text-lg">
                        {user.name?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Button type="button" variant="outline" size="sm">
                        Change Avatar
                      </Button>
                      <p className="text-sm text-gray-500 mt-1">
                        JPG, GIF or PNG. 1MB max.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500">
                        Email cannot be changed
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input
                      id="timezone"
                      value={formData.timezone}
                      onChange={(e) =>
                        setFormData({ ...formData, timezone: e.target.value })
                      }
                      placeholder="Your timezone"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="daily_target">
                      Daily Study Target (hours)
                    </Label>
                    <Input
                      id="daily_target"
                      type="number"
                      min="1"
                      max="12"
                      value={formData.daily_study_target}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          daily_study_target: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>

                  <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle>Subscription</CardTitle>
                <CardDescription>
                  Manage your subscription and billing information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Current Plan</h3>
                    <p className="text-sm text-gray-500">
                      {isPro
                        ? "Pro Plan - Unlimited access to all features"
                        : "Free Plan - Limited features"}
                    </p>
                  </div>
                  <Badge
                    variant={isPro ? "default" : "secondary"}
                    className="text-sm"
                  >
                    {isPro ? "Pro" : "Free"}
                  </Badge>
                </div>

                {user.subscription_end_date && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Your subscription will end on{" "}
                      {new Date(
                        user.subscription_end_date
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {isPro ? (
                    <Button onClick={handleManageBilling} variant="outline">
                      Manage Billing
                    </Button>
                  ) : (
                    <Button asChild>
                      <Link href="/pricing">Upgrade to Pro</Link>
                    </Button>
                  )}
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-4">Usage & Limits</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Subjects</span>
                      <span className="text-gray-500">
                        {user.subscription_type === "pro"
                          ? "Unlimited"
                          : "3 max"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Assignments</span>
                      <span className="text-gray-500">
                        {user.subscription_type === "pro"
                          ? "Unlimited"
                          : "10 max"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>File Storage</span>
                      <span className="text-gray-500">
                        {user.subscription_type === "pro"
                          ? "100MB per file"
                          : "5MB per file"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>
                  Customize your notification and study preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-4">Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-notifications">
                          Email Notifications
                        </Label>
                        <p className="text-sm text-gray-500">
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={formData.notification_preferences.email}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            notification_preferences: {
                              ...formData.notification_preferences,
                              email: checked,
                            },
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="push-notifications">
                          Push Notifications
                        </Label>
                        <p className="text-sm text-gray-500">
                          Receive push notifications in browser
                        </p>
                      </div>
                      <Switch
                        id="push-notifications"
                        checked={formData.notification_preferences.push}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            notification_preferences: {
                              ...formData.notification_preferences,
                              push: checked,
                            },
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deadline-days">
                        Deadline Reminder (days before)
                      </Label>
                      <Input
                        id="deadline-days"
                        type="number"
                        min="1"
                        max="30"
                        value={formData.notification_preferences.deadline_days}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            notification_preferences: {
                              ...formData.notification_preferences,
                              deadline_days: parseInt(e.target.value),
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-4">Data & Privacy</h3>
                  <div className="space-y-4">
                    <Button variant="outline" size="sm">
                      Export My Data
                    </Button>
                    <Button variant="destructive" size="sm">
                      Delete Account
                    </Button>
                  </div>
                </div>

                <Button onClick={handleUpdateProfile} disabled={loading}>
                  {loading ? "Saving..." : "Save Preferences"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
