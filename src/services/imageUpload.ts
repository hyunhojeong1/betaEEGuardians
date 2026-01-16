import { httpsCallable } from "firebase/functions";
import { functions } from "@/services/firebase";

interface UploadImageRequest {
  productId: string;
  imageBase64: string;
  mimeType: string;
}

interface UploadImageResponse {
  success: boolean;
  message: string;
  imageUrl: string;
}

/**
 * 파일을 Base64로 변환
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // "data:image/jpeg;base64," 부분 제거하고 순수 base64만 반환
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("파일을 읽을 수 없습니다."));
    reader.readAsDataURL(file);
  });
}

/**
 * 이미지 파일 유효성 검사
 */
export function validateImageFile(file: File): string | null {
  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  if (!validTypes.includes(file.type)) {
    return "JPG, PNG, WebP, GIF 형식의 이미지만 업로드할 수 있습니다.";
  }

  // 원본 파일 크기 제한 (10MB)
  if (file.size > 10 * 1024 * 1024) {
    return "이미지 파일 크기는 10MB 이하여야 합니다.";
  }

  return null;
}

/**
 * Cloud Function을 통해 이미지 업로드
 * - Staff 권한 확인
 * - Sharp로 50KB 이하로 리사이징
 * - Firebase Storage에 저장
 */
export async function uploadProductImage(
  file: File,
  productId: string
): Promise<string> {
  // 파일을 Base64로 변환
  const imageBase64 = await fileToBase64(file);

  // Cloud Function 호출
  const uploadFn = httpsCallable<UploadImageRequest, UploadImageResponse>(
    functions,
    "uploadProductImage"
  );

  const result = await uploadFn({
    productId,
    imageBase64,
    mimeType: file.type,
  });

  if (!result.data.success) {
    throw new Error(result.data.message);
  }

  return result.data.imageUrl;
}
