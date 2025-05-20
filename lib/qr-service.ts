import { database } from './firebase';
import { ref, get, set, update } from 'firebase/database';

// QR 코드 데이터 타입 정의
export type QrCode = {
  id: string;
  productId: number;
  isUsed: boolean;
  usedBy?: string; // 사용한 학생의 학번
  usedAt?: string; // 사용 시간
};

// QR 코드 서비스
export const qrService = {
  // 모든 QR 코드 가져오기
  async getAllQrCodes(): Promise<QrCode[]> {
    const qrCodesRef = ref(database, 'qrCodes');
    const snapshot = await get(qrCodesRef);
    return snapshot.val() || [];
  },

  // 특정 QR 코드 가져오기
  async getQrCode(qrId: string): Promise<QrCode | null> {
    const qrCodeRef = ref(database, `qrCodes/${qrId}`);
    const snapshot = await get(qrCodeRef);
    return snapshot.val() || null;
  },

  // QR 코드 사용 상태 업데이트
  async updateQrCodeStatus(qrId: string, isUsed: boolean, studentId?: string): Promise<void> {
    const qrCodeRef = ref(database, `qrCodes/${qrId}`);
    const updates: Partial<QrCode> = {
      isUsed,
      usedBy: isUsed ? studentId : undefined,
      usedAt: isUsed ? new Date().toISOString() : undefined,
    };
    await update(qrCodeRef, updates);
  },

  // QR 코드 초기 데이터 생성
  async initializeQrCodes(qrCodes: Record<string, QrCode>): Promise<void> {
    const qrCodesRef = ref(database, 'qrCodes');
    await set(qrCodesRef, qrCodes);
  },

  // 재학생 검증 및 QR 코드 사용 처리
  async validateAndUseQrCode(qrId: string, name: string, studentId: string): Promise<{ success: boolean; message: string }> {
    try {
      // 1. QR 코드 존재 여부 확인
      const qrCode = await this.getQrCode(qrId);
      if (!qrCode) {
        return { success: false, message: 'QR 코드를 찾을 수 없습니다.' };
      }

      // 2. QR 코드 사용 여부 확인
      if (qrCode.isUsed) {
        return { success: false, message: '이미 사용된 QR 코드입니다.' };
      }

      // 3. 재학생 정보 확인
      const studentsRef = ref(database, 'students');
      const snapshot = await get(studentsRef);
      const students = snapshot.val() || {};
      
      const student = Object.values(students).find(
        (s: any) => s.studentId === studentId && s.name === name
      );

      if (!student) {
        return { success: false, message: '재학생 정보가 일치하지 않습니다.' };
      }

      // 4. QR 코드 사용 상태 업데이트
      await this.updateQrCodeStatus(qrId, true, studentId);
      
      return { success: true, message: 'QR 코드 사용이 완료되었습니다.' };
    } catch (error) {
      console.error('QR 코드 사용 처리 중 오류 발생:', error);
      return { success: false, message: '처리 중 오류가 발생했습니다.' };
    }
  },
}; 