import { useState } from "react";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  isStaff: boolean;
  onAddToCart: (product: Product, quantity: number) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

export default function ProductCard({
  product,
  isStaff,
  onAddToCart,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  const [detailImageErrors, setDetailImageErrors] = useState<
    Record<string, boolean>
  >({});
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setShowAddedMessage(true);
    setTimeout(() => setShowAddedMessage(false), 2000);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(10, prev + delta)));
  };

  // 최소 주문당 가격 기준으로 계산
  const totalPrice =
    (product.pricePerMinOrder || product.pricePerUnit) * quantity;

  // 실제 주문 수량 계산 (최소 주문 수량 * 유저 조절값)
  const actualQuantity = product.orderMinQuantity * quantity;
  const quantityDisplay = `${actualQuantity}${product.orderUnit}`;


  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
      {/* 모바일: 이미지+수량/가격 상단, 상품정보+담기버튼 하단 */}
      {/* 태블릿 이상: 3열 레이아웃 */}
      <div className="flex gap-3 sm:gap-4">
        {/* 왼쪽 영역: 모바일에서는 이미지만, 태블릿 이상에서는 이미지+상품정보 */}
        <div className="flex flex-col sm:flex-row sm:flex-1 gap-3 sm:gap-4 min-w-0">
          {/* 상품 이미지 */}
          <div className="w-24 h-24 sm:w-24 sm:h-24 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            {!imageError && product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-contain"
                onError={() => setImageError(true)}
              />
            ) : (
              <span className="text-gray-400 text-sm sm:text-xs text-center px-1">
                No Image
              </span>
            )}
          </div>

          {/* 상품 정보 (태블릿 이상에서만 표시) */}
          <div className="flex-1 min-w-0 hidden sm:block">
            {/* 상품명 */}
            <h3 className="font-semibold text-gray-900 mb-1">
              {product.name}
              {product.specifications && (
                <span>({product.specifications})</span>
              )}
            </h3>

            {/* 상품 설명 */}
            {product.description && (
              <p className="text-sm text-gray-500 line-clamp-2 mb-1">
                {product.description}
              </p>
            )}

            {/* 단위당 가격 */}
            <p className="text-sm text-gray-600 mb-1">
              {product.unit}당 {product.pricePerUnit.toLocaleString()}원
            </p>

            {/* 공급처 */}
            <p className="text-xs text-gray-500 mb-1">{product.supplier}</p>

            {/* Staff 전용 정보 */}
            {isStaff && (
              <div className="flex items-center gap-2 text-xs mt-1">
                <span className="text-gray-400">
                  {product.estimatedVolumePerMinUnit}ml
                </span>
                <span className="text-gray-400 font-mono">
                  {product.packagingIndependenceCode}
                </span>
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
                <span
                  className={
                    product.recommend ? "text-orange-500" : "text-gray-400"
                  }
                >
                  {product.recommend ? "추천O" : "추천X"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 오른쪽 영역: 모바일에서는 수량+가격만, 태블릿에서는 수량+가격+버튼 */}
        <div className="flex flex-col items-end justify-center gap-2 sm:gap-1 sm:justify-between flex-shrink-0 ml-auto">
          {/* 수량 조절 */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleQuantityChange(-1)}
              className="w-8 h-8 sm:w-6 sm:h-6 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 text-lg sm:text-sm"
              disabled={!product.inStock}
            >
              -
            </button>
            <span className="min-w-[70px] sm:min-w-[60px] text-center text-lg sm:text-sm font-medium">
              {quantityDisplay}
            </span>
            <button
              onClick={() => handleQuantityChange(1)}
              className="w-8 h-8 sm:w-6 sm:h-6 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 text-lg sm:text-sm"
              disabled={!product.inStock || quantity >= 10}
            >
              +
            </button>
          </div>

          {/* 가격 (모바일에서는 수량 아래에만 표시) */}
          <p className="text-xl sm:text-lg font-bold text-blue-600">
            {totalPrice.toLocaleString()}원
          </p>

          {/* 담기/편집/삭제 버튼 (태블릿 이상에서만 표시) */}
          <div className="hidden sm:block">
            {/* 담기 버튼 (Customer만) */}
            {!isStaff && (
              <div className="flex flex-col items-end">
                <div className="flex gap-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    담기
                  </button>
                  {product.useDetailImageYN && (
                    <button
                      onClick={() => setShowDetailModal(true)}
                      className="px-4 py-1.5 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      상세
                    </button>
                  )}
                </div>
                {showAddedMessage && (
                  <span className="text-xs text-green-600 mt-1">
                    담았습니다!
                  </span>
                )}
                {!product.inStock && (
                  <span className="text-xs text-red-500 font-medium mt-1">
                    품절
                  </span>
                )}
              </div>
            )}

            {/* Staff 전용 편집/삭제 버튼 */}
            {isStaff && (
              <div className="flex gap-2">
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
          </div>
        </div>
      </div>

      {/* 모바일 전용: 상품 정보 + 담기 버튼 (이미지 아래에 표시) */}
      <div className="mt-3 sm:hidden">
        <div className="flex items-start justify-between gap-3">
          {/* 상품 정보 (왼쪽) */}
          <div className="flex-1 min-w-0">
            {/* 상품명 */}
            <h3 className="font-semibold text-gray-900 text-lg mb-1">
              {product.name}
              {product.specifications && (
                <span>({product.specifications})</span>
              )}
            </h3>

            {/* 상품 설명 */}
            {product.description && (
              <p className="text-base text-gray-500 mb-1 line-clamp-2">
                {product.description}
              </p>
            )}

            {/* 단위당 가격 & 공급처 */}
            <div className="flex items-center gap-2 text-base text-gray-500">
              <span>
                {product.unit}당 {product.pricePerUnit.toLocaleString()}원
              </span>
              <span>·</span>
              <span>{product.supplier}</span>
            </div>

            {/* Staff 전용 정보 (모바일) */}
            {isStaff && (
              <div className="flex items-center gap-2 text-base mt-1">
                <span className="text-gray-400">
                  {product.estimatedVolumePerMinUnit}ml
                </span>
                <span className="text-gray-400 font-mono">
                  {product.packagingIndependenceCode}
                </span>
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
                <span
                  className={
                    product.recommend ? "text-orange-500" : "text-gray-400"
                  }
                >
                  {product.recommend ? "추천O" : "추천X"}
                </span>
              </div>
            )}
          </div>

          {/* 담기/편집/삭제 버튼 (오른쪽) */}
          <div className="flex-shrink-0">
            {/* 담기 버튼 (Customer만) */}
            {!isStaff && (
              <div className="flex flex-col items-end">
                <div className="flex gap-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className="px-6 py-2.5 text-lg bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    담기
                  </button>
                  {product.useDetailImageYN && (
                    <button
                      onClick={() => setShowDetailModal(true)}
                      className="px-6 py-2.5 text-lg bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      상세
                    </button>
                  )}
                </div>
                {showAddedMessage && (
                  <span className="text-base text-green-600 mt-1">
                    담았습니다!
                  </span>
                )}
                {!product.inStock && (
                  <span className="text-base text-red-500 font-medium mt-1">
                    품절
                  </span>
                )}
              </div>
            )}

            {/* Staff 전용 편집/삭제 버튼 */}
            {isStaff && (
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit?.(product)}
                  className="px-4 py-2 text-base bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  편집
                </button>
                <button
                  onClick={() => onDelete?.(product)}
                  className="px-4 py-2 text-base bg-red-500 text-white rounded hover:bg-red-600"
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* 상세 이미지 모달 */}
      {showDetailModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="relative bg-white rounded-2xl max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {product.name} 상세정보
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            {/* 상세 이미지 목록 */}
            <div className="flex flex-col gap-4">
              {product.detail1ImageUrl?.trim() &&
                !detailImageErrors["detail1"] && (
                  <img
                    src={product.detail1ImageUrl}
                    alt={`${product.name} 상세 1`}
                    className="w-full max-h-[75vh] rounded-lg object-contain"
                    onError={() =>
                      setDetailImageErrors((prev) => ({
                        ...prev,
                        detail1: true,
                      }))
                    }
                  />
                )}
              {product.detail2ImageUrl?.trim() &&
                !detailImageErrors["detail2"] && (
                  <img
                    src={product.detail2ImageUrl}
                    alt={`${product.name} 상세 2`}
                    className="w-full max-h-[75vh] rounded-lg object-contain"
                    onError={() =>
                      setDetailImageErrors((prev) => ({
                        ...prev,
                        detail2: true,
                      }))
                    }
                  />
                )}
              {product.detail3ImageUrl?.trim() &&
                !detailImageErrors["detail3"] && (
                  <img
                    src={product.detail3ImageUrl}
                    alt={`${product.name} 상세 3`}
                    className="w-full max-h-[75vh] rounded-lg object-contain"
                    onError={() =>
                      setDetailImageErrors((prev) => ({
                        ...prev,
                        detail3: true,
                      }))
                    }
                  />
                )}
              {!product.detail1ImageUrl?.trim() &&
                !product.detail2ImageUrl?.trim() &&
                !product.detail3ImageUrl?.trim() && (
                  <p className="text-center text-gray-400 py-8">
                    등록된 상세 이미지가 없습니다.
                  </p>
                )}
            </div>

            {/* 닫기 버튼 */}
            <button
              onClick={() => setShowDetailModal(false)}
              className="mt-4 w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
