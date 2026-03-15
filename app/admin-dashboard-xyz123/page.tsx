"use client"

import React, { useState, useEffect } from "react"
import { database } from "@/lib/firebase"
import { ref, onValue, update, DataSnapshot, set } from "firebase/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Lock,
  LogOut,
  QrCode,
  Search,
  ShoppingBag,
  ToggleLeft,
  ToggleRight,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface QrCode {
  id: string;
  productId: number;
  isUsed: boolean;
  usedBy: {
    name: string | null;
    studentId: string | null;
    phone: string | null;
  } | null;
  usedAt: string | null;
}

interface Student {
  studentId: string;
  name: string;
  isUsed: boolean;
}

// 상품 기본 데이터
const productsData = [
  {
    id: 1,
    name: "에어팟 4 노이즈캔슬링",
    image: "/placeholder.svg?height=200&width=200",
    category: "프리미엄",
  },
  {
    id: 2,
    name: "독거미 키보드",
    image: "/placeholder.svg?height=200&width=200",
    category: "프리미엄",
  },
  {
    id: 3,
    name: "맥세이프 보조배터리",
    image: "/placeholder.svg?height=200&width=200",
    category: "프리미엄",
  },
  {
    id: 4,
    name: "케이스티파이 카드지갑",
    image: "/placeholder.svg?height=200&width=200",
    category: "프리미엄",
  },
  {
    id: 5,
    name: "숭실대 후디베어 키링",
    image: "/placeholder.svg?height=200&width=200",
    category: "일반",
  },
  {
    id: 6,
    name: "3단 자동우산",
    image: "/placeholder.svg?height=200&width=200",
    category: "일반",
  },
]

export default function AdminDashboard() {
  const [qrCodes, setQrCodes] = useState<QrCode[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProduct, setSelectedProduct] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isResetting, setIsResetting] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" })
    router.push("/admin-dashboard-xyz123/login")
  }

  useEffect(() => {
    // QR 코드 데이터 구독
    const qrCodesRef = ref(database, "qrCodes")
    const qrCodesUnsubscribe = onValue(qrCodesRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val()
      if (data) {
        const qrCodesArray = Object.values(data) as QrCode[]
        setQrCodes(qrCodesArray)
      }
    })

    // 학생 데이터 구독
    const studentsRef = ref(database, "students")
    const studentsUnsubscribe = onValue(studentsRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val()
      if (data) {
        const studentsArray = Object.values(data) as Student[]
        setStudents(studentsArray)
      }
    })

    return () => {
      qrCodesUnsubscribe()
      studentsUnsubscribe()
    }
  }, [])

  const handleReset = async (qrCode: QrCode) => {
    try {
      const qrCodeRef = ref(database, `qrCodes/${qrCode.id}`)
      await update(qrCodeRef, {
        isUsed: false,
        usedBy: null,
        usedAt: null
      })
    } catch (error) {
      console.error("QR 코드 초기화 중 오류 발생:", error)
    }
  }

  const handleResetAllSubmissions = async () => {
    if (!window.confirm('정말로 모든 수령 내역을 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    setIsResetting(true);
    try {
      // 1. form_submissions 초기화
      await set(ref(database, 'form_submissions'), {});
      console.log('모든 수령 내역이 초기화되었습니다.');

      // 2. 모든 QR 코드 초기화
      const updates: { [key: string]: any } = {};
      qrCodes.forEach(qrCode => {
        updates[`qrCodes/${qrCode.id}`] = {
          ...qrCode,
          isUsed: false,
          usedBy: null,
          usedAt: null
        };
      });

      await update(ref(database), updates);
      console.log('모든 QR 코드가 초기화되었습니다.');

      alert('모든 수령 내역과 QR 코드가 성공적으로 초기화되었습니다.');
    } catch (error) {
      console.error('초기화 중 오류 발생:', error);
      alert('초기화 중 오류가 발생했습니다.');
    } finally {
      setIsResetting(false);
    }
  };

  const filteredQrCodes = qrCodes.filter((qrCode) => {
    const matchesSearch = qrCode.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProduct = selectedProduct === "all" || qrCode.productId.toString() === selectedProduct
    const matchesStatus = selectedStatus === "all" || 
      (selectedStatus === "used" && qrCode.isUsed) || 
      (selectedStatus === "unused" && !qrCode.isUsed)
    return matchesSearch && matchesProduct && matchesStatus
  })

  const getProductName = (productId: number) => {
    // productsData 배열에서 해당 productId를 가진 상품을 찾습니다.
    const product = productsData.find(p => p.id === productId);
    // 찾았으면 상품 이름을 반환하고, 못 찾았으면 원래 productId를 반환합니다.
    return product ? product.name : productId.toString();
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 헤더 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Lock className="h-6 w-6 text-purple-600 mr-2" />
            <h1 className="text-xl font-bold text-gray-900">관리자 대시보드</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => (window.location.href = "/")}>
              메인 페이지로
            </Button>
            <Button variant="outline" onClick={handleLogout} className="text-red-600 border-red-200 hover:bg-red-50">
              <LogOut className="h-4 w-4 mr-1" />
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 대시보드 헤더 */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">QR코드 별 상품 관리</h2>
            <Button
              variant="destructive"
              onClick={handleResetAllSubmissions}
              disabled={isResetting}
            >
              {isResetting ? '초기화 중...' : '모든 수령 내역 초기화'}
            </Button>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">총 QR코드 수</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <QrCode className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="text-2xl font-bold">{qrCodes.length}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">사용 가능한 QR코드</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <ToggleRight className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-2xl font-bold">{qrCodes.filter((qr) => !qr.isUsed).length}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">사용된 QR코드</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <ToggleLeft className="h-5 w-5 text-red-600 mr-2" />
                    <span className="text-2xl font-bold">{qrCodes.filter((qr) => qr.isUsed).length}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">상품 종류</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <ShoppingBag className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="text-2xl font-bold">{new Set(qrCodes.map((qr) => qr.productId)).size}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* 필터 및 검색  */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="QR코드 ID 또는 상품명으로 검색..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
              }}
              className="pl-10"
            />
          </div>
          <Select
            value={selectedProduct}
            onValueChange={(value) => {
              setSelectedProduct(value)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="상품 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 상품</SelectItem>
              {productsData.map((product) => (
                <SelectItem key={product.id} value={product.id.toString()}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={selectedStatus}
            onValueChange={(value) => {
              setSelectedStatus(value)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="상태 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 상태</SelectItem>
              <SelectItem value="used">사용됨</SelectItem>
              <SelectItem value="unused">미사용</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* QR코드 별 상품 테이블 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">
                  <button className="flex items-center font-semibold" onClick={() => {}}>
                    QR코드 ID
                  </button>
                </TableHead>
                <TableHead className="w-[300px]">
                  <button className="flex items-center font-semibold" onClick={() => {}}>
                    상품명
                  </button>
                </TableHead>
                <TableHead>
                  <button className="flex items-center font-semibold" onClick={() => {}}>
                    카테고리
                  </button>
                </TableHead>
                <TableHead>
                  <button className="flex items-center font-semibold" onClick={() => {}}>
                    상태
                  </button>
                </TableHead>
                <TableHead>
                  <button className="flex items-center font-semibold" onClick={() => {}}>
                    사용자
                  </button>
                </TableHead>
                <TableHead>
                  <button className="flex items-center font-semibold" onClick={() => {}}>
                    사용 시간
                  </button>
                </TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQrCodes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    검색 결과가 없습니다
                  </TableCell>
                </TableRow>
              ) : (
                filteredQrCodes.map((qrCode) => (
                  <TableRow key={qrCode.id} className={qrCode.isUsed ? "bg-red-50" : ""}>
                    <TableCell className="font-mono text-sm">{qrCode.id}</TableCell>
                    <TableCell className="font-medium">{getProductName(qrCode.productId)}</TableCell>
                    <TableCell>
                      <Badge className={qrCode.isUsed ? "bg-purple-600" : "bg-blue-600"}>
                        {qrCode.isUsed ? "사용됨" : "미사용"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {qrCode.isUsed ? (
                        <Badge variant="destructive" className="flex items-center w-fit">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          사용됨
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200 flex items-center w-fit"
                        >
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          미사용
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {qrCode.isUsed ? (
                        <div className="space-y-1">
                          <div>이름: {qrCode.usedBy?.name || 'N/A'}</div>
                          <div>학번: {qrCode.usedBy?.studentId || 'N/A'}</div>
                          <div>전화번호: {qrCode.usedBy?.phone || 'N/A'}</div>
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </TableCell>
                    <TableCell>{qrCode.usedAt ? new Date(qrCode.usedAt).toLocaleString() : "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end">
                        {qrCode.isUsed && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReset(qrCode)}
                          >
                            초기화
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  )
}
