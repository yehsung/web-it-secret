# 구글폼 설정 가이드

이 문서는 QR 코드 보물찾기 시스템과 구글폼을 연동하는 방법을 설명합니다.

## 1. 구글폼 생성

1. [Google Forms](https://docs.google.com/forms)에 접속하여 새 폼을 생성합니다.
2. 폼 제목을 "숭실 IT 탐정단 QR 보물찾기 참여 양식"으로 설정합니다.
3. 설명에 "QR 코드를 스캔하신 후 아래 정보를 입력해주세요. 상품은 IT대학 학생회실에서 수령 가능합니다."를 입력합니다.

## 2. 사용자 입력 필드 추가

다음 필드를 추가합니다:

1. **개인정보수집동의** (체크박스)
   - 필수 항목으로 설정
   - 체크박스 텍스트: "개인정보 수집 및 이용에 동의합니다."

2. **이름** (단답형)
   - 필수 항목으로 설정

3. **학번** (단답형)
   - 필수 항목으로 설정
   - 유효성 검사: 숫자만 입력 가능하도록 설정

4. **연락처** (단답형)
   - 필수 항목으로 설정
   - 유효성 검사: 전화번호 형식으로 설정


## 3. 구글 스프레드시트 연결

1. 폼 응답 탭에서 "스프레드시트에서 응답 보기" 선택
2. 새 스프레드시트 생성

## 4. Apps Script 설정

1. 스프레드시트에서 "확장 프로그램" > "Apps Script" 선택
2. 다음 코드를 붙여넣기:

```javascript
// Firebase Functions 엔드포인트
const FIREBASE_FUNCTION_URL = 'https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net/handleFormSubmission';

// 폼 제출 이벤트 핸들러
function onFormSubmit(e) {
  const formResponse = e.response;
  const itemResponses = formResponse.getItemResponses();
  
  // URL 파라미터에서 QR 코드 정보 추출
  const formUrl = e.source.getPublishedUrl();
  const urlParams = new URL(formUrl).searchParams;
  const qrId = urlParams.get('qrId');
  const productId = urlParams.get('productId');
  
  // 사용자 정보 추출
  let name = '';
  let studentId = '';
  let phone = '';
  let privacyConsent = false;
  
  for (let i = 0; i < itemResponses.length; i++) {
    const itemResponse = itemResponses[i];
    const title = itemResponse.getItem().getTitle();
    const response = itemResponse.getResponse();
    
    if (title === '개인정보 수집 및 이용에 동의합니다.') {
      privacyConsent = response === 'true';
    } else if (title === '이름') {
      name = response;
    } else if (title === '학번') {
      studentId = response;
    } else if (title === '연락처') {
      phone = response;
    }
  }
  
  // Firebase Function 호출
  if (qrId && productId && name && studentId && privacyConsent) {
    const timestamp = new Date().toISOString();
    const data = {
      qrId: qrId,
      productId: parseInt(productId),
      name: name,
      studentId: studentId,
      phone: phone,
      privacyConsent: privacyConsent,
      timestamp: timestamp
    };
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      payload: JSON.stringify(data)
    };
    
    try {
      const response = UrlFetchApp.fetch(FIREBASE_FUNCTION_URL, options);
      const result = JSON.parse(response.getContentText());
      
      if (result.success) {
        console.log('데이터가 성공적으로 저장되었습니다.');
      } else {
        console.error('데이터 저장 실패:', result.error);
      }
    } catch (error) {
      console.error('API 호출 중 오류 발생:', error);
    }
  }
}

// 트리거 설정
function createFormSubmitTrigger() {
  const form = FormApp.getActiveForm();
  ScriptApp.newTrigger('onFormSubmit')
    .forForm(form)
    .onFormSubmit()
    .create();
}
```

3. `FIREBASE_FUNCTION_URL`을 실제 Firebase Functions URL로 수정합니다.
4. "실행" > "createFormSubmitTrigger" 함수를 실행하여 트리거를 설정합니다.

## 5. Firebase Functions 설정

1. Firebase 프로젝트에서 Functions를 활성화합니다.
2. 다음 코드로 새로운 함수를 생성합니다:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.handleFormSubmission = functions.https.onRequest(async (req, res) => {
  // CORS 설정
  res.set('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }
  
  try {
    const data = req.body;
    
    // 필수 필드 검증
    if (!data.qrId || !data.productId || !data.name || !data.studentId || !data.privacyConsent) {
      throw new Error('필수 필드가 누락되었습니다.');
    }
    
    // Firebase Realtime Database에 데이터 저장
    const db = admin.database();
    await db.ref('form_submissions').push(data);
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
```

3. Firebase Functions를 배포합니다.

## 5. 스프레드시트 열 설정

스프레드시트의 첫 번째 행에 다음 열 제목을 설정합니다:

1. 타임스탬프
2. 개인정보수집동의
3. 이름
4. 학번
5. 연락처

## 6. 폼 게시 및 URL 업데이트

1. 구글폼의 "전송" 버튼을 클릭하여 폼을 게시합니다.
2. 생성된 URL을 복사합니다.
3. `app/reward/[qrId]/page.tsx` 파일의 `GOOGLE_FORM_URL` 상수를 업데이트합니다.

```typescript
const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/YOUR_ACTUAL_FORM_ID/viewform";
```

이제 QR 코드를 스캔하면 구글폼에는 사용자 입력 필드만 표시되고, 제출 시 웹 API를 통해 상품 획득 처리가 이루어집니다.
