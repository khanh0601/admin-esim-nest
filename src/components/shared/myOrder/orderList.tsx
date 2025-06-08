// app/(admin)/order-tracking/page.tsx
"use client";
import { useState } from "react";

const mockOrders = Array.from({ length: 53 }, (_, i) => ({
  orderNumber: `b00005225060200${i + 1}`,
  ecommerceOrder: `ecom-${1000 + i}`,
  orderDate: `2025/06/02 03:${String(40 - i % 40).padStart(2, '0')}:21`,
  quantity: i % 2 === 0 ? 2 : 3,
  productType: "eSIM",
  status: "Success",
  lastHistory: `Shipped 2025/06/02 03:${String(40 - i % 40).padStart(2, '0')}:21`
}));

const pageSize = 10;

export default function OrderList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  const filtered = mockOrders.filter((order) =>
    order.orderNumber.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="p-6 bg-white shadow rounded text-sm">
      <div className="grid grid-cols-6 gap-2 mb-4">
        <input
          placeholder="Order number"
          className="border border-gray-300 px-3 py-2 rounded col-span-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input placeholder="E-commerce Order" className="border border-gray-300 px-3 py-2 rounded col-span-1" />
        
        <select className="border border-gray-300 px-3 py-2 rounded col-span-1">
          <option>Product Type</option>
        </select>
        <select className="border border-gray-300 px-3 py-2 rounded col-span-1">
          <option>History</option>
        </select>
      </div>

      <div className="mb-4 flex items-center gap-2">
      <input type="date" className="border border-gray-300 px-2 py-2 rounded col-span-1" defaultValue="2025-06-01" />
      <input type="date" className="border border-gray-300 px-2 py-2 rounded col-span-1" defaultValue="2025-06-30" />
        <button className="bg-yellow-500 text-white px-4 py-2 rounded">Search</button>
        <button className="bg-red-500 text-white px-4 py-2 rounded">Reset</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-2 py-2 text-left">Order number</th>
              <th className="border border-gray-300 px-2 py-2 text-left">E-commerce Order</th>
              <th className="border border-gray-300 px-2 py-2 text-left">Order Date</th>
              <th className="border border-gray-300 px-2 py-2 text-left">Quantity</th>
              <th className="border border-gray-300 px-2 py-2 text-left">Product Type</th>
              <th className="border border-gray-300 px-2 py-2 text-left">Status</th>
              <th className="border border-gray-300 px-2 py-2 text-left">Lastest History</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((order, index) => (
              <tr key={index}>
                <td className="border border-gray-300 px-2 py-2 text-[#5E31F9] font-medium cursor-pointer hover:underline">
                  {order.orderNumber}
                </td>
                <td className="border border-gray-300 px-2 py-2">{order.ecommerceOrder}</td>
                <td className="border border-gray-300 px-2 py-2">{order.orderDate}</td>
                <td className="border border-gray-300 px-2 py-2">{order.quantity}</td>
                <td className="border border-gray-300 px-2 py-2">{order.productType}</td>
                <td className="border border-gray-300 px-2 py-2">{order.status}</td>
                <td className="border border-gray-300 px-2 py-2">{order.lastHistory}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <span className="text-gray-600">
          Showing {1 + (currentPage - 1) * pageSize} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} entries (filtered from {mockOrders.length} total entries)
        </span>
        <div className="flex gap-2">
          <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="px-3 py-1 border border-gray-300 rounded">
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border border-gray-300 rounded ${currentPage === i + 1 ? "bg-teal-500 text-white" : ""}`}
            >
              {i + 1}
            </button>
          ))}
          <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1 border border-gray-300 rounded">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
