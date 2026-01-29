import { httpsCallable } from "firebase/functions";
import { functions } from "@/services/firebase";

interface VerifyCodeResponse {
  success: boolean;
  message: string;
}

export type UserRole = "customer" | "staff";

interface CheckVerificationResponse {
  verified: boolean;
  role?: UserRole;
  verificationCode?: string;
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
 * 사용자 인증 상태, role, verificationCode 조회 (Cloud Function 호출)
 */
export async function checkUserInfo(): Promise<CheckVerificationResponse> {
  const checkVerification = httpsCallable<void, CheckVerificationResponse>(
    functions,
    "checkVerification"
  );

  const result = await checkVerification();
  return result.data;
}
