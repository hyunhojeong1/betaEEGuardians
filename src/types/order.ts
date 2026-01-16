import type { Product, TimeSlot } from "./product";

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
  createdAt: string;
}

// 주문 조회 응답
export interface GetOrdersResponse {
  orders: OrderItem[];
  userRole: "customer" | "staff";
}

// 주문 요청 시 프론트에서 보내는 데이터
export interface CreateOrderRequest {
  items: {
    productId: string;
    quantity: number;
  }[];
  deliveryDate: string; // 배송 희망 날짜
  deliveryTimeSlot: TimeSlot; // 배송 희망 시간대
}

// 주문 응답 (Cloud Function에서 반환)
export interface CreateOrderResponse {
  success: boolean;
  message: string;
  orderId?: string;
  totalPrice?: number;
}
