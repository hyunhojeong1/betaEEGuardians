import type { TimeSlot } from "./product";

// containerStorage 문서 타입 (고객 신청 기반)
export interface ContainerStorageItem {
  id: string; // Firestore 문서 ID
  ordererCode: string; // 베타테스터 코드
  orderDate: string; // 주문 날짜 (YYYY-MM-DD)
  deliveryTimeSlot: TimeSlot; // 배송 시간대
  deliverySlotKey: string; // 주문 묶음 키
  requestedContainerCount: number; // 신청 용기 수량 (유저 기입)
  needsWashing: boolean; // 세척 필요 여부
  actualContainerCount: number | null; // 실제 용기 수량 (직원 기입) - 반입용
  isIncoming: boolean; // 반입 여부 (true: 반입, false: 반출)
  staffComment: string | null; // 직원 코멘트
  createdAt: string;
  // 연결된 반출 문서 정보 (직원이 입력)
  outgoingContainerId?: string | null; // 반출 문서 ID
  outgoingContainerCount?: number | null; // 반출 용기 수량
}

// Staff Todo 요약 데이터
export interface StaffTodoSummary {
  totalRequested: number; // 총 신청 용기 수
  totalIncoming: number; // 총 반입 용기 수
  totalOutgoing: number; // 총 반출 용기 수
  pendingCount: number; // 미처리 건수
  totalBalance: number; // 보관중 용기 총합 (반입 - 반출)
}

// Staff Todo 전체 데이터
export interface StaffTodoData {
  containerItems: ContainerStorageItem[];
  summary: StaffTodoSummary;
}

// 용기 실제 수량 업데이트 요청 (반입/반출 각각)
export interface UpdateContainerActualRequest {
  containerId: string; // 원본 신청 문서 ID
  incomingCount: number | null; // 실제 반입(신규) 용기 수량
  outgoingCount: number | null; // 실제 반출(포장) 용기 수량
  staffComment?: string;
}

// 용기 실제 수량 업데이트 응답
export interface UpdateContainerActualResponse {
  success: boolean;
  message: string;
  outgoingContainerId?: string; // 생성된 반출 문서 ID
}
