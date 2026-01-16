import { useState } from "react";
import type { CartItem } from "@/types/product";

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export default function CartItemCard({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemCardProps) {
  const { product, quantity } = item;
  const [imageError, setImageError] = useState(false);

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity <= 0) {
      onRemove(product.id);
    } else {
      onUpdateQuantity(product.id, newQuantity);
    }
  };

  // 실제 주문 수량 계산 (최소 주문 수량 * 유저 조절값)
  const actualQuantity = product.orderMinQuantity * quantity;
  const quantityDisplay = `${actualQuantity}${product.orderUnit}`;

  // 총 가격
  const totalPrice = product.pricePerMinOrder * quantity;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex gap-4">
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
            <span className="text-gray-400 text-xs text-center px-1">No Image</span>
          )}
        </div>

        {/* 오른쪽: 정보 영역 */}
        <div className="flex-1 min-w-0">
          {/* Row 1: 상품명, 삭제 버튼 */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">{product.name}</h3>
            <button
              onClick={() => onRemove(product.id)}
              className="text-gray-400 hover:text-red-500 text-sm"
            >
              ✕
            </button>
          </div>

          {/* Row 2: 단위당 가격 */}
          <p className="text-sm text-gray-500 mb-2">
            {product.pricePerUnit.toLocaleString()}원 / {product.unit}
          </p>

          {/* Row 3: 수량 조절, 총 가격 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleQuantityChange(-1)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm"
              >
                -
              </button>
              <span className="min-w-[60px] text-center text-sm font-medium">
                {quantityDisplay}
              </span>
              <button
                onClick={() => handleQuantityChange(1)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm"
              >
                +
              </button>
            </div>
            <p className="text-base font-bold text-blue-600">
              {totalPrice.toLocaleString()}원
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
