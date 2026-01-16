import { useState } from "react";
import type { OrderItem } from "@/types/order";

// 무지개 7색 (빨, 주, 노, 초, 파, 남, 보)
const RAINBOW_COLORS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-green-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-violet-500",
];

interface OrderItemCardProps {
  item: OrderItem;
  isStaff: boolean;
  ordererColorIndex?: number; // Staff용 주문자 색상 인덱스
}

export default function OrderItemCard({
  item,
  isStaff,
  ordererColorIndex,
}: OrderItemCardProps) {
  const [imageError, setImageError] = useState(false);
  const { product } = item;

  // 실제 주문 수량 표시
  const actualQuantity = product.orderMinQuantity * item.quantity;
  const quantityDisplay = `${actualQuantity}${product.orderUnit}`;

  // Staff용 색상 바
  const colorBarClass =
    ordererColorIndex !== undefined
      ? RAINBOW_COLORS[ordererColorIndex % RAINBOW_COLORS.length]
      : "";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex">
        {/* Staff용 색상 바 */}
        {isStaff && ordererColorIndex !== undefined && (
          <div className={`w-2 flex-shrink-0 ${colorBarClass}`} />
        )}

        <div className="flex gap-4 p-4 flex-1">
          {/* 왼쪽: 상품 이미지 */}
          <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
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
              <h3 className="font-semibold text-gray-900">{product.name}</h3>
              {isStaff && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded flex-shrink-0">
                  {item.ordererCode}
                </span>
              )}
            </div>

            {/* Row 2: 수량 + 가격 */}
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-gray-600">{quantityDisplay}</p>
              <p className="text-base font-bold text-blue-600">
                {item.itemPrice.toLocaleString()}원
              </p>
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

            {/* Row 5: 유통/소비기한 */}
            {(product.expiryDate || product.consumptionDeadline) && (
              <div className="text-xs text-gray-400">
                {product.expiryDate && `유통기한: ${product.expiryDate}`}
                {product.expiryDate && product.consumptionDeadline && " / "}
                {product.consumptionDeadline &&
                  `소비기한: ${product.consumptionDeadline}`}
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
          </div>
        </div>
      </div>
    </div>
  );
}
