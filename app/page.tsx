import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[url('/img/8003.jpg')]  bg-center ">

      {/* Header */}
      <header className="border-b border-gray-700 bg-red-600 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="text-2xl">⚽</div>
            <h1 className="text-2xl font-bold text-white">LCC Sport</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/login">
              <Button  className="bg-white text-black hover:bg-gray-800 hover:text-white">เข้าสู่ระบบ</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-white text-black hover:bg-gray-800 hover:text-white">สมัครสมาชิก</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-black mb-6">ระบบยืมอุปกรณ์กีฬาโรงเรียน</h2>
          <p className="text-xl text-black mb-8" style={{
    textShadow: `
      -1px -1px 0 #fff,
       2px -2px 0 #fff,
      -1px  1px 0 #fff,
       1px  1px 0 #fff
    `,
  }}>ยืมอุปกรณ์กีฬาได้อย่างง่ายดาย ติดตามการยืม-คืน และจัดการอุปกรณ์อย่างมีประสิทธิภาพ</p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="outline" className=" px-8 bg-red-600 text-white border-2 border-black">
                เริ่มใช้งาน
              </Button>
            </Link>
            <Link href="/equipment">
              <Button size="lg" variant="outline" className="px-8 bg-red-600 text-white border-2 border-black">
                ดูอุปกรณ์
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Equipment Categories */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12 text-yellow-500 text-outline-black"style={{
    textShadow: `
      -1px -1px 0 #000,
       2px -2px 0 #000,
      -1px  1px 0 #000,
       1px  1px 0 #000
    `,
  }}>อุปกรณ์กีฬาทั้งหมด</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/equipment?category=บาสเกตบอล">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gray-700 border-gray-700 hover:bg-gray-700">
              <CardHeader className="text-center">
                <div className="text-6xl mb-4">🏀</div>
                <CardTitle className="text-yellow-500">บาสเกตบอล</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-center">ลูกบาสเกตบอล, ห่วงบาสเกตบอล</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/equipment?category=วอลเลย์บอล">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gray-700 border-gray-700 hover:bg-gray-700">
              <CardHeader className="text-center">
                <div className="text-6xl mb-4">🏐</div>
                <CardTitle className="text-yellow-500">วอลเลย์บอล</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-center">ลูกวอลเลย์บอล, ตาข่ายวอลเลย์บอล</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/equipment?category=ฟุตบอล">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gray-700 border-gray-700 hover:bg-gray-700">
              <CardHeader className="text-center">
                <div className="text-6xl mb-4">⚽</div>
                <CardTitle className="text-yellow-500">ฟุตบอล</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-center">ลูกฟุตบอล, ประตูฟุตบอล</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/equipment?category=เปตอง">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gray-700 border-gray-700 hover:bg-gray-700">
              <CardHeader className="text-center">
                <div className="text-6xl mb-4">🎯</div>
                <CardTitle className="text-yellow-500">เปตอง</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-center">ลูกเปตอง, ลูกเป้า</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-red-600 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="text-xl">⚽</div>
            <span className="text-xl font-bold">LCC Sport</span>
          </div>
          <p className="text-white">ระบบยืมอุปกรณ์กีฬาโรงเรียน © 2025</p>
        </div>
      </footer>
    </div>
  )
}
