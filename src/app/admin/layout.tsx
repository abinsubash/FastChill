"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", path: "/admin" },
    { name: "Products", path: "/admin/products" },
    { name: "sales", path: "/admin/sales" },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-5">
        <h2 className="text-2xl font-bold mb-8">FastChill Admin</h2>

        <nav className="flex flex-col gap-3">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`p-2 rounded-md ${
                pathname === item.path ? "bg-blue-600" : "hover:bg-gray-700"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Page content */}
      <main className="flex-1 p-5 bg-gray-100 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
