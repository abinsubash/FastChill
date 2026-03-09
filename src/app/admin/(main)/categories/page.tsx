"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, Layers, X, Power, PowerOff, Check, AlertCircle } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning';
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({ name: "" });
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const categoryNameRegex = /^[a-zA-Z0-9 ]{3,30}$/;

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter categories based on search
  useEffect(() => {
    if (searchTerm) {
      const filtered = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [searchTerm, categories]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/getAllCategories");
      const data = await res.json();
      
      if (res.ok) {
        setCategories(data.categories);
        setFilteredCategories(data.categories);
      } else {
        showToast("Failed to fetch categories", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Server error while fetching categories", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: Toast['type']) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 4000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ name: e.target.value });
  };

  const handleAddCategory = async () => {
    const { name } = formData;

    if (!categoryNameRegex.test(name)) {
      showToast("Category name must be 3–30 characters and contain only letters, numbers and spaces", "error");
      return;
    }

    try {
      const res = await fetch("/api/admin/addCategories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Something went wrong", "error");
        return;
      }

      showToast("Category created successfully 🎉", "success");
      setFormData({ name: "" });
      setShowAddModal(false);
      fetchCategories();
    } catch (error) {
      console.error(error);
      showToast("Server error", "error");
    }
  };

  const handleEditCategory = async () => {
    if (!selectedCategory) return;

    const { name } = formData;

    if (!categoryNameRegex.test(name)) {
      showToast("Category name must be 3–30 characters and contain only letters, numbers and spaces", "error");
      return;
    }

    try {
      // FIXED: Correct route path
      const res = await fetch(`/api/admin/updateCategories/${selectedCategory._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Something went wrong", "error");
        return;
      }

      showToast("Category updated successfully ✨", "success");
      setFormData({ name: "" });
      setShowEditModal(false);
      setSelectedCategory(null);
      fetchCategories();
    } catch (error) {
      console.error(error);
      showToast("Server error", "error");
    }
  };

  const handleToggleActive = async (category: Category) => {
    try {
      // FIXED: Correct route path
      const res = await fetch(`/api/admin/updateCategories/${category._id}/toggle`, {
        method: "PATCH",
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Something went wrong", "error");
        return;
      }

      showToast(
        data.category.isActive ? "Category enabled" : "Category disabled",
        "success"
      );
      fetchCategories();
    } catch (error) {
      console.error(error);
      showToast("Server error", "error");
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;

    try {
      // FIXED: Correct route path
      const res = await fetch(`/api/admin/deleteCategorie/${selectedCategory._id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Something went wrong", "error");
        return;
      }

      showToast("Category deleted successfully 🗑️", "success");
      setShowDeleteModal(false);
      setSelectedCategory(null);
      fetchCategories();
    } catch (error) {
      console.error(error);
      showToast("Server error", "error");
    }
  };

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setFormData({ name: category.name });
    setShowEditModal(true);
  };

  const openDeleteModal = (category: Category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setFormData({ name: "" });
    setSelectedCategory(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[60] space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`
              flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl backdrop-blur-sm
              transform transition-all duration-300 animate-slideIn
              ${toast.type === 'success' ? 'bg-emerald-500/95 text-white' : ''}
              ${toast.type === 'error' ? 'bg-rose-500/95 text-white' : ''}
              ${toast.type === 'warning' ? 'bg-amber-500/95 text-white' : ''}
            `}
          >
            {toast.type === 'success' && <Check className="w-5 h-5" />}
            {toast.type === 'error' && <X className="w-5 h-5" />}
            {toast.type === 'warning' && <AlertCircle className="w-5 h-5" />}
            <span className="font-medium">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-200/50 p-6 mb-6 sticky top-0 z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              Categories
            </h1>
            <p className="text-slate-600 mt-1 font-medium">Organize and manage product categories</p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white px-6 py-3 rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 font-semibold"
          >
            <Plus className="w-5 h-5" />
            Add Category
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Stats Card */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-200/50 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                <Layers className="w-6 h-6 text-blue-900" />
              </div>
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Categories</p>
                <p className="text-3xl font-bold text-slate-900">{categories.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-200/50 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl">
                <Power className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <p className="text-slate-600 text-sm font-medium">Active</p>
                <p className="text-3xl font-bold text-slate-900">
                  {categories.filter(cat => cat.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-200/50 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-rose-100 to-red-100 rounded-xl">
                <PowerOff className="w-6 h-6 text-rose-700" />
              </div>
              <div>
                <p className="text-slate-600 text-sm font-medium">Inactive</p>
                <p className="text-3xl font-bold text-slate-900">
                  {categories.filter(cat => !cat.isActive).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="px-6 pb-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/50 overflow-hidden">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-300 border-t-blue-900"></div>
              <p className="text-slate-500 mt-4 font-medium">Loading categories...</p>
            </div>
          ) : filteredCategories.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Category Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Slug
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCategories.map((category) => (
                    <tr
                      key={category._id}
                      className="hover:bg-blue-50/30 transition-colors duration-150"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-900 to-indigo-900"></div>
                          <span className="font-semibold text-slate-900">{category.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-600 font-mono text-sm bg-slate-100 px-3 py-1 rounded-lg">
                          {category.slug}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(category)}
                          className={`
                            inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold text-xs
                            transition-all duration-200 transform hover:scale-105
                            ${category.isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                            }
                          `}
                        >
                          {category.isActive ? (
                            <>
                              <Power className="w-3.5 h-3.5" />
                              Active
                            </>
                          ) : (
                            <>
                              <PowerOff className="w-3.5 h-3.5" />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm">
                        {new Date(category.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(category)}
                            className="p-2 text-blue-900 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                            title="Edit category"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(category)}
                            className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors duration-200"
                            title="Delete category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <Layers className="w-20 h-20 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg font-medium">
                {searchTerm ? "No categories found matching your search" : "No categories available"}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 text-blue-900 hover:text-blue-700 font-semibold"
                >
                  Create your first category
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all animate-scaleIn">
            <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 px-6 py-5 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-white">Add New Category</h2>
              <button
                onClick={handleCloseModal}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
                  placeholder="e.g., Refrigerator, Air Conditioner"
                  maxLength={30}
                />
                <p className="text-xs text-slate-500 mt-2 font-medium">
                  {formData.name.length}/30 characters
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddCategory}
                  className="flex-1 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white py-3 rounded-xl font-bold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Add Category
                </button>
                <button
                  onClick={handleCloseModal}
                  className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && selectedCategory && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all animate-scaleIn">
            <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 px-6 py-5 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-white">Edit Category</h2>
              <button
                onClick={handleCloseModal}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
                  placeholder="e.g., Refrigerator, Air Conditioner"
                  maxLength={30}
                />
                <p className="text-xs text-slate-500 mt-2 font-medium">
                  {formData.name.length}/30 characters
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleEditCategory}
                  className="flex-1 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white py-3 rounded-xl font-bold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCloseModal}
                  className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCategory && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-scaleIn">
            <div className="bg-gradient-to-r from-rose-600 to-rose-700 px-6 py-5 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-white">Delete Category</h2>
              <button
                onClick={handleCloseModal}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-rose-100 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <p className="text-slate-900 font-semibold text-lg">
                    Are you sure you want to delete this category?
                  </p>
                  <p className="text-slate-600 mt-2">
                    Category: <span className="font-bold text-slate-900">{selectedCategory.name}</span>
                  </p>
                  <p className="text-slate-500 text-sm mt-2">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleDeleteCategory}
                  className="flex-1 bg-gradient-to-r from-rose-600 to-rose-700 text-white py-3 rounded-xl font-bold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Delete
                </button>
                <button
                  onClick={handleCloseModal}
                  className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}