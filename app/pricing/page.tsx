"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { BookOpen, Check, Star, Zap, Crown, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { createCheckoutSession, STRIPE_PRICE_IDS } from "@/lib/stripe";
import { useRouter } from "next/navigation";

const features = {
  free: [
    "3 tagacha fan",
    "Cheksiz topshiriqlar",
    "Asosiy bildirishnomalar",
    "Web dashboard",
    "Asosiy statistika",
  ],
  pro: [
    "Cheksiz fanlar",
    "AI yordamchi",
    "Email eslatmalar",
    "Kengaytirilgan statistika",
    "Eksport funksiyasi",
    "Prioritet yordam",
    "Mobil ilovalar",
    "Team collaboration",
  ],
};

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const { user } = useAuth();
  const { isProUser } = useSubscription();
  const router = useRouter();

  const handleSubscribe = async (plan: "monthly" | "yearly") => {
    if (!user) {
      router.push("/login");
      return;
    }

    setLoading(plan);
    try {
      const priceId =
        plan === "monthly"
          ? STRIPE_PRICE_IDS.pro_monthly
          : STRIPE_PRICE_IDS.pro_yearly;
      const { sessionId } = await createCheckoutSession(priceId, user.id);

      const stripe = await import("@/lib/stripe").then((m) => m.stripePromise);
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId });
      }
    } catch (error) {
      console.error("Subscription error:", error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-white/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
            <span className="text-gray-600">Dashboard'ga qaytish</span>
          </Link>
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
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            O'qishingizni
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {" "}
              keyingi bosqichga
            </span>
            <br />
            olib chiqing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Professional imkoniyatlar bilan o'qish samaradorligingizni oshiring
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-4 bg-white rounded-full p-1 shadow-lg">
            <span
              className={`px-4 py-2 text-sm font-medium ${!isYearly ? "text-indigo-600" : "text-gray-500"}`}
            >
              Oylik
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-indigo-600"
            />
            <span
              className={`px-4 py-2 text-sm font-medium ${isYearly ? "text-indigo-600" : "text-gray-500"}`}
            >
              Yillik
            </span>
            {isYearly && (
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                2 oy bepul!
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card className="border-2 border-gray-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-400 to-gray-600"></div>
            <CardHeader className="text-center pb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Star className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Bepul</CardTitle>
              <CardDescription>Boshlash uchun ideal</CardDescription>
              <div className="text-4xl font-bold text-gray-900 mt-4">
                $0<span className="text-lg font-normal text-gray-500">/oy</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 mb-8">
                {features.free.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full bg-transparent"
                variant="outline"
                disabled={!isProUser()}
              >
                {isProUser() ? "Joriy rejangiz" : "Bepul boshlash"}
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="border-2 border-indigo-500 relative overflow-hidden shadow-2xl scale-105">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-1">
                <Crown className="h-3 w-3 mr-1" />
                Eng mashhur
              </Badge>
            </div>
            <CardHeader className="text-center pb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl">StudyFlow Pro</CardTitle>
              <CardDescription>Professional talabalar uchun</CardDescription>
              <div className="text-4xl font-bold text-gray-900 mt-4">
                ${isYearly ? "20" : "2"}
                <span className="text-lg font-normal text-gray-500">
                  /{isYearly ? "yil" : "oy"}
                </span>
              </div>
              {isYearly && (
                <p className="text-sm text-green-600 font-medium">
                  Oylik $24 o'rniga - 17% tejash!
                </p>
              )}
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 mb-8">
                {features.pro.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                onClick={() => handleSubscribe(isYearly ? "yearly" : "monthly")}
                disabled={loading !== null || isProUser()}
              >
                {loading
                  ? "Yuklanmoqda..."
                  : isProUser()
                    ? "Faol rejangiz"
                    : "Pro rejani tanlash"}
              </Button>
              {!isProUser() && (
                <p className="text-xs text-gray-500 text-center mt-3">
                  Istalgan vaqt bekor qilish mumkin
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Tez-tez so'raladigan savollar
          </h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Pro rejani bekor qilsam nima bo'ladi?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Pro rejani bekor qilsangiz, joriy billing davrining oxirigacha
                  barcha Pro funksiyalardan foydalanishda davom etasiz. Keyin
                  avtomatik ravishda bepul rejaga o'tasiz.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Ma'lumotlarim xavfsizmi?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Ha, barcha ma'lumotlaringiz Supabase orqali xavfsiz saqlanadi
                  va SSL shifrlash bilan himoyalangan. Biz hech qachon sizning
                  shaxsiy ma'lumotlaringizni uchinchi tomonlarga bermayamiz.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Mobil ilovangiz bormi?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Hozircha web versiya mavjud, lekin tez orada iOS va Android
                  uchun mobil ilovalarni chiqaramiz. Pro foydalanuvchilar
                  birinchi bo'lib kirish imkoniyatiga ega bo'ladilar.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
