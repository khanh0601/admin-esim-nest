// app/(admin)/order-billing/page.tsx
"use client";
import { useState } from "react";

const mockOrders = Array.from({ length: 53 }, (_, i) => ({
  orderNumber: `b00005225060200${i + 1}`,
  orderDate: `2025/06/02 03:${String(40 - i % 40).padStart(2, '0')}:21`,
  totalPrice: i % 3 === 0 ? 1904 : 2856,
  orderType: "create by company",
  receivedType: "Receivable",
  status: "Success",
  lastHistory: `Shipped 2025/06/02 03:${String(40 - i % 40).padStart(2, '0')}:21`
}));

const pageSize = 10;

export default function ListBill() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  const filtered = mockOrders.filter((order) =>
    order.orderNumber.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalPayable = filtered.reduce((sum, order) => sum + order.totalPrice, 0);

  return (
    <div className="p-6">
      {/* Search Filters */}
      <div className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <input
            placeholder="Order number"
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <input 
            placeholder="SIM/ICCID" 
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all" 
          />
          <input 
            placeholder="Redemption" 
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all" 
          />
          <select className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white">
            <option>History</option>
          </select>
          <select className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white">
            <option>Received Type</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <input 
              type="date" 
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" 
              defaultValue="2025-06-01" 
            />
            <span className="text-gray-500">~</span>
            <input 
              type="date" 
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" 
              defaultValue="2025-06-30" 
            />
          </div>
          <div className="flex gap-2">
            <button className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md">
              Search
            </button>
            <button className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors duration-200">
              Reset
            </button>
            <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export billing
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Order number</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Order Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Price</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Order Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Received Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Latest History</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginated.map((order, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-4 py-3 text-teal-600 font-medium cursor-pointer hover:text-teal-700 hover:underline">
                  {order.orderNumber}
                </td>
                <td className="px-4 py-3 text-gray-700">{order.orderDate}</td>
                <td className="px-4 py-3 text-gray-700 font-medium">${order.totalPrice.toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-600">{order.orderType}</td>
                <td className="px-4 py-3 text-gray-600">{order.receivedType}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{order.lastHistory}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t border-gray-200">
        <span className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{1 + (currentPage - 1) * pageSize}</span> to{" "}
          <span className="font-semibold text-gray-900">{Math.min(currentPage * pageSize, filtered.length)}</span> of{" "}
          <span className="font-semibold text-gray-900">{filtered.length}</span> entries
          {filtered.length !== mockOrders.length && (
            <span className="text-gray-500"> (filtered from {mockOrders.length} total entries)</span>
          )}
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

      {/* Summary */}
      <div className="mt-6 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-lg py-5 px-6">
        <div className="flex justify-end">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-700 mb-3">06/01~06/02 Total Price as below</p>
            <div className="space-y-1.5">
              <p className="text-sm text-gray-600">
                Paid (USD): <span className="font-bold text-teal-600 ml-2">0</span>
              </p>
              <p className="text-sm text-gray-600">
                Payable (USD): <span className="font-bold text-teal-600 ml-2">{totalPayable.toLocaleString()}</span>
              </p>
              <p className="text-sm text-gray-700 font-semibold pt-2 border-t border-teal-200">
                Total (USD): <span className="text-teal-600 ml-2 text-lg">{totalPayable.toLocaleString()}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
