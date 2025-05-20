const admin = require('firebase-admin');
const path = require('path');

// Firebase Admin SDK 초기화
const serviceAccount = require('./firebase-admin-key.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://ssu-it-project-ys-default-rtdb.firebaseio.com"
});

const database = admin.database();

/**
 * 새로운 형식의 QR ID를 생성합니다.
 * ID 형식: [pre|nor] + 랜덤 영숫자 (총 길이 30 ~ 50자)
 * @param {string} category - 상품 카테고리 ('프리미엄' 또는 '일반')
 * @returns {string} 생성된 새로운 QR ID
 * @throws {Error} 유효하지 않은 카테고리인 경우 오류 발생
 */
function generateNewQrId(category) {
  // 카테고리에 따른 접두사 설정
  let prefix = '';
  if (category === '프리미엄') {
    prefix = 'pre';
  } else if (category === '일반') {
    prefix = 'nor';
  } else {
    throw new Error(`Error: Invalid product category provided for ID generation: "${category}". Category must be '프리미엄' or '일반'.`);
  }

  // 랜덤 길이 결정 (30 이상 50 이하의 정수)
  const minTotalLength = 30;
  const maxTotalLength = 50;
  // 접두사 길이를 뺀 나머지 랜덤 문자열의 길이 범위
  const minRandomLength = minTotalLength - prefix.length;
  const maxRandomLength = maxTotalLength - prefix.length;

  // 계산된 랜덤 문자열 길이 (minRandomLength 이상 maxRandomLength 이하)
  const randomPartLength = Math.floor(Math.random() * (maxRandomLength - minRandomLength + 1)) + minRandomLength;

  // 랜덤 영숫자 문자열 생성
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  const charactersLength = characters.length;
  for (let i = 0; i < randomPartLength; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return prefix + randomString;
}

// 상품 데이터 (productsData와 동일한 구조)
const productsData = [
    { id: 1, name: "에어팟 4 노이즈캔슬링", category: "프리미엄", quantity: 1 },  // 1개
    { id: 2, name: "독거미 키보드", category: "프리미엄", quantity: 3 },        // 3개
    { id: 3, name: "맥세이프 보조배터리", category: "프리미엄", quantity: 3 },  // 3개
    { id: 4, name: "케이스티파이 카드지갑", category: "프리미엄", quantity: 3 }, // 3개
    { id: 5, name: "숭실대 후디베어 키링", category: "일반", quantity: 15 },    // 15개
    { id: 6, name: "3단 자동우산", category: "일반", quantity: 15 }            // 15개
];

// 각 상품별로 QR 코드 생성
function generateQrCodesForProducts() {
    console.log('Generating QR codes with new format...');
    const qrCodes = {};
    let totalQrCodes = 0;

    productsData.forEach(product => {
        console.log(`\nGenerating QR codes for ${product.name}...`);
        // 각 상품별로 지정된 수량만큼 QR 코드 생성
        for (let i = 0; i < product.quantity; i++) {
            const qrId = generateNewQrId(product.category);
            qrCodes[qrId] = {
                id: qrId,
                productId: product.id,
                isUsed: false,
                usedBy: {
                    name: null,
                    studentId: null,
                    phone: null
                },
                usedAt: null
            };
            totalQrCodes++;
            console.log(`Generated QR Code ${i + 1}/${product.quantity}: ${qrId}`);
        }
    });

    console.log(`\nTotal generated QR codes: ${totalQrCodes}개`);
    return qrCodes;
}

// Firebase에 QR 코드 데이터를 추가하는 함수
// 이 함수는 기존 데이터를 삭제하고 새로운 데이터를 씁니다. (마이그레이션 스크립트와 유사)
// !! 주의: 이 스크립트 실행 시 Firebase의 기존 /qrCodes 데이터는 삭제됩니다.
async function addQrCodesToFirebase(qrCodes) {
    console.log('Adding generated QR codes to Firebase...');
    try {
        // 기존 데이터 삭제 (선택사항이나, 새로운 ID로 덮어쓰려면 삭제하는 것이 일반적)
        // 주의: 기존 데이터가 필요한 경우 이 라인을 제거하거나 마이그레이션 스크립트를 별도로 사용하세요。
        await database.ref('qrCodes').remove();
        console.log('Existing QR code data deleted from Firebase.');

        // 새로운 QR 코드 데이터 추가
        await database.ref('qrCodes').set(qrCodes);
        console.log('New QR code data successfully added to Firebase.');

        // 생성된 QR 코드 통계 출력
        console.log('\nGenerated QR Code Statistics:');
        productsData.forEach(product => {
            // 생성된 qrCodes 객체에서 해당 productId를 가진 QR 코드를 찾습니다.
            const productQrCodes = Object.values(qrCodes).filter(qr => qr.productId === product.id);
            console.log(`${product.name}:`);
            console.log(`- Generated Count: ${productQrCodes.length}개`);
            console.log(`- 카테고리: ${product.category}`);
            console.log('-------------------');
        });

        // 샘플 QR 코드 URL 출력 (각 상품별 1개씩)
        console.log('\nSample QR Code URLs:');
        productsData.forEach(product => {
            const sampleQrCodeEntry = Object.entries(qrCodes).find(([qrId, data]) => data.productId === product.id);
            if (sampleQrCodeEntry) {
                const [qrId, _] = sampleQrCodeEntry;
                // !! 중요: 아래 YOUR_SITE_URL_HERE 부분을 실제 웹사이트 주소로 변경하세요!
                console.log(`${product.name}:`);
                console.log(`URL: https://YOUR_SITE_URL_HERE/reward/${qrId}`);
                console.log('-------------------');
            }
        });

    } catch (error) {
        console.error('Error adding QR code data to Firebase:', error);
    } finally {
        // Firebase 앱 종료 (스크립트 실행 완료 후)
        // process.exit(0); // Node.js 스크립트 종료
        if (admin.apps.length > 0) {
           try {
              admin.app().delete();
              console.log("Firebase app deleted.");
           } catch (error) {
              console.error("Error deleting Firebase app:", error);
           }
        }
    }
}

// 스크립트 실행 메인 함수
async function main() {
    try {
        const generatedQrCodes = generateQrCodesForProducts();
        // 생성된 QR 코드가 0개 이상인지 확인 후 Firebase에 추가
        if (Object.keys(generatedQrCodes).length > 0) {
             await addQrCodesToFirebase(generatedQrCodes);
        } else {
             console.log("No QR codes generated. Skipping Firebase add.");
        }
    } catch (error) {
        console.error('Error during script execution:', error);
    }
}

main(); 