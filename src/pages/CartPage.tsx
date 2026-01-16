import { useCartStore } from "@/stores/cartStore";
import CartItemCard from "@/components/cart/CartItemCard";

export default function CartPage() {
  const {
    items,
    selectedTimeSlot,
    orderDate,
    updateQuantity,
    removeItem,
    clearCart,
    getTotalPrice,
  } = useCartStore();

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
      <h1 className="text-2xl md:text-3xl font-bold mb-6">장바구니</h1>

      {/* 배송 정보 헤더 */}
      <div className="bg-blue-50 rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          {/* 날짜 */}
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-medium">
              {formatDate(orderDate)} ({getDayOfWeek(orderDate)})
            </span>
          </div>
          {/* 배송 시간대 */}
          <div>
            {selectedTimeSlot ? (
              <span className="text-sm text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                배송 희망: {selectedTimeSlot.label}
              </span>
            ) : (
              <span className="text-sm text-gray-500">
                배송 시간대를 선택해주세요
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 장바구니 내용 */}
      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">장바구니가 비어있습니다.</p>
          <a
            href="/shop"
            className="text-blue-600 hover:text-blue-700 underline"
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
              className="text-sm text-gray-500 hover:text-red-500"
            >
              장바구니 비우기
            </button>
          </div>

          {/* 합계 */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium text-gray-700">합계</span>
              <span className="text-2xl font-bold text-blue-600">
                {totalPrice.toLocaleString()}원
              </span>
            </div>
          </div>

          {/* 주문하기 버튼 */}
          <button
            disabled={!selectedTimeSlot}
            className="w-full py-4 text-lg font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {selectedTimeSlot ? "주문하기" : "배송 시간대를 선택해주세요"}
          </button>
        </>
      )}
    </div>
  );
}
