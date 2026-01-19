import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/stores/cartStore";
import CartItemCard from "@/components/cart/CartItemCard";
import {
  isTimeSlotExpired,
  TIME_SLOT_EXPIRED_MESSAGE,
} from "@/utils/timeSlotValidation";
import { createOrder } from "@/services/order";

export default function CartPage() {
  const navigate = useNavigate();
  const [isOrdering, setIsOrdering] = useState(false);
  const [containerCount, setContainerCount] = useState(0);
  const [needsWashing, setNeedsWashing] = useState(true); // 기본값: 세척 후 사용
  const {
    items,
    selectedTimeSlot,
    orderDate,
    updateQuantity,
    removeItem,
    clearCart,
    setTimeSlot,
    getTotalPrice,
  } = useCartStore();

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
        // 다회용기 정보 (수량이 0보다 클 때만 전송)
        containerInfo:
          containerCount > 0
            ? {
                containerCount,
                needsWashing,
              }
            : undefined,
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
      alert(firebaseError.message || "주문 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsOrdering(false);
    }
  };

  // 오늘 날짜 포맷팅
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) {
      const today = new Date();
      return `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
    }
    const date = new Date(dateStr);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  // 요일 가져오기
  const getDayOfWeek = (dateStr: string | null) => {
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    const date = dateStr ? new Date(dateStr) : new Date();
    return days[date.getDay()];
  };

  const totalPrice = getTotalPrice();

  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold mb-6">장바구니</h1>

      {/* 배송 정보 헤더 */}
      <div className="bg-blue-50 rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          {/* 날짜 */}
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-medium text-lg sm:text-base">
              {formatDate(orderDate)} ({getDayOfWeek(orderDate)})
            </span>
          </div>
          {/* 배송 시간대 */}
          <div>
            {selectedTimeSlot ? (
              <span className="text-base sm:text-sm text-blue-700 bg-blue-100 px-3 py-1.5 sm:py-1 rounded-full">
                배송 희망: {selectedTimeSlot.label}
              </span>
            ) : (
              <span className="text-base sm:text-sm text-gray-500">
                배송 시간대를 선택해주세요
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 장바구니 내용 */}
      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4 text-base sm:text-sm">장바구니가 비어있습니다.</p>
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
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-xl sm:text-lg font-medium text-gray-700">합계</span>
              <span className="text-2xl sm:text-2xl font-bold text-blue-600">
                {totalPrice.toLocaleString()}원
              </span>
            </div>
          </div>

          {/* 주문 전 유의사항 안내 */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-base sm:text-sm font-semibold text-amber-800 mb-3">
              주문 전 아래 유의사항을 꼭 확인해주세요
            </p>
            <ol className="space-y-2 text-base sm:text-sm text-amber-700">
              <li className="flex gap-2">
                <span className="font-medium">1.</span>
                <span>
                  회수할 지환수 상자가 있다면 배송 전까지 현관문 앞에
                  내놓아주세요.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium">2.</span>
                <span>
                  아 맞다, 음식물 쓰레기! 잔반 회수 용기와 싱크대 배수망에 남은
                  음식물 배출도 잊지 마세요.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium">3.</span>
                <span>
                  개인 다회용기도 내놓으신다면: 용기 수량과 세척 필요 여부를
                  알려주세요.
                </span>
              </li>
            </ol>

            {/* 다회용기 입력 영역 */}
            <div className="mt-4 pt-4 border-t border-amber-200">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* 용기 수량 입력 */}
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-sm text-amber-700 font-medium">
                    개인 용기 갯수:
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
                  <span className="text-base sm:text-sm text-amber-700">개</span>
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
