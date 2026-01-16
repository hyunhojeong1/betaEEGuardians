import { httpsCallable } from "firebase/functions";
import { functions } from "@/services/firebase";

interface SubmitUserRequestResponse {
  success: boolean;
  message: string;
}

/**
 * 사용자 입점 요청 제출
 */
export async function submitUserRequest(
  content: string
): Promise<SubmitUserRequestResponse> {
  const submitUserRequestFn = httpsCallable<
    { content: string },
    SubmitUserRequestResponse
  >(functions, "submitUserRequest");

  const result = await submitUserRequestFn({ content });
  return result.data;
}
