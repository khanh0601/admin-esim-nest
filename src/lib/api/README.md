# API Service Structure

Cấu trúc API service được thiết kế để dễ dàng gọi API từ external server và có thể tái sử dụng cho nhiều màn hình.

## Cấu trúc

```
src/lib/api/
├── index.ts          # Export tất cả services
├── types.ts          # TypeScript types cho API
├── client.ts         # API client chung (base class)
└── auth.ts           # Auth API services
```

## Setup

### 1. Environment Variables

Thêm vào file `.env.local`:

```env
# External API URL
NEXT_PUBLIC_EXTERNAL_API_URL=https://your-api-domain.com/api
```

### 2. Sử dụng trong component

```typescript
import { authApi } from "@/lib/api/auth";

// Login
try {
  const response = await authApi.login({ 
    email: "user@example.com", 
    password: "password123" 
  });
  // Handle success
} catch (error) {
  // Handle error
}
```

## Tạo service mới

Để tạo service mới cho module khác (ví dụ: products, orders):

1. Tạo file `src/lib/api/products.ts`:

```typescript
import { apiClient } from "./client";

export const productsApi = {
  getAll: async () => {
    const response = await apiClient.get("/products");
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },
  
  create: async (data: CreateProductRequest) => {
    const response = await apiClient.post("/products", data);
    return response.data;
  },
};
```

2. Export từ `src/lib/api/index.ts`:

```typescript
export { productsApi } from "./products";
```

3. Sử dụng trong component:

```typescript
import { productsApi } from "@/lib/api";

const products = await productsApi.getAll();
```

## API Client

`apiClient` tự động:
- Thêm `Content-Type: application/json` header
- Thêm `Authorization: Bearer <token>` từ cookie (nếu có)
- Xử lý errors và throw `ApiError`
- Parse JSON responses

## Notes

- Tất cả API calls đều gọi trực tiếp external API (không qua Next.js API routes)
- Token được lưu trong cookie (set từ client-side)
- API client tự động thêm token vào header khi gọi API

