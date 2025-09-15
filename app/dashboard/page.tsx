"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Clock, LogOut, Plus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface BorrowedItem {
  _id: string
  equipmentName: string
  borrowDate: string
  returnDate: string
  status: "borrowed" | "overdue" | "returned"
}

export default function DashboardPage() {
  const [user, setUser] = useState<any | null>(null)
  const [borrowedItems, setBorrowedItems] = useState<BorrowedItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    const token = localStorage.getItem("token")

    if (!userData || !token) {
      router.push("/login")
      return
    }

    setUser(JSON.parse(userData))
    fetchBorrowedItems(token)
  }, [router])

  const fetchBorrowedItems = async (token: string) => {
    try {
      console.log("Fetching borrowed items...")
      const response = await fetch("/api/borrow", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("Response status:", response.status)

      if (response.ok) {
        const data = await response.json()

        const activeBorrows = data.filter((item: any) => item.status === "borrowed")
        setBorrowedItems(activeBorrows)
      } else {
        const errorData = await response.json()
        console.error("Failed to fetch borrowed items:", errorData)
      }
    } catch (error) {
      console.error("Error fetching borrowed items:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    router.push("/")
  }

  const handleReturn = async (borrowRecordId: string) => {
    const token = localStorage.getItem("token")
    if (!token) {
      alert("กรุณาเข้าสู่ระบบ")
      return
    }

    try {
      const response = await fetch("/api/borrow/return", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ borrowRecordId }),
      })

      const data = await response.json()

      if (response.ok) {
        alert("คืนอุปกรณ์เรียบร้อยแล้ว!")
        fetchBorrowedItems(token)
      } else {
        alert(data.error || "เกิดข้อผิดพลาดในการคืนอุปกรณ์")
      }
    } catch (error) {
      console.error("Return error:", error)
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("th-TH")
  }

  if (!user) return null

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sky-600 flex items-center justify-center">
        <div className="text-white">กำลังโหลดข้อมูล...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-200">
      <header className="bg-[#799EFF] border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="text-2xl">⚽</div>
            <h1 className="text-2xl font-bold text-white">LCC Sport</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white">สวัสดี, {user.name}</span>
            <Button className=" hover:bg-gray-800 hover:text-white" variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              ออกจากระบบ
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-yellow-500 mb-2 text-outline-black" style={{
    textShadow: `
      -1px -1px 0 #000,
       1px -1px 0 #000,
      -1px  1px 0 #000,
       1px  1px 0 #000
    `,
  }}
>     >dashboard</h2>
          <p className="text-black">จัดการการยืมอุปกรณ์กีฬาของคุณ</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/equipment">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer  border-2 border-black">
              <CardHeader className="text-center">
                <Package className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                <CardTitle className="text-lg">ยืมอุปกรณ์</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 text-center">ดูและยืมอุปกรณ์กีฬา</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/history">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-black">
              <CardHeader className="text-center">
                <Clock className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <CardTitle className="text-lg">ประวัติการยืม</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 text-center">ดูประวัติการยืม-คืน</p>
              </CardContent>
            </Card>
          </Link>

          

          <Card className="bg-gradient-to-br from-orange-50 to-red-50  border-2 border-black">
            <CardHeader className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{borrowedItems.length}</div>
              <CardTitle className="text-lg">อุปกรณ์ที่ยืม</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 text-center">อุปกรณ์ที่ยืมในขณะนี้</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>อุปกรณ์ที่ยืม</CardTitle>
            <CardDescription>รายการอุปกรณ์ที่คุณยืมในขณะนี้</CardDescription>
          </CardHeader>
          <CardContent>
            {borrowedItems.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600">ไม่มีอุปกรณ์ที่ยืม</p>
                <Link href="/equipment">
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    ยืมอุปกรณ์
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {borrowedItems.map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{item.equipmentName}</h4>
                      <p className="text-sm text-gray-600">ยืมวันที่: {formatDate(item.borrowDate)}</p>
                      <p className="text-sm text-gray-600">กำหนดคืน: {formatDate(item.returnDate)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="bg-blue-100 text-blue-800">
                        ยืม
                      </Badge>
                      
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
