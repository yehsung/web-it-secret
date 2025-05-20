import Image from "next/image"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

// 상품 데이터 (실제로는 API나 데이터베이스에서 가져올 것입니다)
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

// 실제 구현에서는 데이터베이스에서 가져올 것입니다
const qrCodesData = [
  // 에어팟 QR코드
  { id: "qr001", productId: 1, isUsed: false },

  // 키보드 QR코드
  { id: "qr002", productId: 2, isUsed: false },
  { id: "qr003", productId: 2, isUsed: true }, // 이미 사용됨
  { id: "qr004", productId: 2, isUsed: false },

  // 보조배터리 QR코드
  { id: "qr005", productId: 3, isUsed: false },
  { id: "qr006", productId: 3, isUsed: false },
  { id: "qr007", productId: 3, isUsed: false },

  // 카드지갑 QR코드
  { id: "qr008", productId: 4, isUsed: false },
  { id: "qr009", productId: 4, isUsed: false },
  { id: "qr010", productId: 4, isUsed: false },

  // 숭실대 후디베어 키링 QR코드 (15개)
  { id: "qr011", productId: 5, isUsed: false },
  { id: "qr012", productId: 5, isUsed: false },
  { id: "qr013", productId: 5, isUsed: true }, // 이미 사용됨
  { id: "qr014", productId: 5, isUsed: false },
  { id: "qr015", productId: 5, isUsed: false },
  { id: "qr016", productId: 5, isUsed: false },
  { id: "qr017", productId: 5, isUsed: false },
  { id: "qr018", productId: 5, isUsed: true }, // 이미 사용됨
  { id: "qr019", productId: 5, isUsed: false },
  { id: "qr020", productId: 5, isUsed: false },
  { id: "qr021", productId: 5, isUsed: false },
  { id: "qr022", productId: 5, isUsed: false },
  { id: "qr023", productId: 5, isUsed: false },
  { id: "qr024", productId: 5, isUsed: false },
  { id: "qr025", productId: 5, isUsed: false },

  // 3단 자동우산 QR코드 (15개)
  { id: "qr026", productId: 6, isUsed: false },
  { id: "qr027", productId: 6, isUsed: false },
  { id: "qr028", productId: 6, isUsed: true }, // 이미 사용됨
  { id: "qr029", productId: 6, isUsed: false },
  { id: "qr030", productId: 6, isUsed: false },
  { id: "qr031", productId: 6, isUsed: false },
  { id: "qr032", productId: 6, isUsed: false },
  { id: "qr033", productId: 6, isUsed: true }, // 이미 사용됨
  { id: "qr034", productId: 6, isUsed: false },
  { id: "qr035", productId: 6, isUsed: false },
  { id: "qr036", productId: 6, isUsed: false },
  { id: "qr037", productId: 6, isUsed: false },
  { id: "qr038", productId: 6, isUsed: false },
  { id: "qr039", productId: 6, isUsed: false },
  { id: "qr040", productId: 6, isUsed: false },
]

// 각 상품별 총 QR코드 수와 사용되지 않은 QR코드 수 계산
function getProductStats() {
  return productsData.map((product) => {
    const qrCodes = qrCodesData.filter((qr) => qr.productId === product.id)
    const total = qrCodes.length
    const remaining = qrCodes.filter((qr) => !qr.isUsed).length

    return {
      ...product,
      total,
      remaining,
    }
  })
}

export default function Home() {
  const products = getProductStats()

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
          {products.map((product) => (
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
