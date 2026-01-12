"use client";
import { useState, useRef } from "react";
import { useAuthStore } from "@/lib/stores";
import { productApi } from "@/lib/api";
import type { Product, ApiError } from "@/lib/api/types";

// Mock data với format mới
const mockData = [
  {
    "supplier": "Airalo",
    "product_code": "ESIM_VN_7D",
    "product_type": "eSIM",
    "product_name_vi": "Gói eSIM Việt Nam 7 ngày",
    "product_name_en": "Vietnam eSIM 7 Days",
    "sale_price": 50000,
    "days": 7,
    "plan_type": 1,
    "data": "5GB",
    "network_types": "4G/5G",
    "coverage_area_en": "Vietnam",
    "coverage_area_vi": "Việt Nam",
    "telecommunication_providers": "Viettel, Vinaphone",
    "notification_en": "Instant activation",
    "notification_vi": "Kích hoạt ngay lập tức",
    "data_reset_date_reset_en": "No reset - one-time data",
    "data_reset_date_reset_vi": "Không reset - dùng một lần",
    "prepaid_card": "No",
    "apn": "internet",
    "roaming_carrier": "Viettel",
    "sms": 1,
    "receive": 1,
    "call": 0,
    "tiktok": 1,
    "chat_gpt": 1,
  },
  {
    "supplier": "Airalo",
    "product_code": "ESIM_TH_15D",
    "product_type": "eSIM",
    "product_name_vi": "Gói eSIM Thái Lan 15 ngày",
    "product_name_en": "Thailand eSIM 15 Days",
    "sale_price": 35000,
    "days": 15,
    "plan_type": 1,
    "data": "10GB",
    "network_types": "4G/5G",
    "coverage_area_en": "Thailand",
    "coverage_area_vi": "Thái Lan",
    "telecommunication_providers": "AIS, True, dtac",
    "notification_en": "Instant activation",
    "notification_vi": "Kích hoạt ngay lập tức",
    "data_reset_date_reset_en": "No reset - one-time data",
    "data_reset_date_reset_vi": "Không reset - dùng một lần",
    "prepaid_card": "No",
    "apn": "internet",
    "roaming_carrier": "AIS",
    "sms": 1,
    "receive": 1,
    "call": 1,
    "tiktok": 1,
    "chat_gpt": 0,
  },
  {
    "supplier": "Airalo",
    "product_code": "ESIM_JP_30D",
    "product_type": "eSIM",
    "product_name_vi": "Gói eSIM Nhật Bản 30 ngày",
    "product_name_en": "Japan eSIM 30 Days",
    "sale_price": 75000,
    "days": 30,
    "plan_type": 2,
    "data": "Unlimited",
    "network_types": "4G/5G",
    "coverage_area_en": "Japan",
    "coverage_area_vi": "Nhật Bản",
    "telecommunication_providers": "SoftBank, NTT Docomo",
    "notification_en": "Instant activation",
    "notification_vi": "Kích hoạt ngay lập tức",
    "data_reset_date_reset_en": "Daily reset",
    "data_reset_date_reset_vi": "Reset hàng ngày",
    "prepaid_card": "No",
    "apn": "internet",
    "roaming_carrier": "SoftBank",
    "sms": 0,
    "receive": 1,
    "call": 0,
    "tiktok": 1,
    "chat_gpt": 1,
  },
  {
    "supplier": "Airalo",
    "product_code": "ESIM_US_UNLIMITED",
    "product_type": "eSIM",
    "product_name_vi": "Gói eSIM Mỹ không giới hạn",
    "product_name_en": "USA eSIM Unlimited",
    "sale_price": 120000,
    "days": 0,
    "plan_type": 3,
    "data": "Unlimited",
    "network_types": "4G/5G",
    "coverage_area_en": "United States",
    "coverage_area_vi": "Hoa Kỳ",
    "telecommunication_providers": "AT&T, T-Mobile, Verizon",
    "notification_en": "Instant activation",
    "notification_vi": "Kích hoạt ngay lập tức",
    "data_reset_date_reset_en": "No reset - unlimited",
    "data_reset_date_reset_vi": "Không reset - không giới hạn",
    "prepaid_card": "Yes",
    "apn": "internet",
    "roaming_carrier": "AT&T",
    "sms": 1,
    "receive": 1,
    "call": 1,
    "tiktok": 1,
    "chat_gpt": 1,
  },
];

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

export default function MyQuotation() {
  const [currentPage, setCurrentPage] = useState(1);
  const [productName, setProductName] = useState("");
  const [productCode, setProductCode] = useState("");
  const [coverageArea, setCoverageArea] = useState("");
  const [planType, setPlanType] = useState<number | "">("");
  const [productType, setProductType] = useState<string>("");
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { role } = useAuthStore();

  // API states
  const [products, setProducts] = useState<Product[]>(mockData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(mockData.length);

  // Use products from API or mockData as fallback
  const filtered = products.filter(
    (d) =>
      (productName ? 
        (d.product_name_en.toLowerCase().includes(productName.toLowerCase()) ||
         d.product_name_vi.toLowerCase().includes(productName.toLowerCase())) : true) &&
      (productCode ? d.product_code.toLowerCase().includes(productCode.toLowerCase()) : true) &&
      (coverageArea ? 
        (d.coverage_area_en.toLowerCase().includes(coverageArea.toLowerCase()) ||
         d.coverage_area_vi.toLowerCase().includes(coverageArea.toLowerCase())) : true) &&
      (planType !== "" ? d.plan_type === planType : true)
  );

  const totalPages = Math.ceil(totalItems / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setCurrentPage(1);

      const response = await productApi.search({
        product_name: productName || undefined,
        product_code: productCode || undefined,
        coverage_area: coverageArea || undefined,
        plan_type: planType !== "" ? planType : undefined,
        product_type: productType || undefined,
        page: 1,
        limit: pageSize,
      });

      if (response.data) {
        setProducts(response.data);
        setTotalItems(response.total || response.data.length);
      } else {
        // Fallback to mockData if API returns no data
        setProducts(mockData);
        setTotalItems(mockData.length);
      }
    } catch (err) {
      console.error("Search products error:", err);
      const apiError = err as ApiError;
      setError(apiError.message || "Failed to search products");
      // Fallback to mockData on error
      setProducts(mockData);
      setTotalItems(mockData.length);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setProductName("");
    setProductCode("");
    setCoverageArea("");
    setPlanType("");
    setProductType("");
    // Reset to initial state (could also call API with empty params)
    setProducts(mockData);
    setTotalItems(mockData.length);
    setCurrentPage(1);
    setError(null);
  };

  const handleAdd = () => {
    // TODO: Implement add product functionality
    console.log("Add product");
    alert("Add product functionality - to be implemented");
  };

  const handleEdit = (item: typeof mockData[0]) => {
    // TODO: Implement edit product functionality
    console.log("Edit product:", item);
    alert(`Edit product: ${item.product_code} - to be implemented`);
  };

  const handleDelete = (item: typeof mockData[0]) => {
    // TODO: Implement delete product functionality
    if (confirm(`Are you sure you want to delete product "${item.product_code}"?`)) {
      console.log("Delete product:", item);
      alert(`Delete product: ${item.product_code} - to be implemented`);
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
    if (selectedItems.size === paginated.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(paginated.map((_, index) => (currentPage - 1) * pageSize + index)));
    }
  };

  const handleDeleteSelected = () => {
    const selectedCount = selectedItems.size;
    if (selectedCount === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedCount} product(s)?`)) {
      // TODO: Implement batch delete functionality
      const selectedItemsList = Array.from(selectedItems).map((index) => filtered[index]);
      console.log("Delete products:", selectedItemsList);
      alert(`Delete ${selectedCount} product(s) - to be implemented`);
      setSelectedItems(new Set());
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

  const handleSubmitImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Please select a CSV file");
      return;
    }
    
    // TODO: Implement CSV file processing
    console.log("Import file:", selectedFile.name, selectedFile);
    alert(`Importing file: ${selectedFile.name} - to be implemented`);
    
    // Close modal and reset
    handleCloseModal();
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
              <label htmlFor="product-code" className="block text-sm font-medium text-gray-700 mb-2">
                Product Code
              </label>
              <input
                id="product-code"
                type="text"
                placeholder="Enter product code"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div>
              <label htmlFor="coverage-area" className="block text-sm font-medium text-gray-700 mb-2">
                Coverage Area
              </label>
              <input
                id="coverage-area"
                type="text"
                placeholder="Enter coverage area"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                value={coverageArea}
                onChange={(e) => setCoverageArea(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
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
                <option value="sim">SIM</option>
                <option value="esim">eSIM</option>
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
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSearch}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </>
              )}
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
          <button className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
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
      <div className="overflow-x-auto rounded-lg border border-gray-200 w-full">
        <table className="text-sm min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {role === 1 && (
                <>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap w-12">
                    <input
                      type="checkbox"
                      checked={selectedItems.size > 0 && selectedItems.size === paginated.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Actions</th>
                </>
              )}
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
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Data Reset</th>
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
            {paginated.map((item, index) => {
              const globalIndex = (currentPage - 1) * pageSize + index;
              const isSelected = selectedItems.has(globalIndex);
              
              return (
                <tr key={index} className={`hover:bg-gray-50 transition-colors duration-150 ${isSelected ? 'bg-blue-50' : ''}`}>
                  {role === 1 && (
                    <>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(globalIndex)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
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
                        </div>
                      </td>
                    </>
                  )}
                  <td className="px-4 py-3 text-gray-900">{item.supplier}</td>
                <td className="px-4 py-3 text-gray-900 font-medium">{item.product_code}</td>
                <td className="px-4 py-3 text-gray-600">{item.product_type}</td>
                <td className="px-4 py-3 text-gray-900">{item.product_name_vi}</td>
                <td className="px-4 py-3 text-gray-900">{item.product_name_en}</td>
                <td className="px-4 py-3 text-gray-700 font-semibold">{item.sale_price.toLocaleString('vi-VN')} VND</td>
                <td className="px-4 py-3 text-gray-600">{item.days || "-"}</td>
                <td className="px-4 py-3 text-gray-600">{getPlanTypeLabel(item.plan_type)}</td>
                <td className="px-4 py-3 text-gray-600">{item.data}</td>
                <td className="px-4 py-3 text-gray-600">{item.network_types}</td>
                <td className="px-4 py-3 text-gray-600">{item.coverage_area_en}</td>
                <td className="px-4 py-3 text-gray-600">{item.coverage_area_vi}</td>
                <td className="px-4 py-3 text-gray-600">{item.telecommunication_providers}</td>
                <td className="px-4 py-3 text-gray-600">{item.notification_en}</td>
                <td className="px-4 py-3 text-gray-600">{item.notification_vi}</td>
                <td className="px-4 py-3 text-gray-600">{item.data_reset_date_reset_vi}</td>
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
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t border-gray-200 w-full">
        <span className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{1 + (currentPage - 1) * pageSize}</span> to{" "}
          <span className="font-semibold text-gray-900">{Math.min(currentPage * pageSize, totalItems)}</span> of{" "}
          <span className="font-semibold text-gray-900">{totalItems}</span> entries
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
          >
            Previous
          </button>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={i}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    currentPage === pageNum
                      ? "bg-teal-600 text-white shadow-sm"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium shadow-sm hover:shadow-md"
          >
            Next
          </button>
        </div>
      </div>

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
                  disabled={!selectedFile}
                  className="flex-1 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
