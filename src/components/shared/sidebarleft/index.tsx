'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { sidebarData } from "./sidebarData";

export default function Sidebar() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <aside className="w-64 bg-white p-4 text-sm relative shadow-2xs h-full min-h-[calc(100vh-4.75rem)]">
      <ul className="space-y-1 sticky top-24">
        {sidebarData.map((item) => {
          const isParentActive = item.href && pathname.startsWith(item.href);
          const isChildActive = item.children?.some(child => pathname === child.href);
          const isOpen = openMenu === item.title || isChildActive;

          return (
            <li key={item.title}>
              {item.children ? (
                <>
                  <div
                    onClick={() => setOpenMenu(isOpen ? null : item.title)}
                    className={`flex items-center justify-between px-3 py-2 cursor-pointer rounded ${
                      isOpen
                        ? " text-[#5E31F9] font-semibold"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-[.9rem]">
                      <span>{item.icon}</span>
                      <span>{item.title}</span>
                    </div>
                    <span className="text-xl">{isOpen ? "▾" : "▸"}</span>
                  </div>
                  {isOpen && (
                    <ul className="ml-8 mt-1 space-y-1">
                      {item.children.map((sub) => {
                        const isActive = pathname === sub.href;
                        return (
                          <li key={sub.title}>
                            <Link
                              href={sub.href}
                              className={`block px-2 py-1 text-[.9rem] rounded ${
                                isActive
                                  ? "bg-[#F3F0FF] text-[#5E31F9] font-semibold"
                                  : "text-gray-700 hover:text-[#5E31F9]"
                              }`}
                            >
                              {sub.title}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </>
              ) : (
                <Link
                  href={item.href!}
                  className={`flex items-center text-[.9rem] gap-2 px-3 py-2 rounded ${
                    isParentActive
                      ? "bg-[#F3F0FF] text-[#5E31F9] font-semibold"
                      : "hover:bg-gray-100 text-gray-800"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.title}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
