import { apiClient } from "./client";
import type { SearchProductsRequest, SearchProductsResponse, GetProductsRequest, GetProductsResponse, Product, ListCoverageResponse } from "./types";

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

  /**
   * Lấy danh sách products
   * @param params - Query parameters (limit, page, sort, name, day, plan_type, product_type, coverage)
   * @returns Response với danh sách products
   */
  list: async (params: GetProductsRequest = {}): Promise<GetProductsResponse> => {
    const { limit = 10, page = 1, sort = "desc", name, day, plan_type, product_type, coverage } = params;
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      page: page.toString(),
      sort: sort,
    });
    
    // Thêm các search params nếu có
    if (name) queryParams.append("name", name);
    if (day !== undefined && day !== null) queryParams.append("day", day.toString());
    if (plan_type !== undefined && plan_type !== null) queryParams.append("plan_type", plan_type.toString());
    if (product_type) queryParams.append("product_type", product_type);
    if (coverage) queryParams.append("coverage", coverage);
    
    const response = await apiClient.get<GetProductsResponse>(`/product/list?${queryParams.toString()}`);
    return response.data as GetProductsResponse;
  },

  /**
   * Tạo sản phẩm mới
   * @param product - Thông tin sản phẩm cần tạo
   * @returns Response với sản phẩm đã tạo
   */
  create: async (product: Product): Promise<{ data?: Product; message?: string }> => {
    const response = await apiClient.post<{ data?: Product; message?: string }>("/product/create", product);
    return response.data ?? {};
  },

  /**
   * Cập nhật sản phẩm
   * @param product - Thông tin sản phẩm cần cập nhật
   * @returns Response với sản phẩm đã cập nhật
   */
  update: async (product: Product): Promise<{ data?: Product; message?: string }> => {
    const response = await apiClient.patch<{ data?: Product; message?: string }>("/product/update", product);
    return response.data ?? {};
  },

  /**
   * Xóa sản phẩm (1 hoặc nhiều)
   * @param id - ID của sản phẩm cần xóa (có thể là 1 id hoặc mảng ids)
   * @returns Response với thông báo
   */
  delete: async (id: number | string | (number | string)[]): Promise<{ message?: string; error?: string }> => {
    // Nếu là array, map thành [{ id: 1 }, { id: 2 }]
    // Nếu là single id, chuyển thành [{ id: 1 }]
    const ids = Array.isArray(id) ? id : [id];
    const payload = ids.map((item) => ({ id: Number(item) }));
    const response = await apiClient.delete<{ message?: string; error?: string }>("/product/deleted_list", payload);
    return response.data ?? {};
  },

  /**
   * Lấy danh sách coverage areas
   * @returns Response với danh sách coverage areas
   */
  listCoverage: async (): Promise<ListCoverageResponse> => {
    const response = await apiClient.get<ListCoverageResponse>("/product/list_coverage");
    return response.data as ListCoverageResponse;
  },

  /**
   * Import sản phẩm từ file CSV
   * @param file - File CSV cần import
   * @returns Response với thông báo
   */
  import: async (file: File): Promise<{ message?: string; error?: string; data?: unknown }> => {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await apiClient.post<{ message?: string; error?: string; data?: unknown }>(
      "/product/import_product",
      formData
    );
    return response.data ?? {};
  },
};
