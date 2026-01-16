import { httpsCallable } from "firebase/functions";
import { functions } from "@/services/firebase";
import type { TimeSlot } from "@/types/product";

interface TimeSlotData {
  id: string;
  isEnabled: boolean;
}

interface SaveOpenHoursResponse {
  success: boolean;
  message: string;
}

interface GetOpenHoursResponse {
  slots: Record<string, boolean> | null;
}

/**
 * 배송 시간대 저장 (Staff 전용)
 */
export async function saveOpenHours(
  slots: TimeSlot[]
): Promise<SaveOpenHoursResponse> {
  const saveOpenHoursFn = httpsCallable<
    { slots: TimeSlotData[] },
    SaveOpenHoursResponse
  >(functions, "saveOpenHours");

  const slotData: TimeSlotData[] = slots.map((slot) => ({
    id: slot.id,
    isEnabled: slot.isEnabled,
  }));

  const result = await saveOpenHoursFn({ slots: slotData });
  return result.data;
}

/**
 * 배송 시간대 조회
 */
export async function getOpenHours(): Promise<Record<string, boolean> | null> {
  const getOpenHoursFn = httpsCallable<void, GetOpenHoursResponse>(
    functions,
    "getOpenHours"
  );

  const result = await getOpenHoursFn();
  return result.data.slots;
}

/**
 * 현재 시간 기준으로 주문 가능한 최소 시간대 계산
 * (현재 시간 + 2시간 이후의 시간대부터 주문 가능)
 */
function getMinAvailableHour(): number {
  const now = new Date();
  const currentHour = now.getHours();
  // 현재 시간 + 2시간 = 최소 주문 가능 시간대의 시작 시간
  return currentHour + 2;
}

/**
 * 서버에서 받은 slots 데이터를 TimeSlot 배열에 적용
 * - 서버에서 비활성화된 시간대는 비활성화
 * - 현재 시간 + 2시간 이전의 시간대도 비활성화
 */
export function applyOpenHoursToSlots(
  baseSlots: TimeSlot[],
  serverSlots: Record<string, boolean> | null
): TimeSlot[] {
  const minAvailableHour = getMinAvailableHour();

  return baseSlots.map((slot) => {
    // 서버에서 받은 활성화 상태 (없으면 기본값 사용)
    const serverEnabled = serverSlots ? (serverSlots[slot.id] ?? slot.isEnabled) : slot.isEnabled;

    // 현재 시간 + 2시간 이전 시간대는 비활성화
    // slot.startHour가 minAvailableHour보다 작으면 주문 불가
    const isTimeAvailable = slot.startHour >= minAvailableHour;

    return {
      ...slot,
      isEnabled: serverEnabled && isTimeAvailable,
    };
  });
}
