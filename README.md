# IT 탐정단 🔍

숭실대학교 IT학부 학생회 주관 QR 코드 보물찾기 이벤트 웹 애플리케이션입니다.

> **이벤트 기간**: 2025년 5월 21일 ~ 23일

---

## 프로젝트 개요

캠퍼스 곳곳에 숨겨진 QR 코드를 찾아 경품을 획득하는 이벤트입니다.
학생들이 QR 코드를 스캔하면 경품 정보를 확인하고 신청 폼을 통해 수령 신청을 할 수 있으며, 상품 재고는 실시간으로 갱신됩니다.

---

## 이벤트 흐름

```
① 학생회가 QR 코드를 출력하여 캠퍼스 곳곳에 숨김
② 학생이 QR 코드 스캔 → 경품 안내 페이지 진입
③ 구글 폼으로 수령 신청 (학번, 이름 등 입력)
④ 구글 폼 제출 → 구글 스프레드시트 자동 저장
⑤ 앱스 스크립트 트리거 → Firebase REST API 호출로 재고 실시간 갱신
⑥ 메인 페이지에서 경품 재고 현황 실시간 반영
⑦ 경품은 이벤트 종료 후 별도 지급
```

---

## 주요 기능

### 메인 페이지 (`/`)
- 전체 경품 목록 및 실시간 재고 현황 표시

### QR 보상 페이지 (`/reward/[qrId]`)
- QR 코드 스캔 시 진입하는 페이지
- 해당 QR에 연결된 경품 정보 표시
- 구글 폼 신청 링크 제공
- 이미 사용된 QR 코드 중복 사용 방지

### 관리자 대시보드 (`/admin-dashboard`)
- 전체 QR 코드 현황 및 사용 내역 조회
- 상품별 / 사용 여부별 필터링
- 개별 또는 전체 제출 내역 초기화

---

## 경품 구성

| 구분 | 상품 |
|------|------|
| 프리미엄 | 에어팟, 키보드, 보조배터리, 카드지갑 |
| 일반 | 키링, 우산 |

- 학생 1인당 **프리미엄 1개 + 일반 1개** 수령 제한
- 학생회 보유 재학생 명단을 기반으로 재학생 여부 및 중복 수령 여부 검증

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 14 (App Router), TypeScript |
| UI | Tailwind CSS, shadcn/ui, Lucide React |
| 백엔드 | Firebase Realtime Database, Firebase Cloud Functions |
| 폼 / 자동화 | Google Forms, Google Spreadsheet, Google Apps Script |
| 패키지 매니저 | pnpm |

---

## 시스템 아키텍처

```
[캠퍼스 QR 코드]
      ↓ 스캔
[Next.js 웹앱 /reward/[qrId]]
      ↓ 링크 클릭
[Google Form]
      ↓ 제출 시 자동 저장
[Google Spreadsheet]
      ↓ Apps Script 트리거 실행
[Firebase REST API (PATCH/POST)]
      ↓ 실시간 업데이트
[Firebase Realtime Database]
      ↓ onValue 리스너
[Next.js 메인 페이지 - 재고 현황]

[관리자 대시보드]  ↔  [Firebase Realtime Database]
```

---

## Firebase 데이터 구조

```
root
├── qrCodes/
│   └── {qrId}
│       ├── id: string
│       ├── productId: number
│       ├── isUsed: boolean
│       ├── usedBy: { name, studentId, phone }
│       └── usedAt: string | null
├── students/
│   └── {studentId}
│       ├── studentId: string
│       ├── name: string
│       ├── premiumUsed: boolean
│       └── normalUsed: boolean
└── form_submissions/
    └── {auto-generated}: { 폼 제출 데이터 }
```

---

## 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 아래 값을 설정합니다.

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

---

## 실행 방법

```bash
# 패키지 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start
```

### Firebase Cloud Functions

```bash
cd functions

# 로컬 에뮬레이터 실행
npm run serve

# 배포
npm run deploy
```

---

## 프로젝트 구조

```
├── app/
│   ├── page.tsx                      # 메인 페이지 (경품 목록 및 재고 현황)
│   ├── layout.tsx                    # 루트 레이아웃
│   ├── globals.css                   # 전역 스타일
│   ├── reward/[qrId]/page.tsx        # QR 보상 페이지
│   ├── admin-dashboard/       # 관리자 대시보드
│   └── api/reward/validate/          # 학생 검증 API 엔드포인트
├── components/
│   ├── ui/                           # shadcn/ui 컴포넌트
│   └── theme-provider.tsx
├── lib/
│   ├── firebase.ts                   # Firebase 초기화
│   ├── qr-service.ts                 # QR 코드 비즈니스 로직
│   └── utils.ts                      # 유틸리티 함수
├── hooks/
│   ├── use-mobile.tsx
│   └── use-toast.ts
└── functions/
    └── index.js                      # Firebase Cloud Functions
```
