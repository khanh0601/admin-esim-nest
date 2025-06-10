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
    <div className="p-6 bg-white shadow rounded text-sm">
      <div className="grid grid-cols-6 gap-2 mb-4">
        <input
          placeholder="Order number"
          className="border border-gray-300 px-3 py-2 rounded col-span-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input placeholder="SIM/ICCID" className="border border-gray-300 px-3 py-2 rounded col-span-1" />
        <input placeholder="Redemption" className="border border-gray-300 px-3 py-2 rounded col-span-1" />
        <select className="border border-gray-300 px-3 py-2 rounded col-span-1">
          <option>History</option>
        </select>
        <select className="border border-gray-300 px-3 py-2 rounded col-span-1">
          <option>Received Type</option>
        </select>
        
      </div>

      <div className="flex items-center gap-2 mb-4">
        <input type="date" className="border border-gray-300 px-2 py-2 rounded" defaultValue="2025-06-01" />
        <span>~</span>
        <input type="date" className="border border-gray-300 px-2 py-2 rounded" defaultValue="2025-06-30" />
        <div className="col-span-1 flex gap-2">
          <button className="bg-yellow-500 text-white px-4 py-2 rounded">Search</button>
          <button className="bg-red-500 text-white px-4 py-2 rounded">Reset</button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Export billing</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 text-left px-2 py-2">Order number</th>
              <th className="border border-gray-300 text-left px-2 py-2">Order Date</th>
              <th className="border border-gray-300 text-left px-2 py-2">Total Price</th>
              <th className="border border-gray-300 text-left px-2 py-2">Order Type</th>
              <th className="border border-gray-300 text-left px-2 py-2">Received Type</th>
              <th className="border border-gray-300 text-left px-2 py-2">Status</th>
              <th className="border border-gray-300 text-left px-2 py-2">Lastest History</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((order, index) => (
              <tr key={index}>
                <td className="border border-gray-300 px-2 py-2 text-[#5E31F9] font-medium cursor-pointer hover:underline">
                  {order.orderNumber}
                </td>
                <td className="border border-gray-300 px-2 py-2">{order.orderDate}</td>
                <td className="border border-gray-300 px-2 py-2">{order.totalPrice}</td>
                <td className="border border-gray-300 px-2 py-2">{order.orderType}</td>
                <td className="border border-gray-300 px-2 py-2">{order.receivedType}</td>
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

      <div className="mt-6 bg-[#F3F0FF] border border-gray-300 py-4 px-6 text-sm">
        <div className="flex justify-end text-right">
          <div>
            <p className="text-gray-700 font-medium">06/01~06/02 Total Price as below</p>
            <p className="mt-1">Paid (USD)： <span className="font-bold text-[#5E31F9]">0</span></p>
            <p>Payable (USD)： <span className="font-bold text-[#5E31F9]">{totalPayable.toLocaleString()}</span></p>
            <p>Total (USD)： <span className="font-bold text-[#5E31F9]">{totalPayable.toLocaleString()}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
