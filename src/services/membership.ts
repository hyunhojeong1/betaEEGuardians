import { httpsCallable } from "firebase/functions";
import { functions } from "@/services/firebase";

export interface GetMembershipResponse {
  success: boolean;
  deliveryFee: number;
  refillTicket: number;
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

export interface UseRefillTicketRequest {
  containerCount: number;
  needsWashing: boolean;
}

export interface UseRefillTicketResponse {
  success: boolean;
  message: string;
  remainingTickets: number;
}

/**
 * 충전권 사용 (Cloud Function 호출)
 */
export async function useRefillTicket(
  data: UseRefillTicketRequest
): Promise<UseRefillTicketResponse> {
  const fn = httpsCallable<UseRefillTicketRequest, UseRefillTicketResponse>(
    functions,
    "useRefillTicket"
  );
  const result = await fn(data);
  return result.data;
}
