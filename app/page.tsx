"use client"; // 클라이언트 컴포넌트 명시

import Image from "next/image"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

import React, { useState, useEffect } from "react"; // useState, useEffect import
import { database } from "@/lib/firebase"; // Firebase 설정 파일 경로 확인 및 수정
import { ref, onValue, DataSnapshot } from "firebase/database"; // Firebase Realtime Database 함수 import

// 상품 데이터 
const productsData = [
  {
    id: 1,
    name: "에어팟 4 노이즈캔슬링",
    image: "/images/airpods.jpg",
    category: "프리미엄",
  },
  {
    id: 2,
    name: "독거미 키보드",
    image: "/images/keyboard.jpg",
    category: "프리미엄",
  },
  {
    id: 3,
    name: "맥세이프 보조배터리",
    image: "/images/powerbank.jpg",
    category: "프리미엄",
  },
  {
    id: 4,
    name: "케이스티파이 카드지갑",
    image: "/images/cardwallet.jpg",
    category: "프리미엄",
  },
  {
    id: 5,
    name: "숭실대 후디베어 키링",
    image: "/images/keyring.jpg",
    category: "일반",
  },
  {
    id: 6,
    name: "3단 자동우산",
    image: "/images/umbrella.jpg",
    category: "일반",
  },
]

// Firebase에서 QR 코드 데이터를 가져와 상태로 관리
interface QrCodeData {
  id: string; // 새로운 형식: pre/nor + 랜덤 문자열 (30~50자)
  productId: number;
  isUsed: boolean;
  usedBy: {
    name: string | null;
    studentId: string | null;
    phone: string | null;
  };
  usedAt: string | null;
}

export default function Home() {
  const [qrCodes, setQrCodes] = useState<QrCodeData[]>([]); // Firebase에서 가져온 QR 코드 데이터 상태
  const [productStats, setProductStats] = useState<any[]>([]); // 상품별 통계 상태

  useEffect(() => {
    // Firebase Realtime Database의 '/qrCodes' 경로 구독
    const qrCodesRef = ref(database, 'qrCodes');
    const unsubscribe = onValue(qrCodesRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      if (data) {
        // 객체 형태의 데이터를 배열로 변환
        const qrCodesArray: QrCodeData[] = Object.values(data);
        setQrCodes(qrCodesArray);
        // 데이터가 업데이트될 때마다 상품 통계 다시 계산
        setProductStats(calculateProductStats(qrCodesArray, productsData));
      } else {
        setQrCodes([]);
        setProductStats(calculateProductStats([], productsData));
      }
    });

    // 컴포넌트 언마운트 시 구독 해제
    return () => unsubscribe();
  }, []); // 최초 마운트 시에만 실행

  // QR 코드 데이터를 기반으로 상품별 총수량 및 남은 수량 계산 함수
  const calculateProductStats = (qrCodes: QrCodeData[], productsData: any[]) => {
    return productsData.map(product => {
      // 해당 상품 ID를 가진 QR 코드들 필터링
      const productQrCodes = qrCodes.filter(qr => qr.productId === product.id);
      const total = productQrCodes.length; // 총 수량
      const remaining = productQrCodes.filter(qr => !qr.isUsed).length; // 사용되지 않은 수량

      return {
        ...product,
        total,
        remaining,
      };
    });
  };

  return (
    <main className="min-h-screen bg-[#0d1117] text-white">
      {/* 헤더 섹션 */}
      <div className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-purple-900/20 to-transparent"></div>
        <div className="relative z-10">
          <Image
            src="/images/logo.png"
            alt="IT 탐정단 로고"
            width={100}
            height={100}
            className="mx-auto mb-6"
          />
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            숭실 IT 탐정단
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold mb-6">QR코드 캠퍼스 보물찾기</h2>
          <p className="max-w-2xl mx-auto text-gray-300">
            캠퍼스 곳곳에 숨겨진 QR코드를 찾아 스캔하고 다양한 상품을 받아가세요!
          </p>
        </div>
      </div>

      {/* 상품 목록 섹션 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold mb-8 text-center">상품 목록</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {productStats.map((product) => (
            <div
              key={product.id}
              className="bg-[#161b22] rounded-lg overflow-hidden shadow-lg border border-gray-800 hover:border-purple-500 transition-all duration-300 hover:shadow-purple-900/30 hover:shadow-xl"
            >
              <div className="relative">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  width={400}
                  height={300}
                  className="w-full h-32 sm:h-48 object-cover"
                />
                {product.remaining === 0 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Badge className="bg-red-600 hover:bg-red-700 text-white text-sm sm:text-lg py-0.5 sm:py-1 px-2 sm:px-3">
                      품절
                    </Badge>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge className={product.category === "프리미엄" ? "bg-purple-600" : "bg-blue-600"}>
                    {product.category}
                  </Badge>
                </div>
              </div>
              <div className="p-3 sm:p-5">
                <h3 className="text-base sm:text-xl font-semibold mb-2">{product.name}</h3>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs sm:text-sm text-gray-400">
                    남은 수량: {product.remaining} / {product.total}
                  </span>
                  {product.remaining === 0 && <span className="text-xs sm:text-sm text-red-500">품절</span>}
                </div>
                <Progress
                  value={(product.remaining / product.total) * 100}
                  className="h-2 bg-gray-700"
                  indicatorClassName={`${
                    product.remaining === 0
                      ? "bg-red-500"
                      : product.remaining < product.total * 0.3
                        ? "bg-yellow-500"
                        : "bg-purple-500"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 푸터 섹션 */}
      <footer className="bg-[#161b22] border-t border-gray-800 py-8 px-4 text-center text-gray-400">
        <p>© 2025 숭실대학교 IT대학 | 이벤트 기간: 2025.05.21 ~ 2025.05.23</p>
        <p className="mt-2 text-sm">주최: 숭실대학교 IT대학</p>
      </footer>
    </main>
  )
}
