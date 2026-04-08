import { algoliasearch } from "algoliasearch";

const appId = import.meta.env.VITE_ALGOLIA_APP_ID;
const searchApiKey = import.meta.env.VITE_ALGOLIA_SEARCH_API_KEY;

const client = algoliasearch(appId, searchApiKey);

const PRODUCTS_INDEX = "products";

interface AlgoliaProductHit {
  objectID: string;
}

/**
 * 검색어를 2글자 바이그램으로 분절
 * "외국산나문희" → "외국 국산 산나 나문 문희"
 * "호박 나문희" → "호박 나문 문희"
 * "귤" → "귤" (1글자는 그대로)
 */
function toBigrams(query: string): string {
  const words = query.split(/\s+/).filter(Boolean);
  const bigrams: string[] = [];

  for (const word of words) {
    if (word.length <= 2) {
      bigrams.push(word);
    } else {
      for (let i = 0; i <= word.length - 2; i++) {
        bigrams.push(word.slice(i, i + 2));
      }
    }
  }

  return [...new Set(bigrams)].join(" ");
}

/**
 * Algolia에서 상품 검색 → 매칭된 상품 ID 배열 반환
 */
export async function searchProductIds(
  query: string,
  hitsPerPage = 50,
): Promise<string[]> {
  const bigramQuery = toBigrams(query.trim());

  const result = await client.searchSingleIndex<AlgoliaProductHit>({
    indexName: PRODUCTS_INDEX,
    searchParams: {
      query: bigramQuery,
      hitsPerPage,
      attributesToRetrieve: ["objectID"],
      queryType: "prefixAll",
      optionalWords: bigramQuery.split(" "),
      typoTolerance: "strict",
    },
  });

  return result.hits.map((hit) => hit.objectID);
}
