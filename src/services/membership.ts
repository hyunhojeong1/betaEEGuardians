import { httpsCallable } from "firebase/functions";
import { functions } from "@/services/firebase";

export interface GetMembershipResponse {
  success: boolean;
  deliveryFee: number;
  collectionTicket: number;
}

/**
 * 멤버십 정보 조회 (Cloud Function 호출)
 */
export async function getMembership(): Promise<GetMembershipResponse> {
  const fn = httpsCallable<void, GetMembershipResponse>(
    functions,
    "getMembership"
  );
  const result = await fn();
  return result.data;
}
