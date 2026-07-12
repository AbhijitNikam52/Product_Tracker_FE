import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import client from '../api/client';

import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import AlertBanner from '../components/AlertBanner';
import AddItemModal from '../components/AddItemModal';
import CustomPopup from '../components/CustomPopup';
import LoadingSpinner from '../components/LoadingSpinner';

const STORES_CONFIG = {
  amazon: { name: 'Amazon', bg: 'from-amber-500 to-yellow-600', text: 'text-white border-amber-600' },
  flipkart: { name: 'Flipkart', bg: 'from-blue-600 to-indigo-700', text: 'text-white border-blue-700' },
  myntra: { name: 'Myntra', bg: 'from-pink-500 to-rose-600', text: 'text-white border-pink-600' },
  ajio: { name: 'Ajio', bg: 'from-teal-700 to-slate-800', text: 'text-white border-teal-800' },
  croma: { name: 'Croma', bg: 'from-cyan-600 to-teal-700', text: 'text-white border-cyan-600' },
  reliancedigital: { name: 'Reliance Digital', bg: 'from-red-500 to-orange-600', text: 'text-white border-red-600' },
  vijaysales: { name: 'Vijay Sales', bg: 'from-red-700 to-rose-800', text: 'text-white border-rose-700' }
};

const Home = () => {
  const { savedProducts, setSavedProducts, removeSavedProduct, cart, addToCart, openAddModal, showConfirm, user } = useStore();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStore, setSelectedStore] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Fetch initial saved products from DB
  useEffect(() => {
    const fetchSavedProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await client.get('/api/saved-products');
        setSavedProducts(res.data);
      } catch (err) {
        console.error('Error fetching saved products:', err);
        setError('Failed to fetch saved products from the server.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedProducts();
  }, [setSavedProducts]);

  // Remove saved product API handler
  const handleRemoveSavedProduct = async (id) => {
    try {
      await client.delete(`/api/saved-products/${id}`);
      removeSavedProduct(id);
    } catch (err) {
      console.error('Error removing saved product:', err);
      alert(err.response?.data?.error || 'Failed to remove saved product.');
    }
  };

  // Filter and Sort Logic
  const filteredProducts = savedProducts
    .filter((prod) => {
      const title = prod.title || '';
      const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStore = selectedStore === 'all' || prod.site === selectedStore;

      let matchesPrice = true;
      if (prod.price !== null) {
        if (priceRange === 'under_2k') matchesPrice = prod.price < 2000;
        else if (priceRange === '2k_10k') matchesPrice = prod.price >= 2000 && prod.price <= 10000;
        else if (priceRange === '10k_50k') matchesPrice = prod.price >= 10000 && prod.price <= 50000;
        else if (priceRange === 'above_50k') matchesPrice = prod.price > 50000;
      } else {
        if (priceRange !== 'all') matchesPrice = false;
      }

      return matchesSearch && matchesStore && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      if (sortBy === 'price_low') {
        return (a.price ?? Infinity) - (b.price ?? Infinity);
      }
      if (sortBy === 'price_high') {
        return (b.price ?? -Infinity) - (a.price ?? -Infinity);
      }
      if (sortBy === 'rating') {
        return parseFloat(b.rating || 0) - parseFloat(a.rating || 0);
      }
      return 0;
    });

  const uniqueStores = ['all', ...new Set(savedProducts.map((p) => p.site).filter(Boolean))];

  const renderStars = (ratingStr) => {
    const num = parseFloat(ratingStr);
    if (isNaN(num)) return null;

    const fullStars = Math.floor(num);
    const halfStar = num % 1 >= 0.4 && num % 1 <= 0.8;
    const ratingRounded = Math.round(num * 10) / 10;

    return (
      <div className="flex items-center space-x-1 mt-1 select-none">
        <div className="flex text-ag-amber text-xs">
          {[...Array(5)].map((_, i) => {
            if (i < fullStars) return <span key={i}>★</span>;
            if (i === fullStars && halfStar) return <span key={i} className="opacity-75">★</span>;
            return <span key={i} className="text-ag-border text-opacity-50">★</span>;
          })}
        </div>
        <span className="text-[9px] font-bold text-ag-muted bg-ag-black/50 px-1.5 py-0.5 rounded border border-ag-border ml-1">
          {ratingRounded}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-ag-black flex flex-col pb-16">
      <Navbar />
      <Sidebar />
      <AlertBanner />

      <div className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 md:px-8">
        
        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-ag-white leading-tight flex items-center space-x-2">
              <span className="text-ag-purple">🏠</span>
              <span>Saved Products Hub</span>
            </h2>
            <p className="text-sm font-semibold text-ag-muted mt-1.5 max-w-xl leading-relaxed">
              Shared catalog of curated retail items, platform deals, and active trackers monitored by our users.
            </p>
          </div>
          <div className="flex items-center bg-ag-surface border border-ag-border px-4 py-2.5 rounded-2xl select-none flex-shrink-0">
            <span className="text-xs font-bold text-ag-muted uppercase tracking-wider">Total Saved:</span>
            <span className="text-sm font-black text-ag-purple ml-2 bg-ag-purple/10 px-2.5 py-0.5 rounded-full">
              {savedProducts.length}
            </span>
          </div>
        </div>

        {/* Filter Controls Panel */}
        <div className="glass-card p-6 mb-8 shadow-xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Search Input */}
            <div>
              <label className="block text-[10px] font-bold text-ag-muted uppercase tracking-wider mb-2">
                Search Curated Items
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ag-muted text-xs select-none">🔎</span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter by keyword..."
                  className="w-full bg-ag-black border border-ag-border rounded-xl pl-9 pr-3 py-2.5 text-xs text-ag-white focus:outline-none focus:border-ag-purple transition-all"
                />
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-[10px] font-bold text-ag-muted uppercase tracking-wider mb-2">
                Price Bracket
              </label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full bg-ag-black border border-ag-border rounded-xl px-3 py-2.5 text-xs text-ag-white focus:outline-none focus:border-ag-purple transition-all"
              >
                <option value="all">All Price Ranges</option>
                <option value="under_2k">Under ₹2,000</option>
                <option value="2k_10k">₹2,000 - ₹10,000</option>
                <option value="10k_50k">₹10,000 - ₹50,000</option>
                <option value="above_50k">Above ₹50,000</option>
              </select>
            </div>

            {/* Sorting */}
            <div>
              <label className="block text-[10px] font-bold text-ag-muted uppercase tracking-wider mb-2">
                Sort Inventory
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-ag-black border border-ag-border rounded-xl px-3 py-2.5 text-xs text-ag-white focus:outline-none focus:border-ag-purple transition-all"
              >
                <option value="newest">Date Saved: Newest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Rating: Highest First</option>
              </select>
            </div>

          </div>

          {/* Store Pills Filter */}
          {savedProducts.length > 0 && (
            <div className="pt-4 border-t border-ag-border/50">
              <span className="block text-[10px] font-bold text-ag-muted uppercase tracking-wider mb-3">
                Store Catalog Filter
              </span>
              <div className="flex flex-wrap gap-2">
                {uniqueStores.map((storeKey) => {
                  const name = storeKey === 'all' ? 'All Platforms' : (STORES_CONFIG[storeKey]?.name || storeKey);
                  const isSelected = selectedStore === storeKey;
                  return (
                    <button
                      key={storeKey}
                      onClick={() => setSelectedStore(storeKey)}
                      className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-ag-purple border-ag-purple text-white shadow-md shadow-ag-purple/20'
                          : 'bg-ag-black border-ag-border text-ag-muted hover:text-ag-white hover:border-ag-purple/50'
                      }`}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* PRODUCTS INVENTORY LIST */}
        {isLoading ? (
          <div className="py-24 flex items-center justify-center">
            <LoadingSpinner size={40} label="Syncing shared product catalog..." />
          </div>
        ) : error ? (
          <div className="py-16 text-center max-w-md mx-auto glass-card p-6">
            <p className="text-ag-red text-sm font-bold mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 bg-ag-surface border border-ag-border rounded-xl text-xs font-bold text-ag-white hover:border-ag-purple transition-all"
            >
              Retry
            </button>
          </div>
        ) : savedProducts.length === 0 ? (
          <div className="glass-card p-12 text-center max-w-xl mx-auto shadow-xl space-y-4">
            <span className="text-5xl block">🏠</span>
            <div className="space-y-1">
              <h3 className="font-extrabold text-lg text-ag-white">No saved products yet</h3>
              <p className="text-xs text-ag-muted leading-relaxed">
                Start discovering best deals across e-commerce. Perform a search and save your favorite matched links to publish them here!
              </p>
            </div>
            <a 
              href="/search"
              className="btn-primary py-2.5 px-6 text-xs font-bold shadow-lg shadow-ag-purple/20 inline-flex"
            >
              Start Product Search →
            </a>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="glass-card p-12 text-center max-w-xl mx-auto shadow-xl space-y-2">
            <span className="text-3xl block">🔍</span>
            <h3 className="font-extrabold text-sm text-ag-white">No matches found for your filter criteria</h3>
            <p className="text-xs text-ag-muted">
              Try adjusting your search query, selecting "All Platforms" or choosing "All Price Ranges".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 fade-in-up">
            {filteredProducts.map((prod) => {
              const store = STORES_CONFIG[prod.site] || { name: prod.site, bg: 'from-gray-700 to-gray-800', text: 'text-white' };
              const isInCart = cart.some(item => item.productUrl === prod.productUrl);
              const canDelete = user && (user.role === 'admin' || prod.userId === user.userId);

              return (
                <div 
                  key={prod._id}
                  className="glass-card overflow-hidden flex flex-col h-full shadow-lg group hover:-translate-y-1 transition-all duration-300 relative"
                >
                  {/* Remove Pin Ribbon/Icon - only visible to owner or admins */}
                  {canDelete && (
                    <button
                      onClick={() => {
                        showConfirm(
                          'Remove Saved Product',
                          `Are you sure you want to remove "${prod.title}" from the shared catalog?`,
                          () => handleRemoveSavedProduct(prod._id)
                        );
                      }}
                      className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-ag-black/80 hover:bg-ag-red/20 border border-ag-border hover:border-ag-red flex items-center justify-center text-ag-muted hover:text-ag-red transition-all cursor-pointer shadow-md focus:outline-none"
                      title="Remove Pin"
                    >
                      ✕
                    </button>
                  )}

                  {/* Store Header Badge */}
                  <div className={`px-4 py-2 font-black text-[10px] uppercase bg-gradient-to-r ${store.bg} ${store.text} pr-10 select-none`}>
                    {store.name}
                  </div>

                  {/* Image Container */}
                  <div className="h-40 bg-ag-black/50 border-b border-ag-border flex items-center justify-center p-4 overflow-hidden relative">
                    {prod.imageUrl ? (
                      <img 
                        src={prod.imageUrl} 
                        alt={prod.title} 
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="text-center text-ag-muted text-xs">
                        <span className="text-3xl block mb-1">📦</span>
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <h4 
                        className="text-xs font-bold text-ag-white leading-snug line-clamp-2 pr-1"
                        title={prod.title}
                      >
                        {prod.title}
                      </h4>
                      
                      {/* Rating block */}
                      {prod.rating ? (
                        renderStars(prod.rating)
                      ) : (
                        <span className="text-[9px] font-semibold text-ag-muted block mt-1.5 select-none">
                          No ratings available
                        </span>
                      )}
                    </div>

                    {/* Price Section */}
                    <div>
                      <span className="text-[9px] font-bold text-ag-muted uppercase tracking-wider block">
                        Saved Price
                      </span>
                      <span className="text-base font-black text-ag-green">
                        {prod.price !== null 
                          ? `₹${prod.price.toLocaleString('en-IN')}` 
                          : 'Out of Stock'
                        }
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-2 pt-2 border-t border-ag-border/50">
                      <div className="flex space-x-2">
                        <a 
                          href={prod.productUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-1/2 py-2 px-3 border border-ag-border rounded-xl text-[10px] font-bold text-center text-ag-muted hover:text-ag-white hover:border-ag-purple transition-all flex items-center justify-center cursor-pointer select-none"
                        >
                          Visit Store ↗
                        </a>
                        
                        {prod.price !== null && (
                          <button
                            onClick={() => openAddModal(prod.productUrl)}
                            className="w-1/2 py-2 px-3 border border-ag-border hover:border-ag-purple text-ag-muted hover:text-ag-white text-[10px] font-black rounded-xl transition-all flex items-center justify-center cursor-pointer"
                          >
                            🔔 Track Alert
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => addToCart(prod)}
                        disabled={isInCart}
                        className={`w-full py-2 px-3 text-[10px] font-black rounded-xl transition-all flex items-center justify-center ${
                          isInCart 
                            ? 'bg-ag-purple/20 text-ag-purple border border-ag-purple/20 cursor-not-allowed' 
                            : 'bg-ag-purple hover:bg-ag-violet text-white shadow-md shadow-ag-purple/10'
                        }`}
                      >
                        {isInCart ? '✓ Added to Cart' : '🛒 Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      <AddItemModal />
      <CustomPopup />
    </div>
  );
};

export default Home;
