import { useState } from "react";
import type { TimeSlot } from "@/types/product";

// 기본 15개 시간대 생성
export const generateDefaultTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let hour = 8; hour <= 22; hour++) {
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
    });
  }
  return slots;
};

// 일요일 체크
const isSunday = () => new Date().getDay() === 0;

interface TimeSlotSelectorProps {
  timeSlots: TimeSlot[];
  selectedSlotId: string | null;
  isStaff: boolean;
  isSaving?: boolean;
  onSelectSlot: (slotId: string) => void;
  onUpdateSlots?: (slots: TimeSlot[]) => void;
}

export default function TimeSlotSelector({
  timeSlots,
  selectedSlotId,
  isStaff,
  isSaving = false,
  onSelectSlot,
  onUpdateSlots,
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
    // 일요일 체크
    if (isSunday()) {
      alert("죄송합니다. 오늘은 휴무일로 운영하지 않습니다.");
      return;
    }
    onSelectSlot(slotId);
  };

  // 편집 모드
  if (isEditMode) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-700">
            배송 시간대 활성화/비활성화
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {editingSlots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => handleToggleSlot(slot.id)}
              disabled={isSaving}
              className={`px-2 py-2 text-xs rounded-lg border-2 transition-colors ${
                slot.isEnabled
                  ? "bg-blue-100 border-blue-500 text-blue-700"
                  : "bg-gray-100 border-gray-300 text-gray-400 line-through"
              }`}
            >
              {slot.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 선택된 시간대가 있으면 숨김
  if (selectedSlotId) {
    return null;
  }

  // 일반 선택 모드 - 모든 시간대 표시 (비활성화된 것도 포함)
  return (
    <div className="bg-blue-50 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-blue-800">
          먼저 배송 희망 시간대를 선택해주세요.(매주 월~토요일 당일 배송, 일요일
          휴무)
        </p>
        {isStaff && (
          <button
            onClick={handleStartEdit}
            className="px-3 py-1.5 text-xs text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            배송 시간 편집
          </button>
        )}
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {timeSlots.map((slot) => (
          <button
            key={slot.id}
            onClick={() => slot.isEnabled && handleSelectSlot(slot.id)}
            disabled={!slot.isEnabled}
            className={`px-2 py-2 text-xs rounded-lg transition-colors ${
              slot.isEnabled
                ? "bg-white border border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-400"
                : "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed line-through"
            }`}
          >
            {slot.label}
          </button>
        ))}
      </div>
    </div>
  );
}
