import { algoliasearch } from "algoliasearch";

const appId = import.meta.env.VITE_ALGOLIA_APP_ID;
const searchApiKey = import.meta.env.VITE_ALGOLIA_SEARCH_API_KEY;

const client = algoliasearch(appId, searchApiKey);

const PRODUCTS_INDEX = "products";

interface AlgoliaProductHit {
  objectID: string;
}

/**
 * Algolia에서 상품 검색 → 매칭된 상품 ID 배열 반환
 */
export async function searchProductIds(
  query: string,
  hitsPerPage = 50,
): Promise<string[]> {
  const result = await client.searchSingleIndex<AlgoliaProductHit>({
    indexName: PRODUCTS_INDEX,
    searchParams: {
      query,
      hitsPerPage,
      attributesToRetrieve: ["objectID"],
      queryType: "prefixAll",
      removeWordsIfNoResults: "allOptional",
      typoTolerance: false,
    },
  });

  return result.hits.map((hit) => hit.objectID);
}
