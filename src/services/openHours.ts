import { httpsCallable } from "firebase/functions";
import { functions } from "@/services/firebase";
import type { TimeSlot } from "@/types/product";

export type DateType = "today" | "tomorrow";

// 슬롯 정보 (중첩 구조)
export interface SlotInfo {
  isEnabled: boolean;
  comment?: string;
  reservation?: number; // 해당 시간대 예약 건수
}

interface TimeSlotData {
  id: string;
  isEnabled: boolean;
  comment?: string;
}

interface SaveOpenHoursRequest {
  slots: TimeSlotData[];
  dateType: DateType;
}

interface SaveOpenHoursResponse {
  success: boolean;
  message: string;
}

interface GetOpenHoursRequest {
  dateType: DateType;
}

interface GetOpenHoursResponse {
  slots: Record<string, SlotInfo> | null;
}

/**
 * 배송 시간대 저장 (Staff 전용)
 * @param slots 시간대 배열
 * @param dateType 오늘(today) 또는 익일(tomorrow)
 */
export async function saveOpenHours(
  slots: TimeSlot[],
  dateType: DateType
): Promise<SaveOpenHoursResponse> {
  const saveOpenHoursFn = httpsCallable<
    SaveOpenHoursRequest,
    SaveOpenHoursResponse
  >(functions, "saveOpenHours");

  const slotData: TimeSlotData[] = slots.map((slot) => ({
    id: slot.id,
    isEnabled: slot.isEnabled,
    comment: slot.comment || "",
  }));

  const result = await saveOpenHoursFn({ slots: slotData, dateType });
  return result.data;
}

/**
 * 배송 시간대 조회
 * @param dateType 오늘(today) 또는 익일(tomorrow)
 */
export async function getOpenHours(dateType: DateType = "today"): Promise<Record<string, SlotInfo> | null> {
  const getOpenHoursFn = httpsCallable<GetOpenHoursRequest, GetOpenHoursResponse>(
    functions,
    "getOpenHours"
  );

  const result = await getOpenHoursFn({ dateType });
  return result.data.slots;
}

/**
 * 서버에서 받은 slots 데이터를 TimeSlot 배열에 적용
 * - 서버에서 비활성화된 시간대만 비활성화
 * - 코멘트도 함께 적용
 */
export function applyOpenHoursToSlots(
  baseSlots: TimeSlot[],
  serverSlots: Record<string, SlotInfo> | null
): TimeSlot[] {
  return baseSlots.map((slot) => {
    const serverSlot = serverSlots?.[slot.id];

    return {
      ...slot,
      isEnabled: serverSlot?.isEnabled ?? slot.isEnabled,
      comment: serverSlot?.comment || "",
      reservation: serverSlot?.reservation || 0,
    };
  });
}
