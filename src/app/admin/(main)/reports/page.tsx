'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  XCircle,
  Clock,
  Wrench,
  AlertTriangle,
  CreditCard,
  Tag,
} from 'lucide-react';

// Types (same as before)
interface MetricCard {
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
  color: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
  }[];
}

interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  stock: number;
  image: string;
  brand: string;
  category: string;
}

interface Order {
  id: string;
  customer: string;
  service: string;
  status: 'completed' | 'pending' | 'in-progress' | 'cancelled';
  amount: number;
  date: string;
  paymentMethod?: string;
}

interface CategoryData {
  name: string;
  value: number;
  count: number;
  color: string;
}

interface AnalyticsData {
  metrics: MetricCard[];
  salesData: ChartData;
  topProducts: TopProduct[];
  categoryData: CategoryData[];
  recentOrders: Order[];
  recentComplaints: Order[];
  inventoryInsights: {
    totalProducts: number;
    totalStock: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    averageStockPerProduct: number;
    stockValue: number;
  };
  paymentMethodData: {
    method: string;
    count: number;
    percentage: number;
  }[];
  brandPerformance: {
    brand: string;
    sales: number;
    revenue: number;
  }[];
  summary: {
    totalBills: number;
    totalComplaints: number;
    completedComplaints: number;
    pendingComplaints: number;
    totalBrands: number;
    totalCategories: number;
  };
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'services' | 'inventory'>('overview');

  // Data states
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/analytics?dateRange=${dateRange}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch analytics');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    const styles = {
      completed: 'bg-green-100 text-green-900',
      'in-progress': 'bg-blue-100 text-blue-900',
      pending: 'bg-orange-100 text-orange-900',
      cancelled: 'bg-red-100 text-red-900',
    };

    const icons = {
      completed: <CheckCircle className="w-3 h-3" />,
      'in-progress': <Clock className="w-3 h-3" />,
      pending: <Clock className="w-3 h-3" />,
      cancelled: <XCircle className="w-3 h-3" />,
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
      </span>
    );
  };

  const exportReport = (format: 'pdf' | 'csv' | 'excel') => {
    if (format === 'csv' && data) {
      const csvRows = [
        ['Metric', 'Value', 'Change'],
        ...data.metrics.map(m => [m.title, m.value, `${m.change}%`]),
        [],
        ['Product', 'Sales', 'Revenue', 'Stock'],
        ...data.topProducts.map(p => [p.name, p.sales, p.revenue, p.stock]),
      ];
      
      const csvContent = csvRows.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } else {
      alert(`Exporting as ${format.toUpperCase()}...`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 text-lg">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white border border-red-200 rounded-2xl p-8 max-w-md shadow-sm">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Analytics</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAnalyticsData}
            className="px-6 py-3 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4 sm:p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics & Reports</h1>
            <p className="text-gray-600 text-sm sm:text-base mt-1">
              Real-time business insights • {dateRange.charAt(0).toUpperCase() + dateRange.slice(1)} view
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAnalyticsData}
              disabled={loading}
              className="p-2 sm:p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => exportReport('csv')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={() => exportReport('excel')}
              className="flex items-center gap-2 px-4 py-2 sm:py-3 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg sm:rounded-xl hover:shadow-lg transition-all text-sm font-semibold"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {(['today', 'week', 'month', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                dateRange === range
                  ? 'bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {(['overview', 'products', 'services', 'inventory'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-blue-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Cards */}
      <section className="px-4 sm:px-6 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.metrics.map((metric, index) => (
            <div
              key={index}
              className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${metric.color === 'from-emerald-500 to-teal-600' ? 'bg-emerald-100' : metric.color === 'from-blue-500 to-cyan-600' ? 'bg-blue-100' : metric.color === 'from-purple-500 to-pink-600' ? 'bg-purple-100' : metric.color === 'from-orange-500 to-red-600' ? 'bg-orange-100' : metric.color === 'from-yellow-500 to-orange-600' ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                  {metric.title === 'Total Revenue' && <DollarSign className={`w-6 h-6 ${metric.color === 'from-emerald-500 to-teal-600' ? 'text-emerald-900' : 'text-gray-900'}`} />}
                  {metric.title === 'Total Orders' && <ShoppingCart className="w-6 h-6 text-blue-900" />}
                  {metric.title === 'Total Customers' && <Users className="w-6 h-6 text-purple-900" />}
                  {metric.title === 'Products Sold' && <Package className="w-6 h-6 text-orange-900" />}
                  {metric.title === 'Service Requests' && <Wrench className="w-6 h-6 text-yellow-900" />}
                  {metric.title === 'Avg. Order Value' && <TrendingUp className="w-6 h-6 text-blue-900" />}
                </div>
                <div className={`flex items-center gap-1 text-sm font-semibold ${
                  metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {Math.abs(metric.change)}%
                </div>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">{metric.title}</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{metric.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content Based on Active Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Charts Section */}
          <section className="px-4 sm:px-6 pb-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Sales Chart */}
              <div className="bg-white border rounded-xl shadow-sm p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Sales Overview</h3>
                    <p className="text-sm text-gray-600">Revenue and orders trends</p>
                  </div>
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-900" />
                </div>
                
                {/* Bar Chart Visualization */}
                <div className="space-y-4">
                  {data.salesData.labels.map((label, index) => {
                    const maxRevenue = Math.max(...data.salesData.datasets[0].data);
                    const revenue = data.salesData.datasets[0].data[index];
                    const orders = data.salesData.datasets[1].data[index];
                    
                    return (
                      <div key={label}>
                        <div className="flex justify-between text-xs sm:text-sm mb-2">
                          <span className="text-gray-600">{label}</span>
                          <span className="text-blue-900 font-semibold">
                            ₹{revenue.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="relative h-8 sm:h-10 bg-gray-100 rounded-lg overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-900 to-blue-700 rounded-lg transition-all duration-500"
                            style={{
                              width: `${maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0}%`,
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-semibold text-gray-700">
                              {orders} {orders === 1 ? 'order' : 'orders'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Summary */}
                <div className="mt-6 pt-6 border-t grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Total Revenue</p>
                    <p className="text-lg sm:text-xl font-bold text-blue-900">
                      ₹{data.salesData.datasets[0].data.reduce((a, b) => a + b, 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Total Orders</p>
                    <p className="text-lg sm:text-xl font-bold text-blue-900">
                      {data.salesData.datasets[1].data.reduce((a, b) => a + b, 0)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Category Distribution */}
              <div className="bg-white border rounded-xl shadow-sm p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Category Distribution</h3>
                    <p className="text-sm text-gray-600">Sales by product category</p>
                  </div>
                  <PieChart className="w-5 h-5 sm:w-6 sm:h-6 text-blue-900" />
                </div>

                {/* Pie Chart Visualization */}
                <div className="space-y-3">
                  {data.categoryData.length > 0 ? (
                    data.categoryData.map((category) => (
                      <div key={category.name} className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: category.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between text-xs sm:text-sm mb-1">
                            <span className="text-gray-700 truncate">{category.name}</span>
                            <span className="text-gray-900 font-semibold ml-2">{category.value}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${category.value}%`,
                                backgroundColor: category.color,
                              }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{category.count} items sold</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No sales data available for this period</p>
                    </div>
                  )}
                </div>

                {/* Summary */}
                {data.categoryData.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-xl sm:text-2xl font-bold text-blue-900">
                          {data.categoryData.length}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">Categories</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl sm:text-2xl font-bold text-blue-900">
                          {data.categoryData.reduce((sum, cat) => sum + cat.count, 0)}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">Total Items</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Payment Methods & Brand Performance */}
          <section className="px-4 sm:px-6 pb-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Payment Methods */}
              <div className="bg-white border rounded-xl shadow-sm p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Payment Methods</h3>
                    <p className="text-sm text-gray-600">Distribution by payment type</p>
                  </div>
                  <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-blue-900" />
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {data.paymentMethodData.map((payment, index) => (
                    <div key={payment.method} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                          index === 0 ? 'bg-emerald-100' :
                          index === 1 ? 'bg-blue-100' :
                          'bg-purple-100'
                        }`}>
                          <CreditCard className={`w-4 h-4 sm:w-5 sm:h-5 ${
                            index === 0 ? 'text-emerald-900' :
                            index === 1 ? 'text-blue-900' :
                            'text-purple-900'
                          }`} />
                        </div>
                        <div>
                          <p className="text-gray-900 font-semibold text-sm sm:text-base">{payment.method}</p>
                          <p className="text-xs text-gray-600">{payment.count} transactions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg sm:text-xl font-bold text-blue-900">{payment.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Brands */}
              <div className="bg-white border rounded-xl shadow-sm p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Top Brands</h3>
                    <p className="text-sm text-gray-600">Best performing brands</p>
                  </div>
                  <Tag className="w-5 h-5 sm:w-6 sm:h-6 text-blue-900" />
                </div>

                <div className="space-y-3">
                  {data.brandPerformance.slice(0, 5).map((brand, index) => (
                    <div key={brand.brand} className="flex items-center gap-3">
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm ${
                        index === 0 ? 'bg-yellow-100 text-yellow-900' :
                        index === 1 ? 'bg-gray-200 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-900' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-900 font-semibold text-sm truncate">{brand.brand}</span>
                          <span className="text-blue-900 font-bold text-sm ml-2">₹{brand.revenue.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          {brand.sales} units sold
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <section className="px-4 sm:px-6 pb-6">
          <div className="bg-white border rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Top Selling Products</h3>
                <p className="text-sm text-gray-600">Best performers this {dateRange}</p>
              </div>
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-900" />
            </div>

            {data.topProducts.length > 0 ? (
              <div className="overflow-x-auto -mx-4 sm:-mx-6">
                <div className="inline-block min-w-full align-middle px-4 sm:px-6">
                  <table className="min-w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left py-3 px-2 sm:px-4 text-xs font-semibold text-gray-600">Rank</th>
                        <th className="text-left py-3 px-2 sm:px-4 text-xs font-semibold text-gray-600">Product</th>
                        <th className="text-left py-3 px-2 sm:px-4 text-xs font-semibold text-gray-600 hidden sm:table-cell">Brand</th>
                        <th className="text-left py-3 px-2 sm:px-4 text-xs font-semibold text-gray-600 hidden md:table-cell">Category</th>
                        <th className="text-left py-3 px-2 sm:px-4 text-xs font-semibold text-gray-600">Sales</th>
                        <th className="text-left py-3 px-2 sm:px-4 text-xs font-semibold text-gray-600 hidden lg:table-cell">Revenue</th>
                        <th className="text-left py-3 px-2 sm:px-4 text-xs font-semibold text-gray-600 hidden xl:table-cell">Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {data.topProducts.map((product, index) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="py-4 px-2 sm:px-4">
                            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                              index === 0
                                ? 'bg-yellow-100 text-yellow-900'
                                : index === 1
                                ? 'bg-gray-200 text-gray-700'
                                : index === 2
                                ? 'bg-orange-100 text-orange-900'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {index + 1}
                            </div>
                          </td>
                          <td className="py-4 px-2 sm:px-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                {product.image && product.image !== '/placeholder.jpg' ? (
                                  <Image
                                    src={product.image}
                                    alt={product.name}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                    unoptimized
                                  />
                                ) : (
                                  <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                                    <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-900" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-gray-900 font-semibold text-xs sm:text-sm truncate">{product.name}</p>
                                <p className="text-gray-500 text-xs truncate">ID: {product.id.slice(0, 8)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-2 sm:px-4 hidden sm:table-cell">
                            <span className="text-gray-700 text-xs sm:text-sm">{product.brand}</span>
                          </td>
                          <td className="py-4 px-2 sm:px-4 hidden md:table-cell">
                            <span className="text-gray-700 text-xs sm:text-sm">{product.category}</span>
                          </td>
                          <td className="py-4 px-2 sm:px-4">
                            <p className="text-gray-900 font-semibold text-xs sm:text-sm">{product.sales}</p>
                            <p className="text-xs text-gray-500">units</p>
                          </td>
                          <td className="py-4 px-2 sm:px-4 hidden lg:table-cell">
                            <p className="text-blue-900 font-bold text-xs sm:text-sm">
                              ₹{product.revenue.toLocaleString('en-IN')}
                            </p>
                          </td>
                          <td className="py-4 px-2 sm:px-4 hidden xl:table-cell">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                              product.stock > 50
                                ? 'bg-green-100 text-green-900'
                                : product.stock > 20
                                ? 'bg-yellow-100 text-yellow-900'
                                : product.stock > 0
                                ? 'bg-orange-100 text-orange-900'
                                : 'bg-red-100 text-red-900'
                            }`}>
                              {product.stock} left
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No product sales data for this period</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <section className="px-4 sm:px-6 pb-6">
          <div className="space-y-6">
            {/* Recent Orders */}
            <div className="bg-white border rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Recent Orders</h3>
                  <p className="text-sm text-gray-600">Latest customer purchases</p>
                </div>
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-blue-900" />
              </div>

              {data.recentOrders.length > 0 ? (
                <div className="overflow-x-auto -mx-4 sm:-mx-6">
                  <div className="inline-block min-w-full align-middle px-4 sm:px-6">
                    <table className="min-w-full">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left py-3 px-2 sm:px-4 text-xs font-semibold text-gray-600">Order ID</th>
                          <th className="text-left py-3 px-2 sm:px-4 text-xs font-semibold text-gray-600">Customer</th>
                          <th className="text-left py-3 px-2 sm:px-4 text-xs font-semibold text-gray-600 hidden md:table-cell">Items</th>
                          <th className="text-left py-3 px-2 sm:px-4 text-xs font-semibold text-gray-600 hidden lg:table-cell">Payment</th>
                          <th className="text-left py-3 px-2 sm:px-4 text-xs font-semibold text-gray-600">Status</th>
                          <th className="text-left py-3 px-2 sm:px-4 text-xs font-semibold text-gray-600">Amount</th>
                          <th className="text-left py-3 px-2 sm:px-4 text-xs font-semibold text-gray-600 hidden sm:table-cell">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {data.recentOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="py-4 px-2 sm:px-4">
                              <p className="text-blue-900 font-mono text-xs font-semibold">{order.id}</p>
                            </td>
                            <td className="py-4 px-2 sm:px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-900 to-blue-700 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                  {order.customer.charAt(0)}
                                </div>
                                <p className="text-gray-900 font-semibold text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">{order.customer}</p>
                              </div>
                            </td>
                            <td className="py-4 px-2 sm:px-4 hidden md:table-cell">
                              <p className="text-gray-900 text-xs sm:text-sm">{order.service}</p>
                            </td>
                            <td className="py-4 px-2 sm:px-4 hidden lg:table-cell">
                              <span className="text-gray-700 text-xs uppercase">{order.paymentMethod || 'N/A'}</span>
                            </td>
                            <td className="py-4 px-2 sm:px-4">{getStatusBadge(order.status)}</td>
                            <td className="py-4 px-2 sm:px-4">
                              <p className="text-gray-900 font-semibold text-xs sm:text-sm">₹{order.amount.toLocaleString('en-IN')}</p>
                            </td>
                            <td className="py-4 px-2 sm:px-4 hidden sm:table-cell">
                              <p className="text-gray-600 text-xs">{order.date}</p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No orders found for this period</p>
                </div>
              )}
            </div>

            {/* Recent Complaints */}
            <div className="bg-white border rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Service Requests</h3>
                  <p className="text-sm text-gray-600">Recent customer complaints</p>
                </div>
                <Wrench className="w-5 h-5 sm:w-6 sm:h-6 text-blue-900" />
              </div>

              {data.recentComplaints.length > 0 ? (
                <div className="overflow-x-auto -mx-4 sm:-mx-6">
                  <div className="inline-block min-w-full align-middle px-4 sm:px-6">
                    <table className="min-w-full">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left py-3 px-2 sm:px-4 text-xs font-semibold text-gray-600">ID</th>
                          <th className="text-left py-3 px-2 sm:px-4 text-xs font-semibold text-gray-600">Customer</th>
                          <th className="text-left py-3 px-2 sm:px-4 text-xs font-semibold text-gray-600 hidden md:table-cell">Service</th>
                          <th className="text-left py-3 px-2 sm:px-4 text-xs font-semibold text-gray-600">Status</th>
                          <th className="text-left py-3 px-2 sm:px-4 text-xs font-semibold text-gray-600 hidden sm:table-cell">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {data.recentComplaints.map((complaint) => (
                          <tr key={complaint.id} className="hover:bg-gray-50">
                            <td className="py-4 px-2 sm:px-4">
                              <p className="text-blue-900 font-mono text-xs font-semibold">{complaint.id}</p>
                            </td>
                            <td className="py-4 px-2 sm:px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                  {complaint.customer.charAt(0)}
                                </div>
                                <p className="text-gray-900 font-semibold text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">{complaint.customer}</p>
                              </div>
                            </td>
                            <td className="py-4 px-2 sm:px-4 hidden md:table-cell">
                              <p className="text-gray-900 text-xs sm:text-sm">{complaint.service}</p>
                            </td>
                            <td className="py-4 px-2 sm:px-4">{getStatusBadge(complaint.status)}</td>
                            <td className="py-4 px-2 sm:px-4 hidden sm:table-cell">
                              <p className="text-gray-600 text-xs">{complaint.date}</p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No service requests for this period</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <section className="px-4 sm:px-6 pb-6">
          {/* Inventory Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-900" />
                </div>
                <p className="text-gray-600 text-xs sm:text-sm">Total Products</p>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{data.inventoryInsights.totalProducts}</p>
            </div>

            <div className="bg-white border rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-900" />
                </div>
                <p className="text-gray-600 text-xs sm:text-sm">Total Stock</p>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{data.inventoryInsights.totalStock}</p>
            </div>

            <div className="bg-white border rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-900" />
                </div>
                <p className="text-gray-600 text-xs sm:text-sm">Low Stock</p>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{data.inventoryInsights.lowStockProducts}</p>
            </div>

            <div className="bg-white border rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-900" />
                </div>
                <p className="text-gray-600 text-xs sm:text-sm">Out of Stock</p>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{data.inventoryInsights.outOfStockProducts}</p>
            </div>
          </div>

          {/* Additional Inventory Info */}
          <div className="bg-white border rounded-xl shadow-sm p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">Inventory Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 text-sm sm:text-base">Average Stock per Product</span>
                  <span className="text-gray-900 font-bold text-sm sm:text-base">{data.inventoryInsights.averageStockPerProduct}</span>
                </div>
                <div className="flex justify-between items-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 text-sm sm:text-base">Total Inventory Value</span>
                  <span className="text-blue-900 font-bold text-sm sm:text-base">
                    ₹{data.inventoryInsights.stockValue.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 text-sm sm:text-base">Total Brands</span>
                  <span className="text-gray-900 font-bold text-sm sm:text-base">{data.summary.totalBrands}</span>
                </div>
                <div className="flex justify-between items-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 text-sm sm:text-base">Total Categories</span>
                  <span className="text-gray-900 font-bold text-sm sm:text-base">{data.summary.totalCategories}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}