"use client";
import { useState } from "react";

interface Props {
  onSearch: (keyword: string) => void;
  onReset: () => void;
}

export default function SearchBar({ onSearch, onReset }: Props) {
  const [keyword, setKeyword] = useState("");

  const handleSearch = () => onSearch(keyword);
  const handleReset = () => {
    setKeyword("");
    onReset();
  };

  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="relative flex-1 max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Enter a keyword to search..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
        />
      </div>
      <button 
        onClick={handleSearch} 
        className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
      >
        Search
      </button>
      <button 
        onClick={handleReset} 
        className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors duration-200"
      >
        Reset
      </button>
    </div>
  );
}