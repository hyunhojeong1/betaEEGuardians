import { httpsCallable } from "firebase/functions";
import { functions } from "@/services/firebase";
import type {
  CreateNewCustomerCallRequest,
  CreateNewCustomerCallResponse,
} from "@/types/newCustomerCall";

/**
 * 신규 고객 호출 신청 (Cloud Function 호출)
 * - 최초 다회용기 충전을 위해 직원을 호출하는 기능
 */
export async function createNewCustomerCall(
  request: CreateNewCustomerCallRequest
): Promise<CreateNewCustomerCallResponse> {
  const createNewCustomerCallFn = httpsCallable<
    CreateNewCustomerCallRequest,
    CreateNewCustomerCallResponse
  >(functions, "createNewCustomerCall");

  const result = await createNewCustomerCallFn(request);
  return result.data;
}
