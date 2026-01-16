import { httpsCallable } from "firebase/functions";
import { functions } from "@/services/firebase";

interface VerifyCodeResponse {
  success: boolean;
  message: string;
}

interface CheckVerificationResponse {
  verified: boolean;
}

/**
 * 베타 테스터 인증 코드 검증 및 사용자 등록 (Cloud Function 호출)
 */
export async function verifyAndCreateUser(
  code: string
): Promise<VerifyCodeResponse> {
  const verifyBetaCode = httpsCallable<{ code: string }, VerifyCodeResponse>(
    functions,
    "verifyBetaCode"
  );

  const result = await verifyBetaCode({ code });
  return result.data;
}

/**
 * 사용자 인증 상태 확인 (Cloud Function 호출)
 */
export async function checkUserVerified(): Promise<boolean> {
  const checkVerification = httpsCallable<void, CheckVerificationResponse>(
    functions,
    "checkVerification"
  );

  const result = await checkVerification();
  return result.data.verified;
}
