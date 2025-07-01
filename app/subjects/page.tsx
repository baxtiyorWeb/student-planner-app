"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { BookOpen, Plus, Search, Edit, Trash2, Calendar } from "lucide-react"
import Link from "next/link"

// Mock data
const mockSubjects = [
  {
    id: 1,
    name: "Matematika",
    color: "bg-blue-500",
    assignments: 5,
    completedAssignments: 2,
    description: "Oliy matematika va analiz",
    createdAt: "2024-01-01",
  },
  {
    id: 2,
    name: "Dasturlash",
    color: "bg-green-500",
    assignments: 3,
    completedAssignments: 1,
    description: "Web dasturlash va React",
    createdAt: "2024-01-02",
  },
  {
    id: 3,
    name: "Falsafa",
    color: "bg-purple-500",
    assignments: 2,
    completedAssignments: 0,
    description: "Falsafa tarixi va mantiq",
    createdAt: "2024-01-03",
  },
]

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState(mockSubjects)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredSubjects = subjects.filter((subject) => subject.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const deleteSubject = (id: number) => {
    setSubjects((prev) => prev.filter((subject) => subject.id !== id))
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
            <span className="text-2xl font-bold text-gray-900">StudyPlan</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Button variant="ghost">Profil</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Fanlarim</h1>
            <p className="text-gray-600">Barcha fanlaringizni boshqaring</p>
          </div>
          <Link href="/subjects/new">
            <Button className="mt-4 sm:mt-0">
              <Plus className="h-4 w-4 mr-2" />
              Yangi Fan Qo'shish
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Fanlarni qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jami Fanlar</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subjects.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jami Topshiriqlar</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subjects.reduce((total, subject) => total + subject.assignments, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bajarilgan</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subjects.reduce((total, subject) => total + subject.completedAssignments, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subjects Grid */}
        {filteredSubjects.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "Fan topilmadi" : "Hali fan qo'shilmagan"}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? "Qidiruv so'zingizni o'zgartiring" : "Birinchi faningizni qo'shish uchun tugmani bosing"}
              </p>
              {!searchTerm && (
                <Link href="/subjects/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Fan Qo'shish
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubjects.map((subject) => (
              <Card key={subject.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${subject.color}`}></div>
                      <CardTitle className="text-lg">{subject.name}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link href={`/subjects/${subject.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSubject(subject.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>{subject.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Topshiriqlar</span>
                      <Badge variant="secondary">
                        {subject.completedAssignments}/{subject.assignments}
                      </Badge>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${subject.assignments > 0 ? (subject.completedAssignments / subject.assignments) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <Link href={`/subjects/${subject.id}`}>
                        <Button variant="outline" size="sm">
                          Ko'rish
                        </Button>
                      </Link>
                      <Link href={`/assignments/new?subject=${subject.id}`}>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          Topshiriq
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
