import type { Category1, Category2 } from "@/types/product";

interface CategorySelectorProps {
  categories1: Category1[];
  categories2: Category2[];
  selectedCategory1Id: string | null;
  selectedCategory2Id: string | null;
  isStaff?: boolean;
  onSelectCategory1: (id: string | null) => void;
  onSelectCategory2: (id: string | null) => void;
}

export default function CategorySelector({
  categories1,
  categories2,
  selectedCategory1Id,
  selectedCategory2Id,
  isStaff = false,
  onSelectCategory1,
  onSelectCategory2,
}: CategorySelectorProps) {
  const filteredCategories2 = selectedCategory1Id
    ? categories2.filter((c) => c.category1Id === selectedCategory1Id)
    : [];

  // Staff에게는 name(id) 형태로, 일반 사용자에게는 name만 표시
  const formatCategoryName = (name: string, id: string) => {
    return isStaff ? `${name}(${id})` : name;
  };

  return (
    <div className="space-y-3">
      {/* Category1 선택 */}
      <div className="flex flex-wrap gap-2">
        <span
          className={`px-5 sm:px-4 py-2.5 sm:py-2 rounded-full text-base sm:text-sm font-medium ${
            selectedCategory1Id === null
              ? "bg-blue-600 text-white"
              : "hidden"
          }`}
        >
          상품 유형을 선택하세요
        </span>
        {categories1.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory1(category.id)}
            className={`px-5 sm:px-4 py-2.5 sm:py-2 rounded-full text-base sm:text-sm font-medium transition-colors ${
              selectedCategory1Id === category.id
                ? "bg-blue-700 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {formatCategoryName(category.name, category.id)}
          </button>
        ))}
      </div>

      {/* Category2 선택 */}
      {selectedCategory1Id && filteredCategories2.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onSelectCategory2(null)}
            className={`px-5 sm:px-4 py-2.5 sm:py-2 rounded-md text-base sm:text-sm font-medium transition-colors border ${
              selectedCategory2Id === null
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}
          >
            전체
          </button>
          {filteredCategories2.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelectCategory2(category.id)}
              className={`px-5 sm:px-4 py-2.5 sm:py-2 rounded-md text-base sm:text-sm font-medium transition-colors border ${
                selectedCategory2Id === category.id
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {formatCategoryName(category.name, category.id)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
