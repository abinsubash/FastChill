"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil, X } from "lucide-react";

export default function BrandsPage() {
  const [brandName, setBrandName] = useState("");
  const [brands, setBrands] = useState([
    { id: 1, name: "Samsung" },
    { id: 2, name: "LG" },
  ]);

  const [openModal, setOpenModal] = useState(false);

  const handleAddBrand = () => {
    if (!brandName.trim()) return;

    const newBrand = {
      id: Date.now(),
      name: brandName,
    };

    setBrands([...brands, newBrand]);
    setBrandName("");
    setOpenModal(false); // close modal
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Brands Management</h1>

        <button
          onClick={() => setOpenModal(true)}
          className="px-4 py-3 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Brand
        </button>
      </div>

      {/* Brand List Table */}
      <div className="bg-white p-5 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Brands List</h2>

        <table className="w-full border text-left">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-3 border">#</th>
              <th className="p-3 border">Brand Name</th>
              <th className="p-3 border text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {brands.map((brand, index) => (
              <tr key={brand.id} className="border-b">
                <td className="p-3 border">{index + 1}</td>
                <td className="p-3 border">{brand.name}</td>
                <td className="p-3 border text-center">
                  <div className="flex justify-center gap-3">
                    <button className="text-blue-600 hover:text-blue-800">
                      <Pencil size={18} />
                    </button>
                    <button className="text-red-600 hover:text-red-800">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {brands.length === 0 && (
              <tr>
                <td colSpan={3} className="p-4 text-center text-gray-500">
                  No brands added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Brand Modal */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg relative animate-fadeIn">
            {/* Close Button */}
            <button
              onClick={() => setOpenModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X size={22} />
            </button>

            <h2 className="text-xl font-semibold mb-4">Add New Brand</h2>

            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Enter brand name"
              className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300"
            />

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setOpenModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleAddBrand}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
