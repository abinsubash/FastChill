"use client";

import { useState, useCallback } from 'react';
import {
  Plus,
  Trash2,
  Search,
  Package,
  X,
  Upload,
  Crop,
} from 'lucide-react';
import Cropper from 'react-easy-crop';

type ProductImage = {
  file: File;
  preview: string;
  cropped: string | null;
};

type Product = {
  id: number;
  name: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  brand: string;
  images: string[];
  mainImage: string;
};

export default function ProductsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    purchasePrice: '',
    sellingPrice: '',
    stock: '',
    brand: '',
  });

  const [images, setImages] = useState<ProductImage[]>([]);
  const [showCropper, setShowCropper] = useState(false);
  const [currentImageToCrop, setCurrentImageToCrop] = useState<ProductImage | null>(null);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const categories = ["Fridge", "Washing Machine", "AC", "Parts", "Gas", "Motor"];

  // Image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || images.length >= 3) return;

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
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormData({ name: '', category: '', purchasePrice: '', sellingPrice: '', stock: '', brand: '' });
    setImages([]);
  };

  const handleAddProduct = () => {
    if (!formData.name || !formData.category || !formData.purchasePrice || !formData.sellingPrice || images.length === 0) {
      alert('Please fill all required fields and add at least one image.');
      return;
    }

    const croppedImages = images.map(img => img.cropped || img.preview);

    const newProduct: Product = {
      id: Date.now(),
      name: formData.name,
      category: formData.category,
      purchasePrice: parseFloat(formData.purchasePrice),
      sellingPrice: parseFloat(formData.sellingPrice),
      stock: parseInt(formData.stock) || 0,
      brand: formData.brand || 'N/A',
      images: croppedImages,
      mainImage: croppedImages[0],
    };

    setProducts(prev => [...prev, newProduct]);
    setShowAddModal(false);
    resetForm();
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600">Manage your inventory</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-900 to-blue-700 text-white px-6 py-3 rounded-xl hover:shadow-lg transition"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>

        <div className="mt-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg"><Package className="w-6 h-6 text-blue-900" /></div>
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold">{products.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg"><Package className="w-6 h-6 text-green-900" /></div>
            <div>
              <p className="text-sm text-gray-600">Total Stock</p>
              <p className="text-2xl font-bold">{products.reduce((a, p) => a + p.stock, 0)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg"><Package className="w-6 h-6 text-orange-900" /></div>
            <div>
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold">{products.filter(p => p.stock < 10).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg"><Package className="w-6 h-6 text-purple-900" /></div>
            <div>
              <p className="text-sm text-gray-600">Categories</p>
              <p className="text-2xl font-bold">{categories.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="px-6 pb-6">
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Images</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Product Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Brand</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Purchase</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Selling</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Stock</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16">
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No products yet. Add your first one!</p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(product => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {product.images.slice(0, 3).map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt=""
                              className="w-12 h-12 rounded-lg object-cover border"
                            />
                          ))}
                          {product.images.length > 3 && (
                            <span className="text-xs text-gray-500 self-center">+{product.images.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">{product.name}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-sm">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{product.brand}</td>
                      <td className="px-6 py-4 text-gray-700">₹{product.purchasePrice.toLocaleString()}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900">₹{product.sellingPrice.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 px-3 py-1 rounded-full text-sm font-medium ${product.stock < 10 ? 'bg-red-100 text-red-900' : 'bg-green-100 text-green-900'
                          }`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setProducts(prev => prev.filter(p => p.id !== product.id))}
                          className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0  bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-900 to-blue-700 text-white p-6 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-2xl font-bold">Add New Product</h2>
              <button onClick={() => { setShowAddModal(false); resetForm(); }}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Images Grid */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  Product Images (up to 3) <span className="text-red-500">*</span>
                </label>

                <div className="grid grid-cols-3 gap-4">
                  {[0, 1, 2].map(index => (
                    <div key={index} className="relative group">
                      {images[index] ? (
                        <div>
                          <img
                            src={images[index].cropped || images[index].preview}
                            alt={`Product ${index + 1}`}
                            className="w-full h-40 object-cover rounded-lg border border-gray-200"
                          />

                          <button
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 bg-gray-50">
                          <Upload className="w-8 h-8 text-gray-400" />
                          <span className="mt-2 text-xs text-gray-600">Image {index + 1}</span>

                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                            disabled={images.length >= 3}
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
                  <label className="block font-medium mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-900"
                    placeholder="Samsung Double Door Fridge"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-900"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-2">Purchase Price *</label>
                  <input
                    type="number"
                    value={formData.purchasePrice}
                    onChange={e => setFormData({ ...formData, purchasePrice: e.target.value })}
                    className="w-full px-4 py-3 border rounded-xl"
                    placeholder="35000"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-2">Selling Price *</label>
                  <input
                    type="number"
                    value={formData.sellingPrice}
                    onChange={e => setFormData({ ...formData, sellingPrice: e.target.value })}
                    className="w-full px-4 py-3 border rounded-xl"
                    placeholder="42000"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-2">Teachnition Price</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-4 py-3 border rounded-xl"
                    placeholder="Samsung"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-2">Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-3 border rounded-xl"
                    placeholder="15"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-2">Brand</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-4 py-3 border rounded-xl"
                    placeholder="Samsung"
                  />
                </div>

              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleAddProduct}
                  className="flex-1 bg-gradient-to-r from-blue-900 to-blue-700 text-white py-4 rounded-xl font-bold"
                >
                  Add Product
                </button>
                <button
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  className="flex-1 bg-gray-200 py-4 rounded-xl"
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
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col">
            <div className="p-4 border-b flex justify-between flex items-center">
              <h3 className="text-xl font-bold">Crop Image</h3>
              <button onClick={() => setShowCropper(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="relative flex-1 m-4 bg-gray-900 rounded-xl overflow-hidden">
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
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={zoom}
                onChange={e => setZoom(parseFloat(e.target.value))}
                className="flex-1"
              />
              <button
                onClick={createCroppedImage}
                className="px-8 py-3 bg-blue-900 text-white rounded-xl flex items-center gap-2"
              >
                <Crop className="w-5 h-5" />
                Crop & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}