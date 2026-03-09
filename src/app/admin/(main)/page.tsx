'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  lowStockItems: number;
  outOfStock: number;
  totalValue: number;
}

interface RecentActivity {
  id: string;
  type: 'add' | 'update' | 'delete' | 'stock';
  message: string;
  timestamp: string;
  productName?: string;
}

interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  category: string;
}

export default function AdminHomePage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCategories: 0,
    lowStockItems: 0,
    outOfStock: 0,
    totalValue: 0,
  });

  const [loading, setLoading] = useState(true);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/getAllProducts');
      const data = await response.json();

      if (data.success && data.products) {
        const products = data.products;

        const categories = new Set(products.map((p: any) => p.category));
        const lowStock = products.filter((p: any) => p.stock > 0 && p.stock <= 10);
        const outOfStock = products.filter((p: any) => p.stock === 0);
        const totalValue = products.reduce((sum: number, p: any) =>
          sum + (p.sellingPrice * p.stock), 0
        );

        setStats({
          totalProducts: products.length,
          totalCategories: categories.size,
          lowStockItems: lowStock.length,
          outOfStock: outOfStock.length,
          totalValue: totalValue,
        });

        setLowStockProducts(
          lowStock.slice(0, 5).map((p: any) => ({
            id: p.id,
            name: p.name,
            stock: p.stock,
            category: p.category,
          }))
        );

        setRecentActivities([
          {
            id: '1',
            type: 'add',
            message: 'New product added',
            timestamp: new Date().toISOString(),
          },
          {
            id: '2',
            type: 'update',
            message: 'Product updated',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const StatCard = ({
    title,
    value,
    icon,
    color,
    trend,
    link,
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    trend?: string;
    link?: string;
  }) => (
    <div className={`relative group bg-gradient-to-br ${color} rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl`}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}></div>
      </div>

      <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"></div>

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
            {icon}
          </div>
          {trend && (
            <span className="text-xs bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full font-semibold">
              {trend}
            </span>
          )}
        </div>

        <h3 className="text-white/90 text-sm font-medium mb-1">{title}</h3>
        <p className="text-white text-3xl font-black mb-2">{value}</p>

        {link && (
          <Link href={link} className="text-white/80 text-xs hover:text-white transition-colors inline-flex items-center gap-1 group/link">
            View Details
            <svg className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );

  // Define stat cards as an array so keys can be applied
  const statCards = [
    {
      key: 'total-products',
      title: 'Total Products',
      value: stats.totalProducts,
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: 'from-cyan-500 to-blue-600',
      link: '/admin/products',
    },
    {
      key: 'categories',
      title: 'Categories',
      value: stats.totalCategories,
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      color: 'from-purple-500 to-pink-600',
      link: '/admin/products',
    },
    {
      key: 'low-stock',
      title: 'Low Stock Alert',
      value: stats.lowStockItems,
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      color: 'from-orange-500 to-red-600',
      trend: '⚠️ Action needed',
    },
    {
      key: 'out-of-stock',
      title: 'Out of Stock',
      value: stats.outOfStock,
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      color: 'from-red-500 to-rose-600',
      trend: stats.outOfStock > 0 ? '🔴 Critical' : '✅ Good',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-slate-400 text-lg">Welcome back! Here's what's happening with your store.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-slate-400">Last Updated</p>
            <p className="text-sm font-semibold text-white">{new Date().toLocaleTimeString()}</p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors group"
            title="Refresh"
          >
            <svg className="w-5 h-5 text-cyan-400 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <StatCard
            key={card.key}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            trend={card.trend}
            link={card.link}
          />
        ))}
      </div>

      {/* Inventory Value Card */}
      <div className="bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}></div>
        </div>

        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-white/90 text-lg font-medium mb-2">Total Inventory Value</p>
            <p className="text-white text-5xl font-black">{formatCurrency(stats.totalValue)}</p>
            <p className="text-white/70 text-sm mt-2">Based on current stock × selling price</p>
          </div>
          <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1 bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Actions
          </h2>

          <div className="space-y-3">
            <Link
              href="/admin/products/add"
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-xl hover:border-cyan-400 transition-all group"
            >
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white group-hover:text-cyan-400 transition-colors">Add New Product</p>
                <p className="text-xs text-slate-400">Create a new product listing</p>
              </div>
              <svg className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="/admin/products"
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-xl hover:border-purple-400 transition-all group"
            >
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white group-hover:text-purple-400 transition-colors">Manage Products</p>
                <p className="text-xs text-slate-400">View and edit all products</p>
              </div>
              <svg className="w-4 h-4 text-slate-400 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <button
              onClick={fetchDashboardData}
              className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 rounded-xl hover:border-emerald-400 transition-all group"
            >
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-white group-hover:text-emerald-400 transition-colors">Refresh Data</p>
                <p className="text-xs text-slate-400">Update dashboard statistics</p>
              </div>
              <svg className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Low Stock Alert
            </h2>
            <Link
              href="/admin/products?filter=lowstock"
              className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
            >
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {lowStockProducts.length > 0 ? (
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-orange-400/50 transition-all group"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                      <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white">{product.name}</p>
                      <p className="text-sm text-slate-400">{product.category?.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-slate-400">Stock</p>
                      <p className={`text-lg font-bold ${
                        product.stock <= 3 ? 'text-red-400' :
                        product.stock <= 7 ? 'text-orange-400' :
                        'text-yellow-400'
                      }`}>
                        {product.stock} units
                      </p>
                    </div>

                    <Link
                      href={`/admin/products/edit/${product.id}`}
                      className="p-2 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-slate-400">All products are well stocked!</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Recent Activity
          </h2>
        </div>

        <div className="space-y-3">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 p-4 bg-slate-800/50 border border-slate-700 rounded-xl"
              >
                <div className={`p-2 rounded-lg ${
                  activity.type === 'add' ? 'bg-green-500/20' :
                  activity.type === 'update' ? 'bg-blue-500/20' :
                  activity.type === 'delete' ? 'bg-red-500/20' :
                  'bg-orange-500/20'
                }`}>
                  {activity.type === 'add' ? (
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  ) : activity.type === 'update' ? (
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  ) : activity.type === 'delete' ? (
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  )}
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-white">{activity.message}</p>
                  {activity.productName && (
                    <p className="text-sm text-slate-400">{activity.productName}</p>
                  )}
                </div>

                <p className="text-sm text-slate-500">{formatDate(activity.timestamp)}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400">No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}