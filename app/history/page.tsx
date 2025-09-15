"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Package } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface HistoryItem {
  _id: string
  equipmentName: string
  borrowDate: string
  returnDate: string
  actualReturnDate?: string
  status: "returned" | "borrowed" | "overdue"
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const userData = localStorage.getItem("user")
      const token = localStorage.getItem("token")
      if (!userData || !token) {
        router.push("/login")
        return
      }
      await fetchHistory(token)
    }
    checkAuthAndFetch()
  }, [router])

  const fetchHistory = async (token: string) => {
    try {
      const response = await fetch("/api/borrow", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        console.error("Failed to fetch history, status:", response.status)
        setHistory([])
        return
      }

      const data = await response.json()
      console.log("Raw data from API:", data)

      const mappedData: HistoryItem[] = data.map((item: any) => ({
        _id: item._id,
        equipmentName: item.equipmentName || item.name || "ไม่ระบุชื่ออุปกรณ์",
        borrowDate: item.borrowedAt || item.borrowDate,
        returnDate: item.returnDate,
        actualReturnDate: item.actualReturnDate,
        status: item.status,
      }))

      setHistory(mappedData)
    } catch (error) {
      console.error("Error fetching history:", error)
      setHistory([])
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (item: HistoryItem) => {
    const returnDate = new Date(item.returnDate)
    const today = new Date()

    if (item.status === "returned") {
      return <Badge className="bg-green-100 text-green-800">คืนแล้ว</Badge>
    }

    if (item.status === "borrowed") {
      if (today > returnDate) {
        return <Badge variant="destructive">เกินกำหนด</Badge>
      }
      return <Badge className="bg-blue-100 text-blue-800">ยืม</Badge>
    }

    return <Badge variant="secondary">ไม่ทราบสถานะ</Badge>
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("th-TH")
  }

  const handleReturn = async (borrowRecordId: string) => {
    const token = localStorage.getItem("token")
    if (!token) {
      alert("กรุณาเข้าสู่ระบบ")
      return
    }

    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการคืนอุปกรณ์นี้?")) return

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
        setHistory((prev) =>
          prev.map((item) =>
            item._id === borrowRecordId
              ? { ...item, status: "returned", actualReturnDate: new Date().toISOString() }
              : item
          )
        )
      } else {
        alert(data.error || "เกิดข้อผิดพลาดในการคืนอุปกรณ์")
      }
    } catch (error) {
      console.error("Return error:", error)
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sky-600 flex items-center justify-center">
        <div className="text-white">กำลังโหลด...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-200 dark:bg-gray-900">
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
            <Clock className="h-8 w-8 text-yellow-500" />
            <h1 className="text-2xl font-bold text-white">ประวัติการยืม</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>ประวัติการยืม-คืนอุปกรณ์</CardTitle>
            <CardDescription>รายการประวัติการยืมอุปกรณ์กีฬาทั้งหมดของคุณ</CardDescription>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-16 w-16 text-gray-900 dark:text-white mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  ไม่มีประวัติการยืม
                </h3>
                <p className="text-gray-500 dark:text-gray-300 mb-4">คุณยังไม่เคยยืมอุปกรณ์กีฬา</p>
                <Link href="/equipment">
                  <Button>
                    <Package className="h-4 w-4 mr-2" />
                    ยืมอุปกรณ์
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-6 shadow-md transition hover:shadow-lg"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-medium text-lg mb-2 text-gray-900 dark:text-white">
                          {item.equipmentName}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <div>
                            <span className="font-medium">วันที่ยืม:</span> {formatDate(item.borrowDate)}
                          </div>
                          <div>
                            <span className="font-medium">กำหนดคืน:</span> {formatDate(item.returnDate)}
                          </div>
                          {item.actualReturnDate && (
                            <div>
                              <span className="font-medium">วันที่คืน:</span> {formatDate(item.actualReturnDate)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(item)}
                       
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Stats */}
        {history.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <Card>
              <CardHeader className="text-center border border-gray-400">
                <div className="text-3xl font-bold text-blue-600 mb-2">{history.length}</div>
                <CardTitle className="text-lg">ยืมทั้งหมด</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="text-center border border-gray-400">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {history.filter((item) => item.status === "returned").length}
                </div>
                <CardTitle className="text-lg">คืนแล้ว</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="text-center border border-gray-400">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {history.filter((item) => item.status === "borrowed").length}
                </div>
                <CardTitle className="text-lg">ยืมตอนนี้</CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
