"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Plus, Search, Calendar, Clock, CheckCircle2, AlertCircle, Filter } from "lucide-react"
import Link from "next/link"

// Mock data
const mockAssignments = [
  {
    id: 1,
    title: "Integral hisobini yakunlash",
    subject: "Matematika",
    subjectColor: "bg-blue-500",
    deadline: "2024-01-15",
    priority: "high",
    completed: false,
    description: "Aniq integrallar va ularning qo'llanilishi",
    createdAt: "2024-01-10",
  },
  {
    id: 2,
    title: "React loyihasini tugatish",
    subject: "Dasturlash",
    subjectColor: "bg-green-500",
    deadline: "2024-01-15",
    priority: "medium",
    completed: false,
    description: "E-commerce saytini React bilan yaratish",
    createdAt: "2024-01-08",
  },
  {
    id: 3,
    title: "Faylasuflar haqida esse",
    subject: "Falsafa",
    subjectColor: "bg-purple-500",
    deadline: "2024-01-18",
    priority: "low",
    completed: false,
    description: "Aristotel va Platonning falsafiy qarashlarini taqqoslash",
    createdAt: "2024-01-05",
  },
  {
    id: 4,
    title: "Algoritm tahlili",
    subject: "Dasturlash",
    subjectColor: "bg-green-500",
    deadline: "2024-01-20",
    priority: "high",
    completed: true,
    description: "Sorting algoritmlarining vaqt murakkabligi",
    createdAt: "2024-01-03",
  },
]

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState(mockAssignments)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSubject, setFilterSubject] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")

  const subjects = [...new Set(assignments.map((a) => a.subject))]

  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch =
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = filterSubject === "all" || assignment.subject === filterSubject
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "completed" && assignment.completed) ||
      (filterStatus === "pending" && !assignment.completed)
    const matchesPriority = filterPriority === "all" || assignment.priority === filterPriority

    return matchesSearch && matchesSubject && matchesStatus && matchesPriority
  })

  const toggleAssignment = (id: number) => {
    setAssignments((prev) =>
      prev.map((assignment) =>
        assignment.id === id ? { ...assignment, completed: !assignment.completed } : assignment,
      ),
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high":
        return "Yuqori"
      case "medium":
        return "O'rta"
      case "low":
        return "Past"
      default:
        return "Noma'lum"
    }
  }

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getDeadlineStatus = (deadline: string, completed: boolean) => {
    if (completed) return { text: "Bajarilgan", color: "text-green-600" }

    const days = getDaysUntilDeadline(deadline)
    if (days < 0) return { text: "Kechikkan", color: "text-red-600" }
    if (days === 0) return { text: "Bugun", color: "text-orange-600" }
    if (days === 1) return { text: "Ertaga", color: "text-yellow-600" }
    return { text: `${days} kun qoldi`, color: "text-blue-600" }
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Topshiriqlarim</h1>
            <p className="text-gray-600">Barcha topshiriqlaringizni boshqaring</p>
          </div>
          <Link href="/assignments/new">
            <Button className="mt-4 sm:mt-0">
              <Plus className="h-4 w-4 mr-2" />
              Yangi Topshiriq
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jami</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignments.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bajarilgan</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignments.filter((a) => a.completed).length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kutilmoqda</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignments.filter((a) => !a.completed).length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kechikkan</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assignments.filter((a) => !a.completed && getDaysUntilDeadline(a.deadline) < 0).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filtrlar</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Qidirish..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Fan tanlang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barcha fanlar</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Holat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barcha holatlar</SelectItem>
                  <SelectItem value="pending">Kutilmoqda</SelectItem>
                  <SelectItem value="completed">Bajarilgan</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Muhimlik" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barcha darajalar</SelectItem>
                  <SelectItem value="high">Yuqori</SelectItem>
                  <SelectItem value="medium">O'rta</SelectItem>
                  <SelectItem value="low">Past</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Assignments List */}
        {filteredAssignments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Topshiriq topilmadi</h3>
              <p className="text-gray-500 mb-4">Filtrlarni o'zgartiring yoki yangi topshiriq qo'shing</p>
              <Link href="/assignments/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Topshiriq Qo'shish
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAssignments.map((assignment) => {
              const deadlineStatus = getDeadlineStatus(assignment.deadline, assignment.completed)

              return (
                <Card
                  key={assignment.id}
                  className={`hover:shadow-md transition-shadow ${
                    assignment.completed ? "bg-green-50 border-green-200" : ""
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <button
                        onClick={() => toggleAssignment(assignment.id)}
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 ${
                          assignment.completed
                            ? "bg-green-500 border-green-500 text-white"
                            : "border-gray-300 hover:border-green-500"
                        }`}
                      >
                        {assignment.completed && <CheckCircle2 className="h-4 w-4" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3
                              className={`text-lg font-medium ${
                                assignment.completed ? "line-through text-gray-500" : "text-gray-900"
                              }`}
                            >
                              {assignment.title}
                            </h3>
                            <p className="text-gray-600 mt-1">{assignment.description}</p>

                            <div className="flex items-center space-x-4 mt-3">
                              <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${assignment.subjectColor}`}></div>
                                <span className="text-sm text-gray-600">{assignment.subject}</span>
                              </div>

                              <div className="flex items-center space-x-1">
                                <div className={`w-3 h-3 rounded-full ${getPriorityColor(assignment.priority)}`}></div>
                                <span className="text-sm text-gray-600">{getPriorityText(assignment.priority)}</span>
                              </div>

                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{assignment.deadline}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end space-y-2">
                            <Badge variant="outline" className={deadlineStatus.color}>
                              {deadlineStatus.text}
                            </Badge>

                            <div className="flex items-center space-x-2">
                              <Link href={`/assignments/${assignment.id}/edit`}>
                                <Button variant="ghost" size="sm">
                                  Tahrirlash
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
