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

// === QR 코드 검증 및 카테고리 관련 함수 ===
// QR ID에서 카테고리 추출 함수
function getCategoryFromQrId(qrId) {
  if (!qrId || typeof qrId !== 'string') return null;
  if (qrId.startsWith('pre')) return '프리미엄';
  if (qrId.startsWith('nor')) return '일반';
  return null;
}

// 사용자의 카테고리별 수령 이력 확인 함수
function checkUserCategoryHistory(studentId, category) {
  console.log(`사용자 ${studentId}의 ${category} 카테고리 수령 이력 확인 시작`);
  try {
    const submissions = firebaseGetData('form_submissions');
    if (!submissions) return false;

    // form_submissions의 모든 항목을 순회하며 확인
    for (const submissionId in submissions) {
      const submission = submissions[submissionId];
      if (submission.studentId === studentId) {
        // 해당 제출의 QR 코드 정보 가져오기
        const qrCode = firebaseGetData(`qrCodes/${submission.qrId}`);
        if (qrCode) {
          const submissionCategory = getCategoryFromQrId(submission.qrId);
          if (submissionCategory === category) {
            console.log(`사용자 ${studentId}가 이미 ${category} 카테고리 상품을 수령했습니다.`);
            return true;
          }
        }
      }
    }
    return false;
  } catch (error) {
    console.error('사용자 카테고리 이력 확인 중 오류:', error);
    return false;
  }
}

// === 폼 제출 이벤트 핸들러 ===
function onFormSubmit(e) {
  console.log('============= 폼 제출 이벤트 처리 시작 =============');
  const startTime = new Date();
  console.log('이벤트 발생 시각:', startTime.toISOString());

  // ... existing code ...

  try {
    // 1. 제출된 폼 응답에서 'ID' 필드 값 가져오기
    if (!submittedQrId) {
      console.error('오류: 추출된 QR 코드 ID가 누락되었거나 비어있습니다.');
      return;
    }

    // QR ID 형식 검증 (pre/nor + 랜덤 영숫자, 전체 길이 30~50자)
    if (!/^(pre|nor)[a-zA-Z0-9]{27,47}$/.test(submittedQrId)) {
      console.error(`오류: QR 코드 ID 형식이 올바르지 않습니다: "${submittedQrId}"`);
      return;
    }

    // QR ID에서 카테고리 추출
    const category = getCategoryFromQrId(submittedQrId);
    if (!category) {
      console.error(`오류: QR 코드 ID에서 카테고리를 추출할 수 없습니다: "${submittedQrId}"`);
      return;
    }

    // 2. Firebase에서 QR 코드 정보 확인
    const qrCode = firebaseGetData(`qrCodes/${submittedQrId}`);
    if (!qrCode) {
      console.error(`오류: QR 코드를 찾을 수 없습니다: "${submittedQrId}"`);
      return;
    }

    // 2-1. QR 코드가 이미 사용되었는지 확인
    if (qrCode.isUsed === true) {
      console.warn(`경고: QR 코드가 이미 사용되었습니다: "${submittedQrId}"`);
      return;
    }

    // 2-2. 사용자 정보 검증
    if (!name || !studentId || !privacyConsent) {
      console.error('오류: 필수 정보가 누락되었습니다.');
      return;
    }

    // 2-3. 재학생 확인
    const studentList = getStudentList();
    const isStudent = checkStudentExists(studentList, name, studentId);
    if (!isStudent) {
      console.error('오류: 재학생이 아닙니다.');
      return;
    }

    // 2-4. 카테고리별 수령 이력 확인
    if (checkUserCategoryHistory(studentId, category)) {
      console.error(`오류: 이미 ${category} 카테고리 상품을 수령했습니다.`);
      return;
    }

    // 3. 모든 검증 통과 시 Firebase 업데이트
    const submissionTimestamp = new Date().toISOString();
    const submissionData = {
      qrId: submittedQrId,
      productId: qrCode.productId,
      name: name,
      studentId: studentId,
      phone: phone,
      privacyConsent: privacyConsent,
      category: category,
      timestamp: submissionTimestamp
    };

    // form_submissions에 데이터 추가
    if (!firebasePushData('form_submissions', submissionData)) {
      console.error('오류: 폼 제출 데이터 저장 실패');
      return;
    }

    // QR 코드 상태 업데이트
    const userInfoForUpdate = {
      name: name,
      studentId: studentId,
      phone: phone
    };
    
    if (!updateQrCodeStatus(submittedQrId, true, userInfoForUpdate)) {
      console.error('오류: QR 코드 상태 업데이트 실패');
      return;
    }

    console.log('============= 폼 제출 이벤트 처리 완료 (성공) =============');

  } catch (error) {
    console.error('처리 중 오류 발생:', error);
  }

  const endTime = new Date();
  console.log('이벤트 처리 종료 시각:', endTime.toISOString());
  console.log('총 처리 시간 (밀리초):', endTime.getTime() - startTime.getTime());
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