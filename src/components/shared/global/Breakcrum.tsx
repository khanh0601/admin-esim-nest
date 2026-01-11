import Link from 'next/link';

interface BreadcrumbProps {
  title: string;
  path: { label: string; href?: string }[];
}

const Breadcrumb = ({ title, path }: BreadcrumbProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-6 mb-6">
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      <nav className="flex items-center text-sm" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          {path.map((item, index) => (
            <li key={index} className="flex items-center">
              {item.href ? (
                <Link 
                  href={item.href} 
                  className="text-teal-600 hover:text-teal-700 font-medium transition-colors duration-150"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-500 font-medium">{item.label}</span>
              )}
              {index < path.length - 1 && (
                <svg
                  className="mx-2 h-4 w-4 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
};

export default Breadcrumb;
