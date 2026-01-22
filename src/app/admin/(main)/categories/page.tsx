"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Search, Layers, X } from "lucide-react";

export default function CategoriesPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({ name: "" });

  // Empty category list (UI only)
  const [categories] = useState([]);

  const handleInputChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ name: e.target.value });
    console.log(e.target.value)
  };
  const handleSubmit = (e:React.ChangeEvent<HTMLInputElement>)=>{
    console.log('submited Data',formData)
  }

  const handleCloseModal = () => {
    setShowAddModal(false);
    setFormData({ name: "" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600 mt-1">Manage product categories</p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-900 to-blue-700 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Add Category
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Stats Card */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Layers className="w-6 h-6 text-blue-900" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total Categories</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="px-6 pb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Category Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* NO categories — empty table */}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          <div className="text-center py-12">
            <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No categories available</p>
          </div>
        </div>
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-opacity-20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="sticky top-0 bg-gradient-to-r from-blue-900 to-blue-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Add Category</h2>
              <button
                onClick={handleCloseModal}
                className="text-white hover:bg-blue-800 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
                  placeholder="e.g., Refrigerator, Air Conditioner"
                />

                <p className="text-xs text-gray-500 mt-2">
                  {formData.name.length}/50 characters
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                onClick={handleSubmit}
                  className="flex-1 bg-gradient-to-r from-blue-900 to-blue-700 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Add Category
                </button>

                <button
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
