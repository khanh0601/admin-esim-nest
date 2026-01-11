# API Service Layer

Cấu trúc tổ chức API calls tập trung trong folder `src/lib/api/`.

## Cấu trúc

```
src/lib/api/
├── client.ts      # ApiClient class - base HTTP client
├── auth.ts        # Authentication API services
├── types.ts       # TypeScript interfaces và types
├── index.ts       # Export tất cả API services
└── README.md      # Documentation
```

## Sử dụng

### 1. Import API services

```typescript
import { authApi } from "@/lib/api";
// hoặc
import { authApi } from "@/lib/api/auth";
```

### 2. Sử dụng trong components

```typescript
"use client";

import { authApi } from "@/lib/api";
import type { ApiError } from "@/lib/api/types";

const handleLogin = async () => {
  try {
    const data = await authApi.login({ account: "esim123", password: "123456" });
    // Xử lý response
  } catch (error) {
    const apiError = error as ApiError;
    console.error(apiError.message);
  }
};
```

## ApiClient

`ApiClient` là base HTTP client class cung cấp các methods:
- `get<T>(endpoint, options?)` - GET request
- `post<T>(endpoint, body?, options?)` - POST request
- `put<T>(endpoint, body?, options?)` - PUT request
- `patch<T>(endpoint, body?, options?)` - PATCH request
- `delete<T>(endpoint, options?)` - DELETE request

### Features

- Tự động thêm `Authorization: Bearer <token>` header từ cookie
- Tự động xử lý errors và throw `ApiError`
- Parse JSON responses
- Type-safe với TypeScript generics

## API Services

### authApi

Authentication related APIs:

- `login(credentials: LoginRequest): Promise<LoginResponse>` - Đăng nhập
- `logout(): Promise<void>` - Đăng xuất
- `getCurrentUser(): Promise<User>` - Lấy thông tin user hiện tại
- `refreshToken(): Promise<RefreshTokenResponse>` - Refresh access token

## Types

### LoginRequest

```typescript
interface LoginRequest {
  account: string;
  password: string;
}
```

### LoginResponse

```typescript
interface LoginResponse {
  token?: string;
  refreshToken?: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
  message?: string;
  error?: string;
}
```

### ApiError

```typescript
interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}
```

## Best Practices

1. **Luôn sử dụng API services thay vì fetch trực tiếp**
   - ✅ Đúng: `await authApi.login({ account, password })`
   - ❌ Sai: `await fetch(`${API_URL}/login`, ...)`

2. **Xử lý errors đúng cách**
   ```typescript
   try {
     const data = await authApi.login(credentials);
   } catch (error) {
     const apiError = error as ApiError;
     // Xử lý error
   }
   ```

3. **Sử dụng TypeScript types**
   - Import types từ `@/lib/api/types`
   - Sử dụng generics khi cần type safety

4. **Tổ chức API services theo domain**
   - Tạo file riêng cho mỗi domain (auth.ts, user.ts, product.ts, ...)
   - Export tất cả từ `index.ts`

## Thêm API service mới

1. Tạo file mới trong `src/lib/api/` (ví dụ: `user.ts`)
2. Import `apiClient` từ `./client`
3. Export service object với các methods
4. Export từ `index.ts`

Ví dụ:

```typescript
// src/lib/api/user.ts
import { apiClient } from "./client";

export const userApi = {
  getProfile: async () => {
    const response = await apiClient.get("/user/profile");
    return response.data;
  },
  
  updateProfile: async (data: UpdateProfileRequest) => {
    const response = await apiClient.put("/user/profile", data);
    return response.data;
  },
};
```

```typescript
// src/lib/api/index.ts
export { userApi } from "./user";
```
