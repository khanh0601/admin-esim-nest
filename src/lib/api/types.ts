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

