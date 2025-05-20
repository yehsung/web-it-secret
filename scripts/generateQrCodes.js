const admin = require('firebase-admin');
const path = require('path');

// Firebase Admin SDK 초기화
const serviceAccount = require('./firebase-admin-key.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://ssu-it-project-ys-default-rtdb.firebaseio.com"
});

const database = admin.database();

// QR 코드 생성을 위한 유틸리티 함수
function generateRandomId(length = 16) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
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
    const qrCodes = {};
    let totalQrCodes = 0;
    
    productsData.forEach(product => {
        // 각 상품별로 지정된 수량만큼 QR 코드 생성
        for (let i = 0; i < product.quantity; i++) {
            const qrId = generateRandomId(16);
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
        }
        
        console.log(`생성된 QR 코드 (${product.name}):`);
        console.log(`- 수량: ${product.quantity}개`);
        console.log(`- 카테고리: ${product.category}`);
        console.log('-------------------');
    });
    
    console.log(`총 생성된 QR 코드 수: ${totalQrCodes}개`);
    return qrCodes;
}

// Firebase에 QR 코드 데이터를 추가하는 함수
async function addQrCodesToFirebase(qrCodes) {
    try {
        // 기존 데이터 삭제 (선택사항)
        await database.ref('qrCodes').remove();
        console.log('기존 QR 코드 데이터가 삭제되었습니다.');

        // 새로운 QR 코드 데이터 추가
        await database.ref('qrCodes').set(qrCodes);
        console.log('새로운 QR 코드 데이터가 Firebase에 추가되었습니다.');
        
        // 생성된 QR 코드 통계 출력
        console.log('\n생성된 QR 코드 통계:');
        productsData.forEach(product => {
            const productQrCodes = Object.values(qrCodes).filter(qr => qr.productId === product.id);
            console.log(`${product.name}:`);
            console.log(`- 생성된 QR 코드 수: ${productQrCodes.length}개`);
            console.log(`- 카테고리: ${product.category}`);
            console.log('-------------------');
        });

        // 샘플 QR 코드 URL 출력 (각 상품별 1개씩)
        console.log('\n샘플 QR 코드 URL:');
        productsData.forEach(product => {
            const sampleQrCode = Object.entries(qrCodes).find(([_, data]) => data.productId === product.id);
            if (sampleQrCode) {
                const [qrId, _] = sampleQrCode;
                console.log(`${product.name}:`);
                console.log(`URL: https://여러분의사이트주소/reward/${qrId}`);
                console.log('-------------------');
            }
        });

    } catch (error) {
        console.error('Firebase 데이터 추가 중 오류 발생:', error);
    } finally {
        // Firebase 앱 종료
        admin.app().delete();
    }
}

// 스크립트 실행
async function main() {
    try {
        const generatedQrCodes = generateQrCodesForProducts();
        await addQrCodesToFirebase(generatedQrCodes);
    } catch (error) {
        console.error('스크립트 실행 중 오류 발생:', error);
    }
}

main(); 