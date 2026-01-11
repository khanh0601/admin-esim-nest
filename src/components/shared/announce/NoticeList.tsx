interface Notice {
  date: string;
  title: string;
  description: string;
  pinned?: boolean;
}

interface Props {
  data: Notice[];
}

export default function NoticeList({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="mt-4 text-sm text-gray-500">No notices found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div
          key={index}
          className={`bg-white border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ${
            item.pinned
              ? "border-teal-300 bg-gradient-to-br from-teal-50/50 to-white"
              : "border-gray-200"
          }`}
        >
          <div className="p-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {item.pinned && (
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-teal-100 rounded-full">
                      <svg
                        className="w-4 h-4 text-teal-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M5.5 17.5a.5.5 0 01-1 0v-11a.5.5 0 011 0v11zM9 2a1 1 0 00-1 1v14a1 1 0 001 1h2a1 1 0 001-1V3a1 1 0 00-1-1H9zM3 2a1 1 0 00-1 1v14a1 1 0 001 1h2a1 1 0 001-1V3a1 1 0 00-1-1H3zM13 2a1 1 0 00-1 1v14a1 1 0 001 1h2a1 1 0 001-1V3a1 1 0 00-1-1h-2z" />
                      </svg>
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-sm text-gray-500">{item.date}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
