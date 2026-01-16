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
        <button
          onClick={() => onSelectCategory1(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory1Id === null
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          전체
        </button>
        {categories1.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory1(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory1Id === category.id
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedCategory2Id === null
                ? "bg-green-600 text-white"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            전체
          </button>
          {filteredCategories2.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelectCategory2(category.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedCategory2Id === category.id
                  ? "bg-green-600 text-white"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
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
