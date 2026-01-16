import { httpsCallable } from "firebase/functions";
import { functions } from "@/services/firebase";

interface SaveNoticeResponse {
  success: boolean;
  message: string;
}

interface GetNoticeResponse {
  comment: string;
}

/**
 * 공지사항 저장 (Staff 전용)
 */
export async function saveNotice(comment: string): Promise<SaveNoticeResponse> {
  const saveNoticeFn = httpsCallable<{ comment: string }, SaveNoticeResponse>(
    functions,
    "saveNotice"
  );
  const result = await saveNoticeFn({ comment });
  return result.data;
}

/**
 * 공지사항 조회
 */
export async function getNotice(): Promise<string> {
  const getNoticeFn = httpsCallable<void, GetNoticeResponse>(
    functions,
    "getNotice"
  );
  const result = await getNoticeFn();
  return result.data.comment;
}
