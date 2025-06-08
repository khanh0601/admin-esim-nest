// app/(admin)/return-management/page.tsx
"use client";
import { useState } from "react";
type ReturnEntry = {
  returnNumber: string;
  returnDate: string;
  totalRefund: number;
  branch: string;
  status: string;
};

const mockReturns: ReturnEntry[] = Array.from({ length: 0 }, (_, i) => ({
  returnNumber: `R2025-060${i + 1}`,
  returnDate: `2025/06/${String(1 + (i % 30)).padStart(2, "0")}`,
  totalRefund: 2000 + i * 100,
  branch: i % 2 === 0 ? "Hanoi HQ" : "HCM Office",
  status: i % 3 === 0 ? "Pending" : i % 3 === 1 ? "Approved" : "Rejected",
}));
const pageSize = 10;

export default function ReturnManagementPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchReturnNumber, setSearchReturnNumber] = useState("");

  const filtered = mockReturns.filter((r) =>
    r.returnNumber.toLowerCase().includes(searchReturnNumber.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="p-6 bg-white shadow rounded text-sm">
      <div className="grid grid-cols-6 gap-2 mb-4">
        <input placeholder="SIM/ICCID" className="border  border-gray-300 px-3 py-2 rounded col-span-1" />
        <input placeholder="Redemption" className="border border-gray-300  px-3 py-2 rounded col-span-1" />
        <input placeholder="Original Order Number" className="border border-gray-300  px-3 py-2 rounded col-span-1" />
        <input
          placeholder="Return Number"
          className="border border-gray-300  px-3 py-2 rounded col-span-1"
          value={searchReturnNumber}
          onChange={(e) => setSearchReturnNumber(e.target.value)}
        />
        <select className="border border-gray-300  px-3 py-2 rounded col-span-1">
          <option>Return Status</option>
        </select>
      </div>

      <div className="grid grid-cols-6 gap-2 mb-4">
        <input type="date" className="border border-gray-300  px-3 py-2 rounded col-span-2" defaultValue="2025-06-01" />
        <input type="date" className="border border-gray-300  px-3 py-2 rounded col-span-2" defaultValue="2025-06-30" />
        <div className="flex items-center gap-2 col-span-2">
          <button className="bg-yellow-500 text-white px-4 py-2 rounded">Search</button>
          <button className="bg-red-500 text-white px-4 py-2 rounded">Reset</button>
          <button className="bg-sky-500 text-white px-4 py-2 rounded">Export billing</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border border-gray-300  text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300  px-2 py-2">Return Number</th>
              <th className="border border-gray-300  px-2 py-2">Return Date</th>
              <th className="border border-gray-300  px-2 py-2">Total Refund</th>
              <th className="border border-gray-300  px-2 py-2">Department/Branch</th>
              <th className="border border-gray-300  px-2 py-2">Return Status</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="border border-gray-300  px-2 py-2 text-center text-gray-500">
                  No data available in table
                </td>
              </tr>
            ) : (
              paginated.map((r, idx) => (
                <tr key={idx}>
                  <td className="border border-gray-300  px-2 py-2">{r.returnNumber}</td>
                  <td className="border border-gray-300  px-2 py-2">{r.returnDate}</td>
                  <td className="border border-gray-300  px-2 py-2">{r.totalRefund}</td>
                  <td className="border border-gray-300  px-2 py-2">{r.branch}</td>
                  <td className="border border-gray-300  px-2 py-2">{r.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <span className="text-gray-600">
          Showing {1 + (currentPage - 1) * pageSize} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} entries
        </span>
        <div className="flex gap-2">
          <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="px-3 py-1 border border-gray-300  rounded">
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border border-gray-300  rounded ${currentPage === i + 1 ? "bg-teal-500 text-white" : ""}`}
            >
              {i + 1}
            </button>
          ))}
          <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1 border border-gray-300  rounded">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
