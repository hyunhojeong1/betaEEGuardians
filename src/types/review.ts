// 리뷰 생성 요청
export interface CreateReviewRequest {
  deliverySlotKey: string; // 주문 묶음 키
  orderDate: string; // 주문 날짜 (YYYY-MM-DD)
  deliveryTimeSlotLabel: string; // 배송 시간대 라벨
  rating: number; // 별점 (1-5)
  content: string; // 리뷰 내용
}

// 리뷰 생성 응답
export interface CreateReviewResponse {
  success: boolean;
  message: string;
  reviewId?: string;
}

// 리뷰 문서 타입
export interface Review {
  id: string;
  ordererCode: string; // 베타테스터 코드
  deliverySlotKey: string;
  orderDate: string;
  deliveryTimeSlotLabel: string;
  rating: number;
  content: string;
  createdAt: string;
}

// 리뷰 목록 조회 응답
export interface GetReviewsResponse {
  success: boolean;
  reviews: Review[];
}
