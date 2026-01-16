import { useState } from "react";
import type { Product, Category1, Category2 } from "@/types/product";

interface ProductCardProps {
  product: Product;
  isStaff: boolean;
  categories1?: Category1[];
  categories2?: Category2[];
  onAddToCart: (product: Product, quantity: number) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

export default function ProductCard({
  product,
  isStaff,
  categories1 = [],
  categories2 = [],
  onAddToCart,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  const [showAddedMessage, setShowAddedMessage] = useState(false);

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setShowAddedMessage(true);
    setTimeout(() => setShowAddedMessage(false), 2000);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  // 최소 주문당 가격 기준으로 계산
  const totalPrice =
    (product.pricePerMinOrder || product.pricePerUnit) * quantity;

  // 실제 주문 수량 계산 (최소 주문 수량 * 유저 조절값)
  const actualQuantity = product.orderMinQuantity * quantity;
  const quantityDisplay = `${actualQuantity}${product.orderUnit}`;

  // 카테고리 이름 가져오기
  const category1Name =
    categories1.find((c) => c.id === product.category1Id)?.name ||
    product.category1Id;
  const category2Name =
    categories2.find((c) => c.id === product.category2Id)?.name ||
    product.category2Id;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex gap-4">
        {/* 왼쪽: 상품 이미지 */}
        <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
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
          {/* Row 1: 상품명, 카테고리, 수량 조절 */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-900">{product.name}</h3>
                <span className="text-xs text-gray-400">
                  ({category1Name} &gt; {category2Name})
                </span>
              </div>
            </div>
            {/* 수량 조절 */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => handleQuantityChange(-1)}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm"
                disabled={!product.inStock}
              >
                -
              </button>
              <span className="min-w-[60px] text-center text-sm font-medium">
                {quantityDisplay}
              </span>
              <button
                onClick={() => handleQuantityChange(1)}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm"
                disabled={!product.inStock}
              >
                +
              </button>
            </div>
          </div>

          {/* Row 2: 단위당 가격, 총 가격 */}
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-gray-600">
              {product.pricePerUnit.toLocaleString()}원 / {product.unit}
            </p>
            <p className="text-base font-bold text-blue-600">
              {totalPrice.toLocaleString()}원
            </p>
          </div>

          {/* Row 3: 공급처 */}
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-500">{product.supplier}</p>
          </div>

          {/* Row 4: 제품 스펙, 담기 버튼 */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex-1">
              {product.specifications && (
                <p className="text-xs text-gray-400">
                  {product.specifications}
                </p>
              )}
            </div>
            {!isStaff && (
              <div className="flex flex-col items-end">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  담기
                </button>
                {showAddedMessage && (
                  <span className="text-xs text-green-600 mt-1">
                    장바구니에 담았습니다!
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Row 5: 유통/소비기한, Staff 전용 정보 */}
          <div className="flex items-center justify-between text-xs">
            <div className="text-gray-400">
              {(product.expiryDate || product.consumptionDeadline) && (
                <span>
                  {product.expiryDate && `유통기한: ${product.expiryDate}`}
                  {product.expiryDate && product.consumptionDeadline && " / "}
                  {product.consumptionDeadline &&
                    `소비기한: ${product.consumptionDeadline}`}
                </span>
              )}
            </div>
            {isStaff && (
              <div className="text-gray-400 flex gap-2">
                <span>{product.estimatedVolumePerMinUnit}ml</span>
                <span className="font-mono">
                  {product.packagingIndependenceCode}
                </span>
              </div>
            )}
          </div>

          {/* Row 6: 상품 설명, Staff 전용 상태 */}
          <div className="flex items-start justify-between mt-1">
            <div className="flex-1 min-w-0">
              {product.description && (
                <p className="text-xs text-gray-400 line-clamp-2">
                  {product.description}
                </p>
              )}
            </div>
            {isStaff && (
              <div className="flex items-center gap-2 text-xs flex-shrink-0 ml-2">
                <span
                  className={
                    product.inStock ? "text-green-600" : "text-red-500"
                  }
                >
                  {product.inStock ? "재고O" : "재고X"}
                </span>
                <span
                  className={
                    product.isActive ? "text-blue-600" : "text-gray-400"
                  }
                >
                  {product.isActive ? "노출O" : "노출X"}
                </span>
              </div>
            )}
          </div>

          {/* Row 7: Staff 전용 편집/삭제 버튼 */}
          {isStaff && (
            <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => onEdit?.(product)}
                className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                편집
              </button>
              <button
                onClick={() => onDelete?.(product)}
                className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
              >
                삭제
              </button>
            </div>
          )}

          {/* 품절 표시 (Customer) */}
          {!isStaff && !product.inStock && (
            <div className="mt-1">
              <span className="text-xs text-red-500 font-medium">품절</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
