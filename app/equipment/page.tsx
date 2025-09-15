"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Search, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Equipment {
  _id: string
  name: string
  category: string
  available: number
  total: number
  description: string
  imgURL: string
}

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    // Get category from URL
    const urlParams = new URLSearchParams(window.location.search)
    const categoryParam = urlParams.get("category")
    if (categoryParam) {
      setSelectedCategory(categoryParam)
    }

    fetchEquipment(categoryParam)
  }, [router])

  const fetchEquipment = async (category?: string | null) => {
    try {
      const url =
        category && category !== "all" ? `/api/equipment?category=${encodeURIComponent(category)}` : "/api/equipment"

      const response = await fetch(url)
      const data = await response.json()

      if (response.ok) {
        setEquipment(data)
      } else {
        console.error("Failed to fetch equipment:", data.error)
      }
    } catch (error) {
      console.error("Equipment fetch error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const categories = ["all", "บาสเกตบอล", "วอลเลย์บอล", "ฟุตบอล", "เปตอง"]

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleBorrow = async (equipmentId: string) => {
    const token = localStorage.getItem("token")
    if (!token) {
      alert("กรุณาเข้าสู่ระบบ")
      return
    }

    try {
      // เช็คจำนวนอุปกรณ์ที่ผู้ใช้ยืมแล้ว
      const checkResponse = await fetch("/api/borrow/check", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const checkData = await checkResponse.json()

      if (!checkResponse.ok) {
        alert(checkData.error || "เกิดข้อผิดพลาดในการตรวจสอบจำนวนอุปกรณ์ที่ยืม")
        return
      }

      const borrowedCount = checkData.borrowedCount || 0
      if (borrowedCount >= 2) {
        alert("คุณยืมอุปกรณ์ได้ไม่เกิน 2 ชิ้น")
        return
      }

      // ถ้ายังไม่เกิน 2 ให้ทำการยืม
      const response = await fetch("/api/borrow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ equipmentId }),
      })

      const data = await response.json()

      if (response.ok) {
        alert("ยืมอุปกรณ์เรียบร้อยแล้ว!")
        fetchEquipment(selectedCategory === "all" ? null : selectedCategory)
      } else {
        alert(data.error || "เกิดข้อผิดพลาดในการยืมอุปกรณ์")
      }
    } catch (error) {
      console.error("Borrow error:", error)
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ")
    }
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    fetchEquipment(category === "all" ? null : category)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sky-600 flex items-center justify-center">
        <div className="text-white">กำลังโหลด...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-200">
      {/* Header */}
      <header className="bg-[#799EFF] border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard">
            <Button className="hover:bg-gray-800 hover:text-white" variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              กลับ
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Package className="h-8 w-8 text-yellow-500" />
            <h1 className="text-2xl font-bold text-white text-outline-black">อุปกรณ์กีฬา</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="ค้นหาอุปกรณ์..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="เลือกประเภท" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              {categories.slice(1).map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Equipment Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipment.map((item) => (
            <Card key={item._id} className="overflow-hidden">
              <div className="aspect-square bg-gray-100">
                <img
                  src={item.imgURL && item.imgURL.trim() !== "" ? item.imgURL : "/img/default.png"}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </div>
                  <Badge variant="secondary">{item.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-gray-600">
                    ว่าง: {item.available}/{item.total}
                  </div>
                  <Badge variant={item.available > 0 ? "default" : "destructive"}>
                    {item.available > 0 ? "พร้อมใช้" : "ไม่ว่าง"}
                  </Badge>
                </div>
                <Button className="w-full" disabled={item.available === 0} onClick={() => handleBorrow(item._id)}>
                  {item.available > 0 ? "ยืมอุปกรณ์" : "ไม่ว่าง"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEquipment.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">ไม่พบอุปกรณ์</h3>
            <p className="text-gray-300">ลองเปลี่ยนคำค้นหาหรือประเภทอุปกรณ์</p>
          </div>
        )}
      </div>
    </div>
  )
}
