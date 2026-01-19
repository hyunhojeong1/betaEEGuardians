import { httpsCallable } from "firebase/functions";
import { functions } from "@/services/firebase";
import type {
  StaffTodoData,
  UpdateContainerActualRequest,
  UpdateContainerActualResponse,
} from "@/types/staffTodo";

/**
 * Staff Todo 데이터 조회 (Cloud Function 호출)
 * - Staff 전용: 모든 containerStorage 문서 조회
 * - 요약 정보 포함
 */
export async function getStaffTodoData(): Promise<StaffTodoData> {
  const getStaffTodoDataFn = httpsCallable<void, StaffTodoData>(
    functions,
    "getStaffTodoData"
  );

  const result = await getStaffTodoDataFn();
  return result.data;
}

/**
 * 용기 실제 수량 업데이트 (Cloud Function 호출)
 * - Staff 전용: containerStorage 문서의 actualContainerCount 업데이트
 */
export async function updateContainerActual(
  data: UpdateContainerActualRequest
): Promise<UpdateContainerActualResponse> {
  const updateContainerActualFn = httpsCallable<
    UpdateContainerActualRequest,
    UpdateContainerActualResponse
  >(functions, "updateContainerActual");

  const result = await updateContainerActualFn(data);
  return result.data;
}
