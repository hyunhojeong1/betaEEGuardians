import type { TimeSlot } from "@/types/product";

/**
 * 시간대의 종료 시간이 현재 시간 기준 2시간 이내인지 확인
 * 예: 현재 15:20이면 end 시간이 17:20 이내인 슬롯은 불가
 * - 16:00~17:00 → 불가 (end 17:00 < 17:20)
 * - 17:00~18:00 → 가능 (end 18:00 > 17:20)
 */
export function isTimeSlotExpired(slot: TimeSlot): boolean {
  const now = new Date();
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

  // 슬롯 종료 시간 파싱 (예: "15:00 ~ 16:00" → 16시)
  const endPart = slot.label.split("~")[1]?.trim();
  if (!endPart) return false;

  const [endHourStr] = endPart.split(":");
  const slotEndHour = parseInt(endHourStr, 10);
  const slotEndTotalMinutes = slotEndHour * 60;

  // 슬롯 종료 시간 - 현재 시간 < 120분(2시간)이면 배송 불가
  return slotEndTotalMinutes - currentTotalMinutes < 120;
}

/**
 * 배송 시간대 만료 시 표시할 알림 메시지
 */
export const TIME_SLOT_EXPIRED_MESSAGE =
  "죄송합니다. 배송 준비 시간을 감안할 때, 선택하신 배송 시간대로는 더 이상 주문이 어렵습니다. 다른 시간대를 선택해주세요.";
