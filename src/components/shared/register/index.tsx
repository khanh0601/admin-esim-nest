"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Breadcrumb from "../global/Breakcrum";
import { authApi, userApi } from "@/lib/api";
import { passwordConstraintContent } from "@/lib/constants";
import type { ApiError, UserProfile } from "@/lib/api/types";
import { useAuthStore } from "@/lib/stores";
import toast from "react-hot-toast";

// Confirm Modal Component
function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  confirmButtonClass = "bg-red-600 hover:bg-red-700 text-white",
}: {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const { user: currentUser } = useAuthStore();

  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Listing states
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Confirm Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    userId: number;
    account: string;
    email: string;
    action: "lock" | "unlock";
  }>({
    isOpen: false,
    userId: 0,
    account: "",
    email: "",
    action: "lock",
  });

  // Password validation - check each requirement
  const passwordRequirements = useMemo(() => {
    return passwordConstraintContent.map((constraint) => ({
      ...constraint,
      isValid: constraint.regex.test(password),
    }));
  }, [password]);

  const isPasswordValid = useMemo(() => {
    return passwordRequirements.every((req) => req.isValid);
  }, [passwordRequirements]);

  // Load all users
  const fetchUsers = useCallback(async () => {
    try {
      setIsUsersLoading(true);
      const res = await userApi.listAllUsers();
      if (res.data) {
        setUsers(res.data);
      } else if (res.error) {
        toast.error(res.error || "Không thể tải danh sách người dùng!");
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      toast.error("Không thể tải danh sách người dùng!");
    } finally {
      setIsUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!isPasswordValid) {
      setError("Please meet all password requirements");
      return;
    }

    setIsLoading(true);

    try {
      // Gọi API register qua authApi service
      const data = await authApi.register({
        account,
        password,
        email,
        first_name: firstName || undefined,
        last_name: lastName || undefined,
      });

      setSuccess(data.message || "Account created successfully!");
      
      // Reset form after successful registration
      setAccount("");
      setPassword("");
      setConfirmPassword("");
      setEmail("");
      setFirstName("");
      setLastName("");
      
      // Refresh user listing
      fetchUsers();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      const apiError = err as ApiError;
      setError(
        apiError.message || "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenConfirm = (user: UserProfile, action: "lock" | "unlock") => {
    setConfirmModal({
      isOpen: true,
      userId: user.id,
      account: user.account,
      email: user.email,
      action,
    });
  };

  const handleConfirmAction = async () => {
    const { userId, action, account } = confirmModal;
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    
    const loadingToast = toast.loading(
      action === "lock" ? "Đang khóa tài khoản..." : "Đang mở khóa tài khoản..."
    );

    try {
      let res;
      if (action === "lock") {
        res = await userApi.lockUser(userId);
      } else {
        res = await userApi.unlockUser(userId);
      }

      if (res.error) {
        toast.error(res.error || "Thao tác thất bại!", { id: loadingToast });
      } else {
        toast.success(
          action === "lock"
            ? `Đã khóa thành công tài khoản ${account}!`
            : `Đã mở khóa thành công tài khoản ${account}!`,
          { id: loadingToast }
        );
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
      toast.error("Thao tác thất bại!", { id: loadingToast });
    }
  };

  const filteredUsers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return users;
    return users.filter((u) => {
      const fullName = `${u.first_name || ""} ${u.last_name || ""}`.toLowerCase();
      return (
        u.account.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        fullName.includes(query)
      );
    });
  }, [users, searchQuery]);

  return (
    <div>
      <Breadcrumb 
        title="Register Account" 
        path={[
          { label: "Home", href: "/admin/notice" },
          { label: "Register Account" }
        ]} 
      />
      
      {/* Form đăng ký */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mt-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Create New Account</h2>
          
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{success}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* First Name Input */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="firstName"
                    type="text"
                    placeholder="Enter first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all duration-200 text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Last Name Input */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="lastName"
                    type="text"
                    placeholder="Enter last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all duration-200 text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Account Input */}
              <div>
                <label htmlFor="account" className="block text-sm font-medium text-gray-700 mb-2">
                  Account <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="account"
                    type="text"
                    placeholder="Enter account"
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all duration-200 text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all duration-200 text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 ${
                      password && !isPasswordValid
                        ? "border-orange-300 focus:border-orange-500 focus:ring-orange-500"
                        : password && isPasswordValid
                        ? "border-green-300 focus:border-green-500 focus:ring-green-500"
                        : "border-gray-300"
                    }`}
                  />
                </div>
                
                {/* Password Requirements */}
                {password && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-medium text-gray-700 mb-2">Password requirements:</p>
                    <ul className="space-y-1.5">
                      {passwordRequirements.map((req) => (
                        <li
                          key={req.id}
                          className={`flex items-center gap-2 text-xs transition-all duration-300 ${
                            req.isValid
                              ? "text-green-600 animate-in fade-in slide-in-from-left-2"
                              : "text-gray-500"
                          }`}
                        >
                          <div
                            className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 ${
                              req.isValid
                                ? "bg-green-500 scale-110"
                                : "bg-gray-300 scale-100"
                            }`}
                          >
                            {req.isValid ? (
                              <svg
                                className="w-3 h-3 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={3}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            ) : (
                              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                            )}
                          </div>
                          <span
                            className={`transition-all duration-300 ${
                              req.isValid ? "font-medium" : ""
                            }`}
                          >
                            {req.message}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Confirm Password Input */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all duration-200 text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 text-center">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full md:w-auto bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-3 px-8 rounded-lg font-semibold hover:from-teal-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registering...
                  </span>
                ) : (
                  "Register Account"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Danh sách tài khoản người dùng */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-4 mb-6 gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Danh sách tài khoản</h2>
            <p className="text-xs text-gray-500 mt-1">Quản lý trạng thái hoạt động và khóa/mở khóa tài khoản.</p>
          </div>
          
          {/* Ô Tìm kiếm User */}
          <div className="relative w-full sm:w-[300px]">
            <input
              type="text"
              placeholder="Tìm kiếm tài khoản, email, tên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 bg-white rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-gray-900"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Nội dung bảng */}
        {isUsersLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <svg className="animate-spin h-8 w-8 text-teal-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm">Đang tải danh sách tài khoản...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-gray-500 border border-dashed border-gray-200 rounded-lg">
            Không tìm thấy tài khoản nào.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border border-gray-200 rounded-lg overflow-hidden text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Tài khoản</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Họ & Tên</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Vai trò</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Trạng thái</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u) => {
                  const isSelf = currentUser && String(currentUser.id) === String(u.id);
                  const fullName = `${u.first_name || ""} ${u.last_name || ""}`.trim() || "-";
                  const isLocked = u.locked;
                  
                  return (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-900">{u.account}</td>
                      <td className="px-4 py-3 text-gray-700">{fullName}</td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">{u.email}</td>
                      <td className="px-4 py-3">
                        {u.role === 1 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800">
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                            User
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isLocked ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Bị khóa
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Hoạt động
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isSelf ? (
                          <span className="text-xs text-gray-400 italic">Tài khoản hiện tại</span>
                        ) : isLocked ? (
                          <button
                            onClick={() => handleOpenConfirm(u, "unlock")}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg text-xs font-semibold transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                            </svg>
                            Mở khóa
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenConfirm(u, "lock")}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-semibold transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Khóa
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Popups xác nhận */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.action === "lock" ? "Xác nhận khóa tài khoản" : "Xác nhận mở khóa tài khoản"}
        message={`Bạn có chắc chắn muốn ${
          confirmModal.action === "lock" ? "khóa" : "mở khóa"
        } tài khoản "${confirmModal.account}" (${confirmModal.email}) không? Người dùng bị khóa sẽ không thể truy cập hệ thống.`}
        confirmText={confirmModal.action === "lock" ? "Khóa tài khoản" : "Mở khóa"}
        confirmButtonClass={
          confirmModal.action === "lock"
            ? "bg-red-600 hover:bg-red-700 text-white"
            : "bg-green-600 hover:bg-green-700 text-white"
        }
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
