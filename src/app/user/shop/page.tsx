'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Filter, X, ChevronLeft, ChevronRight, MapPin, Phone, Clock } from 'lucide-react';

// Types
interface Product {
  _id: string;
  name: string;
  brand: { _id: string; name: string; isActive?: boolean } | null;
  category: { _id: string; name: string; isActive?: boolean } | null;
  description?: string;
  images: string[];
  sellingPrice: number;
  technicianPrice?: number;
  stock: number;
  isActive: boolean;
}

interface FilterOption {
  id: string;
  name: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  productsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ApiResponse {
  success: boolean;
  products: Product[];
  pagination: Pagination;
  filters: {
    categories: FilterOption[];
    brands: FilterOption[];
    priceRange: { min: number; max: number };
  };
  message?: string;
}

interface AllProductsResponse {
  success: boolean;
  products: Product[];
  count?: number;
  message?: string;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useClientFiltering, setUseClientFiltering] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const productsPerPage = 20;

  const [availableCategories, setAvailableCategories] = useState<FilterOption[]>([]);
  const [availableBrands, setAvailableBrands] = useState<FilterOption[]>([]);
  const [availablePriceRange, setAvailablePriceRange] = useState({ min: 0, max: 100000 });
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => { fetchAllProducts(); }, []);

  useEffect(() => {
    if (!useClientFiltering && allProducts.length === 0) {
      fetchProducts();
    } else if (useClientFiltering && allProducts.length > 0) {
      applyClientSideFilters();
    }
  }, [debouncedSearch, selectedCategories, selectedBrands, priceRange, inStockOnly, sortBy, currentPage, useClientFiltering, allProducts]);

  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/getAllProducts');
      if (!response.ok) throw new Error('Failed to fetch all products');
      const data: AllProductsResponse = await response.json();
      if (data.success) {
        const validProducts = data.products.filter(p => p.isActive);
        setAllProducts(validProducts);
        const categories = Array.from(new Map(validProducts.filter(p => p.category !== null).map(p => [p.category!._id, { id: p.category!._id, name: p.category!.name }])).values());
        const brands = Array.from(new Map(validProducts.filter(p => p.brand !== null).map(p => [p.brand!._id, { id: p.brand!._id, name: p.brand!.name }])).values());
        const prices = validProducts.map(p => p.sellingPrice);
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
        const maxPrice = prices.length > 0 ? Math.max(...prices) : 100000;
        setAvailableCategories(categories.sort((a, b) => a.name.localeCompare(b.name)));
        setAvailableBrands(brands.sort((a, b) => a.name.localeCompare(b.name)));
        setAvailablePriceRange({ min: minPrice, max: maxPrice });
        setPriceRange({ min: minPrice, max: maxPrice });
        setUseClientFiltering(true);
        applyClientSideFilters(validProducts);
      } else throw new Error(data.message || 'Failed to fetch products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setUseClientFiltering(false);
      fetchProducts();
    } finally {
      setLoading(false);
    }
  };

  const applyClientSideFilters = (productsToFilter: Product[] = allProducts) => {
    if (productsToFilter.length === 0) return;
    let filtered = [...productsToFilter];
    if (debouncedSearch.trim()) {
      const s = debouncedSearch.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(s) || p.description?.toLowerCase().includes(s) || p.brand?.name.toLowerCase().includes(s) || p.category?.name.toLowerCase().includes(s));
    }
    if (selectedCategories.length > 0) filtered = filtered.filter(p => p.category && selectedCategories.includes(p.category._id));
    if (selectedBrands.length > 0) filtered = filtered.filter(p => p.brand && selectedBrands.includes(p.brand._id));
    filtered = filtered.filter(p => p.sellingPrice >= priceRange.min && p.sellingPrice <= priceRange.max);
    if (inStockOnly) filtered = filtered.filter(p => p.stock > 0);
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.sellingPrice - b.sellingPrice;
        case 'price-high': return b.sellingPrice - a.sellingPrice;
        case 'name': return a.name.localeCompare(b.name);
        default: return b._id.localeCompare(a._id);
      }
    });
    const totalProducts = sorted.length;
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const paginatedProducts = sorted.slice(startIndex, startIndex + productsPerPage);
    setProducts(paginatedProducts);
    setPagination({ currentPage, totalPages, totalProducts, productsPerPage, hasNextPage: currentPage < totalPages, hasPrevPage: currentPage > 1 });
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (selectedCategories.length > 0) params.append('categories', selectedCategories.join(','));
      if (selectedBrands.length > 0) params.append('brands', selectedBrands.join(','));
      params.append('minPrice', priceRange.min.toString());
      params.append('maxPrice', priceRange.max.toString());
      if (inStockOnly) params.append('inStock', 'true');
      params.append('sortBy', sortBy);
      params.append('page', currentPage.toString());
      params.append('limit', productsPerPage.toString());
      const response = await fetch(`/api/shop/products?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data: ApiResponse = await response.json();
      if (data.success) {
        setProducts(data.products);
        setPagination(data.pagination);
        if (availableCategories.length === 0) {
          setAvailableCategories(data.filters.categories);
          setAvailableBrands(data.filters.brands);
          setAvailablePriceRange(data.filters.priceRange);
          setPriceRange(data.filters.priceRange);
        }
      } else throw new Error(data.message || 'Failed to fetch products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (id: string) => { setSelectedCategories(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]); setCurrentPage(1); };
  const toggleBrand = (id: string) => { setSelectedBrands(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]); setCurrentPage(1); };
  const clearFilters = () => { setSearchQuery(''); setSelectedCategories([]); setSelectedBrands([]); setPriceRange(availablePriceRange); setInStockOnly(false); setSortBy('featured'); setCurrentPage(1); };

  const hasActiveFilters = selectedCategories.length > 0 || selectedBrands.length > 0 || inStockOnly || debouncedSearch.trim() !== '' || priceRange.min !== availablePriceRange.min || priceRange.max !== availablePriceRange.max;
  const activeFilterCount = selectedCategories.length + selectedBrands.length + (inStockOnly ? 1 : 0) + (debouncedSearch.trim() !== '' ? 1 : 0) + ((priceRange.min !== availablePriceRange.min || priceRange.max !== availablePriceRange.max) ? 1 : 0);

  const stockStatus = (stock: number) => {
    if (stock >= 10) return { label: 'In Stock', color: '#10B981' };
    if (stock > 0) return { label: 'Low Stock', color: '#F59E0B' };
    return { label: 'Out of Stock', color: '#EF4444' };
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050A0F', color: '#fff', fontFamily: "'Syne', sans-serif" }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;500;700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #050A0F; }
        ::-webkit-scrollbar-thumb { background: #00D4FF; border-radius: 2px; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes scanLine {
          0%   { top: -2px; }
          100% { top: 100%; }
        }

        .anim-1 { animation: fadeUp 0.6s ease both; }
        .anim-2 { animation: fadeUp 0.6s ease 0.1s both; }
        .anim-3 { animation: fadeUp 0.6s ease 0.2s both; }

        .product-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 2px;
          transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
          overflow: hidden;
        }
        .product-card:hover {
          border-color: rgba(0,212,255,0.35);
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(0,212,255,0.1);
        }
        .product-card:hover .card-img {
          transform: scale(1.06);
        }
        .card-img {
          transition: transform 0.5s ease;
        }

        .filter-panel {
          animation: fadeUp 0.25s ease both;
        }

        .nav-link {
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
          text-decoration: none;
          position: relative;
          transition: color 0.2s;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px; left: 0;
          width: 0; height: 1px;
          background: #00D4FF;
          transition: width 0.3s;
        }
        .nav-link:hover { color: #00D4FF; }
        .nav-link:hover::after { width: 100%; }

        .btn-cyan {
          background: #00D4FF;
          color: #050A0F;
          border: none;
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          border-radius: 2px;
          transition: background 0.2s, box-shadow 0.2s;
        }
        .btn-cyan:hover {
          background: #33DDFF;
          box-shadow: 0 0 16px rgba(0,212,255,0.4);
        }
        .btn-ghost {
          background: transparent;
          border: 1px solid rgba(0,212,255,0.2);
          color: rgba(0,212,255,0.8);
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          border-radius: 2px;
          transition: border-color 0.2s, color 0.2s, background 0.2s;
        }
        .btn-ghost:hover {
          border-color: #00D4FF;
          background: rgba(0,212,255,0.06);
          color: #00D4FF;
        }
        .btn-ghost.active {
          background: rgba(0,212,255,0.1);
          border-color: #00D4FF;
          color: #00D4FF;
        }

        input[type="checkbox"] {
          appearance: none;
          width: 14px; height: 14px;
          border: 1px solid rgba(0,212,255,0.3);
          border-radius: 2px;
          background: rgba(0,212,255,0.05);
          cursor: pointer;
          flex-shrink: 0;
          position: relative;
          transition: border-color 0.2s, background 0.2s;
        }
        input[type="checkbox"]:checked {
          background: #00D4FF;
          border-color: #00D4FF;
        }
        input[type="checkbox"]:checked::after {
          content: '';
          position: absolute;
          left: 3px; top: 1px;
          width: 5px; height: 8px;
          border: 2px solid #050A0F;
          border-top: none; border-left: none;
          transform: rotate(45deg);
        }

        input[type="range"] {
          -webkit-appearance: none;
          width: 100%; height: 2px;
          background: rgba(0,212,255,0.2);
          border-radius: 1px;
          outline: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px; height: 14px;
          border-radius: 50%;
          background: #00D4FF;
          cursor: pointer;
          box-shadow: 0 0 8px rgba(0,212,255,0.5);
        }

        select {
          appearance: none;
          -webkit-appearance: none;
        }

        .mono { font-family: 'Space Mono', monospace; }
        .divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(0,212,255,0.15), transparent); }

        /* Responsive product grid */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: rgba(0,212,255,0.06);
        }
        @media (max-width: 1100px) { .products-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 768px)  { .products-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px)  { .products-grid { grid-template-columns: 1fr; } }

        .filter-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        @media (max-width: 768px) { .filter-grid { grid-template-columns: 1fr; } }

        .contact-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: rgba(0,212,255,0.06);
        }
        @media (max-width: 768px) { .contact-grid { grid-template-columns: 1fr; } }

        .section-pad { padding: 64px 24px; }
        @media (max-width: 600px) { .section-pad { padding: 48px 16px; } }

        .search-sort-row {
          display: flex;
          gap: 12px;
        }
        @media (max-width: 600px) {
          .search-sort-row { flex-direction: column; }
        }

        .footer-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
        }
        @media (max-width: 600px) {
          .footer-inner { flex-direction: column; text-align: center; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        borderBottom: '1px solid rgba(0,212,255,0.08)',
        backdropFilter: 'blur(20px)',
        background: 'rgba(5,10,15,0.92)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span className="mono" style={{ fontSize: 18, fontWeight: 700, letterSpacing: '0.12em', color: '#00D4FF' }}>
              FAST<span style={{ color: 'rgba(255,255,255,0.9)' }}>CHILL</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <ul style={{ display: 'flex', gap: 32, listStyle: 'none', margin: 0, padding: 0 }} className="desktop-nav-ul">
            {['Home', 'Shop', 'Services', 'About', 'Contact'].map((item) => (
              <li key={item}>
                <Link href={item === 'Home' ? '/' : `/user/${item.toLowerCase()}`} className="nav-link">{item}</Link>
              </li>
            ))}
          </ul>

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} className="hamburger-btn" aria-label="Menu">
            <div style={{ width: 22, height: 1, background: '#00D4FF', marginBottom: 5, transition: 'transform 0.2s', transform: menuOpen ? 'rotate(45deg) translateY(6px)' : 'none' }} />
            <div style={{ width: 22, height: 1, background: '#00D4FF', opacity: menuOpen ? 0 : 1, transition: 'opacity 0.2s' }} />
            <div style={{ width: 22, height: 1, background: '#00D4FF', marginTop: 5, transition: 'transform 0.2s', transform: menuOpen ? 'rotate(-45deg) translateY(-6px)' : 'none' }} />
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div style={{ padding: '12px 24px 20px', borderTop: '1px solid rgba(0,212,255,0.08)', background: 'rgba(5,10,15,0.98)', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {['Home', 'Shop', 'Services', 'About', 'Contact'].map((item) => (
              <Link key={item} href={item === 'Home' ? '/' : `/user/${item.toLowerCase()}`} onClick={() => setMenuOpen(false)} className="nav-link" style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'block' }}>{item}</Link>
            ))}
          </div>
        )}
      </nav>

      <style jsx>{`
        @media (max-width: 768px) {
          .hamburger-btn { display: block !important; }
          .desktop-nav-ul { display: none !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section style={{ paddingTop: 60, borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px 48px' }}>
          <div className="anim-1" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 24, height: 1, background: '#00D4FF' }} />
            <span className="mono" style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#00D4FF' }}>Parts Catalogue</span>
          </div>
          <h1 className="anim-2" style={{ fontSize: 'clamp(32px, 6vw, 64px)', fontWeight: 800, lineHeight: 1.0, letterSpacing: '-0.02em', margin: 0, marginBottom: 16 }}>
            Premium Parts<br />
            <span style={{ color: '#00D4FF' }}>For Your Appliances</span>
          </h1>
          <p className="anim-3 mono" style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em', margin: 0 }}>
            Browse genuine components · Fast delivery · Expert support
          </p>
        </div>
      </section>

      {/* ── SEARCH + CONTROLS ── */}
      <section style={{ padding: '24px 24px 0', maxWidth: 1200, margin: '0 auto' }}>
        <div className="search-sort-row">
          {/* Search */}
          <div style={{ flex: 1, position: 'relative' }}>
            <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'rgba(255,255,255,0.3)' }} />
            <input
              type="text"
              placeholder="Search parts, brands, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(0,212,255,0.12)',
                borderRadius: 2,
                color: '#fff',
                padding: '12px 40px 12px 42px',
                fontSize: 13,
                outline: 'none',
                fontFamily: 'Syne, sans-serif',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.target.style.borderColor = 'rgba(0,212,255,0.4)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(0,212,255,0.12)')}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center' }}>
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filter btn */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-ghost ${(showFilters || hasActiveFilters) ? 'active' : ''}`}
            style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}
          >
            <Filter size={14} />
            Filters
            {activeFilterCount > 0 && (
              <span style={{ background: '#00D4FF', color: '#050A0F', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Sort */}
          <div style={{ position: 'relative' }}>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(0,212,255,0.12)',
                borderRadius: 2,
                color: 'rgba(255,255,255,0.7)',
                padding: '12px 36px 12px 14px',
                fontSize: 12,
                fontFamily: 'Space Mono, monospace',
                letterSpacing: '0.06em',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price ↑</option>
              <option value="price-high">Price ↓</option>
              <option value="name">A → Z</option>
            </select>
            <ChevronRight size={12} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%) rotate(90deg)', color: 'rgba(0,212,255,0.5)', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0 0', flexWrap: 'wrap', gap: 8 }}>
          <span className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>
            {loading ? 'LOADING...' : pagination ? `${products.length} / ${pagination.totalProducts} PRODUCTS` : 'NO PRODUCTS'}
          </span>
          {hasActiveFilters && (
            <button onClick={clearFilters} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#00D4FF', fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              <X size={12} /> Clear filters
            </button>
          )}
        </div>
      </section>

      {/* ── FILTER PANEL ── */}
      {showFilters && (
        <section style={{ padding: '16px 24px 0', maxWidth: 1200, margin: '0 auto' }} className="filter-panel">
          <div style={{ border: '1px solid rgba(0,212,255,0.12)', borderRadius: 2, background: 'rgba(0,212,255,0.02)', padding: '24px' }}>
            <div className="filter-grid">
              {/* Categories */}
              <div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#00D4FF', marginBottom: 16 }}>Categories {selectedCategories.length > 0 && `(${selectedCategories.length})`}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
                  {availableCategories.length > 0 ? availableCategories.map((c) => (
                    <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '6px 8px', borderRadius: 2, transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,212,255,0.04)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <input type="checkbox" checked={selectedCategories.includes(c.id)} onChange={() => toggleCategory(c.id)} />
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>{c.name}</span>
                    </label>
                  )) : <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>No categories</span>}
                </div>
              </div>

              {/* Brands */}
              <div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#00D4FF', marginBottom: 16 }}>Brands {selectedBrands.length > 0 && `(${selectedBrands.length})`}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
                  {availableBrands.length > 0 ? availableBrands.map((b) => (
                    <label key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '6px 8px', borderRadius: 2, transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,212,255,0.04)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <input type="checkbox" checked={selectedBrands.includes(b.id)} onChange={() => toggleBrand(b.id)} />
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>{b.name}</span>
                    </label>
                  )) : <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>No brands</span>}
                </div>
              </div>

              {/* Availability + Price */}
              <div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#00D4FF', marginBottom: 16 }}>Availability</div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '6px 8px', borderRadius: 2 }}>
                  <input type="checkbox" checked={inStockOnly} onChange={() => { setInStockOnly(!inStockOnly); setCurrentPage(1); }} />
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>In Stock Only</span>
                </label>

                <div style={{ marginTop: 28 }}>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#00D4FF', marginBottom: 16 }}>Price Range</div>
                  <input
                    type="range"
                    min={availablePriceRange.min}
                    max={availablePriceRange.max}
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                    onMouseUp={() => setCurrentPage(1)}
                    onTouchEnd={() => setCurrentPage(1)}
                  />
                  <div className="mono" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 8, letterSpacing: '0.05em' }}>
                    <span>₹{priceRange.min.toLocaleString()}</span>
                    <span style={{ color: '#00D4FF' }}>₹{priceRange.max.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── PRODUCTS ── */}
      <section style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 40, height: 40, border: '2px solid rgba(0,212,255,0.2)', borderTop: '2px solid #00D4FF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <span className="mono" style={{ fontSize: 10, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)' }}>LOADING PRODUCTS...</span>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{ textAlign: 'center', padding: '60px 24px', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 2, background: 'rgba(239,68,68,0.04)' }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>⚠</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Failed to Load Products</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>{error}</div>
            <button className="btn-cyan" style={{ padding: '12px 28px' }} onClick={fetchAllProducts}>Try Again</button>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && products.length > 0 && (
          <>
            <div className="products-grid">
              {products.map((product) => {
                const status = stockStatus(product.stock);
                return (
                  <div key={product._id} className="product-card" style={{ background: '#050A0F' }}>
                    {/* Image */}
                    <Link href={`/user/shop/productDetail/${product._id}`} style={{ textDecoration: 'none', display: 'block' }}>
                      <div style={{ position: 'relative', aspectRatio: '4/3', background: 'rgba(0,212,255,0.03)', overflow: 'hidden' }}>
                        <Image
                          src={product.images[0] || '/placeholder.jpg'}
                          alt={product.name}
                          fill
                          className="card-img"
                          style={{ objectFit: 'cover' }}
                          unoptimized
                        />
                        {/* Overlay */}
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(5,10,15,0.7) 0%, transparent 50%)', pointerEvents: 'none' }} />
                        {/* Stock badge */}
                        <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(5,10,15,0.9)', border: `1px solid ${status.color}40`, borderRadius: 2, padding: '4px 8px' }}>
                          <span className="mono" style={{ fontSize: 9, letterSpacing: '0.1em', color: status.color }}>{status.label.toUpperCase()}</span>
                        </div>
                        {/* Brand chip */}
                        <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(5,10,15,0.9)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 2, padding: '4px 8px' }}>
                          <span className="mono" style={{ fontSize: 9, letterSpacing: '0.1em', color: 'rgba(0,212,255,0.8)' }}>{product.brand?.name?.toUpperCase() || 'NO BRAND'}</span>
                        </div>
                      </div>
                    </Link>

                    {/* Info */}
                    <div style={{ padding: '16px' }}>
                      <Link href={`/user/shop/productDetail/${product._id}`} style={{ textDecoration: 'none' }}>
                        <div className="mono" style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>
                          {product.category?.name || 'Uncategorized'}
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', lineHeight: 1.3, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {product.name}
                        </div>
                      </Link>

                      {product.description && (
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {product.description}
                        </div>
                      )}

                      {/* Price + CTA */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 'auto' }}>
                        <div>
                          {product.technicianPrice && product.technicianPrice < product.sellingPrice && (
                            <div className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', textDecoration: 'line-through' }}>
                              ₹{product.technicianPrice.toLocaleString()}
                            </div>
                          )}
                          <div className="mono" style={{ fontSize: 16, fontWeight: 700, color: '#00D4FF', letterSpacing: '-0.02em' }}>
                            ₹{product.sellingPrice.toLocaleString()}
                          </div>
                        </div>
                        <Link href={`/user/shop/productDetail/${product._id}`}>
                          <button className="btn-cyan" style={{ padding: '8px 16px', fontSize: 9 }}>
                            Details →
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 48, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrevPage}
                  style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,212,255,0.12)', borderRadius: 2, color: pagination.hasPrevPage ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.15)', cursor: pagination.hasPrevPage ? 'pointer' : 'not-allowed' }}
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(page => page === 1 || page === pagination.totalPages || Math.abs(page - currentPage) <= 1)
                  .map((page, idx, arr) => (
                    <React.Fragment key={page}>
                      {idx > 0 && arr[idx - 1] !== page - 1 && (
                        <span className="mono" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>···</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className="mono"
                        style={{
                          width: 36, height: 36,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: currentPage === page ? '#00D4FF' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${currentPage === page ? '#00D4FF' : 'rgba(0,212,255,0.12)'}`,
                          borderRadius: 2,
                          color: currentPage === page ? '#050A0F' : 'rgba(255,255,255,0.5)',
                          fontWeight: 700, fontSize: 11,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >{page}</button>
                    </React.Fragment>
                  ))}

                <button
                  onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={!pagination.hasNextPage}
                  style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,212,255,0.12)', borderRadius: 2, color: pagination.hasNextPage ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.15)', cursor: pagination.hasNextPage ? 'pointer' : 'not-allowed' }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty */}
        {!loading && !error && products.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 24px', border: '1px solid rgba(0,212,255,0.08)', borderRadius: 2, background: 'rgba(0,212,255,0.02)' }}>
            <div style={{ fontSize: 36, marginBottom: 16, opacity: 0.5 }}>◇</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>No products found</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 24 }}>Try adjusting your search or filters</div>
            {hasActiveFilters && <button className="btn-cyan" style={{ padding: '12px 28px' }} onClick={clearFilters}>Clear All Filters</button>}
          </div>
        )}
      </section>

      <div className="divider" style={{ maxWidth: 1200, margin: '0 auto' }} />

      {/* ── CONTACT ── */}
      <section className="section-pad" style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{ width: 24, height: 1, background: '#00D4FF' }} />
          <span className="mono" style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#00D4FF' }}>Visit Our Store</span>
        </div>
        <div className="contact-grid">
          {[
            { icon: <MapPin size={16} color="#00D4FF" />, label: 'Location', value: '123 Appliance Street, Tech City' },
            { icon: <Phone size={16} color="#00D4FF" />, label: 'Phone', value: '+91 1234567890' },
            { icon: <Clock size={16} color="#00D4FF" />, label: 'Hours', value: 'Mon–Sat: 9AM – 6PM' },
          ].map((item, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,212,255,0.08)', borderRadius: 2, padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ marginTop: 2, flexShrink: 0 }}>{item.icon}</div>
              <div>
                <div className="mono" style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(0,212,255,0.6)', marginBottom: 6 }}>{item.label}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />

      {/* ── FOOTER ── */}
      <footer style={{ padding: '32px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }} className="footer-inner">
          <span className="mono" style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.12em', color: '#00D4FF' }}>
            FAST<span style={{ color: 'rgba(255,255,255,0.7)' }}>CHILL</span>
          </span>
          <span className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.1em' }}>© 2025 FASTCHILL · ALL RIGHTS RESERVED</span>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Privacy', 'Terms', 'Contact'].map((l) => (
              <a key={l} href="#" className="nav-link" style={{ textDecoration: 'none' }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}