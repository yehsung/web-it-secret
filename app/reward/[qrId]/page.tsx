'use client';

import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ExternalLink, QrCode } from "lucide-react"
import { database } from "@/lib/firebase"
import { ref, onValue, DataSnapshot } from "firebase/database"
import { useEffect, useState } from "react"

// 상품 데이터 - productId가 숫자 1, 2, 3... 인 구조에 맞춰 다시 수정
const productsData = [
  {
    id: 1, // Firebase productId와 일치하도록 숫자 id 사용
    name: "에어팟 4 노이즈캔슬링",
    image: "/images/airpods.jpg",
    description: "최신 노이즈 캔슬링 기능을 탑재한 애플 에어팟 4세대입니다.",
    category: "프리미엄",
  },
  {
    id: 2, // Firebase productId와 일치하도록 숫자 id 사용
    name: "독거미 키보드",
    image: "/images/keyboard.jpg",
    description: "독거미 브랜드의 게이밍에 최적화된 기계식 키보드입니다.",
    category: "프리미엄",
  },
  {
    id: 3, // Firebase productId와 일치하도록 숫자 id 사용
    name: "맥세이프 보조배터리",
    image: "/images/powerbank.jpg",
    description: "애플 맥세이프 호환 20,000mAh 대용량 보조배터리로 무선 충전이 가능합니다.",
    category: "프리미엄",
  },
  {
    id: 4, // Firebase productId와 일치하도록 숫자 id 사용
    name: "케이스티파이 카드지갑",
    image: "/images/cardwallet.jpg",
    description: "케이스티파이의 슬림한 디자인 카드지갑으로 필수 카드만 휴대하기 좋습니다.",
    category: "프리미엄",
  },
  {
    id: 5, // Firebase productId와 일치하도록 숫자 id 사용
    name: "숭실대 후디베어 키링",
    image: "/images/keyring.jpg",
    description: "숭실대학교 마스코트인 후디베어가 새겨진 귀여운 키링입니다.",
    category: "일반",
  },
  {
    id: 6, // Firebase productId와 일치하도록 숫자 id 사용
    name: "3단 자동우산",
    image: "/images/umbrella.jpg",
    description: "버튼 하나로 자동으로 펼쳐지는 편리한 3단 우산입니다.",
    category: "일반",
  },
  // 필요한 다른 상품들도 Firebase productId에 맞춰 추가
];

// 구글폼 URL 
const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSe45HgKCROIhl0FFm0h2z97hekjN1ir7ZsAXFaqC7XrKTaZJg/viewform"


const QR_ID_ENTRY_ID = "200310164";

// 상품 ID 필드도 사전 작성하려면 해당 Entry ID를 여기에 추가 (선택 사항)
// const PRODUCT_ID_ENTRY_ID = "여기에_상품_ID_필드의_Entry_ID_입력";

interface QrCodeData {
  id: string;
  productId: number; // Firebase에서 숫자로 저장되므로 number로 변경
  isUsed: boolean;
  usedBy: string | null;
  usedAt: string | null;
}

const getProductName = (productId: number) => {
  // productsData 배열에서 해당 productId를 가진 상품을 찾습니다.
  const product = productsData.find(p => p.id === productId);
  // 찾았으면 상품 이름을 반환하고, 못 찾았으면 원래 productId를 반환합니다.
  return product ? product.name : productId;
}

export default function QRRewardPage({ params }: { params: { qrId: string } }) {
  const { qrId } = params
  const [qrCode, setQrCode] = useState<QrCodeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('Fetching QR code data for:', qrId)
    // 수정: QR 코드 데이터 경로를 'qrCodes/${qrId}'로 되돌림
    const qrCodeRef = ref(database, `qrCodes/${qrId}`)
    console.log('Database path:', `qrCodes/${qrId}`)

    const unsubscribe = onValue(qrCodeRef, (snapshot: DataSnapshot) => {
      console.log('Received data:', snapshot.val())
      const data = snapshot.val() as QrCodeData | null; // 타입 단언
      if (data) {
        setQrCode(data)
      } else {
        console.log('No data found for QR code:', qrId)
        // 데이터가 없으면 notFound 호출
        notFound();
      }
      setLoading(false)
    }, (error) => {
      console.error('Error fetching QR code:', error)
      setError('QR 코드 데이터를 불러오는 중 오류가 발생했습니다.')
      setLoading(false)
    })

    return () => unsubscribe()
  }, [qrId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>로딩 중...</p>
        </div>
      </div>
    )
  }

   // QR 코드 데이터 로딩 실패 또는 데이터 없음 (useEffect에서 notFound 처리)
   // error 상태인 경우 사용자에게 오류 메시지를 표시하거나 null 반환
   if (error) {
     console.error("QR 코드 데이터 로딩 오류:", error);
     // 필요하다면 사용자에게 표시할 오류 UI를 여기에 추가할 수 있습니다.
     return (
       <div className="min-h-screen bg-[#0d1117] text-white flex items-center justify-center">
         <p className="text-red-500">{error}</p>
       </div>
     );
   }

  if (!qrCode) {
      // 로딩은 끝났으나 qrCode가 null인 경우 (e.g. 데이터가 없어서 notFound 호출 후)
      // notFound가 클라이언트 컴포넌트에서 즉시 작동하지 않을 수 있으므로 여기서도 처리
      console.log("QR 코드 데이터가 없어 페이지를 표시할 수 없습니다.");
      return (
        <div className="min-h-screen bg-[#0d1117] text-white flex items-center justify-center">
          <p className="text-red-500">유효하지 않은 QR 코드입니다.</p>
        </div>
      );
  }

  // 연결된 상품 정보 찾기
  // 수정: Firebase에서 읽어온 qrCode.productId (number)와 productsData의 id (number)를 비교
  const product = productsData.find((p) => p.id === qrCode.productId)

  // 상품 정보가 존재하지 않으면 404 페이지로 리다이렉트
  if (!product) {
     console.error("productsData에서 상품 정보를 찾을 수 없습니다. productId:", qrCode.productId);
     notFound()
  }

  // QR 코드가 이미 사용되었는지 확인
  const isAvailable = !qrCode.isUsed

  // 구글폼 URL 생성
  // 수정: productId 파라미터에 qrCode에서 읽어온 productId 값을 그대로 사용 (number)
  // Google Form은 URL 파라미터 값을 모두 문자열로 받으므로 `product.id`를 사용해도 무방
  const formUrl = `${GOOGLE_FORM_URL}?entry.${QR_ID_ENTRY_ID}=${encodeURIComponent(qrId)}`; // Entry ID와 함께 qrId 전달

  // 만약 상품 ID도 사전 작성하려면 아래 주석 해제 후 PRODUCT_ID_ENTRY_ID 정의
  // + `&entry.${PRODUCT_ID_ENTRY_ID}=${encodeURIComponent(product.id.toString())}`;

  return (
    <main className="min-h-screen bg-[#0d1117] text-white">
      {/* 상품 정보 */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-[#161b22] rounded-lg overflow-hidden shadow-lg border border-gray-800">
          {/* 상태 배지 */}
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <div className="flex items-center">
              {/* product.name과 product.category는 여전히 productsData에서 가져옴 */}
              <h1 className="text-xl font-bold">{product.name}</h1>
              <Badge
                className={`ml-3 ${
                  product.category === "프리미엄"
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {product.category}
              </Badge>
            </div>
            {qrCode.isUsed ? (
              <Badge className="bg-red-600 hover:bg-red-700 text-white">이미 사용된 QR</Badge>
            ) : (
              <Badge className="bg-green-600 hover:bg-green-700 text-white">수령 가능</Badge>
            )}
          </div>

          <div className="md:flex">
            {/* 상품 이미지 */}
            {/* product.image와 product.name은 productsData에서 가져옴 */}
            <div className="md:w-1/2">
              <div className="relative h-64 md:h-full">
                <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
              </div>
            </div>

            {/* 상품 상세 정보 */}
            <div className="p-6 md:w-1/2">
              <div className="mb-6">
                {/* product.description은 productsData에서 가져옴 */}
                <h3 className="text-lg font-medium mb-2">상품 설명</h3>
                <p className="text-gray-300">{product.description}</p>
              </div>

              {/* 참여 방법 및 버튼 */}
              <div className="space-y-4">
                <div className="bg-[#0d1117] p-4 rounded-md">
                  <h3 className="text-lg font-medium mb-2">참여 방법</h3>
                  <ol className="list-decimal list-inside text-gray-300 space-y-2">
                    <li>아래 버튼을 클릭하여 구글폼으로 이동</li>
                    <li>이름, 학번, 학과(부), 연락처를 정확히 입력</li>
                    <li>제출 후 확인 메시지를 받으면 완료</li>
                    <li>상품은 추후 IT대학 학생회실에서 수령 가능</li>
                  </ol>
                </div>

                {isAvailable ? (
                  // href 속성에 수정된 formUrl 사용
                  <a href={formUrl} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                      구글폼으로 정보 입력하기
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                ) : (
                  <Button disabled className="w-full bg-gray-700 text-gray-400 cursor-not-allowed">
                    이미 사용된 QR코드입니다
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 주의사항 */}
        <div className="mt-8 bg-[#161b22] rounded-lg p-6 border border-gray-800">
          <h3 className="text-lg font-medium mb-4">주의사항</h3>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>각 QR코드는 하나의 상품에 연결되어 있으며, 1회만 사용 가능합니다.</li>
            <li>구글폼 제출 후에는 해당 QR코드를 재사용할 수 없습니다.</li>
            <li>숭실대학교 학생만 참여 가능하며, 학생증 확인이 필요할 수 있습니다.</li>
          </ul>
        </div>
      </div>

      {/* 푸터 */}
      <footer className="bg-[#161b22] border-t border-gray-800 py-8 px-4 text-center text-gray-400 mt-12">
        <p>© 2025 숭실대학교 IT대학 | 이벤트 기간: 2025.05.21 ~ 2025.05.23</p>
        <p className="mt-2 text-sm">주최: 숭실대학교 IT대학</p>
      </footer>
    </main>
  )
}
