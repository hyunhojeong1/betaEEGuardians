import { httpsCallable } from "firebase/functions";
import { functions } from "@/services/firebase";

// 용기 잔액 조회 응답
export interface GetContainerBalanceResponse {
  success: boolean;
  balance: number; // 지환수가 보관중인 용기 수량 (반입 - 반출)
  message?: string;
}

/**
 * 용기 잔액 조회 (Cloud Function 호출)
 * - 해당 유저의 containerStorage 문서들을 조회
 * - isIncoming이 true면 actualContainerCount를 더하고, false면 빼서 총합 반환
 */
export async function getContainerBalance(): Promise<GetContainerBalanceResponse> {
  const getContainerBalanceFn = httpsCallable<void, GetContainerBalanceResponse>(
    functions,
    "getContainerBalance"
  );

  const result = await getContainerBalanceFn();
  return result.data;
}

// 고객별 용기 잔액
export interface CustomerContainerBalance {
  ordererCode: string;
  balance: number; // 보관중 용기 수량 (반입 - 반출)
}

// 모든 고객 용기 잔액 조회 응답 (Staff 전용)
export interface GetAllContainerBalancesResponse {
  success: boolean;
  balances: CustomerContainerBalance[];
  totalBalance: number; // 전체 보관중 용기 합계
}

/**
 * 모든 고객 용기 잔액 조회 (Staff 전용)
 * - 모든 고객의 containerStorage 문서를 ordererCode별로 그룹화
 * - 각 고객별 반입/반출 합계 계산
 */
export async function getAllContainerBalances(): Promise<GetAllContainerBalancesResponse> {
  const getAllContainerBalancesFn = httpsCallable<
    void,
    GetAllContainerBalancesResponse
  >(functions, "getAllContainerBalances");

  const result = await getAllContainerBalancesFn();
  return result.data;
}
