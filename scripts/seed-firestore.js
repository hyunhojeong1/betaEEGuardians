/**
 * Firestore CSV Seed Script (Product 전용)
 *
 * 사용법:
 * 1. npm install csv-parser firebase-admin (scripts 폴더에서)
 * 2. Firebase Console > 프로젝트 설정 > 서비스 계정 > 새 비공개 키 생성
 * 3. 다운로드된 JSON 파일을 scripts/serviceAccountKey.json 으로 저장
 * 4. CSV 파일을 scripts/ 폴더에 저장
 * 5. 아래 설정 수정 후 실행: node scripts/seed-firestore.js
 */

const admin = require("firebase-admin");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");

// ============ 설정 ============
const CSV_FILE = "data.csv"; // CSV 파일명 (scripts 폴더 내)
const COLLECTION_NAME = "products"; // Firestore 컬렉션명
const USE_CUSTOM_ID = true; // true면 ID_COLUMN 값을 문서 ID로 사용
const ID_COLUMN = "id"; // 문서 ID로 사용할 CSV 컬럼명
// ==============================

// Product 스키마 정의 (타입 변환용)
const PRODUCT_SCHEMA = {
  // 숫자 필드
  numberFields: [
    "pricePerUnit",
    "orderMinQuantity",
    "pricePerMinOrder",
    "estimatedVolumePerMinUnit",
  ],
  // 불리언 필드
  booleanFields: ["inStock", "isActive"],
  // 배열 필드 (CSV에서 세미콜론 또는 파이프로 구분)
  arrayFields: ["tags"],
  // 문자열 필드 (나머지)
  stringFields: [
    "id",
    "name",
    "category1Id",
    "category2Id",
    "imageUrl",
    "unit",
    "supplier",
    "description",
    "orderUnit",
    "packagingIndependenceCode",
    "specifications",
    "consumptionDeadline",
    "expiryDate",
  ],
};

// 서비스 계정 키 로드
const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");
if (!fs.existsSync(serviceAccountPath)) {
  console.error("❌ serviceAccountKey.json 파일이 없습니다.");
  console.error("Firebase Console에서 서비스 계정 키를 다운로드하세요.");
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

// Firebase Admin 초기화
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Product 타입에 맞게 행 데이터 변환
function convertProductRow(row) {
  const converted = {};

  for (const [key, value] of Object.entries(row)) {
    // 숫자 필드
    if (PRODUCT_SCHEMA.numberFields.includes(key)) {
      converted[key] = value === "" || value === null ? 0 : Number(value);
    }
    // 불리언 필드
    else if (PRODUCT_SCHEMA.booleanFields.includes(key)) {
      converted[key] = value === "TRUE" || value === true || value === "1";
    }
    // 배열 필드 (세미콜론 또는 파이프로 구분)
    else if (PRODUCT_SCHEMA.arrayFields.includes(key)) {
      if (!value || value === "") {
        converted[key] = [];
      } else {
        // 세미콜론, 파이프, 또는 쉼표로 구분된 값을 배열로 변환
        converted[key] = String(value)
          .split(/[;|,]/)
          .map((v) => v.trim())
          .filter((v) => v !== "");
      }
    }
    // 문자열 필드 (null/undefined → 빈 문자열 또는 생략)
    else {
      converted[key] =
        value === null || value === undefined ? "" : String(value);
    }
  }

  return converted;
}

// 메인 함수
async function seedFirestore() {
  const csvPath = path.join(__dirname, CSV_FILE);

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV 파일을 찾을 수 없습니다: ${csvPath}`);
    process.exit(1);
  }

  console.log(`📄 CSV 파일 로드: ${CSV_FILE}`);

  const rows = [];

  // CSV 파싱
  await new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on("data", (row) => {
        rows.push(convertProductRow(row));
      })
      .on("end", resolve)
      .on("error", reject);
  });

  if (rows.length === 0) {
    console.error("❌ CSV 파일에 데이터가 없습니다.");
    process.exit(1);
  }

  const headers = Object.keys(rows[0]);
  console.log(`📋 컬럼: ${headers.join(", ")}`);
  console.log(`📊 총 ${rows.length}개 데이터`);
  console.log(`🎯 컬렉션: ${COLLECTION_NAME}`);
  console.log("");

  // 첫 번째 데이터 미리보기
  console.log("📝 첫 번째 데이터 미리보기:");
  console.log(JSON.stringify(rows[0], null, 2));
  console.log("");

  let batch = db.batch();
  let count = 0;
  let batchCount = 0;

  for (const row of rows) {
    let docRef;

    if (USE_CUSTOM_ID && row[ID_COLUMN]) {
      // 지정된 컬럼 값을 문서 ID로 사용
      const docId = String(row[ID_COLUMN]);
      docRef = db.collection(COLLECTION_NAME).doc(docId);
    } else {
      // 자동 생성 ID 사용
      docRef = db.collection(COLLECTION_NAME).doc();
    }

    batch.set(docRef, {
      ...row,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    count++;
    batchCount++;

    // Firestore batch는 최대 500개까지
    if (batchCount === 500) {
      await batch.commit();
      console.log(`✅ ${count}개 저장 완료`);
      batch = db.batch();
      batchCount = 0;
    }
  }

  // 남은 데이터 저장
  if (batchCount > 0) {
    await batch.commit();
  }

  console.log("");
  console.log(
    `🎉 완료! 총 ${count}개 문서가 '${COLLECTION_NAME}' 컬렉션에 저장되었습니다.`,
  );
  process.exit(0);
}

seedFirestore().catch((error) => {
  console.error("❌ 오류 발생:", error);
  process.exit(1);
});
