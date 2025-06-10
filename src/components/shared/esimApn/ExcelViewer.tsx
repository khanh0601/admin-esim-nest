// components/ExcelViewer.tsx
"use client";

interface ExcelViewerProps {
  fileUrl: string;
  fileName: string;
}

export default function ExcelViewer({ fileUrl, fileName }: ExcelViewerProps) {
  return (
    <div className="w-full h-screen  bg-white shadow rounded overflow-auto">
      <div className="flex items-end justify-start gap-4 px-4 py-4 border-b border-gray-300">
        <a
          href={fileUrl}
          download
          className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 text-sm"
        >
          Download Excel
        </a>
        <span className="text-lg text-gray-600 font-medium">{fileName}.xlsx</span>
        <div className="w-24" /> {/* để căn giữa tên file */}
      </div>
      <iframe
        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
        className="w-full h-full border-0"
      ></iframe>
    </div>
  );
}
