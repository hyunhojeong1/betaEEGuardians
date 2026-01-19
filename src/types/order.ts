import type { Product, TimeSlot } from "./product";

// Staff 상태 체크 타입
export type StaffStatusCheck = "pending" | "fulfilled" | "cancelled";

// 주문 품목 단위 (Firestore orders 컬렉션의 각 문서)
export interface OrderItem {
  id: string; // Firestore 문서 ID
  orderId: string; // 같은 주문의 품목들을 그룹화하기 위한 ID
  product: Product; // 상품 정보 전체 (공급처, 유통기한 등 포함)
  quantity: number; // 주문 수량
  itemPrice: number; // 해당 품목의 계산 가격 (서버에서 계산)
  totalOrderPrice: number; // 주문 전체 가격 (서버에서 계산)
  ordererCode: string; // 주문자 (테스터 코드)
  orderDate: string; // 주문 날짜 (YYYY-MM-DD)
  deliveryTimeSlot: TimeSlot; // 배송 희망 시간대
  deliverySlotKey: string; // 주문 묶음용 키 (orderDate_timeSlotId)
  staffStatusCheck: StaffStatusCheck; // 직원 상태 체크 (미진행/이행/취소)
  createdAt: string;
}

// 주문 조회 응답
export interface GetOrdersResponse {
  orders: OrderItem[];
  userRole: "customer" | "staff";
}

// 개인 다회용기 정보
export interface ContainerInfo {
  containerCount: number; // 용기 수량
  needsWashing: boolean; // 세척 필요 여부 (true: 세척 후 사용, false: 세척 불필요)
}

// 주문 요청 시 프론트에서 보내는 데이터
export interface CreateOrderRequest {
  items: {
    productId: string;
    quantity: number;
  }[];
  deliveryDate: string; // 배송 희망 날짜
  deliveryTimeSlot: TimeSlot; // 배송 희망 시간대
  containerInfo?: ContainerInfo; // 개인 다회용기 정보 (선택)
}

// 주문 응답 (Cloud Function에서 반환)
export interface CreateOrderResponse {
  success: boolean;
  message: string;
  orderId?: string;
  totalPrice?: number;
}

// 주문 취소 요청
export interface CancelOrderRequest {
  deliverySlotKey: string;
}

// 주문 취소 응답
export interface CancelOrderResponse {
  success: boolean;
  message: string;
  deletedCount: number;
}

// Staff 상태 업데이트 요청
export interface UpdateOrderStatusRequest {
  orderId: string; // Firestore 문서 ID
  staffStatusCheck: StaffStatusCheck;
}

// Staff 상태 업데이트 응답
export interface UpdateOrderStatusResponse {
  success: boolean;
  message: string;
}
