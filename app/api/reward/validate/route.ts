import { NextResponse } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, get, update } from 'firebase/database';

// 상품 카테고리 확인
function getProductCategory(productId: number): '프리미엄' | '일반' {
  const products: Record<number, '프리미엄' | '일반'> = {
    1: "프리미엄", // 에어팟
    2: "프리미엄", // 키보드
    3: "프리미엄", // 보조배터리
    4: "프리미엄", // 카드지갑
    5: "일반",     // 키링
    6: "일반"      // 우산
  };
  return products[productId] || "일반";
}

// 학생의 상품 획득 이력 확인
async function checkStudentRewardHistory(studentId: string, productCategory: '프리미엄' | '일반'): Promise<boolean> {
  const studentRef = ref(database, `students/${studentId}`);
  const snapshot = await get(studentRef);
  const student = snapshot.val();

  if (!student) return false;

  if (productCategory === "프리미엄" && student.premiumUsed) {
    return false; // 이미 프리미엄 상품을 획득했음
  }
  if (productCategory === "일반" && student.normalUsed) {
    return false; // 이미 일반 상품을 획득했음
  }
  return true; // 상품 획득 가능
}

// QR 코드 상태 업데이트
async function updateQrCodeStatus(qrId: string, studentId: string, productId: number): Promise<void> {
  const qrCodeRef = ref(database, `qrCodes/${qrId}`);
  await update(qrCodeRef, {
    isUsed: true,
    usedBy: studentId,
    usedAt: new Date().toISOString()
  });

  // 학생의 상품 획득 이력 업데이트
  const productCategory = getProductCategory(productId);
  const studentRef = ref(database, `students/${studentId}`);
  const updates: Record<string, boolean> = {};
  
  if (productCategory === "프리미엄") {
    updates.premiumUsed = true;
  } else {
    updates.normalUsed = true;
  }
  
  await update(studentRef, updates);
}

// 재학생 정보 확인
async function validateStudent(name: string, studentId: string): Promise<boolean> {
  const studentRef = ref(database, `students/${studentId}`);
  const snapshot = await get(studentRef);
  const student = snapshot.val();
  
  return student && student.name === name;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { qrId, productId, name, studentId } = body;

    if (!qrId || !productId || !name || !studentId) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 재학생 정보 확인
    const isValidStudent = await validateStudent(name, studentId);
    if (!isValidStudent) {
      return NextResponse.json(
        { error: '재학생 정보가 일치하지 않습니다.' },
        { status: 400 }
      );
    }

    // 상품 카테고리 확인
    const productCategory = getProductCategory(productId);
    
    // 학생의 상품 획득 이력 확인
    const canReceiveReward = await checkStudentRewardHistory(studentId, productCategory);
    if (!canReceiveReward) {
      return NextResponse.json(
        { error: `이미 ${productCategory} 상품을 획득했습니다.` },
        { status: 400 }
      );
    }

    // QR 코드 상태 업데이트
    await updateQrCodeStatus(qrId, studentId, productId);

    return NextResponse.json({
      success: true,
      message: '상품 획득이 완료되었습니다.'
    });

  } catch (error) {
    console.error('상품 획득 처리 중 오류 발생:', error);
    return NextResponse.json(
      { error: '처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 