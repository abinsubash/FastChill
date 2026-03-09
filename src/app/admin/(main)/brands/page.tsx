"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, Tag, X, Power, PowerOff, Check, AlertCircle } from "lucide-react";

interface Brand {
  _id: string;
  id?: string; // Support both _id and id for compatibility
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

interface ErrorState {
  brandName: string;
}

export default function BrandsPage() {
  const [brandName, setBrandName] = useState<string>("");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deletingBrandId, setDeletingBrandId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [errors, setErrors] = useState<ErrorState>({ brandName: "" });
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const brandNameRegex = /^[a-zA-Z0-9 ]{2,30}$/;

  // Fetch brands on component mount
  useEffect(() => {
    fetchBrands();
  }, []);

  // Filter brands based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredBrands(brands);
    } else {
      const filtered = brands.filter((brand) =>
        brand.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBrands(filtered);
    }
  }, [searchQuery, brands]);

  const fetchBrands = async (): Promise<void> => {
    try {
      setLoading(true);
      const res = await fetch("/api/getAllBrands");
      const data = await res.json();
      
      if (res.ok) {
        setBrands(data.brands || []);
        setFilteredBrands(data.brands || []);
      } else {
        showToast("Failed to fetch brands", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Server error while fetching brands", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: Toast['type']): void => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 4000);
  };

  const validateBrandName = (name: string): string => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return "Brand name cannot be empty";
    }

    if (trimmedName.length < 2) {
      return "Brand name must be at least 2 characters";
    }

    if (trimmedName.length > 30) {
      return "Brand name must not exceed 30 characters";
    }

    if (!brandNameRegex.test(trimmedName)) {
      return "Brand name can only contain letters, numbers, and spaces";
    }

    // Check for duplicate brand names (case-insensitive)
    const isDuplicate = brands.some(
      (brand) => {
        const brandId = brand._id || brand.id;
        const editingId = editingBrand?._id || editingBrand?.id;
        return brand.name.toLowerCase() === trimmedName.toLowerCase() && 
               (!editMode || brandId !== editingId);
      }
    );

    if (isDuplicate) {
      return "A brand with this name already exists";
    }

    return "";
  };

  const handleAddBrand = async (): Promise<void> => {
    const name = brandName.trim();
    const validationError = validateBrandName(name);

    if (validationError) {
      setErrors({ brandName: validationError });
      showToast(validationError, "error");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/addBrands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Failed to add brand", "error");
        return;
      }

      showToast("✨ Brand added successfully!", "success");
      setBrandName("");
      setOpenModal(false);
      setErrors({ brandName: "" });
      fetchBrands(); // Refresh the list
    } catch (error) {
      console.error(error);
      showToast("Server error occurred", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditBrand = async (): Promise<void> => {
    const name = brandName.trim();
    const validationError = validateBrandName(name);

    if (validationError) {
      setErrors({ brandName: validationError });
      showToast(validationError, "error");
      return;
    }

    setSubmitting(true);

    try {
      const brandId = editingBrand?._id || editingBrand?.id;
      const res = await fetch("/api/admin/updateBrand", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: brandId, 
          name 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Failed to update brand", "error");
        return;
      }

      showToast("✅ Brand updated successfully!", "success");
      setBrandName("");
      setOpenModal(false);
      setEditMode(false);
      setEditingBrand(null);
      setErrors({ brandName: "" });
      fetchBrands(); // Refresh the list
    } catch (error) {
      console.error(error);
      showToast("Server error occurred", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (brand: Brand): Promise<void> => {
    try {
      const brandId = brand._id || brand.id;
      const res = await fetch("/api/admin/toggleBrandStatus", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: brandId, 
          isActive: !brand.isActive 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Failed to toggle brand status", "error");
        return;
      }

      showToast(
        data.brand.isActive ? "Brand activated" : "Brand deactivated", 
        "success"
      );
      fetchBrands(); // Refresh the list
    } catch (error) {
      console.error(error);
      showToast("Server error occurred", "error");
    }
  };

  const handleDeleteBrand = async (): Promise<void> => {
    if (!deletingBrandId) return;

    try {
      const res = await fetch("/api/admin/deleteBrand", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deletingBrandId }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Failed to delete brand", "error");
        return;
      }

      showToast("🗑️ Brand deleted successfully!", "success");
      setShowDeleteModal(false);
      setDeletingBrandId(null);
      fetchBrands(); // Refresh the list
    } catch (error) {
      console.error(error);
      showToast("Server error occurred", "error");
    }
  };

  const openEditModal = (brand: Brand): void => {
    setEditMode(true);
    setEditingBrand(brand);
    setBrandName(brand.name);
    setOpenModal(true);
    setErrors({ brandName: "" });
  };

  const closeModal = (): void => {
    setOpenModal(false);
    setBrandName("");
    setEditMode(false);
    setEditingBrand(null);
    setErrors({ brandName: "" });
  };

  const openDeleteConfirm = (brandId: string): void => {
    setDeletingBrandId(brandId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = (): void => {
    setShowDeleteModal(false);
    setDeletingBrandId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      {/* Toast Container - FIXED: Added key prop */}
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-900 via-pink-900 to-rose-900 bg-clip-text text-transparent">
              Brands
            </h1>
            <p className="text-slate-600 mt-1 font-medium">Manage product brands and manufacturers</p>
          </div>

          <button
            onClick={() => setOpenModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-900 via-purple-800 to-pink-900 text-white px-6 py-3 rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 font-semibold"
          >
            <Plus className="w-5 h-5" />
            Add Brand
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search brands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-900 focus:border-transparent transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Stats Card */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-200/50 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                <Tag className="w-6 h-6 text-purple-900" />
              </div>
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Brands</p>
                <p className="text-3xl font-bold text-slate-900">{brands.length}</p>
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
                  {brands.filter(brand => brand.isActive).length}
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
                  {brands.filter(brand => !brand.isActive).length}
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
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-300 border-t-purple-900"></div>
              <p className="text-slate-500 mt-4 font-medium">Loading brands...</p>
            </div>
          ) : filteredBrands.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-purple-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Brand Name
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
                  {/* FIXED: Added key prop using _id or id */}
                  {filteredBrands.map((brand) => (
                    <tr
                      key={brand._id || brand.id}
                      className="hover:bg-purple-50/30 transition-colors duration-150"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-900 to-pink-900"></div>
                          <span className="font-semibold text-slate-900">{brand.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-600 font-mono text-sm bg-slate-100 px-3 py-1 rounded-lg">
                          {brand.slug}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(brand)}
                          className={`
                            inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold text-xs
                            transition-all duration-200 transform hover:scale-105
                            ${brand.isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                            }
                          `}
                        >
                          {brand.isActive ? (
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
                        {new Date(brand.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(brand)}
                            className="p-2 text-purple-900 hover:bg-purple-100 rounded-lg transition-colors duration-200"
                            title="Edit brand"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteConfirm(brand._id || brand.id || '')}
                            className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors duration-200"
                            title="Delete brand"
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
              <Tag className="w-20 h-20 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg font-medium">
                {searchQuery ? "No brands found matching your search" : "No brands available"}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setOpenModal(true)}
                  className="mt-4 text-purple-900 hover:text-purple-700 font-semibold"
                >
                  Create your first brand
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Brand Modal */}
      {openModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all animate-scaleIn">
            <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-pink-900 px-6 py-5 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-white">
                {editMode ? "Edit Brand" : "Add New Brand"}
              </h2>
              <button
                onClick={closeModal}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Brand Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => {
                    setBrandName(e.target.value);
                    setErrors({ brandName: "" });
                  }}
                  className={`w-full px-4 py-3 bg-slate-50 border ${
                    errors.brandName ? 'border-rose-500' : 'border-slate-200'
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-900 focus:border-transparent transition-all`}
                  placeholder="e.g., Samsung, LG, Sony"
                  maxLength={30}
                />
                {errors.brandName && (
                  <p className="text-rose-500 text-xs mt-2 font-medium">{errors.brandName}</p>
                )}
                <p className="text-xs text-slate-500 mt-2 font-medium">
                  {brandName.length}/30 characters
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={editMode ? handleEditBrand : handleAddBrand}
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-purple-900 via-purple-800 to-pink-900 text-white py-3 rounded-xl font-bold hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {submitting ? "Processing..." : editMode ? "Save Changes" : "Add Brand"}
                </button>
                <button
                  onClick={closeModal}
                  disabled={submitting}
                  className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-scaleIn">
            <div className="bg-gradient-to-r from-rose-600 to-rose-700 px-6 py-5 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-white">Delete Brand</h2>
              <button
                onClick={closeDeleteModal}
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
                    Are you sure you want to delete this brand?
                  </p>
                  <p className="text-slate-600 mt-2">
                    Brand: <span className="font-bold text-slate-900">
                      {brands.find(b => (b._id || b.id) === deletingBrandId)?.name}
                    </span>
                  </p>
                  <p className="text-slate-500 text-sm mt-2">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleDeleteBrand}
                  className="flex-1 bg-gradient-to-r from-rose-600 to-rose-700 text-white py-3 rounded-xl font-bold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Delete
                </button>
                <button
                  onClick={closeDeleteModal}
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