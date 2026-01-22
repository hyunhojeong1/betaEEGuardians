import { useState, useEffect, useCallback } from "react";
import { useUserStore } from "@/stores/userStore";
import { useCartStore } from "@/stores/cartStore";
import SearchBar from "@/components/shop/SearchBar";
import RequestBanner from "@/components/shop/RequestBanner";
import StaffActions from "@/components/shop/StaffActions";
import CategorySelector from "@/components/shop/CategorySelector";
import ProductCard from "@/components/shop/ProductCard";
import { Category1Form, Category2Form } from "@/components/shop/CategoryForm";
import ProductForm from "@/components/shop/ProductForm";
import ProductEditForm from "@/components/shop/ProductEditForm";
import NoticeEditor from "@/components/shop/NoticeEditor";
import NoticeBanner from "@/components/shop/NoticeBanner";
import { getCategories } from "@/services/category";
import {
  getProducts,
  searchProducts,
  deleteProduct,
  type ProductData,
} from "@/services/product";
import { getNotice } from "@/services/notice";
import { useDebounce } from "@/hooks/useDebounce";
import type { Category1, Category2, Product } from "@/types/product";

// ProductData를 Product로 변환
function toProduct(data: ProductData): Product {
  return {
    ...data,
    createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
    updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
  };
}

export default function ShopPage() {
  const { role } = useUserStore();
  const { addItem, selectedTimeSlot: cartTimeSlot, orderDate } = useCartStore();
  const isStaff = role === "staff";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory1Id, setSelectedCategory1Id] = useState<string | null>(
    null
  );
  const [selectedCategory2Id, setSelectedCategory2Id] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // 카테고리 상태
  const [categories1, setCategories1] = useState<Category1[]>([]);
  const [categories2, setCategories2] = useState<Category2[]>([]);

  // 상품 상태
  const [products, setProducts] = useState<Product[]>([]);

  // 편집 중인 상품 ID
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // 폼 표시 상태
  const [showCategory1Form, setShowCategory1Form] = useState(false);
  const [showCategory2Form, setShowCategory2Form] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);

  // 공지사항 상태
  const [noticeComment, setNoticeComment] = useState("");

  // 검색어 debounce (1초)
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // 상품 목록 불러오기
  const fetchProducts = useCallback(
    async (
      category1Id?: string | null,
      category2Id?: string | null,
      query?: string
    ) => {
      setIsLoadingProducts(true);
      try {
        let productData: ProductData[];

        if (query && query.trim()) {
          // 검색어가 있으면 검색 API 사용
          productData = await searchProducts(query.trim());
        } else {
          // 카테고리 필터링
          productData = await getProducts(
            category1Id || undefined,
            category2Id || undefined
          );
        }

        setProducts(productData.map(toProduct));
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts([]);
      } finally {
        setIsLoadingProducts(false);
      }
    },
    []
  );

  // 페이지 진입 시 데이터 불러오기 (최초 1회)
  useEffect(() => {
    async function fetchInitialData() {
      try {
        // categories, notice, products를 병렬로 불러오기
        const [categoriesData, notice] = await Promise.all([
          getCategories(),
          getNotice(),
        ]);

        setCategories1(categoriesData.categories1);
        setCategories2(categoriesData.categories2);
        setNoticeComment(notice);

        // 전체 상품 불러오기
        await fetchProducts();
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchInitialData();
  }, [fetchProducts]);

  // 카테고리 변경 또는 검색어 변경 시 상품 다시 불러오기 (debounce 적용)
  useEffect(() => {
    if (!isLoading) {
      fetchProducts(
        selectedCategory1Id,
        selectedCategory2Id,
        debouncedSearchQuery
      );
    }
  }, [
    selectedCategory1Id,
    selectedCategory2Id,
    debouncedSearchQuery,
    isLoading,
    fetchProducts,
  ]);

  // 카테고리 새로고침
  const refreshCategories = async () => {
    try {
      const categoriesData = await getCategories();
      setCategories1(categoriesData.categories1);
      setCategories2(categoriesData.categories2);
    } catch (error) {
      console.error("Failed to refresh categories:", error);
    }
  };

  // 상품 목록 새로고침
  const refreshProducts = () => {
    fetchProducts(
      selectedCategory1Id,
      selectedCategory2Id,
      debouncedSearchQuery
    );
  };

  // 카테고리1 변경 시 카테고리2 초기화 + 검색어 초기화
  const handleCategory1Change = (id: string | null) => {
    setSelectedCategory1Id(id);
    setSelectedCategory2Id(null);
    setSearchQuery("");
  };

  // 카테고리2 변경 시 검색어 초기화
  const handleCategory2Change = (id: string | null) => {
    setSelectedCategory2Id(id);
    setSearchQuery("");
  };

  const handleAddToCart = (product: Product, quantity: number) => {
    addItem(product, quantity);
  };

  const handleEditProduct = (product: Product) => {
    // 해당 상품 위치에서 편집 폼 열기
    setEditingProductId(product.id);
    // 다른 폼들 닫기
    setShowCategory1Form(false);
    setShowCategory2Form(false);
    setShowProductForm(false);
  };

  const handleEditSuccess = () => {
    setEditingProductId(null);
    refreshProducts();
  };

  const handleEditCancel = () => {
    setEditingProductId(null);
  };

  const handleDeleteProduct = async (product: Product) => {
    // 삭제 확인 Alert
    const confirmed = window.confirm(
      `정말로 "${product.name}" 상품을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`
    );

    if (!confirmed) return;

    try {
      await deleteProduct(product.id);
      alert("상품이 삭제되었습니다.");
      refreshProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("상품 삭제에 실패했습니다.");
    }
  };

  const handleAddCategory1 = () => {
    setShowCategory1Form(true);
    setShowCategory2Form(false);
    setShowProductForm(false);
  };

  const handleAddCategory2 = () => {
    setShowCategory2Form(true);
    setShowCategory1Form(false);
    setShowProductForm(false);
  };

  const handleCategory1Success = () => {
    setShowCategory1Form(false);
    refreshCategories();
  };

  const handleCategory2Success = () => {
    setShowCategory2Form(false);
    refreshCategories();
  };

  const handleAddProduct = () => {
    setShowProductForm(true);
    setShowCategory1Form(false);
    setShowCategory2Form(false);
  };

  const handleProductSuccess = () => {
    setShowProductForm(false);
    refreshProducts();
  };

  // 날짜 포맷팅 (orderDate용)
  const formatOrderDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  };

  if (isLoading) {
    return (
      <div className="px-4 py-6 md:px-8 md:py-10 max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-4xl mx-auto">
      {/* 타이틀 + 선택된 시간대 표시 */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">장보기</h1>
        {cartTimeSlot && (
          <a
            href="/cart"
            className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100"
          >
            {orderDate && `${formatOrderDate(orderDate)} `}{cartTimeSlot.label} 배송
          </a>
        )}
      </div>

      {/* 공지사항: Staff는 편집 가능, Customer는 읽기만 */}
      {isStaff ? (
        <NoticeEditor
          initialComment={noticeComment}
          onSaveSuccess={(newComment) => setNoticeComment(newComment)}
        />
      ) : (
        <NoticeBanner comment={noticeComment} />
      )}

      {/* 검색바 */}
      <div className="mb-4">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* 요청 배너 */}
      <div className="mb-4">
        <RequestBanner />
      </div>

      {/* Staff 전용 액션 버튼 */}
      {isStaff && (
        <div className="mb-4">
          <StaffActions
            onAddCategory1={handleAddCategory1}
            onAddCategory2={handleAddCategory2}
            onAddProduct={handleAddProduct}
          />

          {/* 카테고리1 추가 폼 */}
          {showCategory1Form && (
            <Category1Form
              onSuccess={handleCategory1Success}
              onCancel={() => setShowCategory1Form(false)}
            />
          )}

          {/* 카테고리2 추가 폼 */}
          {showCategory2Form && (
            <Category2Form
              categories1={categories1}
              onSuccess={handleCategory2Success}
              onCancel={() => setShowCategory2Form(false)}
            />
          )}

          {/* 상품 추가 폼 */}
          {showProductForm && (
            <div className="overflow-x-auto -mx-4 px-4">
              <ProductForm
                categories1={categories1}
                categories2={categories2}
                onSuccess={handleProductSuccess}
                onCancel={() => setShowProductForm(false)}
              />
            </div>
          )}
        </div>
      )}

      {/* 카테고리 선택 */}
      <div className="mb-6">
        <CategorySelector
          categories1={categories1}
          categories2={categories2}
          selectedCategory1Id={selectedCategory1Id}
          selectedCategory2Id={selectedCategory2Id}
          isStaff={isStaff}
          onSelectCategory1={handleCategory1Change}
          onSelectCategory2={handleCategory2Change}
        />
      </div>

      {/* 상품 목록 */}
      <div className="space-y-3">
        {isLoadingProducts ? (
          <div className="text-center py-10 text-gray-500">
            상품을 불러오는 중...
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            {searchQuery
              ? `"${searchQuery}"에 대한 검색 결과가 없습니다.`
              : "해당 카테고리에 상품이 없습니다."}
          </div>
        ) : (
          products.map((product) =>
            editingProductId === product.id ? (
              // 편집 중인 상품은 편집 폼으로 표시
              <div key={product.id} className="overflow-x-auto -mx-4 px-4">
                <ProductEditForm
                  product={product}
                  categories1={categories1}
                  categories2={categories2}
                  onSuccess={handleEditSuccess}
                  onCancel={handleEditCancel}
                />
              </div>
            ) : (
              // 일반 상품 카드
              <ProductCard
                key={product.id}
                product={product}
                isStaff={isStaff}
                categories1={categories1}
                categories2={categories2}
                onAddToCart={handleAddToCart}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
            )
          )
        )}
      </div>
    </div>
  );
}
