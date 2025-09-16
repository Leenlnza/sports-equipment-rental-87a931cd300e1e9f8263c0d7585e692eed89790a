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
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")
    if (!token || !userData) router.push("/login")
    else fetchHistory(token)
  }, [])

  const fetchHistory = async (token: string) => {
    try {
      const res = await fetch("/api/borrow", { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error("Failed to fetch")
      const data: HistoryItem[] = await res.json()
      setHistory(data)
    } catch (err) {
      console.error(err)
      setHistory([])
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("th-TH")
  }

  const getStatusBadge = (item: HistoryItem) => {
    const returnDate = new Date(item.returnDate)
    const today = new Date()
    if (item.status === "returned") return <Badge className="bg-green-100 text-green-800">คืนแล้ว</Badge>
    if (item.status === "borrowed") return today > returnDate ? <Badge variant="destructive">เกินกำหนด</Badge> : <Badge className="bg-blue-100 text-blue-800">ยืม</Badge>
    return <Badge variant="secondary">ไม่ทราบสถานะ</Badge>
  }

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-white">กำลังโหลด...</div>

  return (
    <div className="min-h-screen bg-gray-200 dark:bg-gray-900">
      <header className="bg-[#799EFF] border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="hover:bg-gray-800 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2"/> กลับ
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Clock className="h-8 w-8 text-yellow-500"/>
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
                <Clock className="h-16 w-16 mx-auto mb-4"/>
                <h3 className="text-lg font-medium mb-2">ไม่มีประวัติการยืม</h3>
                <p className="text-gray-500 mb-4">คุณยังไม่เคยยืมอุปกรณ์กีฬา</p>
                <Link href="/equipment">
                  <Button><Package className="h-4 w-4 mr-2"/> ยืมอุปกรณ์</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map(item => (
                  <div key={item._id} className="bg-white dark:bg-gray-800 border rounded-lg p-6 shadow-md">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-medium text-lg mb-2">{item.equipmentName}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <div><span className="font-medium">วันที่ยืม:</span> {formatDate(item.borrowDate)}</div>
                          <div><span className="font-medium">กำหนดคืน:</span> {formatDate(item.returnDate)}</div>
                          {item.actualReturnDate && <div><span className="font-medium">วันที่คืน:</span> {formatDate(item.actualReturnDate)}</div>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">{getStatusBadge(item)}</div>
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
