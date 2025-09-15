"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, User, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface UserProfile {
  _id: string
  name: string
  email: string
  grade: string
  branch: string
  phone?: string
  address?: string
}

interface UserStats {
  totalBorrows: number
  returned: number
  borrowed: number
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    _id: "",
    name: "",
    email: "",
    grade: "",
    branch: "",
    phone: "",
    address: "",
  })
  const [stats, setStats] = useState<UserStats>({
    totalBorrows: 0,
    returned: 0,
    borrowed: 0,
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    fetchProfile(token)
    fetchStats(token)
  }, [router])

  const fetchProfile = async (token: string) => {
    try {
      const response = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      } else {
        console.error("Failed to fetch profile")
        router.push("/login")
      }
    } catch (error) {
      console.error("Profile fetch error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async (token: string) => {
    try {
      const response = await fetch("/api/borrow", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const totalBorrows = data.length
        const returned = data.filter((item: any) => item.status === "returned").length
        const borrowed = data.filter((item: any) => item.status === "borrowed").length

        setStats({
          totalBorrows,
          returned,
          borrowed,
        })
      }
    } catch (error) {
      console.error("Stats fetch error:", error)
    }
  }

  const handleSave = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      alert("กรุณาเข้าสู่ระบบ")
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profile.name,
          grade: profile.grade,
          branch: profile.branch,
          phone: profile.phone,
          address: profile.address,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setProfile(data.user)
        // อัปเดต localStorage
        localStorage.setItem("user", JSON.stringify(data.user))
        setIsEditing(false)
        alert("บันทึกข้อมูลเรียบร้อยแล้ว!")
      } else {
        alert(data.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล")
      }
    } catch (error) {
      console.error("Save error:", error)
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    // รีเซ็ตข้อมูลกลับเป็นค่าเดิม
    const token = localStorage.getItem("token")
    if (token) {
      fetchProfile(token)
    }
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sky-600 flex items-center justify-center">
        <div className="text-white">กำลังโหลด...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              กลับ
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <User className="h-8 w-8 text-yellow-500" />
            <h1 className="text-2xl font-bold text-white">โปรไฟล์</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>ข้อมูลส่วนตัว</CardTitle>
                <CardDescription>จัดการข้อมูลส่วนตัวและการตั้งค่าบัญชี</CardDescription>
              </div>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>แก้ไขข้อมูล</Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                    ยกเลิก
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "กำลังบันทึก..." : "บันทึก"}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">ข้อมูลพื้นฐาน</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">ชื่อ-นามสกุล</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">อีเมล</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled={true} // อีเมลไม่ให้แก้ไข
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grade">ชั้นเรียน</Label>
                  {isEditing ? (
                    <Select value={profile.grade} onValueChange={(value) => setProfile({ ...profile, grade: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกชั้นเรียน" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pvs1">ปวช.1</SelectItem>
                        <SelectItem value="pvs2">ปวช.2</SelectItem>
                        <SelectItem value="pvs3">ปวช.3</SelectItem>
                        <SelectItem value="pvt1">ปวส.1</SelectItem>
                        <SelectItem value="pvt2">ปวส.2</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={profile.grade} disabled />
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch">สาขา</Label>
                  {isEditing ? (
                    <Select value={profile.branch} onValueChange={(value) => setProfile({ ...profile, branch: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกสาขา" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="accounting">สาขาการบัญชี</SelectItem>
                        <SelectItem value="marketing">สาขาการตลาด</SelectItem>
                        <SelectItem value="digital-business">สาขาเทคโนโลยีธุรกิจดิจิทัล</SelectItem>
                        <SelectItem value="foreign-language">สาขาภาษาต่างประเทศ</SelectItem>
                        <SelectItem value="retail-business">สาขาธุรกิจค้าปลีก</SelectItem>
                        <SelectItem value="tourism">สาขาท่องเที่ยว</SelectItem>
                        <SelectItem value="hotel">สาขาโรงแรม</SelectItem>
                        <SelectItem value="entertainment">สาขาอุตสาหกรรมบันเทิง</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={profile.branch} disabled />
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">ข้อมูลติดต่อ</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                  <Input
                    id="phone"
                    value={profile.phone || ""}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    disabled={!isEditing}
                    placeholder="08X-XXX-XXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">ที่อยู่</Label>
                  <Input
                    id="address"
                    value={profile.address || ""}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    disabled={!isEditing}
                    placeholder="ที่อยู่ของคุณ"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Statistics */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>สถิติการใช้งาน</CardTitle>
            <CardDescription>ข้อมูลการใช้งานระบบของคุณ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">{stats.totalBorrows}</div>
                <div className="text-sm text-gray-600">ยืมทั้งหมด</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">{stats.returned}</div>
                <div className="text-sm text-gray-600">คืนแล้ว</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 mb-1">{stats.borrowed}</div>
                <div className="text-sm text-gray-600">ยืมอยู่</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
