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