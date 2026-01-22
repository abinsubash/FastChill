"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  Package,
  DollarSign,
  Wrench,
  BarChart,
  Layers, Tag
} from "lucide-react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { logout } from "@/redux/slices/authSlice";

export default  function AdminLayout({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Products Management", path: "/admin/products", icon: Package },
    { name: "Categories", path: "/admin/categories", icon: Layers },
    { name: "Brands", path: "/admin/brands", icon: Tag },
    { name: "Sales & Billing", path: "/admin/sales", icon: DollarSign },
    { name: "Repair & Service", path: "/admin/repair", icon: Wrench },
    { name: "Analytics / Reports", path: "/admin/reports", icon: BarChart },
  ];
  const  handleLogout = async () => {
    try {
      // Call logout API to clear cookie
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });

      // Clear Redux
      dispatch(logout());

      // Optional UI cleanup
      setSidebarOpen(false);

      // Redirect to login
      router.replace("/admin/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
    // TODO: clear auth data (redux, cookies, localStorage, etc.)
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-opacity-20 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-blue-950 shadow-lg transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-blue-500">
            <h1 className="text-xl font-bold text-white">FastChill Admin</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white hover:text-blue-100"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                    ? "bg-blue-700 text-white"
                    : "text-blue-100 hover:bg-blue-500"
                    }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-blue-500">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg
               text-red-100 bg-red-600 hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>

        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="lg:hidden bg-white shadow-sm p-4 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-blue-600"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">FastChill Admin</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
