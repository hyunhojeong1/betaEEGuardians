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
  expiryDate?: string;
  consumptionDeadline?: string;
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
  expiryDate?: string;
  consumptionDeadline?: string;
  createdAt: string;
  updatedAt: string;
}

interface GetProductsRequest {
  category1Id?: string;
  category2Id?: string;
}

interface GetProductsResponse {
  products: ProductData[];
}

interface SearchProductsRequest {
  query: string;
}

interface SearchProductsResponse {
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
 * 상품 목록 조회 (카테고리 필터링)
 */
export async function getProducts(
  category1Id?: string,
  category2Id?: string
): Promise<ProductData[]> {
  const getProductsFn = httpsCallable<GetProductsRequest, GetProductsResponse>(
    functions,
    "getProducts"
  );

  const result = await getProductsFn({ category1Id, category2Id });
  return result.data.products;
}

/**
 * 상품 검색 (태그 매칭)
 */
export async function searchProducts(query: string): Promise<ProductData[]> {
  const searchProductsFn = httpsCallable<SearchProductsRequest, SearchProductsResponse>(
    functions,
    "searchProducts"
  );

  const result = await searchProductsFn({ query });
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
