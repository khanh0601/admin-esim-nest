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
    <div className="flex items-center gap-2 mb-4">
      <input
        type="text"
        placeholder="Enter a keyword"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className="border p-2 rounded w-full max-w-sm border-gray-300"
      />
      <button onClick={handleSearch} className="bg-yellow-400 px-4 py-2 rounded text-white">Search</button>
      <button onClick={handleReset} className="bg-red-500 px-4 py-2 rounded text-white">Reset</button>
    </div>
  );
}