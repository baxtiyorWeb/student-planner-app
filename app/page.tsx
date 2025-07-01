import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Calendar, Bell, Star, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">StudyPlan</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Kirish</Button>
            </Link>
            <Link href="/register">
              <Button>Ro'yxatdan o'tish</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Yangi dizayn */}
      <section className="relative py-24 px-4 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
          <div className="absolute inset-0 bg-black/20"></div>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
                       radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%)`,
            }}
          ></div>
        </div>

        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm mb-6 border border-white/20">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
            Talabalar uchun #1 rejalashtiruvchi
          </div>

          <h1 className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight">
            O'qishni
            <span className="block bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Boshqaring
            </span>
          </h1>

          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            Fanlaringiz, topshiriqlaringiz va deadline'laringizni professional tarzda boshqaring. Muvaffaqiyatli talaba
            bo'lishning eng oson yo'li.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register">
              <Button
                size="lg"
                className="text-lg px-10 py-4 bg-white text-gray-900 hover:bg-gray-100 rounded-xl font-semibold shadow-2xl"
              >
                Bepul Boshlash
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-10 py-4 border-white/30 text-white hover:bg-white/10 rounded-xl backdrop-blur-sm bg-transparent"
              >
                Demo ko'rish
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex justify-center items-center space-x-8 mt-16 text-white/70">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">1000+</div>
              <div className="text-sm">Faol talabalar</div>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">50K+</div>
              <div className="text-sm">Bajarilgan topshiriq</div>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">98%</div>
              <div className="text-sm">Mamnunlik darajasi</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Yangi dizayn */}
      <section className="py-24 px-4 bg-gray-50 relative">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Nima uchun minglab talaba
              <span className="text-indigo-600"> bizni tanlaydi?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Zamonaviy texnologiyalar va foydalanuvchi-friendly dizayn orqali o'qish jarayoningizni osonlashtiring
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group">
              <Card className="text-center hover:shadow-2xl transition-all duration-300 border-0 bg-white group-hover:scale-105 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardHeader className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl mb-3">Smart Fan Boshqaruvi</CardTitle>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    Barcha fanlaringizni ranglar bilan ajratib, oson navigatsiya qiling. Har bir fan uchun alohida
                    statistika va progress tracking.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="group">
              <Card className="text-center hover:shadow-2xl transition-all duration-300 border-0 bg-white group-hover:scale-105 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardHeader className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl mb-3">AI-Powered Eslatmalar</CardTitle>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    Deadline yaqinlashganda avtomatik eslatma. Email, push notification va dashboard orqali hech qachon
                    muhim topshiriqni unutmang.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="group">
              <Card className="text-center hover:shadow-2xl transition-all duration-300 border-0 bg-white group-hover:scale-105 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-violet-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardHeader className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                    <Bell className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl mb-3">Analytics & Insights</CardTitle>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    O'qish statistikangizni kuzatib boring. Qaysi fanlarda yaxshi, qayerda yaxshilash kerakligini bilib
                    oling.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Narxlar</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="relative">
              <CardHeader>
                <CardTitle className="text-2xl">Bepul</CardTitle>
                <CardDescription>Boshlash uchun</CardDescription>
                <div className="text-3xl font-bold">
                  $0<span className="text-lg font-normal">/oy</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Star className="h-5 w-5 text-green-500 mr-2" />3 tagacha fan
                  </li>
                  <li className="flex items-center">
                    <Star className="h-5 w-5 text-green-500 mr-2" />
                    Cheksiz topshiriqlar
                  </li>
                  <li className="flex items-center">
                    <Star className="h-5 w-5 text-green-500 mr-2" />
                    Asosiy bildirishnomalar
                  </li>
                </ul>
                <Button className="w-full mt-6">Bepul Boshlash</Button>
              </CardContent>
            </Card>

            <Card className="relative border-blue-500 border-2">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm">Mashhur</span>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Premium</CardTitle>
                <CardDescription>To'liq imkoniyatlar</CardDescription>
                <div className="text-3xl font-bold">
                  $2<span className="text-lg font-normal">/oy</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Star className="h-5 w-5 text-green-500 mr-2" />
                    Cheksiz fanlar
                  </li>
                  <li className="flex items-center">
                    <Star className="h-5 w-5 text-green-500 mr-2" />
                    AI Yordamchi
                  </li>
                  <li className="flex items-center">
                    <Star className="h-5 w-5 text-green-500 mr-2" />
                    Kengaytirilgan statistika
                  </li>
                  <li className="flex items-center">
                    <Star className="h-5 w-5 text-green-500 mr-2" />
                    Email eslatmalar
                  </li>
                </ul>
                <Button className="w-full mt-6">Premium Sotib Olish</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <BookOpen className="h-8 w-8" />
            <span className="text-2xl font-bold">StudyPlan</span>
          </div>
          <p className="text-gray-400 mb-4">Talabalar uchun eng yaxshi rejalashtiruvchi</p>
          <div className="flex justify-center space-x-6">
            <Link href="/privacy" className="text-gray-400 hover:text-white">
              Maxfiylik
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white">
              Shartlar
            </Link>
            <Link href="/contact" className="text-gray-400 hover:text-white">
              Aloqa
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
