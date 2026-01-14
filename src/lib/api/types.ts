// API Response Types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  status?: number;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// Auth Types
export interface LoginRequest {
  account: string;
  password: string;
}

export interface LoginResponse {
  message?: string;
  error?: string;
  token?: string | { Token?: string };
  refreshToken?: string;
  role?: number;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface RefreshTokenResponse {
  token?: string;
  refreshToken?: string;
  message?: string;
}

// Register Types
export interface RegisterRequest {
  account: string;
  password: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export interface RegisterResponse {
  message?: string;
  error?: string;
  token?: string | { Token?: string };
  refreshToken?: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

// User Profile Types
export interface UserProfile {
  id: number;
  account: string;
  password: string;
  token: string;
  email: string;
  role: number;
  first_name?: string;
  last_name?: string;
  ip: string;
  redeem_call_back_url?: string;
  order_call_back_url?: string;
  top_up_call_back_url?: string;
  create_at: string;
  update_at: string;
}

export interface UserProfileResponse {
  data: UserProfile;
  ip?: string;
}

export interface UpdateProfileRequest {
  redeem_call_back_url?: string;
  order_call_back_url?: string;
  top_up_call_back_url?: string;
  first_name?: string;
  last_name?: string;
}

export interface UpdateProfileResponse {
  message?: string;
  error?: string;
  data?: UserProfile;
}

// Product Types
export interface Product {
  id?: number | string; // ID của product (optional, có thể là number hoặc string)
  supplier: string;
  product_code: string;
  product_type: string;
  product_name_vi: string;
  product_name_en: string;
  sale_price: number;
  days: number;
  plan_type: number;
  data: string;
  network_types: string;
  coverage_area_en: string;
  coverage_area_vi: string;
  telecommunication_providers: string;
  notification_en: string;
  notification_vi: string;
  data_reset_date_reset_en: string;
  data_reset_date_reset_vi: string;
  prepaid_card: string;
  apn: string;
  roaming_carrier: string;
  sms: number;
  receive: number;
  call: number;
  tiktok: number;
  chat_gpt: number;
}

export interface SearchProductsRequest {
  product_name?: string;
  product_code?: string;
  coverage_area?: string;
  plan_type?: number;
  product_type?: string;
  page?: number;
  limit?: number;
}

export interface SearchProductsResponse {
  data?: Product[];
  total?: number;
  page?: number;
  limit?: number;
  message?: string;
  error?: string;
}

export interface GetProductsRequest {
  limit?: number;
  page?: number;
  sort?: "asc" | "desc";
  name?: string;
  day?: number;
  plan_type?: number;
  product_type?: string;
  coverage?: string;
}

export interface GetProductsResponse {
  data?: Product[];
  total?: number;
  page?: number;
  limit?: number;
  message?: string;
  error?: string;
}

export interface ListCoverageResponse {
  data?: Array<{
    coverage_area_vi: string | null;
  }>;
  message?: string;
  error?: string;
}