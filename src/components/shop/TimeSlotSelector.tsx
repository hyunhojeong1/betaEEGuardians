import { useState } from "react";
import type { TimeSlot } from "@/types/product";

// 12개 시간대 생성 (10:00 ~ 22:00, 08-09, 09-10, 22-23 제외)
export const generateDefaultTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let hour = 10; hour <= 21; hour++) {
    const startHour = hour;
    const endHour = hour + 1;
    slots.push({
      id: `slot-${startHour}`,
      label: `${startHour.toString().padStart(2, "0")}:00 - ${endHour
        .toString()
        .padStart(2, "0")}:00`,
      startHour,
      endHour,
      isEnabled: true,
      comment: "",
      reservation: 0,
    });
  }
  return slots;
};

interface TimeSlotSelectorProps {
  timeSlots: TimeSlot[];
  selectedSlotId: string | null;
  isStaff: boolean;
  isSaving?: boolean;
  onSelectSlot: (slotId: string) => void;
  onUpdateSlots?: (slots: TimeSlot[]) => void;
  // 날짜 관련 props
  selectedDate: Date;
  selectedDateOffset: number;
  onDateOffsetChange: (offset: number) => void;
  formatDate: (date: Date) => string;
  getDayOfWeek: (date: Date) => string;
}

export default function TimeSlotSelector({
  timeSlots,
  selectedSlotId,
  isStaff,
  isSaving = false,
  onSelectSlot,
  onUpdateSlots,
  selectedDate,
  selectedDateOffset,
  onDateOffsetChange,
  formatDate,
  getDayOfWeek,
}: TimeSlotSelectorProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSlots, setEditingSlots] = useState<TimeSlot[]>(timeSlots);

  const handleToggleSlot = (slotId: string) => {
    setEditingSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId ? { ...slot, isEnabled: !slot.isEnabled } : slot
      )
    );
  };

  const handleCommentChange = (slotId: string, comment: string) => {
    setEditingSlots((prev) =>
      prev.map((slot) => (slot.id === slotId ? { ...slot, comment } : slot))
    );
  };

  const handleSave = () => {
    onUpdateSlots?.(editingSlots);
    setIsEditMode(false);
  };

  const handleCancel = () => {
    setEditingSlots(timeSlots);
    setIsEditMode(false);
  };

  const handleStartEdit = () => {
    setEditingSlots(timeSlots);
    setIsEditMode(true);
  };

  const handleSelectSlot = (slotId: string) => {
    onSelectSlot(slotId);
  };

  // 편집 모드
  if (isEditMode) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        {/* 날짜 선택 */}
        <div className="mb-4 pb-4 border-b border-gray-200">
          <p className="text-center text-base sm:text-sm text-gray-500 mb-3">
            오늘 또는 내일 날짜로 배송 예약이 가능합니다! (월~토 배송, 일요일
            휴무)
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => onDateOffsetChange(0)}
              disabled={selectedDateOffset === 0}
              className="w-11 h-11 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed text-lg sm:text-base"
            >
              &lt;
            </button>
            <div className="text-center min-w-[180px]">
              <p className="text-xl sm:text-lg font-semibold text-gray-900">
                {formatDate(selectedDate)} ({getDayOfWeek(selectedDate)})
              </p>
              <p className="text-base sm:text-sm text-gray-500">
                {selectedDateOffset === 0 ? "오늘" : "익일"}
              </p>
            </div>
            <button
              onClick={() => onDateOffsetChange(1)}
              disabled={selectedDateOffset === 1}
              className="w-11 h-11 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed text-lg sm:text-base"
            >
              &gt;
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <p className="text-base sm:text-sm font-medium text-gray-700">배송 시간대 편집</p>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-4 sm:px-3 py-2 sm:py-1.5 text-base sm:text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 sm:px-3 py-2 sm:py-1.5 text-base sm:text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>

        {/* 반응형 그리드 편집 모드: 모바일 2열, 태블릿 이상 3열 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          {editingSlots.map((slot) => (
            <div key={slot.id} className="relative">
              {/* 시간대 버튼 */}
              <button
                onClick={() => handleToggleSlot(slot.id)}
                disabled={isSaving}
                className={`w-full px-2 py-3 sm:py-2.5 text-base sm:text-sm font-medium rounded-t-lg border-2 border-b-0 transition-colors ${
                  slot.isEnabled
                    ? "bg-blue-100 border-blue-500 text-blue-700"
                    : "bg-gray-100 border-gray-300 text-gray-400 line-through"
                }`}
              >
                {slot.label}
                {(slot.reservation ?? 0) > 0 && (
                  <span className="ml-1 text-sm sm:text-xs text-orange-600">
                    ({slot.reservation}건)
                  </span>
                )}
              </button>

              {/* 코멘트 입력 영역 */}
              <div
                className={`border-2 border-t-0 rounded-b-lg p-1.5 ${
                  slot.isEnabled
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 bg-gray-50"
                }`}
              >
                <input
                  type="text"
                  value={slot.comment || ""}
                  onChange={(e) => handleCommentChange(slot.id, e.target.value)}
                  placeholder="코멘트 입력..."
                  className="w-full px-2 py-1.5 sm:py-1 text-sm sm:text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                  disabled={isSaving}
                />
              </div>
            </div>
          ))}
        </div>

        <p className="text-sm sm:text-xs text-gray-500 mt-3">
          클릭하면 활성화/비활성화, 아래 입력란에 코멘트를 작성할 수 있습니다.
        </p>
      </div>
    );
  }

  // 선택된 시간대가 있으면 전체 구역 숨김
  if (selectedSlotId) {
    return null;
  }

  // 일반 선택 모드 - 날짜 + 시간대 통합
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
      {/* 날짜 선택 */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <p className="text-center text-base sm:text-sm text-gray-500 mb-3">
          오늘 또는 내일 날짜로 배송 예약이 가능합니다! (월~토 배송, 일요일
          휴무)
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => onDateOffsetChange(0)}
            disabled={selectedDateOffset === 0}
            className="w-11 h-11 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed text-lg sm:text-base"
          >
            &lt;
          </button>
          <div className="text-center min-w-[180px]">
            <p className="text-xl sm:text-lg font-semibold text-gray-900">
              {formatDate(selectedDate)} ({getDayOfWeek(selectedDate)})
            </p>
            <p className="text-base sm:text-sm text-gray-500">
              {selectedDateOffset === 0 ? "오늘" : "익일"}
            </p>
          </div>
          <button
            onClick={() => onDateOffsetChange(1)}
            disabled={selectedDateOffset === 1}
            className="w-11 h-11 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed text-lg sm:text-base"
          >
            &gt;
          </button>
        </div>
      </div>

      {/* 시간대 선택 */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-base sm:text-sm font-medium text-blue-800">
          먼저 배송 희망 시간대를 선택해주세요
        </p>

        {isStaff && (
          <button
            onClick={handleStartEdit}
            className="px-4 sm:px-3 py-2 sm:py-1.5 text-sm sm:text-xs text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            편집
          </button>
        )}
      </div>

      {/* 반응형 그리드 선택 모드: 모바일 2열, 태블릿 이상 3열 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
        {timeSlots.map((slot) => (
          <button
            key={slot.id}
            onClick={() => slot.isEnabled && handleSelectSlot(slot.id)}
            disabled={!slot.isEnabled}
            className={`rounded-lg overflow-hidden border-2 transition-colors ${
              slot.isEnabled
                ? "border-blue-200 hover:border-blue-400 bg-white"
                : "border-gray-200 bg-gray-100 cursor-not-allowed"
            }`}
          >
            {/* 시간대 */}
            <div
              className={`px-2 py-3 sm:py-2.5 text-base sm:text-sm font-medium ${
                slot.isEnabled ? "text-blue-700" : "text-gray-400 line-through"
              }`}
            >
              {slot.label}
              {isStaff && (slot.reservation ?? 0) > 0 && (
                <span className="ml-1 text-sm sm:text-xs text-orange-600">
                  ({slot.reservation}건)
                </span>
              )}
            </div>

            {/* 코멘트 (있을 경우에만 표시) */}
            {slot.comment && (
              <div
                className={`w-full px-2 py-2 sm:py-1.5 text-sm sm:text-xs border-t ${
                  slot.isEnabled
                    ? "text-gray-600 bg-gray-50 border-gray-200"
                    : "text-gray-400 bg-gray-100 border-gray-200"
                }`}
              >
                {slot.comment}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
