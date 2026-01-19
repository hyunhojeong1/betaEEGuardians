import { useState } from "react";
import type { OrderItem, StaffStatusCheck } from "@/types/order";
import { updateOrderStatus } from "@/services/order";

// 7가지 구분 색상 (빨, 노, 초, 파, 보, 회색, 검정)
const ORDERER_COLORS = [
  "bg-red-500",
  "bg-yellow-400",
  "bg-green-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-gray-400",
  "bg-gray-800",
];

// Staff 상태 옵션
const STATUS_OPTIONS: { value: StaffStatusCheck; label: string }[] = [
  { value: "pending", label: "직원미진행" },
  { value: "fulfilled", label: "직원이행" },
  { value: "cancelled", label: "직원취소" },
];

interface OrderItemCardProps {
  item: OrderItem;
  isStaff: boolean;
  ordererColorIndex?: number; // Staff용 주문자 색상 인덱스
  onStatusChange?: (itemId: string, newStatus: StaffStatusCheck) => void;
}

export default function OrderItemCard({
  item,
  isStaff,
  ordererColorIndex,
  onStatusChange,
}: OrderItemCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<StaffStatusCheck>(
    item.staffStatusCheck || "pending"
  );
  const { product } = item;

  // 실제 주문 수량 표시
  const actualQuantity = product.orderMinQuantity * item.quantity;
  const quantityDisplay = `${actualQuantity}${product.orderUnit}`;

  // Staff용 색상 바
  const colorBarClass =
    ordererColorIndex !== undefined
      ? ORDERER_COLORS[ordererColorIndex % ORDERER_COLORS.length]
      : "";

  // 직원 취소 상태인지 확인
  const isCancelled = currentStatus === "cancelled";

  // Staff 상태 변경 핸들러
  const handleStatusChange = async (newStatus: StaffStatusCheck) => {
    if (newStatus === currentStatus || isUpdating) return;

    setIsUpdating(true);
    try {
      await updateOrderStatus({
        orderId: item.id,
        staffStatusCheck: newStatus,
      });
      setCurrentStatus(newStatus);
      onStatusChange?.(item.id, newStatus);
    } catch (err) {
      console.error("상태 업데이트 오류:", err);
      alert("상태 업데이트에 실패했습니다.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border overflow-hidden ${
        isCancelled && !isStaff
          ? "border-red-300 bg-red-50 opacity-70"
          : "border-gray-200"
      }`}
    >
      <div className="flex">
        {/* Staff용 색상 바 */}
        {isStaff && ordererColorIndex !== undefined && (
          <div className={`w-2 flex-shrink-0 ${colorBarClass}`} />
        )}

        <div className="flex gap-4 p-4 flex-1">
          {/* 왼쪽: 상품 이미지 */}
          <div
            className={`w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden ${
              isCancelled && !isStaff ? "grayscale" : ""
            }`}
          >
            {!imageError && product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <span className="text-gray-400 text-xs text-center px-1">
                No Image
              </span>
            )}
          </div>

          {/* 오른쪽: 정보 영역 */}
          <div className="flex-1 min-w-0">
            {/* Row 1: 상품명 + 주문자 코드 (Staff) */}
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3
                className={`font-semibold ${
                  isCancelled && !isStaff
                    ? "text-gray-400 line-through"
                    : "text-gray-900"
                }`}
              >
                {product.name}
              </h3>
              {isStaff && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded flex-shrink-0">
                  {item.ordererCode}
                </span>
              )}
            </div>

            {/* Row 2: 수량 + 가격 */}
            <div className="flex items-center justify-between mb-1">
              <p
                className={`text-sm ${
                  isCancelled && !isStaff ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {quantityDisplay}
              </p>
              <div className="text-right">
                <p
                  className={`text-base font-bold ${
                    isCancelled && !isStaff ? "text-gray-400" : "text-blue-600"
                  }`}
                >
                  {item.itemPrice.toLocaleString()}원
                </p>
                {/* Staff용: 추정 포장 부피 + 포장독립성 코드 */}
                {isStaff && (
                  <p className="text-xs text-gray-500">
                    {(product.estimatedVolumePerMinUnit * item.quantity).toLocaleString()}ml · {product.packagingIndependenceCode}
                  </p>
                )}
              </div>
            </div>

            {/* Row 3: 공급처 */}
            <div className="mb-1">
              <p className="text-xs text-gray-500">{product.supplier}</p>
            </div>

            {/* Row 4: 제품 스펙 */}
            {product.specifications && (
              <p className="text-xs text-gray-400 mb-1">
                {product.specifications}
              </p>
            )}

            {/* 고객용: 직원 취소 안내 메시지 */}
            {!isStaff && isCancelled && (
              <div className="mt-2 p-2 bg-red-100 rounded-lg">
                <p className="text-xs text-red-600 font-medium">
                  직원의 취소 처리로 인해 배송되지 않은 상품입니다.
                </p>
              </div>
            )}

            {/* Row 6: 해당 주문자의 총 주문 금액 (Staff용) */}
            {isStaff && (
              <div className="flex justify-end mt-1 pt-1 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  주문 총액:{" "}
                  <span className="font-semibold text-gray-700">
                    {item.totalOrderPrice.toLocaleString()}원
                  </span>
                </span>
              </div>
            )}

            {/* Staff용: 상태 라디오 버튼 */}
            {isStaff && (
              <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-100">
                {STATUS_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-1 cursor-pointer ${
                      isUpdating ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name={`status-${item.id}`}
                      value={option.value}
                      checked={currentStatus === option.value}
                      onChange={() => handleStatusChange(option.value)}
                      disabled={isUpdating}
                      className="w-3 h-3"
                    />
                    <span
                      className={`text-xs ${
                        option.value === "pending"
                          ? "text-gray-500"
                          : option.value === "fulfilled"
                            ? "text-green-600"
                            : "text-red-500"
                      }`}
                    >
                      {option.label}
                    </span>
                  </label>
                ))}
                {isUpdating && (
                  <span className="text-xs text-blue-500">저장 중...</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
