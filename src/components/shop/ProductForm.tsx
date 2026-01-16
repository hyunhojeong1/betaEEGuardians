import { useState, useRef } from "react";
import { addProduct } from "@/services/product";
import { uploadProductImage, validateImageFile } from "@/services/imageUpload";
import type { Category1, Category2 } from "@/types/product";

interface ProductFormProps {
  categories1: Category1[];
  categories2: Category2[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProductForm({
  categories1,
  categories2,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  // 카테고리 및 ID
  const [category1Id, setCategory1Id] = useState("");
  const [category2Id, setCategory2Id] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [idLetter, setIdLetter] = useState("");

  // 기본 정보
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState<number>(0);
  const [unit, setUnit] = useState("");
  const [supplier, setSupplier] = useState("");
  const [description, setDescription] = useState("");
  const [specifications, setSpecifications] = useState("");

  // 주문 관련
  const [orderMinQuantity, setOrderMinQuantity] = useState<number>(1);
  const [orderUnit, setOrderUnit] = useState("");
  const [pricePerMinOrder, setPricePerMinOrder] = useState<number>(0);
  const [estimatedVolumePerMinUnit, setEstimatedVolumePerMinUnit] = useState<number>(0);
  const [packagingIndependenceCode, setPackagingIndependenceCode] = useState("");

  // 날짜
  const [expiryDate, setExpiryDate] = useState("");
  const [consumptionDeadline, setConsumptionDeadline] = useState("");

  // 태그
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // 상태
  const [inStock, setInStock] = useState(true);
  const [isActive, setIsActive] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 이미지 업로드 관련
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  // 선택된 category1에 따른 category2 필터링
  const filteredCategories2 = category1Id
    ? categories2.filter((c) => c.category1Id === category1Id)
    : [];

  const handleCategory1Change = (value: string) => {
    setCategory1Id(value);
    setCategory2Id("");
  };

  const generateProductId = () => {
    if (!category2Id || !idNumber || !idLetter) return "";
    const paddedNumber = idNumber.padStart(2, "0");
    return `${category2Id}${paddedNumber}${idLetter}`;
  };

  // 이미지 업로드 핸들러
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 유효성 검사
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // 상품 ID 확인
    const productId = generateProductId();
    if (!productId) {
      setError("이미지 업로드 전에 카테고리와 ID를 먼저 입력해주세요.");
      return;
    }

    setError("");
    setIsUploading(true);
    setUploadProgress("이미지 리사이징 중...");

    try {
      setUploadProgress("업로드 중...");
      const downloadUrl = await uploadProductImage(file, productId);
      setImageUrl(downloadUrl);
      setUploadProgress("완료!");
      setTimeout(() => setUploadProgress(""), 2000);
    } catch (err) {
      console.error("Image upload failed:", err);
      setError("이미지 업로드에 실패했습니다.");
      setUploadProgress("");
    } finally {
      setIsUploading(false);
      // 파일 input 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // 카테고리 이름 가져오기
  const getCategory1Name = () => {
    const cat = categories1.find((c) => c.id === category1Id);
    return cat?.name || "";
  };

  const getCategory2Name = () => {
    const cat = categories2.find((c) => c.id === category2Id);
    return cat?.name || "";
  };

  // 태그 추가
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().replace(/^#/, "");
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  // 태그 삭제
  const handleRemoveTag = (indexToRemove: number) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!category1Id) {
      setError("카테고리1을 선택해주세요.");
      return;
    }
    if (!category2Id) {
      setError("카테고리2를 선택해주세요.");
      return;
    }
    if (!idNumber || !/^\d{1,2}$/.test(idNumber)) {
      setError("ID 숫자는 0-99 사이로 입력해주세요.");
      return;
    }
    if (!idLetter || !/^[a-z]$/.test(idLetter)) {
      setError("ID 알파벳은 소문자 한 글자(a-z)로 입력해주세요.");
      return;
    }
    if (!name.trim()) {
      setError("상품명을 입력해주세요.");
      return;
    }
    if (pricePerUnit <= 0) {
      setError("단위당 가격을 입력해주세요.");
      return;
    }
    if (!unit.trim()) {
      setError("단위를 입력해주세요.");
      return;
    }
    if (!supplier.trim()) {
      setError("공급처를 입력해주세요.");
      return;
    }
    if (orderMinQuantity <= 0) {
      setError("최소 주문 수량을 입력해주세요.");
      return;
    }
    if (!orderUnit.trim()) {
      setError("주문 단위를 입력해주세요.");
      return;
    }
    if (pricePerMinOrder <= 0) {
      setError("최소 주문 수량당 가격을 입력해주세요.");
      return;
    }
    if (!packagingIndependenceCode.trim()) {
      setError("포장독립성 코드를 입력해주세요.");
      return;
    }

    const productId = generateProductId();

    setIsSubmitting(true);
    try {
      const result = await addProduct({
        id: productId,
        name: name.trim(),
        category1Id,
        category2Id,
        imageUrl: imageUrl.trim(),
        pricePerUnit,
        unit: unit.trim(),
        supplier: supplier.trim(),
        description: description.trim() || undefined,
        inStock,
        isActive,
        orderMinQuantity,
        orderUnit: orderUnit.trim(),
        pricePerMinOrder,
        estimatedVolumePerMinUnit,
        packagingIndependenceCode: packagingIndependenceCode.trim(),
        tags,
        specifications: specifications.trim() || undefined,
        expiryDate: expiryDate || undefined,
        consumptionDeadline: consumptionDeadline || undefined,
      });
      alert(result.message || "상품이 저장되었습니다.");
      onSuccess();
    } catch (err) {
      console.error("Failed to add product:", err);
      setError("상품 추가에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-xl p-5 mt-2 shadow-sm w-full max-w-none"
      style={{ minWidth: "800px" }}
    >
      <h3 className="text-sm font-semibold text-gray-800 mb-4 pb-2 border-b">상품 추가/수정</h3>

      <div className="flex gap-5">
        {/* 왼쪽: 이미지 영역 */}
        <div className="flex-shrink-0 w-28 space-y-2">
          {/* 이미지 미리보기 */}
          <div className="w-28 h-28 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="상품 이미지"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <span className="text-xs text-gray-400 text-center px-2">이미지<br />미리보기</span>
            )}
          </div>
          {/* 이미지 URL 입력 */}
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="이미지 URL"
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
            disabled={isSubmitting || isUploading}
          />
          {/* 이미지 업로드 버튼 */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            disabled={isSubmitting || isUploading}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSubmitting || isUploading}
            className="w-full px-2 py-1.5 text-xs text-white bg-gray-600 rounded hover:bg-gray-700 disabled:bg-gray-400"
          >
            {isUploading ? "업로드 중..." : "이미지 첨부"}
          </button>
          {/* 업로드 상태 표시 */}
          {uploadProgress && (
            <p className="text-xs text-blue-600 text-center">{uploadProgress}</p>
          )}
        </div>

        {/* 중앙: 메인 정보 영역 */}
        <div className="flex-1 min-w-0 space-y-2.5">
          {/* Row 1: 상품명, 카테고리, ID */}
          <div className="flex gap-2 items-end">
            <div className="flex-1 min-w-0">
              <label className="block text-xs text-gray-500 mb-1">상품명 *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 시금치"
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                disabled={isSubmitting}
              />
            </div>
            <div className="w-20">
              <label className="block text-xs text-gray-500 mb-1">카테고리1</label>
              <select
                value={category1Id}
                onChange={(e) => handleCategory1Change(e.target.value)}
                className="w-full px-1 py-1.5 border border-gray-300 rounded text-xs"
                disabled={isSubmitting}
              >
                <option value="">선택</option>
                {categories1.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-20">
              <label className="block text-xs text-gray-500 mb-1">카테고리2</label>
              <select
                value={category2Id}
                onChange={(e) => setCategory2Id(e.target.value)}
                className="w-full px-1 py-1.5 border border-gray-300 rounded text-xs"
                disabled={isSubmitting || !category1Id}
              >
                <option value="">선택</option>
                {filteredCategories2.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-16">
              <label className="block text-xs text-gray-500 mb-1">ID</label>
              <div className="flex gap-0.5">
                <input
                  type="text"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, "").slice(0, 2))}
                  placeholder="00"
                  maxLength={2}
                  className="w-8 px-1 py-1.5 border border-gray-300 rounded text-xs text-center"
                  disabled={isSubmitting}
                />
                <input
                  type="text"
                  value={idLetter}
                  onChange={(e) => setIdLetter(e.target.value.toLowerCase().slice(0, 1))}
                  placeholder="a"
                  maxLength={1}
                  className="w-7 px-1 py-1.5 border border-gray-300 rounded text-xs text-center"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Row 2: 단위당 가격 / 단위 */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">단위당 가격 / 단위 *</label>
              <div className="flex gap-1 items-center">
                <input
                  type="number"
                  value={pricePerUnit || ""}
                  onChange={(e) => setPricePerUnit(Number(e.target.value))}
                  placeholder="가격"
                  min={0}
                  className="w-24 px-2 py-1.5 border border-gray-300 rounded text-sm"
                  disabled={isSubmitting}
                />
                <span className="text-sm text-gray-500">원 /</span>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="100g"
                  className="w-16 px-2 py-1.5 border border-gray-300 rounded text-sm"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Row 3: 공급처 */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">공급처 *</label>
            <input
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="예: 친환경농장"
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
              disabled={isSubmitting}
            />
          </div>

          {/* Row 4: 제품 스펙 */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">제품 스펙</label>
            <input
              type="text"
              value={specifications}
              onChange={(e) => setSpecifications(e.target.value)}
              placeholder="예: 대/중/소, 매운맛, 500ml"
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
              disabled={isSubmitting}
            />
          </div>

          {/* Row 5: 유통기한, 소비기한 */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">유통기한 / 소비기한</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs"
                disabled={isSubmitting}
              />
              <input
                type="date"
                value={consumptionDeadline}
                onChange={(e) => setConsumptionDeadline(e.target.value)}
                className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Row 6: 상품 설명 */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">상품 설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="상품에 대한 설명을 입력하세요"
              rows={2}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Row 7: 태그 */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">검색 태그</label>
            <div className="flex gap-1">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="태그 입력"
                className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={isSubmitting || !tagInput.trim()}
                className="px-2 py-1.5 text-xs text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-gray-300"
              >
                추가
              </button>
            </div>
            {/* 태그 목록 */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(index)}
                      disabled={isSubmitting}
                      className="text-gray-400 hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 오른쪽: 주문/상태 정보 영역 */}
        <div className="w-44 flex-shrink-0 space-y-2.5">
          {/* Row 1: 최소 주문 수량/단위 */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">최소 주문 *</label>
            <div className="flex gap-1">
              <input
                type="number"
                value={orderMinQuantity || ""}
                onChange={(e) => setOrderMinQuantity(Number(e.target.value))}
                placeholder="수량"
                min={1}
                className="w-16 px-2 py-1.5 border border-gray-300 rounded text-xs"
                disabled={isSubmitting}
              />
              <input
                type="text"
                value={orderUnit}
                onChange={(e) => setOrderUnit(e.target.value)}
                placeholder="단위"
                className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Row 2: 최소 주문당 가격 */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">최소 주문당 가격 *</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={pricePerMinOrder || ""}
                onChange={(e) => setPricePerMinOrder(Number(e.target.value))}
                placeholder="가격"
                min={0}
                className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                disabled={isSubmitting}
              />
              <span className="text-xs text-gray-500">원</span>
            </div>
          </div>

          {/* Row 3: 추정 부피, 포장코드 */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">추정 부피 / 포장코드 *</label>
            <div className="flex gap-1">
              <input
                type="number"
                value={estimatedVolumePerMinUnit || ""}
                onChange={(e) => setEstimatedVolumePerMinUnit(Number(e.target.value))}
                placeholder="ml"
                min={0}
                className="w-16 px-2 py-1.5 border border-gray-300 rounded text-xs"
                disabled={isSubmitting}
              />
              <input
                type="text"
                value={packagingIndependenceCode}
                onChange={(e) => setPackagingIndependenceCode(e.target.value)}
                placeholder="코드"
                className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Row 4: 상태 설정 */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">상태 설정</label>
            <div className="flex gap-3 py-1">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  className="w-3.5 h-3.5 text-blue-600"
                  disabled={isSubmitting}
                />
                <span className="text-xs text-gray-600">재고</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-3.5 h-3.5 text-blue-600"
                  disabled={isSubmitting}
                />
                <span className="text-xs text-gray-600">노출</span>
              </label>
            </div>
          </div>

          {/* 버튼 영역 - 하단에 배치 */}
          <div className="pt-4 mt-auto">
            <div className="flex flex-col gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isSubmitting ? "저장 중..." : "저장"}
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="w-full px-4 py-1.5 text-xs text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 생성될 ID 미리보기 */}
      {generateProductId() && (
        <div className="mt-3 pt-2 border-t">
          <p className="text-xs text-gray-500">
            상품 ID: <span className="font-mono font-semibold text-blue-600">{generateProductId()}</span>
            {getCategory1Name() && getCategory2Name() && (
              <span className="ml-2 text-gray-400">
                ({getCategory1Name()} &gt; {getCategory2Name()})
              </span>
            )}
          </p>
        </div>
      )}

      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </form>
  );
}
