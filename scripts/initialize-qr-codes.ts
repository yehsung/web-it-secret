import { qrService, QrCode } from '../lib/qr-service';
import * as dotenv from 'dotenv';

// .env.local 파일 로드
dotenv.config({ path: '.env.local' });

// QR 코드 데이터 생성 함수
function generateQrCodesData(): QrCode[] {
  const qrCodes: QrCode[] = [];

  // 에어팟 QR코드 (1개)
  qrCodes.push({ id: "qr001", productId: 1, isUsed: false });

  // 키보드 QR코드 (3개)
  qrCodes.push({ id: "qr002", productId: 2, isUsed: false });
  qrCodes.push({ id: "qr003", productId: 2, isUsed: false });
  qrCodes.push({ id: "qr004", productId: 2, isUsed: false });

  // 보조배터리 QR코드 (3개)
  qrCodes.push({ id: "qr005", productId: 3, isUsed: false });
  qrCodes.push({ id: "qr006", productId: 3, isUsed: false });
  qrCodes.push({ id: "qr007", productId: 3, isUsed: false });

  // 카드지갑 QR코드 (3개)
  qrCodes.push({ id: "qr008", productId: 4, isUsed: false });
  qrCodes.push({ id: "qr009", productId: 4, isUsed: false });
  qrCodes.push({ id: "qr010", productId: 4, isUsed: false });

  // 숭실대 후디베어 키링 QR코드 (15개)
  for (let i = 0; i < 15; i++) {
    const qrId = `qr${(11 + i).toString().padStart(3, "0")}`;
    qrCodes.push({ id: qrId, productId: 5, isUsed: false });
  }

  // 3단 자동우산 QR코드 (15개)
  for (let i = 0; i < 15; i++) {
    const qrId = `qr${(26 + i).toString().padStart(3, "0")}`;
    qrCodes.push({ id: qrId, productId: 6, isUsed: false });
  }

  return qrCodes;
}

async function initializeQrCodes() {
  try {
    const qrCodes = generateQrCodesData();
    // QR 코드 데이터를 객체로 변환
    const qrCodesObject = qrCodes.reduce((acc, qrCode) => {
      acc[qrCode.id] = qrCode;
      return acc;
    }, {} as Record<string, QrCode>);
    
    await qrService.initializeQrCodes(qrCodesObject);
    console.log('QR 코드 데이터가 성공적으로 초기화되었습니다.');
    console.log(`총 ${qrCodes.length}개의 QR 코드가 생성되었습니다.`);
  } catch (error) {
    console.error('QR 코드 초기화 중 오류가 발생했습니다:', error);
    process.exit(1);
  }
}

initializeQrCodes(); 