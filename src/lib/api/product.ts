import { apiClient } from "./client";
import type { SearchProductsRequest, SearchProductsResponse } from "./types";

export const productApi = {
  /**
   * Tìm kiếm products
   * @param params - Search parameters (product_name, product_code, coverage_area, plan_type, page, limit)
   * @returns Search response với danh sách products
   */
  search: async (params: SearchProductsRequest): Promise<SearchProductsResponse> => {
    const response = await apiClient.post<SearchProductsResponse>("/products/search", params);
    return response.data as SearchProductsResponse;
  },
};

