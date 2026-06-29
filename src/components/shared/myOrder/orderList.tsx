"use client";
import { useState, useEffect, useCallback } from "react";
import { productApi, userApi } from "@/lib/api";
import type { Order, ApiError, UserProfile } from "@/lib/api/types";
import { useAuthStore } from "@/lib/stores";
import toast from "react-hot-toast";

const pageSize = 10;

// Helper function để format date
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};

// Helper function để lấy status label và màu
const getStatusInfo = (status: number) => {
  switch (status) {
    case 0:
      return {
        label: "Đang xử lý",
        className: "bg-yellow-100 text-yellow-800",
      };
    case 1:
      return {
        label: "Hoàn thành",
        className: "bg-green-100 text-green-800",
      };
    case 2:
      return {
        label: "Bị hủy",
        className: "bg-red-100 text-red-800",
      };
    default:
      return {
        label: "Không xác định",
        className: "bg-gray-100 text-gray-800",
      };
  }
};

// Helper function để tính tổng tiền của order
const calculateTotalPrice = (order: Order): number => {
  return order.items.reduce((total, item) => total + item.price, 0);
};

// Helper function để lấy ngày order (lấy từ item đầu tiên)
const getOrderDate = (order: Order): string => {
  if (order.items.length > 0 && order.items[0].create_at) {
    return formatDate(order.items[0].create_at);
  }
  return "-";
};

// Order Detail Modal Component
function OrderDetailModal({ order, isOpen, onClose }: { order: Order | null; isOpen: boolean; onClose: () => void }) {
  if (!isOpen || !order) return null;

  const totalPrice = calculateTotalPrice(order);
  const orderDate = getOrderDate(order);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-lg shadow-xl w-full max-w-[90vw] max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Chi tiết đơn hàng</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Order Info */}
            <div className="mb-6 space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700 w-32 whitespace-nowrap">Mã đơn hàng:</span>
                <span className="text-sm text-gray-900 font-semibold">{order.orderId}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700 w-32 whitespace-nowrap">Ngày đặt hàng:</span>
                <span className="text-sm text-gray-900">{orderDate}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700 w-32 whitespace-nowrap">Số lượng sản phẩm:</span>
                <span className="text-sm text-gray-900">{order.items.length}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700 w-32 whitespace-nowrap">Tổng tiền:</span>
                <span className="text-lg font-bold text-teal-600">
                  {totalPrice.toLocaleString("vi-VN")} đ
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Danh sách sản phẩm</h3>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 px-4 py-3 text-left whitespace-nowrap">ID</th>
                      <th className="border border-gray-300 px-4 py-3 text-left whitespace-nowrap">Mã sản phẩm</th>
                      <th className="border border-gray-300 px-4 py-3 text-left whitespace-nowrap">Tên sản phẩm</th>
                      <th className="border border-gray-300 px-4 py-3 text-left whitespace-nowrap">Giá</th>
                      <th className="border border-gray-300 px-4 py-3 text-left whitespace-nowrap">Trạng thái</th>
                      <th className="border border-gray-300 px-4 py-3 text-left whitespace-nowrap">ICCID</th>
                      <th className="border border-gray-300 px-4 py-3 text-left whitespace-nowrap">Redemption Code</th>
                      <th className="border border-gray-300 px-4 py-3 text-left whitespace-nowrap">QR Code</th>
                      <th className="border border-gray-300 px-4 py-3 text-left whitespace-nowrap">Ngày gửi mã</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3">{item.id}</td>
                        <td className="border border-gray-300 px-4 py-3 font-medium">{item.wmproductId}</td>
                        <td className="border border-gray-300 px-4 py-3">{item.productName}</td>
                        <td className="border border-gray-300 px-4 py-3 font-semibold text-teal-600 whitespace-nowrap">
                          {item.price.toLocaleString("vi-VN")} đ
                        </td>
                        <td className="border border-gray-300 px-4 py-3 whitespace-nowrap">
                          {(() => {
                            const statusInfo = getStatusInfo(item.status);
                            return (
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}
                              >
                                {statusInfo.label}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 font-mono text-xs">
                          {item.iccid || "-"}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 font-mono text-xs">
                          {item.redemptionCode || "-"}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 font-mono text-xs break-all max-w-xs">
                          {item.qrCode || "-"}
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          {formatDate(item.update_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function OrderList() {
  const [mounted, setMounted] = useState(false);
  const { role } = useAuthStore();
  const isAdmin = role === 1;

  // Common States
  const [currentPage, setCurrentPage] = useState(1);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Admin Specific States
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null); // null đại diện cho Tất cả người dùng
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [orderSearchInput, setOrderSearchInput] = useState("");
  const [orderIdSearchQuery, setOrderIdSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load users if Admin
  const loadUsers = useCallback(async () => {
    try {
      setIsUsersLoading(true);
      const response = await userApi.listAllUsers();
      if (response.error) {
        toast.error(response.error || "Không thể tải danh sách người dùng!");
        return;
      }
      if (response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
      toast.error("Không thể tải danh sách người dùng!");
    } finally {
      setIsUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mounted && isAdmin) {
      loadUsers();
    }
  }, [mounted, isAdmin, loadUsers]);

  // Load orders
  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      
      let response;
      if (isAdmin) {
        response = await productApi.listOrdersByAdmin({
          limit: pageSize,
          page: currentPage,
          sort: sortOrder,
          orderId: orderIdSearchQuery,
          userId: selectedUser ? selectedUser.id : "", // Gửi userId rỗng nếu muốn xem tất cả
        });
      } else {
        response = await productApi.listOrders({
          limit: pageSize,
          page: currentPage,
          sort: "desc",
        });
      }

      if (response.error) {
        toast.error(response.error || "Không thể tải danh sách đơn hàng!");
        return;
      }

      if (response.data) {
        setOrders(response.data);
        if (response.total) {
          setTotalPages(response.total);
        } else {
          setTotalPages(Math.ceil(response.data.length / pageSize));
        }
      } else {
        setOrders([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Failed to load orders:", error);
      const apiError = error as ApiError;
      toast.error(apiError.message || "Không thể tải danh sách đơn hàng!");
      setOrders([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, isAdmin, sortOrder, orderIdSearchQuery, selectedUser]);

  useEffect(() => {
    if (mounted) {
      loadOrders();
    }
  }, [mounted, loadOrders]);

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedOrder(null);
  };

  const handleSelectUser = (user: UserProfile | null) => {
    setSelectedUser(user);
    setCurrentPage(1);
  };

  const handleSearchOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderIdSearchQuery(orderSearchInput);
    setCurrentPage(1);
  };

  // Filter users based on query
  const filteredUsers = users.filter((u) => {
    const query = userSearchQuery.toLowerCase().trim();
    if (!query) return true;
    const fullName = `${u.first_name || ""} ${u.last_name || ""}`.toLowerCase();
    return (
      u.account.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      fullName.includes(query)
    );
  });

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-24">
        <svg className="animate-spin h-8 w-8 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  // --- ADMIN VIEW ---
  if (isAdmin) {
    return (
      <div className="p-6 bg-white shadow rounded text-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Cột trái - Danh sách User */}
          <div className="lg:col-span-4 bg-gray-50 rounded-lg border border-gray-200 p-4 flex flex-col max-h-[700px]">
            <h3 className="font-semibold text-gray-900 text-base mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Danh sách người dùng
            </h3>
            
            {/* Ô Tìm kiếm User */}
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Tìm kiếm email, tài khoản..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 bg-white rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Danh sách */}
            <div className="flex-1 overflow-y-auto space-y-1 pr-1 max-h-[500px]">
              {/* Tùy chọn Tất cả */}
              <button
                onClick={() => handleSelectUser(null)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all duration-200 flex items-center justify-between border ${
                  selectedUser === null
                    ? "bg-teal-50 text-teal-700 border-teal-200 font-semibold shadow-sm"
                    : "bg-white border-gray-200 hover:bg-gray-150 text-gray-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${selectedUser === null ? "bg-teal-500 animate-pulse" : "bg-gray-300"}`} />
                  <div>
                    <p className="font-semibold text-gray-800">Tất cả người dùng</p>
                    <p className="text-[10px] text-gray-500">Xem toàn bộ đơn hàng</p>
                  </div>
                </div>
              </button>

              {isUsersLoading ? (
                <div className="flex items-center justify-center py-6 text-gray-500 text-xs">
                  <svg className="animate-spin h-5 w-5 text-teal-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang tải...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-xs">
                  Không tìm thấy người dùng nào
                </div>
              ) : (
                filteredUsers.map((u) => {
                  const isSelected = selectedUser?.id === u.id;
                  const displayName = `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.account;
                  
                  return (
                    <button
                      key={u.id}
                      onClick={() => handleSelectUser(u)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all duration-200 flex items-center justify-between border ${
                        isSelected
                          ? "bg-teal-50 text-teal-700 border-teal-200 font-semibold shadow-sm"
                          : "bg-white border-gray-200 hover:bg-gray-150 text-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isSelected ? "bg-teal-500" : "bg-gray-300"}`} />
                        <div className="truncate">
                          <p className="font-semibold truncate text-gray-800">{displayName}</p>
                          <p className="text-[10px] text-gray-500 truncate">{u.email}</p>
                        </div>
                      </div>
                      {u.role === 1 && (
                        <span className="text-[9px] bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded flex-shrink-0 ml-1">
                          Admin
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Cột phải - Danh sách Đơn hàng */}
          <div className="lg:col-span-8 flex flex-col min-h-[500px]">
            {/* Header danh sách đơn hàng */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-4 mb-4 gap-3">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">
                  {selectedUser 
                    ? `Đơn hàng của: ${selectedUser.first_name || selectedUser.last_name ? `${selectedUser.first_name || ""} ${selectedUser.last_name || ""}` : selectedUser.account}`
                    : "Tất cả đơn hàng eSIM"}
                </h3>
                {selectedUser && (
                  <p className="text-xs text-gray-500 font-mono mt-0.5">{selectedUser.email}</p>
                )}
              </div>
              
              {/* Bộ lọc Order & Sắp xếp */}
              <form onSubmit={handleSearchOrder} className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm mã đơn hàng..."
                    value={orderSearchInput}
                    onChange={(e) => setOrderSearchInput(e.target.value)}
                    className="pl-3 pr-8 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 w-[160px] sm:w-[200px]"
                  />
                  {orderSearchInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setOrderSearchInput("");
                        setOrderIdSearchQuery("");
                        setCurrentPage(1);
                      }}
                      className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Tìm
                </button>

                {/* Toggle Sort order */}
                <button
                  type="button"
                  onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
                  className="px-3 py-1.5 border border-gray-300 hover:bg-gray-50 rounded-lg text-gray-600 flex items-center justify-center gap-1.5 text-xs transition-colors"
                  title={sortOrder === "desc" ? "Mới nhất trước" : "Cũ nhất trước"}
                >
                  <svg className="w-3.5 h-3.5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                  <span>{sortOrder === "desc" ? "Mới nhất" : "Cũ nhất"}</span>
                </button>
              </form>
            </div>

            {/* Nội dung bảng đơn hàng */}
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12">
                <svg className="animate-spin h-8 w-8 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="ml-3 text-gray-600 mt-2 text-sm">Đang tải đơn hàng...</span>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto flex-1">
                  <table className="w-full table-auto border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-4 py-2 text-left">Mã đơn hàng</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Tổng tiền</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Ngày đặt hàng</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Số lượng sản phẩm</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                            Không có đơn hàng nào
                          </td>
                        </tr>
                      ) : (
                        orders.map((order) => {
                          const totalPrice = calculateTotalPrice(order);
                          const orderDate = getOrderDate(order);
                          const itemCount = order.items.length;

                          return (
                            <tr key={order.orderId} className="hover:bg-gray-50">
                              <td
                                className="border border-gray-300 px-4 py-2 text-teal-600 font-medium cursor-pointer hover:underline"
                                onClick={() => handleViewDetail(order)}
                              >
                                {order.orderId}
                              </td>
                              <td className="border border-gray-300 px-4 py-2 font-semibold text-teal-600">
                                {totalPrice.toLocaleString("vi-VN")} đ
                              </td>
                              <td className="border border-gray-300 px-4 py-2">{orderDate}</td>
                              <td className="border border-gray-300 px-4 py-2">{itemCount}</td>
                              <td className="border border-gray-300 px-4 py-2">
                                <button
                                  onClick={() => handleViewDetail(order)}
                                  className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-medium transition-colors"
                                >
                                  Xem chi tiết
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Phân trang */}
                {orders.length > 0 && (
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-gray-600">
                      Trang {currentPage} / {totalPages}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1 || isLoading}
                        className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Trước
                      </button>
                      {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            disabled={isLoading}
                            className={`px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 ${
                              currentPage === pageNum ? "bg-teal-500 text-white" : ""
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages || isLoading}
                        className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Sau
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Order Detail Modal */}
        <OrderDetailModal
          order={selectedOrder}
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
        />
      </div>
    );
  }

  // --- NORMAL USER VIEW (role = 0) ---
  return (
    <div className="p-6 bg-white shadow rounded text-sm">
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-3 text-gray-600">Đang tải...</span>
        </div>
      )}

      {/* Orders Table */}
      {!isLoading && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full table-auto border border-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-2 py-2 text-left">Mã đơn hàng</th>
                  <th className="border border-gray-300 px-2 py-2 text-left">Tổng tiền</th>
                  <th className="border border-gray-300 px-2 py-2 text-left">Ngày đặt hàng</th>
                  <th className="border border-gray-300 px-2 py-2 text-left">Số lượng sản phẩm</th>
                  <th className="border border-gray-300 px-2 py-2 text-left">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                      Không có đơn hàng nào
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const totalPrice = calculateTotalPrice(order);
                    const orderDate = getOrderDate(order);
                    const itemCount = order.items.length;

                    return (
                      <tr key={order.orderId} className="hover:bg-gray-50">
                        <td
                          className="border border-gray-300 px-2 py-2 text-teal-600 font-medium cursor-pointer hover:underline"
                          onClick={() => handleViewDetail(order)}
                        >
                          {order.orderId}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 font-semibold text-teal-600">
                          {totalPrice.toLocaleString("vi-VN")} đ
                        </td>
                        <td className="border border-gray-300 px-2 py-2">{orderDate}</td>
                        <td className="border border-gray-300 px-2 py-2">{itemCount}</td>
                        <td className="border border-gray-300 px-2 py-2">
                          <button
                            onClick={() => handleViewDetail(order)}
                            className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-medium transition-colors"
                          >
                            Xem chi tiết
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <span className="text-gray-600">
              Trang {currentPage} / {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isLoading}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Trước
              </button>
              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    disabled={isLoading}
                    className={`px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 ${
                      currentPage === pageNum ? "bg-teal-500 text-white" : ""
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || isLoading}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Sau
              </button>
            </div>
          </div>
        </>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
      />
    </div>
  );
}
