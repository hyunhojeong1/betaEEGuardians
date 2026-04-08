import { httpsCallable } from "firebase/functions";
import { functions } from "@/services/firebase";

interface AddProductRequest {
  id: string;
  name: string;
  category1Id: string;
  category2Id: string;
  imageUrl: string;
  pricePerUnit: number;
  unit: string;
  supplier: string;
  description?: string;
  inStock: boolean;
  isActive: boolean;
  orderMinQuantity: number;
  orderUnit: string;
  pricePerMinOrder: number;
  estimatedVolumePerMinUnit: number;
  packagingIndependenceCode: string;
  tags: string[];
  specifications?: string;
  recommend?: boolean;
  useDetailImageYN?: boolean;
  detail1ImageUrl?: string;
  detail2ImageUrl?: string;
  detail3ImageUrl?: string;
}

interface AddProductResponse {
  success: boolean;
  message: string;
  isUpdate: boolean;
}

export interface ProductData {
  id: string;
  name: string;
  category1Id: string;
  category2Id: string;
  imageUrl: string;
  pricePerUnit: number;
  unit: string;
  supplier: string;
  description?: string;
  inStock: boolean;
  isActive: boolean;
  orderMinQuantity: number;
  orderUnit: string;
  pricePerMinOrder: number;
  estimatedVolumePerMinUnit: number;
  packagingIndependenceCode: string;
  tags: string[];
  specifications?: string;
  recommend?: boolean;
  useDetailImageYN?: boolean;
  detail1ImageUrl?: string;
  detail2ImageUrl?: string;
  detail3ImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface GetProductsRequest {
  category1Id?: string;
  category2Id?: string;
  recommendOnly?: boolean;
  limit?: number;
  startAfterId?: string;
}

interface GetProductsResponse {
  products: ProductData[];
  hasMore: boolean;
}

interface GetProductsByIdsRequest {
  ids: string[];
}

interface GetProductsByIdsResponse {
  products: ProductData[];
}

/**
 * 상품 추가/수정
 */
export async function addProduct(
  data: AddProductRequest
): Promise<AddProductResponse> {
  const addProductFn = httpsCallable<AddProductRequest, AddProductResponse>(
    functions,
    "addProduct"
  );

  const result = await addProductFn(data);
  return result.data;
}

/**
 * 상품 목록 조회 (카테고리 필터링 + 페이지네이션)
 */
export async function getProducts(
  category1Id?: string,
  category2Id?: string,
  startAfterId?: string,
  limit?: number,
  recommendOnly?: boolean,
): Promise<{ products: ProductData[]; hasMore: boolean }> {
  const getProductsFn = httpsCallable<GetProductsRequest, GetProductsResponse>(
    functions,
    "getProducts"
  );

  const result = await getProductsFn({ category1Id, category2Id, recommendOnly, startAfterId, limit });
  return result.data;
}

/**
 * 상품 ID 배열로 조회 (Algolia 검색 결과 → Firestore 데이터 조회용)
 */
export async function getProductsByIds(ids: string[]): Promise<ProductData[]> {
  if (ids.length === 0) return [];

  const fn = httpsCallable<GetProductsByIdsRequest, GetProductsByIdsResponse>(
    functions,
    "getProductsByIds"
  );

  const result = await fn({ ids });
  return result.data.products;
}

interface DeleteProductRequest {
  productId: string;
}

interface DeleteProductResponse {
  success: boolean;
  message: string;
}

/**
 * 상품 삭제 (Staff 전용)
 */
export async function deleteProduct(productId: string): Promise<DeleteProductResponse> {
  const deleteProductFn = httpsCallable<DeleteProductRequest, DeleteProductResponse>(
    functions,
    "deleteProduct"
  );

  const result = await deleteProductFn({ productId });
  return result.data;
}
