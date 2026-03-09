// src/app/user/shop/productDetail/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// Define the Product type to match your API response
interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  description?: string;
  mainImage?: string;
  images: string[];
  sellingPrice: number;
  teachnitionPrice?: number;
  stock: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<number>(0);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        
        console.log('🔍 Product ID:', productId);
        const apiUrl = `/api/getProductById/${productId}`;
        console.log('🔍 API URL:', apiUrl);
        
        const response = await fetch(apiUrl);
        
        console.log('🔍 Response status:', response.status);
        console.log('🔍 Response OK:', response.ok);
        
        const data = await response.json();
        console.log('🔍 Response data:', data);
        
        if (!response.ok) {
          throw new Error(data.message || 'Product not found');
        }
        
        if (data.success && data.product) {
          console.log('✅ Product loaded:', data.product);
          setProduct(data.product);
        } else {
          console.error('❌ Invalid response format:', data);
          throw new Error(data.message || 'Invalid product data');
        }
      } catch (err) {
        console.error('❌ Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    } else {
      console.error('❌ No product ID found in params');
    }
  }, [productId]);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 text-lg">Loading product...</p>
          <p className="text-slate-500 text-sm mt-2">Product ID: {productId}</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-2xl font-bold text-white mb-2">Product Not Found</h3>
          <p className="text-slate-400 mb-4">{error || 'This product does not exist'}</p>
          <div className="bg-slate-800/50 p-4 rounded-lg mb-6 text-left">
            <p className="text-xs text-slate-500 mb-1">Debug Info:</p>
            <p className="text-xs text-slate-300">Product ID: {productId}</p>
            <p className="text-xs text-slate-300">API URL: /api/getProductById/{productId}</p>
            <p className="text-xs text-red-400 mt-2">Check browser console for more details</p>
          </div>
          <Link 
            href="/user/shop"
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] transition-all inline-block"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const inStock = product.stock > 0;
  const discount = product.teachnitionPrice 
    ? Math.round((1 - product.sellingPrice / product.teachnitionPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-950/90 backdrop-blur-xl border-b border-cyan-500/30 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/">
            <h1 className="font-['Orbitron',sans-serif] text-4xl font-black tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)] cursor-pointer hover:scale-105 transition-transform">
              FAST CHILL
            </h1>
          </Link>
          
          <ul className="hidden md:flex gap-10 text-slate-200 font-medium">
            {['Home', 'Shop', 'Services', 'About', 'Contact'].map((item) => (
              <li key={item}>
                <Link 
                  href={item === 'Home' ? '/' : item === 'Shop' ? '/user/shop' : `/${item.toLowerCase()}`}
                  className="relative hover:text-cyan-400 transition-all duration-300 group text-sm tracking-wider uppercase"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="pt-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link>
            <span>›</span>
            <Link href="/user/shop" className="hover:text-cyan-400 transition-colors">Shop</Link>
            <span>›</span>
            <Link href={`/user/shop?category=${product.category}`} className="hover:text-cyan-400 transition-colors">{product.category}</Link>
            <span>›</span>
            <span className="text-white">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product Detail Section */}
      <section className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left Side - Images */}
            <div className="space-y-6 animate-[slideRight_0.8s_ease]">
              {/* Main Image */}
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 rounded-2xl opacity-75 blur-xl group-hover:opacity-100 transition-all duration-500"></div>
                
                <div className="relative bg-slate-900 rounded-2xl overflow-hidden border-2 border-cyan-400/30 aspect-square">
                  <Image
                    src={product.images[selectedImage] || product.mainImage || '/placeholder.jpg'}
                    alt={product.name}
                    fill
                    className="object-contain p-8"
                    priority
                    unoptimized
                  />
                  
                  {/* Discount Badge */}
                  {discount > 0 && (
                    <div className="absolute top-6 left-6 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg">
                      {discount}% OFF
                    </div>
                  )}

                  {/* Stock Badge */}
                  {!inStock && (
                    <div className="absolute top-6 right-6 bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg">
                      Out of Stock
                    </div>
                  )}
                </div>
              </div>

              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                        selectedImage === index
                          ? 'border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)]'
                          : 'border-slate-700 hover:border-cyan-400/50'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} view ${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Side - Product Info */}
            <div className="space-y-6 animate-[slideLeft_0.8s_ease]">
              {/* Category & Brand */}
              <div className="flex items-center gap-3">
                <span className="px-4 py-2 bg-cyan-500/20 border border-cyan-400/50 rounded-full text-cyan-300 text-sm font-semibold tracking-wider uppercase">
                  {product.category}
                </span>
                <span className="text-slate-400">by <span className="text-white font-semibold">{product.brand}</span></span>
              </div>

              {/* Product Name */}
              <h1 className="text-5xl font-black text-white leading-tight">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-4 py-4">
                <div className="text-5xl font-black text-cyan-400">
                  ₹{product.sellingPrice.toLocaleString()}
                </div>
                {product.teachnitionPrice && product.teachnitionPrice !== product.sellingPrice && (
                  <div className="text-2xl text-slate-500 line-through">
                    ₹{product.teachnitionPrice.toLocaleString()}
                  </div>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-3">
                {inStock ? (
                  <>
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 font-semibold">Available in Store</span>
                    <span className="text-slate-400">({product.stock} units)</span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <span className="text-red-400 font-semibold">Out of Stock</span>
                  </>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-3">Description</h3>
                  <p className="text-slate-300 leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Product Specifications */}
              <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Product Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                    <span className="text-slate-400">Brand</span>
                    <span className="text-white font-semibold">{product.brand}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                    <span className="text-slate-400">Category</span>
                    <span className="text-white font-semibold">{product.category}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-400">Availability</span>
                    <span className={`font-semibold ${inStock ? 'text-green-400' : 'text-red-400'}`}>
                      {inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Visit Store CTA */}
              <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-white mb-2">Visit Our Store</h4>
                    <p className="text-slate-300 text-sm mb-4">
                      Interested in this product? Visit our physical store to see it in person and get expert assistance from our team.
                    </p>
                    <Link 
                      href="/contact"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] transition-all"
                    >
                      Get Directions
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Back to Shop Button */}
              <Link 
                href="/user/shop"
                className="block text-center py-3 border-2 border-cyan-400/50 text-cyan-300 rounded-xl hover:bg-cyan-400/10 transition-all font-semibold"
              >
                ← Back to Shop
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="font-['Orbitron',sans-serif] text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-4">
            FAST CHILL
          </h2>
          <p className="text-slate-400 mb-6">Your trusted partner for appliance parts</p>
          <div className="flex justify-center gap-6 text-slate-500">
            <a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a>
            <span>•</span>
            <a href="#" className="hover:text-cyan-400 transition-colors">Terms</a>
            <span>•</span>
            <a href="#" className="hover:text-cyan-400 transition-colors">Contact</a>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@900&display=swap');
        
        @keyframes slideRight {
          from { transform: translateX(-50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideLeft {
          from { transform: translateX(50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}