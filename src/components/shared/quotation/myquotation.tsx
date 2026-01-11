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

  const handleReset = () => {
    setKeyword("");
    setRegionFilter("");
    setTypeFilter("");
  };

  return (
    <div className="p-6">
      {/* Search Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            placeholder="Product Name"
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all flex-1 min-w-[200px]"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setCurrentPage(1)}
          />
          <select
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
          >
            <option value="">Applicable Region</option>
            {uniqueRegions.map((region, i) => (
              <option key={i} value={region}>{region}</option>
            ))}
          </select>
          <select
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">Product Type</option>
            {uniqueTypes.map((type, i) => (
              <option key={i} value={type}>{type}</option>
            ))}
          </select>
          <button 
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
            onClick={() => setCurrentPage(1)}
          >
            Search
          </button>
          <button
            className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors duration-200"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
          <button className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Product Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Applicable Region</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Product Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Price</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">C-end Price</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Showed on C-end</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginated.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-4 py-3 text-gray-900 font-medium">{item.productName}</td>
                <td className="px-4 py-3 text-gray-600">{item.region}</td>
                <td className="px-4 py-3 text-gray-600">{item.type}</td>
                <td className="px-4 py-3 text-gray-700 font-semibold">${item.price}</td>
                <td className="px-4 py-3 text-gray-600">{item.cendPrice}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.showed === 'Y' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {item.showed}
                  </span>
                </td>
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
    </div>
  );
}
