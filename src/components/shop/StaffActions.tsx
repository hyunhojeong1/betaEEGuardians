interface StaffActionsProps {
  onAddCategory1: () => void;
  onAddCategory2: () => void;
  onAddProduct: () => void;
}

export default function StaffActions({
  onAddCategory1,
  onAddCategory2,
  onAddProduct,
}: StaffActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={onAddCategory1}
        className="px-3 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-900 transition-colors"
      >
        + 카테고리1 추가
      </button>
      <button
        onClick={onAddCategory2}
        className="px-3 py-2 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
      >
        + 카테고리2 추가
      </button>
      <button
        onClick={onAddProduct}
        className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
      >
        + 상품 추가
      </button>
    </div>
  );
}
