import { httpsCallable } from "firebase/functions";
import { functions } from "@/services/firebase";
import type { CreateReviewRequest, CreateReviewResponse, GetReviewsResponse } from "@/types/review";

/**
 * 리뷰 생성 (Cloud Function 호출)
 */
export async function createReview(
  request: CreateReviewRequest
): Promise<CreateReviewResponse> {
  const createReviewFn = httpsCallable<CreateReviewRequest, CreateReviewResponse>(
    functions,
    "createReview"
  );

  const result = await createReviewFn(request);
  return result.data;
}

/**
 * 리뷰 목록 조회 (Cloud Function 호출)
 * - Customer: 본인 리뷰만 조회
 * - Staff: 모든 리뷰 조회
 */
export async function getReviews(): Promise<GetReviewsResponse> {
  const getReviewsFn = httpsCallable<void, GetReviewsResponse>(
    functions,
    "getReviews"
  );

  const result = await getReviewsFn();
  return result.data;
}
