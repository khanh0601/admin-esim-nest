'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/stores";
import { sidebarData } from "./sidebarData";

export default function Sidebar() {
  const pathname = usePathname();
  const { role } = useAuthStore();

  // Filter menu items based on role
  const filteredMenuItems = sidebarData.filter((item) => {
    // Role = 1: Ẩn /admin/notice, hiển thị tất cả khác kể cả /admin/register
    if (role === 1) {
      return item.href !== "/admin/notice";
    }
    // Role = 0: Ẩn /admin/register, hiển thị tất cả khác
    if (role === 0) {
      return item.href !== "/admin/register";
    }
    // Nếu không có role, hiển thị tất cả (fallback)
    return true;
  });

  return (
    <aside className="w-64 bg-white p-4 text-sm relative shadow-2xs h-full min-h-[calc(100vh-4.75rem)]">
      <ul className="space-y-1 sticky top-24">
        {filteredMenuItems.map((item) => {
          const isActive = item.href && pathname === item.href;

          return (
            <li key={item.title}>
              <Link
                href={item.href!}
                className={`flex items-center text-[.9rem] gap-2 px-3 py-2 rounded ${
                  isActive
                    ? "bg-[#F3F0FF] text-[#5E31F9] font-semibold"
                    : "hover:bg-gray-100 text-gray-800"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.title}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
