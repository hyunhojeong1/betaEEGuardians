import { httpsCallable } from "firebase/functions";
import { functions } from "@/services/firebase";
import type { Category1, Category2 } from "@/types/product";

interface AddCategoryResponse {
  success: boolean;
  message: string;
}

interface GetCategoriesResponse {
  categories1: Category1[];
  categories2: Category2[];
}

/**
 * 카테고리1 추가
 */
export async function addCategory1(
  data: Omit<Category1, "">
): Promise<AddCategoryResponse> {
  const addCategory1Fn = httpsCallable<typeof data, AddCategoryResponse>(
    functions,
    "addCategory1"
  );

  const result = await addCategory1Fn(data);
  return result.data;
}

/**
 * 카테고리2 추가
 */
export async function addCategory2(
  data: Omit<Category2, "">
): Promise<AddCategoryResponse> {
  const addCategory2Fn = httpsCallable<typeof data, AddCategoryResponse>(
    functions,
    "addCategory2"
  );

  const result = await addCategory2Fn(data);
  return result.data;
}

/**
 * 카테고리1, 2 조회
 */
export async function getCategories(): Promise<GetCategoriesResponse> {
  const getCategoriesFn = httpsCallable<void, GetCategoriesResponse>(
    functions,
    "getCategories"
  );

  const result = await getCategoriesFn();
  return result.data;
}
