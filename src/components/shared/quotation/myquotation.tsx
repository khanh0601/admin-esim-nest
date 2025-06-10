// app/(admin)/product-list/page.tsx
"use client";
import { useState } from "react";

const mockData = [
  {
    "productName":"AIS399 Multi-region, 8 Days, 6GB, 384kbps",
    "region":"Worldwide",
    "type":"eSIM",
    "price":13,
    "cendPrice":"-",
    "showed":"N"
  },
  {
    "productName":"AIS899 Multi-region, 15 Days, 6GB, 384kbps",
    "region":"Worldwide",
    "type":"eSIM",
    "price":32,
    "cendPrice":"-",
    "showed":"N"
  },
  {
    "productName":"Brazil TIM, 30 Days, 15GB",
    "region":"Brazil",
    "type":"eSIM",
    "price":24,
    "cendPrice":"-",
    "showed":"N"
  },
  {
    "productName":"DTAC Thailand Happy Tourist219",
    "region":"Thailand",
    "type":"eSIM",
    "price":5,
    "cendPrice":"-",
    "showed":"N"
  },
  {
    "productName":"DTAC Thailand Happy Tourist349",
    "region":"Thailand",
    "type":"eSIM",
    "price":8,
    "cendPrice":"-",
    "showed":"N"
  },
  {
    "productName":"DTAC Thailand Happy Tourist449",
    "region":"Thailand",
    "type":"eSIM",
    "price":11,
    "cendPrice":"-",
    "showed":"N"
  },
  {
    "productName":"Japan IIJ, 5 Days, 50GB, 256kbps",
    "region":"Japan",
    "type":"eSIM",
    "price":22,
    "cendPrice":"-",
    "showed":"N"
  },
  {
    "productName":"Japan IIJ, 5 Days, 50GB, 256kbps",
    "region":"Japan",
    "type":"eSIM",
    "price":24,
    "cendPrice":"-",
    "showed":"N"
  },
  {
    "productName":"Japan IIJ, 7 Days, 50GB, 256kbps",
    "region":"Japan",
    "type":"eSIM",
    "price":23,
    "cendPrice":"-",
    "showed":"N"
  },
  {
    "productName":"Japan IIJ, 10 Days, 50GB, 256kbps",
    "region":"Japan",
    "type":"eSIM",
    "price":26,
    "cendPrice":"-",
    "showed":"N"
  },
  {
    "productName":"Japan IIJ, 30 Days, 50GB, 256kbps",
    "region":"Japan",
    "type":"eSIM",
    "price":31,
    "cendPrice":"-",
    "showed":"N"
  },
  {
    "productName":"Japan KDDI, 4 Days, Unlimited Data \/day",
    "region":"Japan",
    "type":"eSIM",
    "price":17,
    "cendPrice":"-",
    "showed":"N"
  },
  {
    "productName":"Japan KDDI, 7 Days, Unlimited Data \/day",
    "region":"Japan",
    "type":"eSIM",
    "price":20,
    "cendPrice":"-",
    "showed":"N"
  },
  {
    "productName":"Japan KDDI, 10 Days, Unlimited Data \/day",
    "region":"Japan",
    "type":"eSIM",
    "price":25,
    "cendPrice":"-",
    "showed":"N"
  },
  {
    "productName":"Japan KDDI, 15 Days, Unlimited Data \/day",
    "region":"Japan",
    "type":"eSIM",
    "price":27,
    "cendPrice":"-",
    "showed":"N"
  },
  {
    "productName":"Laos Unitel, 5 Days, 10GB",
    "region":"Laos",
    "type":"eSIM",
    "price":3,
    "cendPrice":"-",
    "showed":"N"
  },
  {
    "productName":"Laos Unitel, 10 Days, 15GB",
    "region":"Laos",
    "type":"eSIM",
    "price":4,
    "cendPrice":"-",
    "showed":"N"
  },
  {
    "productName":"Laos Unitel, 15 Days, 30GB",
    "region":"Laos",
    "type":"eSIM",
    "price":5,
    "cendPrice":"-",
    "showed":"N"
  },
  {
    "productName":"Morocco, 30 Days, 10GB",
    "region":"Morocco",
    "type":"eSIM",
    "price":8,
    "cendPrice":"-",
    "showed":"N"
  },
  {
    "productName":"Mongolia Unitel, 10 Days, 15GB",
    "region":"Mongolia",
    "type":"eSIM",
    "price":9,
    "cendPrice":"-",
    "showed":"N"
  },
  {
    "productName":"O2 EU, 30 Days, 35GB",
    "region":"Europe",
    "type":"eSIM",
    "price":13,
    "cendPrice":"-",
    "showed":"N"
  },
  {
    "productName":"Europe Orange, 30 Days, 30GB, Unlimited talk, 1000 msg",
    "region":"Europe",
    "type":"eSIM",
    "price":22,
    "cendPrice":"-",
    "showed":"N"
  },
  {
    "productName":"Europe Orange, 30 Days, 100GB, Unlimited talk, 1000 msg",
    "region":"Europe",
    "type":"eSIM",
    "price":32,
    "cendPrice":"-",
    "showed":"N"
  },
  {
    "productName":"Europe Orange, 30 Days, 12GB, Unlimited talk, 200 msg",
    "region":"Europe",
    "type":"eSIM",
    "price":20,
    "cendPrice":"-",
    "showed":"N"
  },
  {
    "productName":"Orange-World Global, 14 Days",
    "region":"Worldwide",
    "type":"eSIM",
    "price":5,
    "cendPrice":"-",
    "showed":"N"
  },
  {
    "productName":"Thailand, 1 Day, Unlimited data\/day, 10mbps",
    "region":"Thailand",
    "type":"eSIM",
    "price":3,
    "cendPrice":"-",
    "showed":"N"
  },
  {
    "productName":"Thailand, 3 Days, Unlimited data\/Days, 10mbps",
    "region":"Thailand",
    "type":"eSIM",
    "price":4,
    "cendPrice":"-",
    "showed":"N"
  },
  {
    "productName":"Thailand, 5 Days, Unlimited data\/Days, 10mbps",
    "region":"Thailand",
    "type":"eSIM",
    "price":6,
    "cendPrice":"-",
    "showed":"N"
  },
  {
    "productName":"Thailand, 7 Days, Unlimited data\/Days, 10mbps",
    "region":"Thailand",
    "type":"eSIM",
    "price":8,
    "cendPrice":"-",
    "showed":"N"
  },
  {
    "productName":"Thailand, 10 Days, Unlimited data\/Days, 10mbps",
    "region":"Thailand",
    "type":"eSIM",
    "price":10,
    "cendPrice":"-",
    "showed":"N"
  },
  {
    "productName":"Thailand, 15 Days, Unlimited data\/Days, 10mbps",
    "region":"Thailand",
    "type":"eSIM",
    "price":16,
    "cendPrice":"-",
    "showed":"N"
  },
  {
    "productName":"Thailand, 20 Days, Unlimited data\/Days, 10mbps",
    "region":"Thailand",
    "type":"eSIM",
    "price":19,
    "cendPrice":"-",
    "showed":"N"
  },
  {
    "productName":"Thailand, 30 Days, Unlimited data\/Days, 10mbps",
    "region":"Thailand",
    "type":"eSIM",
    "price":21,
    "cendPrice":"-",
    "showed":"N"
  },
  {
    "productName":"TRUE- Travel Asia 399",
    "region":"Asia",
    "type":"eSIM",
    "price":31,
    "cendPrice":"-",
    "showed":"N"
  }
]

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
