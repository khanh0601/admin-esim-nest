// components/Breadcrumb.tsx
import Link from 'next/link';

interface BreadcrumbProps {
  title: string;
  path: { label: string; href?: string }[];
}

const Breadcrumb = ({ title, path }: BreadcrumbProps) => {
  return (
    <div className=" flex justify-between align-middle py-4 mb-4">
      <h1 className="text-2xl font-bold text-gray-400">{title.toUpperCase()}</h1>
      <div className="text-lg text-gray-400 mt-1">
        {path.map((item, index) => (
          <span key={index}>
            {item.href ? (
              <Link href={item.href} className="text-[#5E31F9] hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-500">{item.label}</span>
            )}
            {index < path.length - 1 && <span className="mx-1">/</span>}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Breadcrumb;
