import { httpsCallable } from "firebase/functions";
import { functions } from "@/services/firebase";
import type {
  CreateOrderRequest,
  CreateOrderResponse,
  GetOrdersResponse,
  CancelOrderRequest,
  CancelOrderResponse,
  UpdateOrderStatusRequest,
  UpdateOrderStatusResponse,
} from "@/types/order";

/**
 * 주문 생성 (Cloud Function 호출)
 * - 프론트에서는 productId와 quantity만 전송
 * - 서버에서 products 컬렉션에서 가격 정보를 조회하여 계산
 * - 가격 조작 방지를 위해 서버에서 가격 검증 및 계산
 */
export async function createOrder(
  data: CreateOrderRequest
): Promise<CreateOrderResponse> {
  const createOrderFn = httpsCallable<CreateOrderRequest, CreateOrderResponse>(
    functions,
    "createOrder"
  );

  const result = await createOrderFn(data);
  return result.data;
}

/**
 * 주문 내역 조회 (Cloud Function 호출)
 * - customer: 본인의 주문 내역만 조회
 * - staff: 모든 주문 내역 조회
 */
export async function getOrders(): Promise<GetOrdersResponse> {
  const getOrdersFn = httpsCallable<void, GetOrdersResponse>(
    functions,
    "getOrders"
  );

  const result = await getOrdersFn();
  return result.data;
}

/**
 * 주문 취소 (Cloud Function 호출)
 * - deliverySlotKey로 해당 주문 그룹의 모든 품목 삭제
 * - customer 전용 (staff는 사용 불가)
 */
export async function cancelOrder(
  data: CancelOrderRequest
): Promise<CancelOrderResponse> {
  const cancelOrderFn = httpsCallable<CancelOrderRequest, CancelOrderResponse>(
    functions,
    "cancelOrder"
  );

  const result = await cancelOrderFn(data);
  return result.data;
}

/**
 * 주문 상태 업데이트 (Cloud Function 호출)
 * - Staff 전용: 각 주문 품목의 staffStatusCheck 업데이트
 */
export async function updateOrderStatus(
  data: UpdateOrderStatusRequest
): Promise<UpdateOrderStatusResponse> {
  const updateOrderStatusFn = httpsCallable<
    UpdateOrderStatusRequest,
    UpdateOrderStatusResponse
  >(functions, "updateOrderStatus");

  const result = await updateOrderStatusFn(data);
  return result.data;
}
