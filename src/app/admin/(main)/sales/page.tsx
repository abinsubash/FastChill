"use client";

import { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  X,
  Trash2,
  Eye,
  Edit2,
  Calendar,
  DollarSign,
  ShoppingCart,
  ChevronDown,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

type Product = {
  id: string;
  name: string;
  sellingPrice: number;
  teachnitionPrice?: number;
  category: string | { _id: string; name: string; slug?: string; isActive?: boolean };
  brand: string | { _id: string; name: string; slug?: string; isActive?: boolean };
  stock: number;
};

type BillItem = {
  product: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
};

type Bill = {
  id: string;
  billNumber: string;
  customerName: string;
  customerPhone?: string;
  items: BillItem[];
  subtotal: number;
  grandTotal: number;
  paymentMethod: 'cash' | 'upi' | 'card';
  paymentStatus: 'paid' | 'unpaid';
  createdAt: string;
  updatedAt: string;
};

export default function SalesPage() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Helper functions to safely get category and brand names
  const getCategoryName = (category: string | { name: string } | any): string => {
    if (typeof category === 'string') return category;
    if (category && typeof category === 'object' && category.name) return category.name;
    return 'Unknown';
  };

  const getBrandName = (brand: string | { name: string } | any): string => {
    if (typeof brand === 'string') return brand;
    if (brand && typeof brand === 'object' && brand.name) return brand.name;
    return 'Unknown';
  };

  // State management
  const [bills, setBills] = useState<Bill[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [billToDelete, setBillToDelete] = useState<Bill | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'custom'>('all');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    paymentMethod: 'cash' as 'cash' | 'upi' | 'card',
    paymentStatus: 'paid' as 'paid' | 'unpaid',
  });

  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch bills and products on mount
  useEffect(() => {
    fetchBills();
    fetchProducts();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProductDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/getAllBills');
      const data = await res.json();

      if (data.success) {
        setBills(data.bills);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/getAllProducts');
      const data = await res.json();

      console.log('📦 Products API response:', data);

      if (data.success) {
        // Map products to ensure id field exists
        const mappedProducts = data.products.map((p: any) => ({
          id: p.id || p._id,  // Handle both id and _id
          name: p.name,
          sellingPrice: p.sellingPrice,
          teachnitionPrice: p.teachnitionPrice || p.technicianPrice,  // Handle both field names
          category: p.category,
          brand: p.brand,
          stock: p.stock,
        }));

        console.log('✅ Mapped products:', mappedProducts.slice(0, 2)); // Log first 2 for debugging
        setProducts(mappedProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Product search and selection
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) &&
    !billItems.some(item => item.product === p.id)
  );

  const handleProductSelect = (product: Product) => {
    const price = product.teachnitionPrice || product.sellingPrice || 0;

    console.log('🛒 Product selected:', {
      id: product.id,
      name: product.name,
      price: price,
    });

    const newItem: BillItem = {
      product: product.id,
      name: product.name,
      quantity: 1,
      price: price,
      total: price,
    };

    console.log('➕ New item created:', newItem);

    setBillItems([...billItems, newItem]);
    setProductSearch('');
    setShowProductDropdown(false);
  };

  const handleRemoveItem = (index: number) => {
    setBillItems(billItems.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    if (quantity < 1) return;

    const updatedItems = [...billItems];
    updatedItems[index].quantity = quantity;
    updatedItems[index].total = quantity * updatedItems[index].price;
    setBillItems(updatedItems);
  };

  const handlePriceChange = (index: number, price: number) => {
    if (price < 0) return;

    const updatedItems = [...billItems];
    updatedItems[index].price = price;
    updatedItems[index].total = updatedItems[index].quantity * price;
    setBillItems(updatedItems);
  };

  // Calculate totals
  const subtotal = billItems.reduce((sum, item) => sum + item.total, 0);
  const grandTotal = subtotal;

  const handleSubmit = async () => {
    if (!formData.customerName.trim()) {
      alert('Customer name is required');
      return;
    }

    if (billItems.length === 0) {
      alert('Please add at least one item');
      return;
    }

    // Debug: Log the items being sent
    console.log('📦 Bill items to send:', billItems);

    try {
      setSubmitting(true);

      const payload = {
        ...formData,
        items: billItems,
        subtotal,
        grandTotal,
      };

      console.log('📤 Full payload:', payload);

      const res = await fetch('/api/admin/createBill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        alert('Bill created successfully! 🎉');
        setShowAddModal(false);
        resetForm();
        fetchBills();
      } else {
        alert(data.message || 'Failed to create bill');
      }
    } catch (error) {
      console.error('Error creating bill:', error);
      alert('Failed to create bill');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      customerPhone: '',
      paymentMethod: 'cash',
      paymentStatus: 'paid',
    });
    setBillItems([]);
    setProductSearch('');
  };

  const handleDeleteBill = async () => {
    if (!billToDelete) return;

    try {
      setDeleting(true);
      const res = await fetch('/api/admin/deleteBill', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billId: billToDelete.id }),
      });

      const data = await res.json();

      if (data.success) {
        setBills(bills.filter(b => b.id !== billToDelete.id));
        setShowDeleteModal(false);
        setBillToDelete(null);
        alert('Bill deleted successfully!');
      } else {
        alert(data.message || 'Failed to delete bill');
      }
    } catch (error) {
      console.error('Error deleting bill:', error);
      alert('Failed to delete bill');
    } finally {
      setDeleting(false);
    }
  };

  // Date filtering
  const getFilteredBills = () => {
    let filtered = bills.filter(bill =>
      bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bill.customerPhone && bill.customerPhone.includes(searchTerm))
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    switch (dateFilter) {
      case 'today':
        filtered = filtered.filter(bill => {
          const billDate = new Date(bill.createdAt);
          billDate.setHours(0, 0, 0, 0);
          return billDate.getTime() === today.getTime();
        });
        break;

      case 'yesterday':
        filtered = filtered.filter(bill => {
          const billDate = new Date(bill.createdAt);
          billDate.setHours(0, 0, 0, 0);
          return billDate.getTime() === yesterday.getTime();
        });
        break;

      case 'custom':
        if (customDateRange.start && customDateRange.end) {
          const startDate = new Date(customDateRange.start);
          const endDate = new Date(customDateRange.end);
          endDate.setHours(23, 59, 59, 999);

          filtered = filtered.filter(bill => {
            const billDate = new Date(bill.createdAt);
            return billDate >= startDate && billDate <= endDate;
          });
        }
        break;
    }

    return filtered;
  };

  const filteredBills = getFilteredBills();

  // Stats
  const todayBills = bills.filter(bill => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const billDate = new Date(bill.createdAt);
    billDate.setHours(0, 0, 0, 0);
    return billDate.getTime() === today.getTime();
  });

  const todayRevenue = todayBills.reduce((sum, bill) => sum + bill.grandTotal, 0);
  const totalRevenue = bills.reduce((sum, bill) => sum + bill.grandTotal, 0);
  const paidBills = bills.filter(b => b.paymentStatus === 'paid').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sales</h1>
            <p className="text-gray-600">Manage bills and transactions</p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-900 to-blue-700 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Create Bill
          </button>
        </div>

        {/* Search and Filters */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by bill number, customer name, or phone..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border rounded-xl hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">
                  {dateFilter === 'all' && 'All Time'}
                  {dateFilter === 'today' && 'Today'}
                  {dateFilter === 'yesterday' && 'Yesterday'}
                  {dateFilter === 'custom' && 'Custom Range'}
                </span>
              </div>
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </button>

            {showDatePicker && (
              <div className="absolute top-full mt-2 w-full bg-white border rounded-xl shadow-lg z-10 p-4">
                <div className="space-y-2">
                  <button
                    key="filter-all"
                    onClick={() => {
                      setDateFilter('all');
                      setShowDatePicker(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg"
                  >
                    All Time
                  </button>
                  <button
                    key="filter-today"
                    onClick={() => {
                      setDateFilter('today');
                      setShowDatePicker(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg"
                  >
                    Today
                  </button>
                  <button
                    key="filter-yesterday"
                    onClick={() => {
                      setDateFilter('yesterday');
                      setShowDatePicker(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg"
                  >
                    Yesterday
                  </button>
                  <button
                    key="filter-custom"
                    onClick={() => setDateFilter('custom')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg"
                  >
                    Custom Range
                  </button>

                  {dateFilter === 'custom' && (
                    <div className="pt-2 border-t space-y-2">
                      <input
                        type="date"
                        value={customDateRange.start}
                        onChange={e => setCustomDateRange({ ...customDateRange, start: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                      <input
                        type="date"
                        value={customDateRange.end}
                        onChange={e => setCustomDateRange({ ...customDateRange, end: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                      <button
                        onClick={() => setShowDatePicker(false)}
                        className="w-full bg-blue-900 text-white py-2 rounded-lg hover:bg-blue-800"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-6 mb-6">
        <div key="total-bills" className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-blue-900" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Bills</p>
              <p className="text-2xl font-bold">{bills.length}</p>
            </div>
          </div>
        </div>

        <div key="today-revenue" className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-900" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Today's Revenue</p>
              <p className="text-2xl font-bold">₹{(todayRevenue || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div key="total-revenue" className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-900" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold">₹{(totalRevenue || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div key="paid-bills" className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-900" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Paid Bills</p>
              <p className="text-2xl font-bold">{paidBills}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bills Table */}
      <div className="px-6 pb-6">
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                    Bill Number
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                    Items
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                    Payment
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16">
                      <div className="inline-block w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-gray-500">Loading bills...</p>
                    </td>
                  </tr>
                ) : filteredBills.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16">
                      <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No bills found</p>
                    </td>
                  </tr>
                ) : (
                  filteredBills.map(bill => (
                    <tr key={bill.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-blue-900">{bill.billNumber}</p>
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{bill.customerName}</p>
                          {bill.customerPhone && (
                            <p className="text-sm text-gray-500">{bill.customerPhone}</p>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700">{bill.items.length} items</p>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">₹{(bill.grandTotal || 0).toLocaleString()}</p>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${bill.paymentStatus === 'paid'
                              ? 'bg-green-100 text-green-900'
                              : 'bg-orange-100 text-orange-900'
                            }`}>
                            {bill.paymentStatus}
                          </span>
                          <p className="text-xs text-gray-500 capitalize">{bill.paymentMethod}</p>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(bill.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/admin/sales/${bill.id}`)}
                            className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setBillToDelete(bill);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                            title="Delete bill"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Bill Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
            <div className="sticky top-0 bg-gradient-to-r from-blue-900 to-blue-700 text-white p-6 flex justify-between items-center rounded-t-2xl z-10">
              <div>
                <h2 className="text-2xl font-bold">Create New Bill</h2>
                <p className="text-blue-100 text-sm mt-1">Add customer details and products</p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="hover:bg-white/20 p-2 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Customer Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Customer Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Customer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.customerName}
                      onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900"
                      placeholder="Enter customer name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={formData.customerPhone}
                      onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                      className="w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              </div>

              {/* Add Products */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Add Products</h3>

                {/* Product Search */}
                <div className="relative mb-6" ref={dropdownRef}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Search and Select Products
                  </label>
                  <input
                    type="text"
                    value={productSearch}
                    onChange={e => {
                      setProductSearch(e.target.value);
                      setShowProductDropdown(true);
                    }}
                    onFocus={() => setShowProductDropdown(true)}
                    className="w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900"
                    placeholder="Type product name to search..."
                  />

                  {showProductDropdown && productSearch && filteredProducts.length > 0 && (
                    <div className="absolute top-full mt-2 w-full bg-white border rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto">
                      {filteredProducts.map(product => (
                        <button
                          key={product.id}
                          onClick={() => handleProductSelect(product)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 transition border-b last:border-b-0"
                        >
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <div className="flex justify-between text-sm text-gray-600 mt-1">
                            <span>{getCategoryName(product.category)} - {getBrandName(product.brand)}</span>
                            <span className="font-semibold text-blue-900">
                              ₹{(product.teachnitionPrice || product.sellingPrice || 0).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Stock: {product.stock || 0}</p>
                        </button>
                      ))}
                    </div>
                  )}

                  {showProductDropdown && productSearch && filteredProducts.length === 0 && (
                    <div className="absolute top-full mt-2 w-full bg-white border rounded-xl shadow-lg z-20 p-4 text-center text-gray-500">
                      No products found
                    </div>
                  )}
                </div>

                {/* Selected Products Table */}
                {billItems.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Selected Products ({billItems.length})</h4>
                    <div className="bg-white rounded-xl border overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-100 border-b">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Product</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Quantity</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Price</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Total</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {billItems.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium">{item.name}</td>
                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={e => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                                  className="w-20 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-900"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.price}
                                  onChange={e => handlePriceChange(index, parseFloat(e.target.value) || 0)}
                                  className="w-28 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-900"
                                />
                              </td>
                              <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                ₹{(item.total || 0).toLocaleString()}
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => handleRemoveItem(index)}
                                  className="text-red-600 hover:bg-red-50 p-1.5 rounded transition"
                                  title="Remove product"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Totals */}
                    <div className="mt-4 bg-white rounded-xl border p-4 space-y-2">
                      <div className="flex justify-between text-gray-700">
                        <span>Subtotal:</span>
                        <span className="font-semibold">₹{(subtotal || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                        <span>Grand Total:</span>
                        <span>₹{(grandTotal || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {billItems.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No products added yet. Search and select products above.</p>
                  </div>
                )}
              </div>

              {/* Payment Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <select
                      value={formData.paymentMethod}
                      onChange={e => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                      className="w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900"
                    >
                      <option value="cash">Cash</option>
                      <option value="upi">UPI</option>
                      <option value="card">Card</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Payment Status
                    </label>
                    <select
                      value={formData.paymentStatus}
                      onChange={e => setFormData({ ...formData, paymentStatus: e.target.value as any })}
                      className="w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900"
                    >
                      <option value="paid">Paid</option>
                      <option value="unpaid">Unpaid</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={submitting || billItems.length === 0}
                  className="flex-1 bg-gradient-to-r from-blue-900 to-blue-700 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Creating...' : 'Create Bill'}
                </button>

                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  disabled={submitting}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && billToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Delete Bill
              </h2>

              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete bill{' '}
                <span className="font-semibold text-gray-900">{billToDelete.billNumber}</span>?
                This action cannot be undone.
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-medium text-gray-900">{billToDelete.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium text-gray-900">₹{(billToDelete.grandTotal || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(billToDelete.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setBillToDelete(null);
                  }}
                  disabled={deleting}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteBill}
                  disabled={deleting}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete Bill
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}