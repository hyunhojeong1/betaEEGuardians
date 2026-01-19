import type { TimeSlot } from "@/types/product";

/**
 * 시간대 만료 여부 확인
 * 2시간 제약 제거됨 - 항상 false 반환 (만료되지 않음)
 */
export function isTimeSlotExpired(_slot: TimeSlot): boolean {
  // 2시간 제약 제거: 시간대는 더 이상 자동으로 만료되지 않음
  return false;
}

/**
 * 배송 시간대 만료 시 표시할 알림 메시지 (현재 사용되지 않음)
 */
export const TIME_SLOT_EXPIRED_MESSAGE =
  "죄송합니다. 선택하신 배송 시간대로는 더 이상 주문이 어렵습니다. 다른 시간대를 선택해주세요.";
