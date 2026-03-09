"use client";

import { useState, useCallback, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Search,
  Package,
  X,
  Upload,
  Crop,
  Edit2,
  Power,
  PowerOff,
  Check,
  AlertCircle,
  Eye,
  Image as ImageIcon,
} from 'lucide-react';
import Cropper from 'react-easy-crop';

type ProductImage = {
  file: File;
  preview: string;
  cropped: string | null;
};

type Product = {
  _id: string;
  name: string;
  category: {
    _id: string;
    name: string;
  };
  brand: {
    _id: string;
    name: string;
  };
  sellingPrice: number;
  teachnitionPrice: number;
  stock: number;
  description: string;
  images: string[];
  mainImage: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type FormData = {
  name: string;
  category: string;
  teachnitionPrice: string;
  sellingPrice: string;
  stock: string;
  brand: string;
  description: string;
};

type Toast = {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning';
};

export default function ProductsPage() {
  // State management
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [allBrands, setAllBrands] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    category: '',
    teachnitionPrice: '',
    sellingPrice: '',
    stock: '',
    brand: '',
    description: '',
  });

  // Image cropper state
  const [images, setImages] = useState<ProductImage[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [showCropper, setShowCropper] = useState(false);
  const [currentImageToCrop, setCurrentImageToCrop] = useState<ProductImage | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  // Fetch data on mount
  useEffect(() => {
    fetchCategories();
    fetchBrands();
    fetchProducts();
  }, []);

  // Filter products
  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  const showToast = (message: string, type: Toast['type']) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 4000);
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/getAllCategories");
      const data = await res.json();
      if (res.ok) {
        setAllCategories(data.categories.filter((cat: any) => cat.isActive));
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await fetch("/api/getAllBrands");
      const data = await res.json();
      if (res.ok) {
        setAllBrands(data.brands.filter((brand: any) => brand.isActive));
      }
    } catch (error) {
      console.error("Failed to fetch brands:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/getAllProducts");
      const data = await res.json();
      console.log(data)
      if (data.success) {
        setProducts(data.products);
        setFilteredProducts(data.products);
      } else {
        showToast("Failed to fetch products", "error");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      showToast("Server error while fetching products", "error");
    } finally {
      setLoading(false);
    }
  };

  // Image handling
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const totalImages = images.length + existingImages.length;
    
    if (!files || totalImages >= 5) {
      showToast("Maximum 5 images allowed", "warning");
      return;
    }

    const file = files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result as string;
        setCurrentImageToCrop({ file, preview, cropped: null });
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = async () => {
    if (!currentImageToCrop || !croppedAreaPixels) return;

    const image = new Image();
    image.src = currentImageToCrop.preview;
    await new Promise(resolve => (image.onload = resolve));

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    const croppedBase64 = canvas.toDataURL('image/jpeg', 0.9);
    setImages(prev => [...prev, { ...currentImageToCrop, cropped: croppedBase64 }]);
    setShowCropper(false);
    setCurrentImageToCrop(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const base64ToBlob = (base64: string): Blob => {
    const byteString = atob(base64.split(",")[1]);
    const mimeString = base64.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeString });
  };

  // Form handling
  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      teachnitionPrice: '',
      sellingPrice: '',
      stock: '',
      brand: '',
      description: '',
    });
    setImages([]);
    setExistingImages([]);
    setSelectedProduct(null);
  };
const handleAddProduct = async () => {
  // Validation
  if (
    !formData.name ||
    !formData.category ||
    !formData.sellingPrice ||
    !formData.teachnitionPrice ||
    images.length === 0
  ) {
    showToast("Please fill all required fields and add at least one image", "error");
    return;
  }

  try {
    const form = new FormData();
    
    // Append form data
    form.append("name", formData.name);
    form.append("category", formData.category);
    form.append("sellingPrice", formData.sellingPrice);
    form.append("stock", formData.stock || "0");
    form.append("brand", formData.brand);
    form.append("teachnitionPrice", formData.teachnitionPrice);
    form.append("description", formData.description);

    // Append images
    images.forEach((img, index) => {
      if (img.cropped) {
        const blob = base64ToBlob(img.cropped);
        form.append("images", blob, `product-${index}.jpg`);
      } else {
        form.append("images", img.file);
      }
    });

    const res = await fetch("/api/admin/addproducts", {
      method: "POST",
      body: form,
    });

    // ✅ ADD THIS: Log the response before parsing
    const contentType = res.headers.get("content-type");
    console.log("Response status:", res.status);
    console.log("Content-Type:", contentType);

    // ✅ ADD THIS: Get text first to see what we're receiving
    const text = await res.text();
    console.log("Response text:", text);

    // ✅ ADD THIS: Try to parse as JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse JSON:", e);
      console.error("Received HTML instead:", text.substring(0, 500));
      showToast("Server error - check console for details", "error");
      return;
    }

    if (!res.ok) {
      showToast(data.message || "Failed to add product", "error");
      return;
    }

    showToast("Product added successfully 🎉", "success");
    setShowAddModal(false);
    resetForm();
    fetchProducts();
  } catch (error) {
    console.error("Error adding product:", error);
    showToast("Server error", "error");
  }
};

  const handleEditProduct = async () => {
    if (!selectedProduct) return;

    // Validation
    if (
      !formData.name ||
      !formData.category ||
      !formData.sellingPrice ||
      !formData.teachnitionPrice
    ) {
      showToast("Please fill all required fields", "error");
      return;
    }

    const totalImages = images.length + existingImages.length;
    if (totalImages === 0) {
      showToast("Please add at least one image", "error");
      return;
    }

    try {
      const form = new FormData();
      
      // Append form data
      form.append("name", formData.name);
      form.append("category", formData.category);
      form.append("sellingPrice", formData.sellingPrice);
      form.append("stock", formData.stock || "0");
      form.append("brand", formData.brand);
      form.append("teachnitionPrice", formData.teachnitionPrice);
      form.append("description", formData.description);

      // Append existing images (URLs to keep)
      form.append("existingImages", JSON.stringify(existingImages));

      // Append new images
      images.forEach((img, index) => {
        if (img.cropped) {
          const blob = base64ToBlob(img.cropped);
          form.append("images", blob, `product-${index}.jpg`);
        } else {
          form.append("images", img.file);
        }
      });

      const res = await fetch(`/api/admin/updateProduct/${selectedProduct._id}`, {
        method: "PUT",
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Failed to update product", "error");
        return;
      }

      showToast("Product updated successfully ✨", "success");
      setShowEditModal(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Error updating product:", error);
      showToast("Server error", "error");
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      const res = await fetch(`/api/admin/updateProduct/${product._id}/toggle`, {
        method: "PATCH",
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Failed to toggle status", "error");
        return;
      }

      showToast(
        data.product.isActive ? "Product enabled" : "Product disabled",
        "success"
      );
      fetchProducts();
    } catch (error) {
      console.error("Error toggling product:", error);
      showToast("Server error", "error");
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      const res = await fetch(`/api/admin/deleteProduct/${selectedProduct._id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Failed to delete product", "error");
        return;
      }

      showToast("Product deleted successfully 🗑️", "success");
      setShowDeleteModal(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      showToast("Server error", "error");
    }
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      category: product.category._id,
      teachnitionPrice: product.teachnitionPrice?.toString(),
      sellingPrice: product.sellingPrice?.toString(),
      stock: product.stock?.toString(),
      brand: product.brand._id,
      description: product.description,
    });
    setExistingImages(product.images);
    setImages([]);
    setShowEditModal(true);
  };

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const openViewModal = (product: Product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowViewModal(false);
    resetForm();
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
              Products
            </h1>
            <p className="text-slate-600 mt-1 font-medium">Manage your inventory</p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white px-6 py-3 rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 font-semibold"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products by name, category, or brand..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-200/50 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                <Package className="w-6 h-6 text-blue-900" />
              </div>
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Products</p>
                <p className="text-3xl font-bold text-slate-900">{products.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-200/50 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl">
                <Power className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <p className="text-slate-600 text-sm font-medium">Active Products</p>
                <p className="text-3xl font-bold text-slate-900">
                  {products.filter(p => p.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-200/50 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl">
                <AlertCircle className="w-6 h-6 text-orange-700" />
              </div>
              <div>
                <p className="text-slate-600 text-sm font-medium">Low Stock</p>
                <p className="text-3xl font-bold text-slate-900">
                  {products.filter(p => p.stock < 10).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-200/50 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-violet-100 rounded-xl">
                <Package className="w-6 h-6 text-purple-700" />
              </div>
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Stock</p>
                <p className="text-3xl font-bold text-slate-900">
                  {products.reduce((acc, p) => acc + p.stock, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="px-6 pb-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/50 overflow-hidden">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-300 border-t-blue-900"></div>
              <p className="text-slate-500 mt-4 font-medium">Loading products...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Images
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Product Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Brand
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Cost Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Selling Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((product) => (
                    <tr
                      key={product._id}
                      className="hover:bg-blue-50/30 transition-colors duration-150"
                    >
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {product.images.slice(0, 2).map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt=""
                              className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                            />
                          ))}
                          {product.images.length > 2 && (
                            <span className="text-xs text-slate-500 self-center font-medium">
                              +{product.images.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900">{product.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-900 rounded-lg text-sm font-medium">
                          {product.category?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-medium">
                        {product.brand?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        ₹{product.teachnitionPrice?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        ₹{product.sellingPrice?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                            product.stock < 10
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(product)}
                          className={`
                            inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold text-xs
                            transition-all duration-200 transform hover:scale-105
                            ${product.isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                            }
                          `}
                        >
                          {product.isActive ? (
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
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openViewModal(product)}
                            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-2 text-blue-900 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                            title="Edit product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(product)}
                            className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors duration-200"
                            title="Delete product"
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
              <Package className="w-20 h-20 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg font-medium">
                {searchTerm ? "No products found matching your search" : "No products available"}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 text-blue-900 hover:text-blue-700 font-semibold"
                >
                  Create your first product
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto my-8">
            <div className="sticky top-0 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 px-6 py-5 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-2xl font-bold text-white">Add New Product</h2>
              <button
                onClick={handleCloseModal}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Images Grid */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-4">
                  Product Images (up to 5) <span className="text-rose-500">*</span>
                </label>

                <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                  {[0, 1, 2, 3, 4].map(index => (
                    <div key={index} className="relative group">
                      {images[index] ? (
                        <div className="relative">
                          <img
                            src={images[index].cropped || images[index].preview}
                            alt={`Product ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border-2 border-slate-200"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-rose-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition bg-slate-50">
                          <Upload className="w-6 h-6 text-slate-400" />
                          <span className="mt-1 text-xs text-slate-600">
                            Image {index + 1}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                            disabled={images.length >= 5}
                          />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Product Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
                    placeholder="Samsung Double Door Refrigerator"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
                  >
                    <option value="">Select category</option>
                    {allCategories.map(cat => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Brand <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.brand}
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
                  >
                    <option value="">Select brand</option>
                    {allBrands.map(brand => (
                      <option key={brand._id} value={brand._id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Selling Price <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.sellingPrice}
                    onChange={e => setFormData({ ...formData, sellingPrice: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
                    placeholder="42000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Cost Price (Teachnition) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.teachnitionPrice}
                    onChange={e => setFormData({ ...formData, teachnitionPrice: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
                    placeholder="4500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
                    placeholder="15"
                  />
                </div>
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Product Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all min-h-[120px] resize-y"
                  placeholder="Enter product description, features, specifications..."
                  rows={4}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddProduct}
                  className="flex-1 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white py-3 rounded-xl font-bold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Add Product
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

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto my-8">
            <div className="sticky top-0 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 px-6 py-5 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-2xl font-bold text-white">Edit Product</h2>
              <button
                onClick={handleCloseModal}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Images Grid */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-4">
                  Product Images (up to 5) <span className="text-rose-500">*</span>
                </label>

                <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                  {/* Existing Images */}
                  {existingImages.map((img, index) => (
                    <div key={`existing-${index}`} className="relative group">
                      <img
                        src={img}
                        alt={`Existing ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-slate-200"
                      />
                      <button
                        onClick={() => removeExistingImage(index)}
                        className="absolute -top-2 -right-2 bg-rose-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* New Images */}
                  {images.map((img, index) => (
                    <div key={`new-${index}`} className="relative group">
                      <img
                        src={img.cropped || img.preview}
                        alt={`New ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-blue-400"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-rose-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-xs py-1 text-center rounded-b-lg">
                        New
                      </div>
                    </div>
                  ))}

                  {/* Upload slots */}
                  {Array.from({ length: 5 - existingImages.length - images.length }).map((_, index) => (
                    <label
                      key={`upload-${index}`}
                      className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition bg-slate-50"
                    >
                      <Upload className="w-6 h-6 text-slate-400" />
                      <span className="mt-1 text-xs text-slate-600">Add Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Product Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
                    placeholder="Samsung Double Door Refrigerator"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
                  >
                    <option value="">Select category</option>
                    {allCategories.map(cat => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Brand <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.brand}
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
                  >
                    <option value="">Select brand</option>
                    {allBrands.map(brand => (
                      <option key={brand._id} value={brand._id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Selling Price <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.sellingPrice}
                    onChange={e => setFormData({ ...formData, sellingPrice: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
                    placeholder="42000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Cost Price (Teachnition) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.teachnitionPrice}
                    onChange={e => setFormData({ ...formData, teachnitionPrice: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
                    placeholder="4500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
                    placeholder="15"
                  />
                </div>
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Product Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all min-h-[120px] resize-y"
                  placeholder="Enter product description, features, specifications..."
                  rows={4}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleEditProduct}
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

      {/* View Product Modal */}
      {showViewModal && selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto my-8">
            <div className="sticky top-0 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 px-6 py-5 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-2xl font-bold text-white">Product Details</h2>
              <button
                onClick={handleCloseModal}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Images Gallery */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Product Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {selectedProduct.images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`${selectedProduct.name} ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border-2 border-slate-200 hover:border-blue-500 transition"
                    />
                  ))}
                </div>
              </div>

              {/* Product Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-slate-600 block mb-1">Product Name</label>
                  <p className="text-lg font-bold text-slate-900">{selectedProduct.name}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-600 block mb-1">Category</label>
                  <span className="inline-block px-4 py-2 bg-blue-100 text-blue-900 rounded-lg font-semibold">
                    {selectedProduct.category?.name || 'N/A'}
                  </span>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-600 block mb-1">Brand</label>
                  <p className="text-lg font-bold text-slate-900">{selectedProduct.brand?.name || 'N/A'}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-600 block mb-1">Status</label>
                  <span
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
                      selectedProduct.isActive
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {selectedProduct.isActive ? (
                      <>
                        <Power className="w-4 h-4" />
                        Active
                      </>
                    ) : (
                      <>
                        <PowerOff className="w-4 h-4" />
                        Inactive
                      </>
                    )}
                  </span>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-600 block mb-1">Selling Price</label>
                  <p className="text-2xl font-bold text-slate-900">₹{selectedProduct.sellingPrice?.toLocaleString()}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-600 block mb-1">Cost Price</label>
                  <p className="text-2xl font-bold text-slate-900">₹{selectedProduct.teachnitionPrice?.toLocaleString()}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-600 block mb-1">Stock</label>
                  <span
                    className={`inline-block px-4 py-2 rounded-lg font-bold text-lg ${
                      selectedProduct.stock < 10
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {selectedProduct.stock} units
                  </span>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-600 block mb-1">Profit Margin</label>
                  <p className="text-2xl font-bold text-emerald-700">
                    ₹{(selectedProduct.sellingPrice - selectedProduct.teachnitionPrice)?.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Description */}
              {selectedProduct.description && (
                <div>
                  <label className="text-sm font-semibold text-slate-600 block mb-2">Description</label>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p className="text-slate-700 whitespace-pre-wrap">{selectedProduct.description}</p>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Created At</label>
                  <p className="text-sm text-slate-700">
                    {new Date(selectedProduct.createdAt)?.toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Last Updated</label>
                  <p className="text-sm text-slate-700">
                    {new Date(selectedProduct.updatedAt)?.toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    handleCloseModal();
                    openEditModal(selectedProduct);
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white py-3 rounded-xl font-bold hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-5 h-5" />
                  Edit Product
                </button>
                <button
                  onClick={handleCloseModal}
                  className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-scaleIn">
            <div className="bg-gradient-to-r from-rose-600 to-rose-700 px-6 py-5 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-white">Delete Product</h2>
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
                    Are you sure you want to delete this product?
                  </p>
                  <p className="text-slate-600 mt-2">
                    Product: <span className="font-bold text-slate-900">{selectedProduct.name}</span>
                  </p>
                  <p className="text-slate-500 text-sm mt-2">
                    This action cannot be undone. All product data will be permanently removed.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleDeleteProduct}
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

      {/* Cropper Modal */}
      {showCropper && currentImageToCrop && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Crop className="w-6 h-6" />
                Crop Image
              </h3>
              <button
                onClick={() => {
                  setShowCropper(false);
                  setCurrentImageToCrop(null);
                }}
                className="hover:bg-slate-100 p-2 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="relative flex-1 m-4 bg-slate-900 rounded-xl overflow-hidden">
              <Cropper
                image={currentImageToCrop.preview}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div className="p-4 border-t flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-semibold text-slate-700 block mb-2">
                  Zoom: {zoom.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={e => setZoom(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              <button
                onClick={createCroppedImage}
                className="px-8 py-3 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-xl flex items-center gap-2 hover:shadow-xl transition font-bold"
              >
                <Check className="w-5 h-5" />
                Crop & Save
              </button>
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