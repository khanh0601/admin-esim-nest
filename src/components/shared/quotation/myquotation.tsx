// app/(admin)/product-list/page.tsx
"use client";
import { useState } from "react";

const mockData = Array.from({ length: 36 }, (_, i) => ({
  company: "WORLDESIM COMPANY LIMITED",
  productName: `Product ${i + 1}`,
  region: i % 2 === 0 ? "Japan" : i % 3 === 0 ? "China" : "Korea",
  type: i % 3 === 0 ? "eSIM" : i % 2 === 0 ? "Top-Up SIM" : "SIM",
  price: 90 + i * 5,
  cendPrice: "-",
  showed: "N",
}));

const pageSize = 10;

export default function MyQuotation() {
  const [currentPage, setCurrentPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const uniqueRegions = Array.from(new Set(mockData.map((d) => d.region)));
  const uniqueTypes = Array.from(new Set(mockData.map((d) => d.type)));

  const filtered = mockData.filter(
    (d) =>
      d.productName.toLowerCase().includes(keyword.toLowerCase()) &&
      (regionFilter ? d.region === regionFilter : true) &&
      (typeFilter ? d.type === typeFilter : true)
  );

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="p-6 bg-white shadow rounded">
      <div className="flex items-center gap-2 mb-4">
        <input
          placeholder="Product Name"
          className="border px-3 py-2 rounded border-gray-300"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <select
          className="border px-3 py-2 rounded border-gray-300"
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
        >
          <option value="">Applicable Region</option>
          {uniqueRegions.map((region, i) => (
            <option key={i} value={region}>{region}</option>
          ))}
        </select>
        <select
          className="border px-3 py-2 rounded border-gray-300"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">Product Type</option>
          {uniqueTypes.map((type, i) => (
            <option key={i} value={type}>{type}</option>
          ))}
        </select>
        <button className="bg-yellow-500 text-white px-4 py-2 rounded">Search</button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={() => {
            setKeyword("");
            setRegionFilter("");
            setTypeFilter("");
          }}
        >
          Reset
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <button className="bg-green-600 text-white px-4 py-2 rounded">Download</button>
        <button className="bg-green-600 text-white px-4 py-2 rounded">Import</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-2 text-left border-gray-300">Company</th>
              <th className="border px-2 py-2 text-left border-gray-300">Product Name</th>
              <th className="border px-2 py-2 text-left border-gray-300">Applicable Region</th>
              <th className="border px-2 py-2 text-left border-gray-300">Product Type</th>
              <th className="border px-2 py-2 text-left border-gray-300">Price</th>
              <th className="border px-2 py-2 text-left border-gray-300">C-end Price</th>
              <th className="border px-2 py-2 text-left border-gray-300">Showed on C-end</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((item, index) => (
              <tr key={index} className="border-t">
                <td className="border px-2 py-2 border-gray-300">{item.company}</td>
                <td className="border px-2 py-2 border-gray-300">{item.productName}</td>
                <td className="border px-2 py-2 border-gray-300">{item.region}</td>
                <td className="border px-2 py-2 border-gray-300">{item.type}</td>
                <td className="border px-2 py-2 border-gray-300">{item.price}</td>
                <td className="border px-2 py-2 border-gray-300">{item.cendPrice}</td>
                <td className="border px-2 py-2 border-gray-300">{item.showed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-600">
          Showing {1 + (currentPage - 1) * pageSize} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} entries
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 border rounded"
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border rounded ${currentPage === i + 1 ? "bg-teal-500 text-white" : ""}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1 border rounded"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
