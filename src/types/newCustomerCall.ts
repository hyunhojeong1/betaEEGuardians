// 신규 고객 호출 신청 타입

export interface NewCustomerCall {
  id: string;
  betaTesterCode: string; // 베타테스터 코드
  containerCount: number; // 용기 개수
  needsWashing: boolean; // 세척 필요 여부
  requestDate: string; // 신청 날짜 (ISO string)
  staffComment: string | null; // 직원 코멘트
  createdAt: string;
}

export interface CreateNewCustomerCallRequest {
  containerCount: number;
  needsWashing: boolean;
}

export interface CreateNewCustomerCallResponse {
  success: boolean;
  message: string;
  callId?: string;
}
