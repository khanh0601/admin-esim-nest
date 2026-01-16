"use client";
import { useState, useRef, useEffect } from "react";
import { useAuthStore, useCartStore } from "@/lib/stores";
import { productApi, userApi } from "@/lib/api";
import type { Product, ApiError } from "@/lib/api/types";
import toast from "react-hot-toast";

const pageSize = 10;

// Helper function để map plan_type
const getPlanTypeLabel = (planType: number): string => {
  switch (planType) {
    case 1:
      return "Gói theo ngày";
    case 2:
      return "Gói theo thời hạn";
    case 3:
      return "Gói không giới hạn";
    default:
      return "-";
  }
};

// Helper function để convert 1/0 thành True/False
const formatBoolean = (value: number): string => {
  return value === 1 ? "True" : "False";
};

// Cart Button Component
function CartButton() {
  const { openCart, getTotalItems } = useCartStore();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = mounted ? getTotalItems() : 0;

  return (
    <button 
      onClick={openCart}
      className="relative px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      Cart
      {mounted && totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {totalItems}
        </span>
      )}
    </button>
  );
}

// Cart Sidebar Component
function CartSidebar() {
  const { isOpen, items, closeCart, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [showSimNumModal, setShowSimNumModal] = useState(false);
  const [simNums, setSimNums] = useState<Record<string, string[]>>({});
  const [simNumErrors, setSimNumErrors] = useState<Record<string, string>>({});

  // Load user email as default when opening email modal
  useEffect(() => {
    const loadUserEmail = async () => {
      if (showEmailModal) {
        try {
          const response = await userApi.getProfile();
          if (response.data?.email && !email) {
            setEmail(response.data.email);
          }
        } catch (error) {
          console.error("Failed to load user email:", error);
        }
      }
    };
    
    loadUserEmail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showEmailModal]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleOpenEmailModal = () => {
    if (items.length === 0) {
      toast.error("Giỏ hàng trống!");
      return;
    }
    
    // Kiểm tra xem có sản phẩm Top-Up SIM không
    const topUpSimItems = items.filter(item => item.product_type === "Top-Up SIM");
    
    if (topUpSimItems.length > 0) {
      // Nếu có Top-Up SIM, hiển thị popup nhập simNum trước
      const initialSimNums: Record<string, string[]> = {};
      topUpSimItems.forEach(item => {
        if (item.id) {
          initialSimNums[String(item.id)] = Array(item.quantity).fill("");
        }
      });
      setSimNums(initialSimNums);
      setSimNumErrors({});
      setShowSimNumModal(true);
    } else {
      // Nếu không có Top-Up SIM, mở email modal trực tiếp
      setShowEmailModal(true);
      setEmailError("");
    }
  };

  const handleCloseEmailModal = () => {
    setShowEmailModal(false);
    setEmail("");
    setEmailError("");
    // Reset simNums khi đóng email modal
    handleCloseSimNumModal();
  };

  const handleCloseSimNumModal = () => {
    setShowSimNumModal(false);
    setSimNums({});
    setSimNumErrors({});
  };

  const handleSimNumChange = (productId: string, index: number, value: string) => {
    setSimNums(prev => ({
      ...prev,
      [productId]: prev[productId]?.map((simNum, i) => i === index ? value : simNum) || []
    }));
    // Clear error when user types
    if (simNumErrors[`${productId}_${index}`]) {
      setSimNumErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${productId}_${index}`];
        return newErrors;
      });
    }
  };

  const handleConfirmSimNums = () => {
    // Validate all simNums are filled
    const errors: Record<string, string> = {};
    let hasError = false;

    Object.keys(simNums).forEach(productId => {
      simNums[productId].forEach((simNum, index) => {
        if (!simNum.trim()) {
          errors[`${productId}_${index}`] = "Vui lòng nhập số SIM!";
          hasError = true;
        }
      });
    });

    if (hasError) {
      setSimNumErrors(errors);
      return;
    }

    // All valid, close simNum modal and open email modal
    setShowSimNumModal(false);
    setShowEmailModal(true);
    setEmailError("");
  };

  const handleCheckout = async () => {
    // Validate email
    if (!email.trim()) {
      setEmailError("Vui lòng nhập email!");
      return;
    }

    if (!validateEmail(email.trim())) {
      setEmailError("Email không hợp lệ!");
      return;
    }

    try {
      setIsCheckingOut(true);
      setEmailError("");

      // Phân loại sản phẩm
      const esimItems = items.filter(item => item.product_type === "eSIM" || !item.product_type);
      const topUpSimItems = items.filter(item => item.product_type === "Top-Up SIM");

      // Xử lý đơn hàng eSIM (nếu có)
      if (esimItems.length > 0) {
        const esimProdList = esimItems.map((item) => ({
          wmproductId: item.product_code,
          qty: item.quantity,
        }));

        const esimResponse = await productApi.order({
          email: email.trim(),
          prodList: esimProdList,
        });

        if (esimResponse.error) {
          toast.error(esimResponse.error || "Đặt hàng eSIM thất bại!");
          return;
        }
      }

      // Xử lý đơn hàng Top-Up SIM (nếu có)
      if (topUpSimItems.length > 0) {
        const topUpSimProdList: Array<{
          wmproductId: string;
          day: number;
          simNum: string;
        }> = [];

        topUpSimItems.forEach(item => {
          if (item.id && simNums[String(item.id)]) {
            simNums[String(item.id)].forEach(simNum => {
              topUpSimProdList.push({
                wmproductId: item.product_code,
                day: item.days || 1,
                simNum: simNum.trim(),
              });
            });
          }
        });

        const topUpSimResponse = await productApi.orderTopUpSim({
          email: email.trim(),
          prodList: topUpSimProdList,
        });

        if (topUpSimResponse.error) {
          toast.error(topUpSimResponse.error || "Đặt hàng Top-Up SIM thất bại!");
          return;
        }
      }

      // Success
      const successMessage = 
        esimItems.length > 0 && topUpSimItems.length > 0
          ? "Đặt hàng thành công!"
          : esimItems.length > 0
          ? "Đặt hàng eSIM thành công!"
          : "Đặt hàng Top-Up SIM thành công!";
      
      toast.success(successMessage);
      clearCart();
      handleCloseEmailModal();
      handleCloseSimNumModal();
      closeCart();
    } catch (error) {
      console.error("Checkout error:", error);
      const apiError = error as ApiError;
      toast.error(apiError.message || "Đặt hàng thất bại. Vui lòng thử lại!");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={closeCart}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Giỏ hàng</h2>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-lg font-medium">Giỏ hàng trống</p>
              <p className="text-sm mt-2">Thêm sản phẩm vào giỏ hàng để tiếp tục</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">
                      {item.product_name_vi || item.product_name_en || item.product_code}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{item.product_code}</p>
                    <p className="text-lg font-semibold text-teal-600">
                      {item.sale_price.toLocaleString('vi-VN')} đ
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => item.id && removeItem(item.id)}
                      className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                      title="Xóa"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => item.id && updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="w-10 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => item.id && updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Tổng cộng:</span>
              <span className="text-xl font-bold text-teal-600">
                {getTotalPrice().toLocaleString('vi-VN')} đ
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={clearCart}
                className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Xóa tất cả
              </button>
              <button
                onClick={handleOpenEmailModal}
                className="flex-1 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
              >
                Thanh toán
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SimNum Modal for Top-Up SIM */}
      {showSimNumModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Nhập số SIM cho Top-Up SIM</h3>
              <button
                onClick={handleCloseSimNumModal}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4 space-y-4">
              {items
                .filter(item => item.product_type === "Top-Up SIM")
                .map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="mb-3">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {item.product_name_vi || item.product_name_en || item.product_code}
                      </h4>
                      <p className="text-sm text-gray-600">Mã sản phẩm: {item.product_code}</p>
                      <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                    </div>
                    <div className="space-y-2">
                      {item.id && simNums[String(item.id)]?.map((simNum, index) => (
                        <div key={index}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Số SIM {index + 1} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={simNum}
                            onChange={(e) => handleSimNumChange(String(item.id), index, e.target.value)}
                            placeholder={`Nhập số SIM ${index + 1}`}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all ${
                              simNumErrors[`${item.id}_${index}`]
                                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                : "border-gray-300"
                            }`}
                          />
                          {simNumErrors[`${item.id}_${index}`] && (
                            <p className="mt-1 text-sm text-red-600">{simNumErrors[`${item.id}_${index}`]}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCloseSimNumModal}
                className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmSimNums}
                className="flex-1 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
              >
                Tiếp tục
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Nhập email để thanh toán</h3>
              <button
                onClick={handleCloseEmailModal}
                disabled={isCheckingOut}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <label htmlFor="checkout-email" className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="checkout-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}
                placeholder="Nhập email của bạn"
                disabled={isCheckingOut}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all ${
                  emailError
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300"
                } ${isCheckingOut ? "bg-gray-50 cursor-not-allowed" : ""}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isCheckingOut) {
                    handleCheckout();
                  }
                }}
              />
              {emailError && (
                <p className="mt-1 text-sm text-red-600">{emailError}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCloseEmailModal}
                disabled={isCheckingOut}
                className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="flex-1 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCheckingOut ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xử lý...
                  </>
                ) : (
                  "Xác nhận"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function MyQuotation() {
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpToPage, setJumpToPage] = useState<string>("");
  const [productName, setProductName] = useState("");
  const [days, setDays] = useState<number | "">("");
  const [coverageArea, setCoverageArea] = useState("");
  const [planType, setPlanType] = useState<number | "">("");
  const [productType, setProductType] = useState<string>("");
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Confirm delete modal state
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    product: Product | null;
    isMultiple: boolean;
    count?: number;
  }>({
    isOpen: false,
    product: null,
    isMultiple: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { role } = useAuthStore();
  const { addItem, isInCart } = useCartStore();

  // Create product form state
  const [formData, setFormData] = useState<Partial<Product> & {
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
  }>({
    supplier: "Simnet", // Mặc định là Simnet
    product_code: "",
    product_type: "",
    product_name_vi: "",
    product_name_en: "",
    sale_price: 0,
    days: 0,
    plan_type: 1,
    data: "",
    network_types: "",
    coverage_area_en: "",
    coverage_area_vi: "",
    telecommunication_providers: "",
    notification_en: "",
    notification_vi: "",
    data_reset_date_reset_en: "",
    data_reset_date_reset_vi: "",
    prepaid_card: "",
    apn: "",
    roaming_carrier: "",
    sms: 0,
    receive: 0,
    call: 0,
    tiktok: 0,
    chat_gpt: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API states
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [coverageAreas, setCoverageAreas] = useState<string[]>([]);

  // Load products từ API khi component mount và khi page thay đổi
  const loadProducts = async (page: number = currentPage, isInitial: boolean = false, searchParams?: {
    name?: string;
    day?: number;
    plan_type?: number;
    product_type?: string;
    coverage?: string;
  }) => {
    try {
      if (isInitial) {
        setIsInitialLoading(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      // Sử dụng searchParams nếu được truyền vào, nếu không thì dùng state hiện tại
      const params = {
        limit: pageSize,
        page: page,
        sort: "desc" as const,
        ...(searchParams || {
          ...(productName && { name: productName }),
          ...(days !== "" && days !== null && days !== undefined && { day: Number(days) }),
          ...(planType !== "" && planType !== null && planType !== undefined && { plan_type: Number(planType) }),
          ...(productType && { product_type: productType }),
          ...(coverageArea && { coverage: coverageArea }),
        }),
      };

      const response = await productApi.list(params);

      if (response.data) {
        setProducts(response.data);
        // total từ API là số lượng page, không phải số lượng product
        // totalPages = total (từ API)
        // totalItems = totalPages * limit (ước tính số product)
        if (response.total) {
          setTotalPages(response.total);
          setTotalItems(response.total * pageSize);
        } else {
          // Fallback: nếu không có total, tính từ data length
          setTotalPages(1);
          setTotalItems(response.data.length);
        }
      } else {
        setProducts([]);
        setTotalPages(0);
        setTotalItems(0);
      }
    } catch (err) {
      console.error("Load products error:", err);
      const apiError = err as ApiError;
      const errorMessage = apiError.message || "Failed to load products";
      setError(errorMessage);
      toast.error(errorMessage);
      setProducts([]);
      setTotalItems(0);
    } finally {
      if (isInitial) {
        setIsInitialLoading(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  // Load coverage areas từ API
  const loadCoverageAreas = async () => {
    try {
      const response = await productApi.listCoverage();
      if (response.data && Array.isArray(response.data)) {
        // Extract coverage_area_vi từ các object và filter ra null values
        const areas = response.data
          .map((item) => item.coverage_area_vi)
          .filter((area): area is string => area !== null && area !== undefined);
        // Remove duplicates và sort
        const uniqueAreas = Array.from(new Set(areas)).sort();
        setCoverageAreas(uniqueAreas);
      }
    } catch (err) {
      console.error("Load coverage areas error:", err);
      // Không hiển thị error toast vì đây không phải là critical feature
    }
  };

  // Load products và coverage areas khi component mount
  useEffect(() => {
    loadProducts(1, true);
    loadCoverageAreas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // totalPages đã được set từ API response (total từ API là số page)
  
  // Dùng trực tiếp products từ API (đã được paginate ở server)
  // Không cần client-side pagination nữa
  const displayProducts = products;

  const handleSearch = async () => {
    // Reload products từ API với search params hiện tại
    // Không set loading state cho search button
    setCurrentPage(1);
    await loadProducts(1, false);
  };

  const handleReset = () => {
    setProductName("");
    setDays("");
    setCoverageArea("");
    setPlanType("");
    setProductType("");
    setCurrentPage(1);
    setError(null);
    // Reload products từ API không có search params
    loadProducts(1, false, {});
  };

  const handleAdd = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    // Reset form
    setFormData({
      supplier: "Simnet", // Mặc định là Simnet
      product_code: "",
      product_type: "",
      product_name_vi: "",
      product_name_en: "",
      sale_price: 0,
      days: 0,
      plan_type: 1,
      data: "",
      network_types: "",
      coverage_area_en: "",
      coverage_area_vi: "",
      telecommunication_providers: "",
      notification_en: "",
      notification_vi: "",
      data_reset_date_reset_en: "",
      data_reset_date_reset_vi: "",
      prepaid_card: "",
      apn: "",
      roaming_carrier: "",
      sms: 0,
      receive: 0,
      call: 0,
      tiktok: 0,
      chat_gpt: 0,
    });
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await productApi.create(formData as Product);
      if (response.data || response.message) {
        // Success - đóng modal trước, sau đó refresh và hiện thông báo
        handleCloseCreateModal();
        await loadProducts(1);
        toast.success("Product created successfully!");
      } else {
        setError("Failed to create product");
        toast.error("Failed to create product");
      }
    } catch (err) {
      console.error("Create product error:", err);
      const apiError = err as ApiError;
      const errorMessage = apiError.message || "Failed to create product";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormChange = (field: keyof Product, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEdit = (item: Product) => {
    // Set product đang edit và mở modal
    setEditingProduct(item);
    // Populate form với data của product
    setFormData({
      supplier: item.supplier || "Simnet",
      product_code: item.product_code || "",
      product_type: item.product_type || "",
      product_name_vi: item.product_name_vi || "",
      product_name_en: item.product_name_en || "",
      sale_price: item.sale_price || 0,
      days: item.days || 0,
      plan_type: item.plan_type || 1,
      data: item.data || "",
      network_types: item.network_types || "",
      coverage_area_en: item.coverage_area_en || "",
      coverage_area_vi: item.coverage_area_vi || "",
      telecommunication_providers: item.telecommunication_providers || "",
      notification_en: item.notification_en || "",
      notification_vi: item.notification_vi || "",
      data_reset_date_reset_en: item.data_reset_date_reset_en || "",
      data_reset_date_reset_vi: item.data_reset_date_reset_vi || "",
      prepaid_card: item.prepaid_card || "",
      apn: item.apn || "",
      roaming_carrier: item.roaming_carrier || "",
      sms: item.sms || 0,
      receive: item.receive || 0,
      call: item.call || 0,
      tiktok: item.tiktok || 0,
      chat_gpt: item.chat_gpt || 0,
    });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingProduct(null);
    // Reset form
    setFormData({
      supplier: "Simnet",
      product_code: "",
      product_type: "",
      product_name_vi: "",
      product_name_en: "",
      sale_price: 0,
      days: 0,
      plan_type: 1,
      data: "",
      network_types: "",
      coverage_area_en: "",
      coverage_area_vi: "",
      telecommunication_providers: "",
      notification_en: "",
      notification_vi: "",
      data_reset_date_reset_en: "",
      data_reset_date_reset_vi: "",
      prepaid_card: "",
      apn: "",
      roaming_carrier: "",
      sms: 0,
      receive: 0,
      call: 0,
      tiktok: 0,
      chat_gpt: 0,
    });
  };

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Gửi formData kèm id của product đang edit
      const updateData: Product = {
        ...(formData as Product),
        id: editingProduct.id, // Thêm id từ product đang edit
      };
      
      const response = await productApi.update(updateData);
      if (response.data || response.message) {
        // Success - đóng modal trước, sau đó refresh và hiện thông báo
        handleCloseEditModal();
        await loadProducts(currentPage);
        toast.success("Product updated successfully!");
      } else {
        setError("Failed to update product");
        toast.error("Failed to update product");
      }
    } catch (err) {
      console.error("Update product error:", err);
      const apiError = err as ApiError;
      const errorMessage = apiError.message || "Failed to update product";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (item: Product) => {
    if (!item.id) {
      toast.error("Product ID is missing");
      return;
    }
    // Mở confirm dialog
    setConfirmDelete({
      isOpen: true,
      product: item,
      isMultiple: false,
    });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete.product?.id) {
      setConfirmDelete({ isOpen: false, product: null, isMultiple: false });
      return;
    }

    try {
      setIsLoading(true);
      const response = await productApi.delete(confirmDelete.product.id);
      
      if (response.message || !response.error) {
        toast.success("Product deleted successfully!");
        // Refresh product list
        await loadProducts(currentPage);
        // Clear selection if this item was selected
        setSelectedItems(new Set());
      } else {
        toast.error(response.error || "Failed to delete product");
      }
    } catch (err) {
      console.error("Delete product error:", err);
      const apiError = err as ApiError;
      toast.error(apiError.message || "Failed to delete product");
    } finally {
      setIsLoading(false);
      setConfirmDelete({ isOpen: false, product: null, isMultiple: false });
    }
  };

  const handleToggleSelect = (index: number) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === products.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(products.map((_, index) => index)));
    }
  };

  const handleDeleteSelected = () => {
    const selectedCount = selectedItems.size;
    if (selectedCount === 0) return;
    
    // Mở confirm dialog
    setConfirmDelete({
      isOpen: true,
      product: null,
      isMultiple: true,
      count: selectedCount,
    });
  };

  const handleConfirmDeleteSelected = async () => {
    const selectedCount = confirmDelete.count || 0;
    if (selectedCount === 0) {
      setConfirmDelete({ isOpen: false, product: null, isMultiple: false });
      return;
    }

    try {
      setIsLoading(true);
      // Lấy danh sách products được chọn
      const selectedProducts = Array.from(selectedItems)
        .map((index) => products[index])
        .filter((item) => item && item.id); // Chỉ lấy những item có id

      if (selectedProducts.length === 0) {
        toast.error("No valid products selected");
        setConfirmDelete({ isOpen: false, product: null, isMultiple: false });
        return;
      }

      // Xóa nhiều sản phẩm trong 1 lần gọi API
      const idsToDelete = selectedProducts.map((item) => item.id!);
      await productApi.delete(idsToDelete);
      
      toast.success(`${selectedCount} product(s) deleted successfully!`);
      // Refresh product list
      await loadProducts(currentPage);
      // Clear selection
      setSelectedItems(new Set());
    } catch (err) {
      console.error("Delete products error:", err);
      const apiError = err as ApiError;
      toast.error(apiError.message || "Failed to delete products");
    } finally {
      setIsLoading(false);
      setConfirmDelete({ isOpen: false, product: null, isMultiple: false });
    }
  };

  const handleImportClick = () => {
    setIsImportModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsImportModalOpen(false);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmitImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select a CSV file");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await productApi.import(selectedFile);
      if (response.message || response.data) {
        // Success - đóng modal trước, sau đó refresh và hiện thông báo
        handleCloseModal();
        await loadProducts(1);
        toast.success(response.message || "Products imported successfully!");
      } else {
        toast.error(response.error || "Failed to import products");
      }
    } catch (err) {
      console.error("Import products error:", err);
      const apiError = err as ApiError;
      const errorMessage = apiError.message || "Failed to import products";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 w-full">
      {/* Search Filters */}
      <div className="mb-6 space-y-4 w-full">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div>
              <label htmlFor="product-name" className="block text-sm font-medium text-gray-700 mb-2">
                Product Name
              </label>
              <input
                id="product-name"
                type="text"
                placeholder="Enter product name"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div>
              <label htmlFor="days" className="block text-sm font-medium text-gray-700 mb-2">
                Days
              </label>
              <input
                id="days"
                type="number"
                placeholder="Enter days"
                min="0"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                value={days}
                onChange={(e) => setDays(e.target.value === "" ? "" : Number(e.target.value))}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div>
              <label htmlFor="coverage-area" className="block text-sm font-medium text-gray-700 mb-2">
                Coverage Area
              </label>
              <select
                id="coverage-area"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
                value={coverageArea}
                onChange={(e) => setCoverageArea(e.target.value)}
              >
                <option value="">All Coverage Areas</option>
                {coverageAreas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="plan-type" className="block text-sm font-medium text-gray-700 mb-2">
                Plan Type
              </label>
              <select
                id="plan-type"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
                value={planType}
                onChange={(e) => setPlanType(e.target.value === "" ? "" : Number(e.target.value))}
              >
                <option value="">All Plan Types</option>
                <option value="1">Gói theo ngày</option>
                <option value="2">Gói theo thời hạn</option>
                <option value="3">Gói không giới hạn</option>
              </select>
            </div>
            <div>
              <label htmlFor="product-type-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Product Type
              </label>
              <select
                id="product-type-filter"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
              >
                <option value="">All Product Types</option>
                <option value="Top-Up SIM">Top-Up SIM</option>
                <option value="eSIM">eSIM</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
            {error && (
              <div className="flex-1 px-4 py-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            <button 
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
              onClick={handleSearch}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </button>
            <button
              className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
              onClick={handleReset}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap items-center">
          <CartButton />
          {/* Temporarily hidden Download button */}
          {/* <button className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button> */}
          {role === 1 && (
            <>
              <button 
                onClick={handleAdd}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Product
              </button>
              {selectedItems.size > 0 && (
                <button 
                  onClick={handleDeleteSelected}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Selected ({selectedItems.size})
                </button>
              )}
              <button 
                onClick={handleImportClick}
                className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import
              </button>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 w-full relative min-h-[300px]">
        <table className="text-sm min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {role === 1 && (
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap w-12">
                  <input
                    type="checkbox"
                    checked={selectedItems.size > 0 && selectedItems.size === products.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                </th>
              )}
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Actions</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Supplier</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Product Code</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Product Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Product Name (VI)</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Product Name (EN)</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Sale Price</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Days</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Plan Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Data</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Network Types</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Coverage Area (EN)</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Coverage Area (VI)</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Telecommunication Providers</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Notification (EN)</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Notification (VI)</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap min-w-[300px]">Data Reset</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Prepaid Card</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">APN</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Roaming Carrier</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">SMS</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Receive</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Call</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">TikTok</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">ChatGPT</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayProducts.map((item, index) => {
              const isSelected = selectedItems.has(index);
              
              return (
                <tr key={index} className={`hover:bg-gray-50 transition-colors duration-150 ${isSelected ? 'bg-blue-50' : ''}`}>
                  {role === 1 && (
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(index)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {role === 1 && (
                        <>
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => {
                          if (item.id) {
                            addItem(item);
                            toast.success(`${item.product_name_vi || item.product_name_en || item.product_code} đã được thêm vào giỏ hàng!`);
                          }
                        }}
                        className={`p-1.5 rounded-lg transition-colors duration-200 ${
                          item.id && isInCart(item.id)
                            ? "bg-teal-600 text-white"
                            : "bg-gray-100 hover:bg-teal-100 text-gray-700 hover:text-teal-700"
                        }`}
                        title={item.id && isInCart(item.id) ? "Đã có trong giỏ hàng" : "Thêm vào giỏ hàng"}
                        disabled={!item.id}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-900">{item.supplier}</td>
                <td className="px-4 py-3 text-gray-900 font-medium">{item.product_code}</td>
                <td className="px-4 py-3 text-gray-600">{item.product_type}</td>
                <td className="px-4 py-3 text-gray-900">{item.product_name_vi}</td>
                <td className="px-4 py-3 text-gray-900">{item.product_name_en}</td>
                <td className="px-4 py-3 text-gray-700 font-semibold">{item.sale_price.toLocaleString('vi-VN')}</td>
                <td className="px-4 py-3 text-gray-600">{item.days || "-"}</td>
                <td className="px-4 py-3 text-gray-600">{getPlanTypeLabel(item.plan_type)}</td>
                <td className="px-4 py-3 text-gray-600">{item.data}</td>
                <td className="px-4 py-3 text-gray-600">{item.network_types}</td>
                <td className="px-4 py-3 text-gray-600">{item.coverage_area_en}</td>
                <td className="px-4 py-3 text-gray-600">{item.coverage_area_vi}</td>
                <td className="px-4 py-3 text-gray-600">{item.telecommunication_providers}</td>
                <td className="px-4 py-3 text-gray-600">{item.notification_en}</td>
                <td className="px-4 py-3 text-gray-600">{item.notification_vi}</td>
                <td className="px-4 py-3 text-gray-600 min-w-[300px]">{item.data_reset_date_reset_vi}</td>
                <td className="px-4 py-3 text-gray-600">{item.prepaid_card}</td>
                <td className="px-4 py-3 text-gray-600">{item.apn}</td>
                <td className="px-4 py-3 text-gray-600">{item.roaming_carrier}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.sms === 1 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {formatBoolean(item.sms)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.receive === 1 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {formatBoolean(item.receive)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.call === 1 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {formatBoolean(item.call)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.tiktok === 1 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {formatBoolean(item.tiktok)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.chat_gpt === 1 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {formatBoolean(item.chat_gpt)}
                  </span>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
        {/* Loading Overlay */}
        {(isInitialLoading || isLoading) && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-3">
              <svg className="animate-spin h-8 w-8 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-sm text-gray-600 font-medium">Loading products...</p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t border-gray-200 w-full">
          <span className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{totalItems > 0 ? 1 + (currentPage - 1) * pageSize : 0}</span> to{" "}
            <span className="font-semibold text-gray-900">{Math.min(currentPage * pageSize, totalItems)}</span> of{" "}
            <span className="font-semibold text-gray-900">{totalItems.toLocaleString()}</span> entries
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                const newPage = Math.max(1, currentPage - 1);
                setCurrentPage(newPage);
                loadProducts(newPage);
              }}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
            >
              Previous
            </button>
            
            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {/* First Page */}
              {totalPages > 7 && currentPage > 4 && (
                <>
                  <button
                    onClick={() => {
                      setCurrentPage(1);
                      loadProducts(1);
                    }}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                  >
                    1
                  </button>
                  {currentPage > 5 && (
                    <span className="px-2 text-gray-500">...</span>
                  )}
                </>
              )}

              {/* Page Numbers around current page */}
              {(() => {
                const pages: number[] = [];
                let startPage = Math.max(1, currentPage - 2);
                let endPage = Math.min(totalPages, currentPage + 2);

                // Adjust if near start
                if (currentPage <= 3) {
                  endPage = Math.min(5, totalPages);
                }
                // Adjust if near end
                if (currentPage >= totalPages - 2) {
                  startPage = Math.max(1, totalPages - 4);
                }

                for (let i = startPage; i <= endPage; i++) {
                  pages.push(i);
                }

                return pages.map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => {
                      setCurrentPage(pageNum);
                      loadProducts(pageNum);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      currentPage === pageNum
                        ? "bg-teal-600 text-white shadow-sm"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                ));
              })()}

              {/* Last Page */}
              {totalPages > 7 && currentPage < totalPages - 3 && (
                <>
                  {currentPage < totalPages - 4 && (
                    <span className="px-2 text-gray-500">...</span>
                  )}
                  <button
                    onClick={() => {
                      setCurrentPage(totalPages);
                      loadProducts(totalPages);
                    }}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            {/* Jump to Page */}
            {totalPages > 10 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Go to:</span>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={jumpToPage}
                  onChange={(e) => setJumpToPage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const page = parseInt(jumpToPage);
                      if (!isNaN(page) && page >= 1 && page <= totalPages) {
                        setCurrentPage(page);
                        loadProducts(page);
                        setJumpToPage("");
                      } else {
                        toast.error(`Please enter a page number between 1 and ${totalPages}`);
                      }
                    }
                  }}
                  placeholder="Page"
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm"
                />
                <button
                  onClick={() => {
                    const page = parseInt(jumpToPage);
                    if (!isNaN(page) && page >= 1 && page <= totalPages) {
                      setCurrentPage(page);
                      loadProducts(page);
                      setJumpToPage("");
                    } else {
                      toast.error(`Please enter a page number between 1 and ${totalPages}`);
                    }
                  }}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors duration-200 text-sm"
                >
                  Go
                </button>
              </div>
            )}

            <button
              onClick={() => {
                const newPage = Math.min(totalPages, currentPage + 1);
                setCurrentPage(newPage);
                loadProducts(newPage);
              }}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium shadow-sm hover:shadow-md"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Import Products</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmitImport} className="space-y-4">
              <div>
                <label htmlFor="csv-file" className="block text-sm font-medium text-gray-700 mb-2">
                  Select CSV File
                </label>
                <input
                  ref={fileInputRef}
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                  required
                />
                {selectedFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: <span className="font-medium">{selectedFile.name}</span>
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile || isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Importing...
                    </>
                  ) : (
                    "Import"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Product Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl mx-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Create Product</h2>
              <button
                onClick={handleCloseCreateModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmitCreate} className="space-y-4">
              {/* Supplier - Hidden field, mặc định là Simnet */}
              <input
                type="hidden"
                name="supplier"
                value={formData.supplier}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Product Code */}
                <div>
                  <label htmlFor="product_code" className="block text-sm font-medium text-gray-700 mb-2">
                    Product Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="product_code"
                    type="text"
                    value={formData.product_code}
                    onChange={(e) => handleFormChange("product_code", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                    required
                  />
                </div>

                {/* Product Type - Select */}
                <div>
                  <label htmlFor="product_type" className="block text-sm font-medium text-gray-700 mb-2">
                    Product Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="product_type"
                    value={formData.product_type}
                    onChange={(e) => handleFormChange("product_type", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                    required
                  >
                    <option value="">-- Chọn Product Type --</option>
                    <option value="eSIM">eSIM</option>
                    <option value="Top-Up SIM">Top-Up SIM</option>
                  </select>
                </div>

                {/* Plan Type */}
                <div>
                  <label htmlFor="plan_type" className="block text-sm font-medium text-gray-700 mb-2">
                    Plan Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="plan_type"
                    value={formData.plan_type}
                    onChange={(e) => handleFormChange("plan_type", parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                    required
                  >
                    <option value={1}>Theo ngày</option>
                    <option value={2}>Theo thời hạn</option>
                    <option value={3}>Unlimited</option>
                  </select>
                </div>

                {/* Product Name VI */}
                <div>
                  <label htmlFor="product_name_vi" className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name (Vietnamese) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="product_name_vi"
                    type="text"
                    value={formData.product_name_vi}
                    onChange={(e) => handleFormChange("product_name_vi", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                    required
                  />
                </div>

                {/* Product Name EN */}
                <div>
                  <label htmlFor="product_name_en" className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name (English) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="product_name_en"
                    type="text"
                    value={formData.product_name_en}
                    onChange={(e) => handleFormChange("product_name_en", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                    required
                  />
                </div>

                {/* Sale Price */}
                <div>
                  <label htmlFor="sale_price" className="block text-sm font-medium text-gray-700 mb-2">
                    Sale Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="sale_price"
                    type="number"
                    value={formData.sale_price || ""}
                    onChange={(e) => handleFormChange("sale_price", parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                    required
                    min="0"
                  />
                </div>

                {/* Days */}
                <div>
                  <label htmlFor="days" className="block text-sm font-medium text-gray-700 mb-2">
                    Days <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="days"
                    type="number"
                    value={formData.days || ""}
                    onChange={(e) => handleFormChange("days", parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                    required
                    min="0"
                  />
                </div>

                {/* Data */}
                <div>
                  <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-2">
                    Data <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="data"
                    type="text"
                    value={formData.data}
                    onChange={(e) => handleFormChange("data", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                    placeholder="e.g., 10GB, Unlimited"
                    required
                  />
                </div>

                {/* Network Types */}
                <div>
                  <label htmlFor="network_types" className="block text-sm font-medium text-gray-700 mb-2">
                    Network Types
                  </label>
                  <input
                    id="network_types"
                    type="text"
                    value={formData.network_types}
                    onChange={(e) => handleFormChange("network_types", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                    placeholder="e.g., 4G/5G"
                  />
                </div>

                {/* Coverage Area EN */}
                <div>
                  <label htmlFor="coverage_area_en" className="block text-sm font-medium text-gray-700 mb-2">
                    Coverage Area (English)
                  </label>
                  <input
                    id="coverage_area_en"
                    type="text"
                    value={formData.coverage_area_en}
                    onChange={(e) => handleFormChange("coverage_area_en", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                  />
                </div>

                {/* Coverage Area VI */}
                <div>
                  <label htmlFor="coverage_area_vi" className="block text-sm font-medium text-gray-700 mb-2">
                    Coverage Area (Vietnamese)
                  </label>
                  <input
                    id="coverage_area_vi"
                    type="text"
                    value={formData.coverage_area_vi}
                    onChange={(e) => handleFormChange("coverage_area_vi", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                  />
                </div>

                {/* Telecommunication Providers */}
                <div>
                  <label htmlFor="telecommunication_providers" className="block text-sm font-medium text-gray-700 mb-2">
                    Telecommunication Providers
                  </label>
                  <input
                    id="telecommunication_providers"
                    type="text"
                    value={formData.telecommunication_providers}
                    onChange={(e) => handleFormChange("telecommunication_providers", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                    placeholder="e.g., Viettel, Vinaphone, Mobifone"
                  />
                </div>

                {/* Notification EN */}
                <div>
                  <label htmlFor="notification_en" className="block text-sm font-medium text-gray-700 mb-2">
                    Notification (English)
                  </label>
                  <input
                    id="notification_en"
                    type="text"
                    value={formData.notification_en}
                    onChange={(e) => handleFormChange("notification_en", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                  />
                </div>

                {/* Notification VI */}
                <div>
                  <label htmlFor="notification_vi" className="block text-sm font-medium text-gray-700 mb-2">
                    Notification (Vietnamese)
                  </label>
                  <input
                    id="notification_vi"
                    type="text"
                    value={formData.notification_vi}
                    onChange={(e) => handleFormChange("notification_vi", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                  />
                </div>

                {/* Data Reset Date Reset EN */}
                <div>
                  <label htmlFor="data_reset_date_reset_en" className="block text-sm font-medium text-gray-700 mb-2">
                    Data Reset Date Reset (English)
                  </label>
                  <input
                    id="data_reset_date_reset_en"
                    type="text"
                    value={formData.data_reset_date_reset_en}
                    onChange={(e) => handleFormChange("data_reset_date_reset_en", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                  />
                </div>

                {/* Data Reset Date Reset VI */}
                <div>
                  <label htmlFor="data_reset_date_reset_vi" className="block text-sm font-medium text-gray-700 mb-2">
                    Data Reset Date Reset (Vietnamese)
                  </label>
                  <input
                    id="data_reset_date_reset_vi"
                    type="text"
                    value={formData.data_reset_date_reset_vi}
                    onChange={(e) => handleFormChange("data_reset_date_reset_vi", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                  />
                </div>

                {/* Prepaid Card */}
                <div>
                  <label htmlFor="prepaid_card" className="block text-sm font-medium text-gray-700 mb-2">
                    Prepaid Card
                  </label>
                  <input
                    id="prepaid_card"
                    type="text"
                    value={formData.prepaid_card}
                    onChange={(e) => handleFormChange("prepaid_card", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                  />
                </div>

                {/* APN */}
                <div>
                  <label htmlFor="apn" className="block text-sm font-medium text-gray-700 mb-2">
                    APN
                  </label>
                  <input
                    id="apn"
                    type="text"
                    value={formData.apn}
                    onChange={(e) => handleFormChange("apn", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                  />
                </div>

                {/* Roaming Carrier */}
                <div>
                  <label htmlFor="roaming_carrier" className="block text-sm font-medium text-gray-700 mb-2">
                    Roaming Carrier
                  </label>
                  <input
                    id="roaming_carrier"
                    type="text"
                    value={formData.roaming_carrier}
                    onChange={(e) => handleFormChange("roaming_carrier", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="border-t pt-4 mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">Features</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.sms === 1}
                      onChange={(e) => handleFormChange("sms", e.target.checked ? 1 : 0)}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700">SMS</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.receive === 1}
                      onChange={(e) => handleFormChange("receive", e.target.checked ? 1 : 0)}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700">Receive</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.call === 1}
                      onChange={(e) => handleFormChange("call", e.target.checked ? 1 : 0)}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700">Call</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.tiktok === 1}
                      onChange={(e) => handleFormChange("tiktok", e.target.checked ? 1 : 0)}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700">TikTok</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.chat_gpt === 1}
                      onChange={(e) => handleFormChange("chat_gpt", e.target.checked ? 1 : 0)}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700">ChatGPT</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseCreateModal}
                  className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors duration-200"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Creating..." : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl mx-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Edit Product</h2>
              <button
                onClick={handleCloseEditModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmitUpdate} className="space-y-4">
              {/* Supplier - Hidden field, mặc định là Simnet */}
              <input
                type="hidden"
                name="supplier"
                value={formData.supplier}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Code */}
                <div>
                  <label htmlFor="edit_product_code" className="block text-sm font-medium text-gray-700 mb-2">
                    Product Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="edit_product_code"
                    type="text"
                    value={formData.product_code}
                    onChange={(e) => handleFormChange("product_code", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                    required
                  />
                </div>

                {/* Product Type - Select */}
                <div>
                  <label htmlFor="edit_product_type" className="block text-sm font-medium text-gray-700 mb-2">
                    Product Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="edit_product_type"
                    value={formData.product_type}
                    onChange={(e) => handleFormChange("product_type", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                    required
                  >
                    <option value="">-- Chọn Product Type --</option>
                    <option value="eSIM">eSIM</option>
                    <option value="Top-Up SIM">Top-Up SIM</option>
                  </select>
                </div>

                {/* Plan Type */}
                <div>
                  <label htmlFor="edit_plan_type" className="block text-sm font-medium text-gray-700 mb-2">
                    Plan Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="edit_plan_type"
                    value={formData.plan_type}
                    onChange={(e) => handleFormChange("plan_type", parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                    required
                  >
                    <option value={1}>Theo ngày</option>
                    <option value={2}>Theo thời hạn</option>
                    <option value={3}>Unlimited</option>
                  </select>
                </div>

                {/* Product Name VI */}
                <div>
                  <label htmlFor="edit_product_name_vi" className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name (Vietnamese) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="edit_product_name_vi"
                    type="text"
                    value={formData.product_name_vi}
                    onChange={(e) => handleFormChange("product_name_vi", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                    required
                  />
                </div>

                {/* Product Name EN */}
                <div>
                  <label htmlFor="edit_product_name_en" className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name (English) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="edit_product_name_en"
                    type="text"
                    value={formData.product_name_en}
                    onChange={(e) => handleFormChange("product_name_en", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                    required
                  />
                </div>

                {/* Sale Price */}
                <div>
                  <label htmlFor="edit_sale_price" className="block text-sm font-medium text-gray-700 mb-2">
                    Sale Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="edit_sale_price"
                    type="number"
                    value={formData.sale_price || ""}
                    onChange={(e) => handleFormChange("sale_price", parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                    required
                    min="0"
                  />
                </div>

                {/* Days */}
                <div>
                  <label htmlFor="edit_days" className="block text-sm font-medium text-gray-700 mb-2">
                    Days <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="edit_days"
                    type="number"
                    value={formData.days || ""}
                    onChange={(e) => handleFormChange("days", parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                    required
                    min="0"
                  />
                </div>

                {/* Data */}
                <div>
                  <label htmlFor="edit_data" className="block text-sm font-medium text-gray-700 mb-2">
                    Data <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="edit_data"
                    type="text"
                    value={formData.data}
                    onChange={(e) => handleFormChange("data", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                    placeholder="e.g., 10GB, Unlimited"
                    required
                  />
                </div>

                {/* Network Types */}
                <div>
                  <label htmlFor="edit_network_types" className="block text-sm font-medium text-gray-700 mb-2">
                    Network Types
                  </label>
                  <input
                    id="edit_network_types"
                    type="text"
                    value={formData.network_types}
                    onChange={(e) => handleFormChange("network_types", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                    placeholder="e.g., 4G/5G"
                  />
                </div>

                {/* Coverage Area EN */}
                <div>
                  <label htmlFor="edit_coverage_area_en" className="block text-sm font-medium text-gray-700 mb-2">
                    Coverage Area (English)
                  </label>
                  <input
                    id="edit_coverage_area_en"
                    type="text"
                    value={formData.coverage_area_en}
                    onChange={(e) => handleFormChange("coverage_area_en", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                  />
                </div>

                {/* Coverage Area VI */}
                <div>
                  <label htmlFor="edit_coverage_area_vi" className="block text-sm font-medium text-gray-700 mb-2">
                    Coverage Area (Vietnamese)
                  </label>
                  <input
                    id="edit_coverage_area_vi"
                    type="text"
                    value={formData.coverage_area_vi}
                    onChange={(e) => handleFormChange("coverage_area_vi", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                  />
                </div>

                {/* Telecommunication Providers */}
                <div>
                  <label htmlFor="edit_telecommunication_providers" className="block text-sm font-medium text-gray-700 mb-2">
                    Telecommunication Providers
                  </label>
                  <input
                    id="edit_telecommunication_providers"
                    type="text"
                    value={formData.telecommunication_providers}
                    onChange={(e) => handleFormChange("telecommunication_providers", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                    placeholder="e.g., Viettel, Vinaphone, Mobifone"
                  />
                </div>

                {/* Notification EN */}
                <div>
                  <label htmlFor="edit_notification_en" className="block text-sm font-medium text-gray-700 mb-2">
                    Notification (English)
                  </label>
                  <input
                    id="edit_notification_en"
                    type="text"
                    value={formData.notification_en}
                    onChange={(e) => handleFormChange("notification_en", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                  />
                </div>

                {/* Notification VI */}
                <div>
                  <label htmlFor="edit_notification_vi" className="block text-sm font-medium text-gray-700 mb-2">
                    Notification (Vietnamese)
                  </label>
                  <input
                    id="edit_notification_vi"
                    type="text"
                    value={formData.notification_vi}
                    onChange={(e) => handleFormChange("notification_vi", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                  />
                </div>

                {/* Data Reset Date Reset EN */}
                <div>
                  <label htmlFor="edit_data_reset_date_reset_en" className="block text-sm font-medium text-gray-700 mb-2">
                    Data Reset Date Reset (English)
                  </label>
                  <input
                    id="edit_data_reset_date_reset_en"
                    type="text"
                    value={formData.data_reset_date_reset_en}
                    onChange={(e) => handleFormChange("data_reset_date_reset_en", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                  />
                </div>

                {/* Data Reset Date Reset VI */}
                <div>
                  <label htmlFor="edit_data_reset_date_reset_vi" className="block text-sm font-medium text-gray-700 mb-2">
                    Data Reset Date Reset (Vietnamese)
                  </label>
                  <input
                    id="edit_data_reset_date_reset_vi"
                    type="text"
                    value={formData.data_reset_date_reset_vi}
                    onChange={(e) => handleFormChange("data_reset_date_reset_vi", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                  />
                </div>

                {/* Prepaid Card */}
                <div>
                  <label htmlFor="edit_prepaid_card" className="block text-sm font-medium text-gray-700 mb-2">
                    Prepaid Card
                  </label>
                  <input
                    id="edit_prepaid_card"
                    type="text"
                    value={formData.prepaid_card}
                    onChange={(e) => handleFormChange("prepaid_card", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                  />
                </div>

                {/* APN */}
                <div>
                  <label htmlFor="edit_apn" className="block text-sm font-medium text-gray-700 mb-2">
                    APN
                  </label>
                  <input
                    id="edit_apn"
                    type="text"
                    value={formData.apn}
                    onChange={(e) => handleFormChange("apn", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                  />
                </div>

                {/* Roaming Carrier */}
                <div>
                  <label htmlFor="edit_roaming_carrier" className="block text-sm font-medium text-gray-700 mb-2">
                    Roaming Carrier
                  </label>
                  <input
                    id="edit_roaming_carrier"
                    type="text"
                    value={formData.roaming_carrier}
                    onChange={(e) => handleFormChange("roaming_carrier", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="border-t pt-4 mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">Features</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.sms === 1}
                      onChange={(e) => handleFormChange("sms", e.target.checked ? 1 : 0)}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700">SMS</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.receive === 1}
                      onChange={(e) => handleFormChange("receive", e.target.checked ? 1 : 0)}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700">Receive</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.call === 1}
                      onChange={(e) => handleFormChange("call", e.target.checked ? 1 : 0)}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700">Call</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.tiktok === 1}
                      onChange={(e) => handleFormChange("tiktok", e.target.checked ? 1 : 0)}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700">TikTok</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.chat_gpt === 1}
                      onChange={(e) => handleFormChange("chat_gpt", e.target.checked ? 1 : 0)}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700">ChatGPT</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors duration-200"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Updating..." : "Update Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              {confirmDelete.isMultiple ? "Delete Multiple Products" : "Delete Product"}
            </h3>
            
            <p className="text-sm text-gray-600 text-center mb-6">
              {confirmDelete.isMultiple
                ? `Are you sure you want to delete ${confirmDelete.count} product(s)? This action cannot be undone.`
                : `Are you sure you want to delete product "${confirmDelete.product?.product_name_vi || confirmDelete.product?.product_name_en || confirmDelete.product?.product_code}"? This action cannot be undone.`}
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete({ isOpen: false, product: null, isMultiple: false })}
                className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors duration-200"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete.isMultiple ? handleConfirmDeleteSelected : handleConfirmDelete}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      <CartSidebar />
    </div>
  );
}
