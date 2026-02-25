export interface Category1 {
  id: string;
  name: string;
  order: number;
}

export interface Category2 {
  id: string;
  name: string;
  category1Id: string;
  order: number;
}

export interface Product {
  id: string; // (category2Id) + (a-z) + (00-99) 형식
  name: string;
  category1Id: string;
  category2Id: string;
  imageUrl: string;
  pricePerUnit: number; // 단위당 가격
  unit: string; // "100g", "1개" 등 가격 비교용 단위
  supplier: string; // 공급처
  description?: string;
  inStock: boolean;
  isActive: boolean; // 상품 노출 여부
  orderMinQuantity: number; // 최소 주문 수량
  orderUnit: string; // 최소 주문 수량 단위 (kg, g, ml, 팩, 통, 개 등)
  pricePerMinOrder: number; // 최소 주문 수량당 가격 (장바구니 계산용)
  estimatedVolumePerMinUnit: number; // 최소 주문 수량의 추정 부피 (ml)
  packagingIndependenceCode: string; // 포장독립성 코드
  tags: string[]; // 검색 키워드
  specifications?: string; // 제품 사이즈, 향, 맛 등 스펙
  useDetailImageYN: boolean; // 상세 이미지 사용 여부 (기본값 false)
  detail1ImageUrl?: string; // 상세 이미지 1
  detail2ImageUrl?: string; // 상세 이미지 2
  detail3ImageUrl?: string; // 상세 이미지 3
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface TimeSlot {
  id: string;
  label: string; // "10:00 - 11:00"
  startHour: number;
  endHour: number;
  isEnabled: boolean;
  comment?: string; // 시간대별 코멘트 (예: "오전 8시 30분 예약 마감!")
  reservation?: number; // 현 시간대에 걸린 예약 건수
}
