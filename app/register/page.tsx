"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    grade: "",
    branch: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      alert("รหัสผ่านไม่ตรงกัน")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          grade: formData.grade,
          branch: formData.branch,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert("สมัครสมาชิกสำเร็จ!")
        router.push("/login")
      } else {
        alert(data.error || "เกิดข้อผิดพลาดในการสมัครสมาชิก")
      }
    } catch (error) {
      console.error("Registration error:", error)
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="text-2xl">⚽</div>
            <span className="text-2xl font-bold">LCC Sport</span>
          </div>
          <CardTitle className="text-2xl">สมัครสมาชิก</CardTitle>
          <CardDescription>สร้างบัญชีใหม่เพื่อใช้งานระบบยืมอุปกรณ์กีฬา</CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">ชื่อ-นามสกุล</Label>
              <Input
                id="name"
                placeholder="ชื่อ - นามสกุล"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">ชั้นเรียน</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, grade: value })}>
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch">สาขา</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, branch: value })}>
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">อีเมล</Label>
              <Input
                id="email"
                type="email"
                placeholder="student@school.ac.th"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">รหัสผ่าน</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
            </Button>
            <p className="text-sm text-center text-gray-600">
              มีบัญชีแล้ว?{" "}
              <Link href="/login" className="text-yellow-500 hover:underline">
                เข้าสู่ระบบ
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
