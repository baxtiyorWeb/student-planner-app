"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BookOpen, ArrowLeft, Palette, Crown } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useSubscription } from "@/hooks/useSubscription"
import { supabase } from "@/lib/supabase"

const colorOptions = [
  { name: "Ko'k", value: "bg-blue-500", class: "bg-blue-500" },
  { name: "Yashil", value: "bg-green-500", class: "bg-green-500" },
  { name: "Binafsha", value: "bg-purple-500", class: "bg-purple-500" },
  { name: "Qizil", value: "bg-red-500", class: "bg-red-500" },
  { name: "Sariq", value: "bg-yellow-500", class: "bg-yellow-500" },
  { name: "Pushti", value: "bg-pink-500", class: "bg-pink-500" },
  { name: "Indigo", value: "bg-indigo-500", class: "bg-indigo-500" },
  { name: "Teal", value: "bg-teal-500", class: "bg-teal-500" },
]

export default function NewSubjectPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { isPro, canAddMoreSubjects } = useSubscription()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "bg-blue-500",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [canAdd, setCanAdd] = useState<boolean | null>(null)

  // useEffect to check limit
  const checkLimit = async () => {
    const result = await canAddMoreSubjects()
    setCanAdd(result)
  }

  React.useEffect(() => {
    checkLimit()
  }, [canAddMoreSubjects])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !canAdd) return

    setIsLoading(true)

    try {
      const { error } = await supabase.from("subjects").insert({
        user_id: user.id,
        name: formData.name,
        description: formData.description,
        color: formData.color,
      })

      if (error) throw error

      router.push("/subjects")
    } catch (error) {
      console.error("Error creating subject:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (canAdd === false) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link href="/dashboard">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </Link>
              <span className="text-2xl font-bold text-gray-900">StudyFlow</span>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
              <CardContent className="p-8 text-center">
                <Crown className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Bepul limit tugadi!</h2>
                <p className="text-gray-600 mb-6">
                  Siz allaqachon 3ta fan qo'shgansiz. Ko'proq fan qo'shish uchun Pro rejaga o'ting.
                </p>
                <div className="flex space-x-4 justify-center">
                  <Link href="/pricing">
                    <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                      Pro'ga o'tish
                    </Button>
                  </Link>
                  <Link href="/subjects">
                    <Button variant="outline">Fanlar ro'yxati</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
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
          <Link href="/subjects">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Fanlar ro'yxatiga qaytish
            </Button>
          </Link>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Yangi Fan Qo'shish</CardTitle>
              <CardDescription>
                Yangi fan ma'lumotlarini kiriting
                {!isPro && <span className="text-yellow-600 font-medium ml-2">(Bepul rejada 3 tagacha fan)</span>}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Fan nomi */}
                <div className="space-y-2">
                  <Label htmlFor="name">Fan nomi *</Label>
                  <Input
                    id="name"
                    placeholder="Masalan: Matematika, Dasturlash, Falsafa"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                  />
                </div>

                {/* Tavsif */}
                <div className="space-y-2">
                  <Label htmlFor="description">Tavsif</Label>
                  <Textarea
                    id="description"
                    placeholder="Fan haqida qisqacha ma'lumot..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Rang tanlash */}
                <div className="space-y-3">
                  <Label className="flex items-center space-x-2">
                    <Palette className="h-4 w-4" />
                    <span>Rang tanlang</span>
                  </Label>
                  <div className="grid grid-cols-4 gap-3">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => handleInputChange("color", color.value)}
                        className={`
                          flex items-center space-x-2 p-3 rounded-lg border-2 transition-all
                          ${
                            formData.color === color.value
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }
                        `}
                      >
                        <div className={`w-4 h-4 rounded-full ${color.class}`}></div>
                        <span className="text-sm">{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                {formData.name && (
                  <div className="space-y-2">
                    <Label>Ko'rinish</Label>
                    <div className="p-4 border rounded-lg bg-white">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${formData.color}`}></div>
                        <div>
                          <h3 className="font-medium">{formData.name}</h3>
                          {formData.description && <p className="text-sm text-gray-500">{formData.description}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex space-x-4 pt-4">
                  <Button type="submit" disabled={!formData.name || isLoading} className="flex-1">
                    {isLoading ? "Qo'shilmoqda..." : "Fan Qo'shish"}
                  </Button>
                  <Link href="/subjects">
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
  )
}
