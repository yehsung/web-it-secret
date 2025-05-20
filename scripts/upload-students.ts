const XLSX = require('xlsx');
const { database } = require('../lib/firebase');
const { ref, set } = require('firebase/database');
const dotenv = require('dotenv');

// .env.local 파일 로드
dotenv.config({ path: '.env.local' });

// 학생 데이터 타입 정의
interface Student {
  studentId: string;
  name: string;
  isUsed: boolean;
}

async function uploadStudents(filePath: string) {
  try {
    // Excel 파일 읽기
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    // 데이터 검증
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('데이터가 없거나 잘못된 형식입니다.');
    }

    // 필수 필드 확인
    const requiredFields = ['학번', '이름'];
    const firstRow = data[0] as Record<string, any>;
    for (const field of requiredFields) {
      if (!(field in firstRow)) {
        throw new Error(`필수 필드가 없습니다: ${field}`);
      }
    }

    // 데이터 형식 변환
    const students: Student[] = data.map((row: any) => ({
      studentId: row['학번'].toString(),
      name: row['이름'],
      isUsed: false, // 기본값으로 사용되지 않음으로 설정
    }));

    // Firebase에 데이터 업로드
    const studentsRef = ref(database, 'students');
    await set(studentsRef, students);

    console.log('학생 데이터가 성공적으로 업로드되었습니다.');
    console.log(`총 ${students.length}명의 학생 데이터가 업로드되었습니다.`);
  } catch (error) {
    console.error('데이터 업로드 중 오류가 발생했습니다:', error);
    process.exit(1);
  }
}

// 명령줄 인수에서 파일 경로 가져오기
const filePath = process.argv[2];
if (!filePath) {
  console.error('Excel 파일 경로를 지정해주세요.');
  process.exit(1);
}

uploadStudents(filePath); 