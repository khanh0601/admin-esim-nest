"use client";

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: Props) {
  return (
    <div className="flex justify-end items-center mt-4">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer"
      >
        Previous
      </button>
      <span className="mx-4">Page {currentPage} of {totalPages}</span>
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-3 py-1 bg-teal-500 text-white rounded disabled:opacity-50 cursor-pointer"
      >
        Next
      </button>
    </div>
  );
}
