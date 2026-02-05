import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/stores/cartStore";
import { useUserStore } from "@/stores/userStore";
import CartItemCard from "@/components/cart/CartItemCard";
import TimeSlotSelector, {
  generateDefaultTimeSlots,
} from "@/components/shop/TimeSlotSelector";
import {
  isTimeSlotExpired,
  TIME_SLOT_EXPIRED_MESSAGE,
} from "@/utils/timeSlotValidation";
import {
  saveOpenHours,
  getOpenHours,
  applyOpenHoursToSlots,
  type DateType,
} from "@/services/openHours";
import { createOrder } from "@/services/order";
import { getContainerBalance } from "@/services/container";
import { getMembership } from "@/services/membership";

// 한국 시간 기준 날짜 유틸리티
function getKoreaDate(offset = 0): Date {
  const now = new Date();
  const koreaTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  koreaTime.setDate(koreaTime.getDate() + offset);
  return koreaTime;
}

function formatKoreaDate(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(
    2,
    "0",
  )}`;
}

function getDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

function getDayOfWeek(date: Date): string {
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return days[date.getUTCDay()];
}

// 선택한 날짜가 일요일인지 체크
function isSundayDate(date: Date): boolean {
  return date.getUTCDay() === 0;
}

// 기본 시간대 데이터
const defaultTimeSlots = generateDefaultTimeSlots();

export default function CartPage() {
  const navigate = useNavigate();
  const { role } = useUserStore();
  const isStaff = role === "staff";

  const [isOrdering, setIsOrdering] = useState(false);
  const [containerCount, setContainerCount] = useState(0);
  const [needsWashing, setNeedsWashing] = useState(true); // 기본값: 세척 후 사용

  // 용기 보관 현황 (customer만)
  const [containerBalance, setContainerBalance] = useState<number | null>(null);

  // 멤버십 정보 (배송비)
  const [deliveryFee, setDeliveryFee] = useState(0);

  // 시간대 선택 관련 state
  const [timeSlots, setTimeSlots] = useState(defaultTimeSlots);
  const [selectedDateOffset, setSelectedDateOffset] = useState(0);
  const [isSavingOpenHours, setIsSavingOpenHours] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(true); // 시간대 로딩 상태

  const selectedDate = getKoreaDate(selectedDateOffset);
  const selectedDateStr = getDateString(selectedDate);
  const currentDateType: DateType =
    selectedDateOffset === 0 ? "today" : "tomorrow";

  const {
    items,
    selectedTimeSlot: cartTimeSlot,
    orderDate,
    updateQuantity,
    removeItem,
    clearCart,
    setTimeSlot,
    getTotalPrice,
  } = useCartStore();

  // cartStore에서 저장된 시간대를 초기값으로 사용
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<string | null>(
    cartTimeSlot?.id || null,
  );

  // 페이지 진입 시 용기 잔액 및 멤버십 조회 (customer만)
  useEffect(() => {
    if (role === "customer") {
      getContainerBalance()
        .then((response) => {
          if (response.success) {
            setContainerBalance(response.balance);
          }
        })
        .catch((err) => {
          console.error("용기 잔액 조회 오류:", err);
        });

      getMembership()
        .then((response) => {
          if (response.success) {
            setDeliveryFee(response.deliveryFee);
          }
        })
        .catch((err) => {
          console.error("멤버십 조회 오류:", err);
        });
    }
  }, [role]);

  // 페이지 진입 시 저장된 시간대 만료 체크 및 날짜 offset 동기화
  useEffect(() => {
    if (cartTimeSlot && isTimeSlotExpired(cartTimeSlot)) {
      alert(TIME_SLOT_EXPIRED_MESSAGE);
      setSelectedTimeSlotId(null);
      setTimeSlot(null);
    } else if (cartTimeSlot && orderDate) {
      // 저장된 orderDate와 현재 날짜를 비교해서 offset 설정
      const todayStr = getDateString(getKoreaDate(0));
      const tomorrowStr = getDateString(getKoreaDate(1));

      if (orderDate === todayStr) {
        setSelectedDateOffset(0);
      } else if (orderDate === tomorrowStr) {
        setSelectedDateOffset(1);
      }
      setSelectedTimeSlotId(cartTimeSlot.id);
    }
    setIsInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 최초 마운트 시에만 실행

  // 날짜 변경 시 openHours 다시 불러오기
  useEffect(() => {
    async function fetchOpenHoursForDate() {
      setIsLoadingSlots(true);
      try {
        // 선택한 날짜가 일요일인지 체크
        const dateToCheck = getKoreaDate(selectedDateOffset);
        if (isSundayDate(dateToCheck)) {
          const sundaySlots = defaultTimeSlots.map((slot) => ({
            ...slot,
            isEnabled: false,
            comment: "휴무일입니다.",
            reservation: 0,
          }));
          setTimeSlots(sundaySlots);
          // 초기화 이후에만 시간대 선택 초기화
          if (isInitialized) {
            setSelectedTimeSlotId(null);
            setTimeSlot(null);
          }
          return;
        }

        const serverSlots = await getOpenHours(currentDateType);
        const updatedSlots = applyOpenHoursToSlots(
          defaultTimeSlots,
          serverSlots,
        );
        setTimeSlots(updatedSlots);

        // 초기화 이후 사용자가 날짜를 변경한 경우에만 시간대 선택 초기화
        // (저장된 시간대가 있고 해당 날짜와 일치하면 유지)
        if (isInitialized && orderDate !== selectedDateStr) {
          setSelectedTimeSlotId(null);
          setTimeSlot(null);
        }
      } catch (error) {
        console.error("Failed to fetch open hours:", error);
      } finally {
        setIsLoadingSlots(false);
      }
    }

    fetchOpenHoursForDate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDateType, selectedDateOffset, isInitialized]);

  // 시간대 선택 핸들러 (장바구니에도 저장, 날짜 포함)
  const handleSelectTimeSlot = (slotId: string | null) => {
    if (slotId) {
      const slot = timeSlots.find((s) => s.id === slotId);
      if (slot && isTimeSlotExpired(slot)) {
        alert(TIME_SLOT_EXPIRED_MESSAGE);
        setSelectedTimeSlotId(null);
        setTimeSlot(null);
        return;
      }
      setSelectedTimeSlotId(slotId);
      // 선택한 날짜와 함께 시간대 저장
      setTimeSlot(slot || null, selectedDateStr);
    } else {
      setSelectedTimeSlotId(null);
      setTimeSlot(null);
    }
  };

  // 시간대 업데이트 핸들러 (Staff 전용)
  const handleUpdateTimeSlots = async (updatedSlots: typeof timeSlots) => {
    setIsSavingOpenHours(true);
    try {
      await saveOpenHours(updatedSlots, currentDateType);
      setTimeSlots(updatedSlots);
      alert(
        `${
          selectedDateOffset === 0 ? "오늘" : "익일"
        } 배송 시간대가 저장되었습니다.`,
      );
    } catch (error) {
      console.error("Failed to save open hours:", error);
      alert("배송 시간대 저장에 실패했습니다.");
    } finally {
      setIsSavingOpenHours(false);
    }
  };

  // 시간대 선택 해제 핸들러
  const handleClearTimeSlot = () => {
    setSelectedTimeSlotId(null);
    setTimeSlot(null);
  };

  // 현재 선택된 시간대 정보
  const selectedTimeSlot = timeSlots.find(
    (slot) => slot.id === selectedTimeSlotId,
  );

  // 주문하기 버튼 클릭 핸들러
  const handleOrder = async () => {
    if (!selectedTimeSlot || items.length === 0) return;

    // 시간대 만료 체크
    if (isTimeSlotExpired(selectedTimeSlot)) {
      alert(TIME_SLOT_EXPIRED_MESSAGE);
      setTimeSlot(null);
      navigate("/shop");
      return;
    }

    setIsOrdering(true);

    try {
      // 주문 요청 데이터 생성 (productId와 quantity만 전송)
      const orderItems = items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      // 한국 시간 기준 오늘 날짜 (fallback용)
      const now = new Date();
      const koreaDate = new Date(now.getTime() + 9 * 60 * 60 * 1000);
      const todayKorea = koreaDate.toISOString().split("T")[0];

      const response = await createOrder({
        items: orderItems,
        deliveryDate: orderDate || todayKorea,
        deliveryTimeSlot: selectedTimeSlot,
        // 다회용기 정보 (항상 전송 - 반출만 있는 케이스를 위해)
        containerInfo: {
          containerCount,
          needsWashing,
        },
      });

      if (response.success) {
        clearCart();
        navigate("/orders");
      } else {
        alert(`주문 실패: ${response.message}`);
      }
    } catch (error: unknown) {
      console.error("주문 오류:", error);
      const firebaseError = error as { code?: string; message?: string };
      alert(
        firebaseError.message ||
          "주문 중 오류가 발생했습니다. 다시 시도해주세요.",
      );
    } finally {
      setIsOrdering(false);
    }
  };

  // 오늘 날짜 포맷팅
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) {
      const today = new Date();
      return `${today.getFullYear()}년 ${
        today.getMonth() + 1
      }월 ${today.getDate()}일`;
    }
    const date = new Date(dateStr);
    return `${date.getFullYear()}년 ${
      date.getMonth() + 1
    }월 ${date.getDate()}일`;
  };

  // 요일 가져오기 (문자열 날짜용)
  const getDayOfWeekFromStr = (dateStr: string | null) => {
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    const date = dateStr ? new Date(dateStr) : new Date();
    return days[date.getDay()];
  };

  const totalPrice = getTotalPrice();

  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold mb-6">
        장바구니
      </h1>

      {/* 배송 정보 헤더 - 선택된 시간대가 있을 때만 표시 */}
      {selectedTimeSlot && (
        <div className="bg-blue-50 rounded-xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            {/* 날짜 */}
            <div className="flex items-center gap-2">
              <span className="text-blue-600 font-medium text-lg sm:text-base">
                {formatDate(orderDate)} ({getDayOfWeekFromStr(orderDate)})
              </span>
            </div>
            {/* 배송 시간대 */}
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-sm text-blue-700 bg-blue-100 px-3 py-1.5 sm:py-1 rounded-full">
                배송 희망: {selectedTimeSlot.label}
              </span>
              <button
                onClick={handleClearTimeSlot}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                변경
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 배송 날짜 & 시간대 선택 */}
      {isLoadingSlots ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-500">배송 시간대 불러오는 중...</span>
          </div>
        </div>
      ) : (
        <TimeSlotSelector
          timeSlots={timeSlots}
          selectedSlotId={selectedTimeSlotId}
          isStaff={isStaff}
          isSaving={isSavingOpenHours}
          onSelectSlot={handleSelectTimeSlot}
          onUpdateSlots={handleUpdateTimeSlots}
          selectedDate={selectedDate}
          selectedDateOffset={selectedDateOffset}
          onDateOffsetChange={setSelectedDateOffset}
          formatDate={formatKoreaDate}
          getDayOfWeek={getDayOfWeek}
        />
      )}

      {/* 장바구니 내용 */}
      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4 text-base sm:text-sm">
            장바구니가 비어있습니다.
          </p>
          <a
            href="/shop"
            className="text-blue-600 hover:text-blue-700 underline text-base sm:text-sm"
          >
            장보기 페이지로 이동
          </a>
        </div>
      ) : (
        <>
          {/* 상품 목록 */}
          <div className="space-y-3 mb-6">
            {items.map((item) => (
              <CartItemCard
                key={item.product.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>

          {/* 전체 삭제 버튼 */}
          <div className="flex justify-end mb-6">
            <button
              onClick={clearCart}
              className="text-base sm:text-sm text-gray-500 hover:text-red-500"
            >
              장바구니 비우기
            </button>
          </div>

          {/* 합계 */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-base sm:text-sm text-gray-600">
                상품 가격
              </span>
              <span className="text-base sm:text-sm text-gray-700">
                {totalPrice.toLocaleString()}원
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-base sm:text-sm text-gray-600">배송비</span>
              <span className="text-base sm:text-sm text-gray-700">
                {deliveryFee > 0 ? `${deliveryFee.toLocaleString()}원` : "무료"}
              </span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex items-center justify-between">
              <span className="text-xl sm:text-lg font-medium text-gray-700">
                합계
              </span>
              <span className="text-2xl sm:text-2xl font-bold text-blue-600">
                {(totalPrice + deliveryFee).toLocaleString()}원
              </span>
            </div>
          </div>

          {/* 주문 전 유의사항 안내 */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-base sm:text-sm font-semibold text-amber-800 mb-3">
              주문 전 유의사항
            </p>
            <ol className="space-y-2 text-base sm:text-sm text-amber-700">
              <li className="flex gap-2">
                <span className="font-medium">1.</span>
                <span>
                  회수할 지환수 상자가 있는 경우, 배송기사님 도착 전까지 현관문
                  밖에 내놓아주세요.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium">2.</span>
                <span>
                  개인 다회용기도 함께 내놓으신다면 - 용기 개수와 세척 필요
                  여부를 알려주세요.
                </span>
              </li>
            </ol>

            {/* 용기 보관 현황 (customer만 표시) */}
            {!isStaff && containerBalance !== null && (
              <div className="mt-3 pt-3 border-t border-amber-200">
                <p className="text-base sm:text-sm text-amber-700">
                  현재 지환수가 보관 중인 나의 용기:{" "}
                  <span className="font-bold text-amber-900">
                    {containerBalance}개
                  </span>
                </p>
              </div>
            )}

            {/* 다회용기 입력 영역 */}
            <div className="mt-4 pt-4 border-t border-amber-200">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* 용기 수량 입력 */}
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-sm text-amber-700 font-medium">
                    충전하실 개인 용기 개수:
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={containerCount || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") {
                        setContainerCount(0);
                      } else {
                        const num = parseInt(val, 10);
                        if (!isNaN(num)) {
                          setContainerCount(Math.min(99, Math.max(0, num)));
                        }
                      }
                    }}
                    placeholder="0"
                    className="w-16 px-2 py-2 sm:py-1.5 text-center text-base sm:text-sm border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <span className="text-base sm:text-sm text-amber-700">
                    개
                  </span>
                </div>

                {/* 세척 필요 여부 체크박스 */}
                {containerCount > 0 && (
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="washingOption"
                        checked={needsWashing}
                        onChange={() => setNeedsWashing(true)}
                        className="w-5 h-5 sm:w-4 sm:h-4 text-amber-600"
                      />
                      <span className="text-base sm:text-sm text-amber-700">
                        세척 후 사용해주세요
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="washingOption"
                        checked={!needsWashing}
                        onChange={() => setNeedsWashing(false)}
                        className="w-5 h-5 sm:w-4 sm:h-4 text-amber-600"
                      />
                      <span className="text-base sm:text-sm text-amber-700">
                        세척이 필요 없어요
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 주문하기 버튼 */}
          <button
            onClick={handleOrder}
            disabled={!selectedTimeSlot || isOrdering}
            className="w-full py-4 text-xl sm:text-lg font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isOrdering
              ? "주문 처리 중..."
              : selectedTimeSlot
                ? "주문하기"
                : "배송 시간대를 선택해주세요"}
          </button>
        </>
      )}
    </div>
  );
}
