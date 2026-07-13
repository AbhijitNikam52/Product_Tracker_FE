import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import client from '../api/client';

import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import AlertBanner from '../components/AlertBanner';
import CustomPopup from '../components/CustomPopup';
import LoadingSpinner from '../components/LoadingSpinner';

const STORES_CONFIG = {
  amazon: { name: 'Amazon', bg: 'from-orange-500/10 to-amber-600/5 text-orange-400 border-orange-500/20' },
  flipkart: { name: 'Flipkart', bg: 'from-blue-500/10 to-indigo-600/5 text-blue-400 border-blue-500/20' },
  myntra: { name: 'Myntra', bg: 'from-pink-500/10 to-rose-600/5 text-pink-400 border-pink-500/20' },
  ajio: { name: 'Ajio', bg: 'from-emerald-500/10 to-slate-800/5 text-emerald-400 border-emerald-500/20' },
  croma: { name: 'Croma', bg: 'from-cyan-500/10 to-teal-800/5 text-cyan-400 border-cyan-500/20' },
  reliancedigital: { name: 'Reliance', bg: 'from-red-500/10 to-orange-800/5 text-red-400 border-red-500/20' },
  vijaysales: { name: 'Vijay Sales', bg: 'from-rose-500/10 to-red-800/5 text-rose-400 border-rose-500/20' },
  generic: { name: 'Web Store', bg: 'from-gray-500/10 to-gray-800/5 text-gray-400 border-gray-500/20' }
};

const Coupons = () => {
  const { dialog, showConfirm, showAlert } = useStore();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStore, setSelectedStore] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');

  const [copiedCodeId, setCopiedCodeId] = useState(null);

  const fetchCouponsList = async () => {
    try {
      setLoading(true);
      const res = await client.get('/api/coupons');
      setCoupons(res.data);
    } catch (err) {
      console.error('Error fetching active coupons:', err);
      setError('Failed to load coupons. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCouponsList();
  }, []);

  const handleToggleVerification = async (coupon) => {
    try {
      const updatedVerified = !coupon.isVerified;
      await client.post(`/api/coupons/${coupon._id}/verify`, { isVerified: updatedVerified });
      setCoupons(prev => prev.map(c => c._id === coupon._id ? { ...c, isVerified: updatedVerified } : c));
    } catch (err) {
      console.error('Error updating verification status:', err);
      showAlert('Update Failed', err.response?.data?.error || 'Failed to update verification status.');
    }
  };

  const getStoreStyle = (storeKey) => {
    return STORES_CONFIG[storeKey] || STORES_CONFIG.generic;
  };

  const filteredCoupons = coupons.filter(c => {
    const matchesSearch = !searchQuery.trim() || 
      (c.code || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStore = selectedStore === 'all' || c.store === selectedStore;
    const matchesType = selectedType === 'all' || c.couponType === selectedType;
    const matchesSource = selectedSource === 'all' || c.source === selectedSource;
    return matchesSearch && matchesStore && matchesType && matchesSource;
  });

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
              <span className="text-ag-purple">🎟️</span>
              <span>Available Coupons & Offers</span>
            </h2>
            <p className="text-sm font-semibold text-ag-muted mt-1.5 max-w-2xl leading-relaxed">
              Explore active promocodes, public e-commerce store bank discount campaigns, and verified deal descriptions curated for your tracking.
            </p>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="glass-card p-5 mb-8 shadow-xl flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ag-muted text-xs">🔎</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coupons by code or text..."
              className="w-full bg-ag-black border border-ag-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-ag-white focus:outline-none focus:border-ag-purple transition-all placeholder:text-ag-muted"
            />
          </div>

          {/* Selector filters */}
          <div className="flex flex-wrap gap-3 w-full md:w-auto items-center justify-end">
            
            {/* Store selection */}
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="bg-ag-black border border-ag-border text-xs rounded-xl px-3 py-2.5 text-ag-white focus:outline-none focus:border-ag-purple"
            >
              <option value="all">All Stores</option>
              <option value="amazon">Amazon</option>
              <option value="flipkart">Flipkart</option>
              <option value="myntra">Myntra</option>
              <option value="ajio">Ajio</option>
              <option value="croma">Croma</option>
              <option value="reliancedigital">Reliance Digital</option>
              <option value="vijaysales">Vijay Sales</option>
            </select>

            {/* Type selection */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-ag-black border border-ag-border text-xs rounded-xl px-3 py-2.5 text-ag-white focus:outline-none focus:border-ag-purple"
            >
              <option value="all">All Types</option>
              <option value="store">Store-wide</option>
              <option value="category">Category-level</option>
              <option value="brand">Brand-level</option>
              <option value="product">Product-level</option>
              <option value="bank_offer">Bank Offer</option>
            </select>

            {/* Source selection */}
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="bg-ag-black border border-ag-border text-xs rounded-xl px-3 py-2.5 text-ag-white focus:outline-none focus:border-ag-purple"
            >
              <option value="all">All Sources</option>
              <option value="scraped">Scraped</option>
              <option value="admin">Curated</option>
              <option value="affiliate">Affiliate Feed</option>
            </select>

          </div>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="py-24">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="p-4 bg-ag-red/10 border border-ag-red/30 rounded-2xl text-center text-ag-red font-bold text-xs">
            {error}
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="glass-card py-20 text-center text-ag-muted font-bold text-sm">
            No coupons match your filters.
          </div>
        ) : (
          /* COUPONS GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCoupons.map((coupon) => {
              const storeStyle = getStoreStyle(coupon.store);
              return (
                <div 
                  key={coupon._id}
                  className="glass-card overflow-hidden flex flex-col justify-between h-full border border-ag-border/80 p-5 group hover:border-ag-purple/50 transition-all duration-300 relative fade-in-up"
                >
                  
                  {/* Coupon Header */}
                  <div className="flex items-center justify-between mb-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${storeStyle.bg}`}>
                      {storeStyle.name}
                    </span>

                    <span className="text-[9px] font-extrabold text-ag-muted capitalize bg-ag-border/20 px-2 py-0.5 rounded-lg">
                      {coupon.couponType.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Coupon Body */}
                  <div className="flex-grow flex flex-col gap-2">
                    
                    {/* Description */}
                    <p className="text-xs font-semibold text-ag-white leading-relaxed">
                      {coupon.description}
                    </p>

                    {/* Expiry / Brand Category Subtext */}
                    <div className="text-[10px] text-ag-muted font-medium flex flex-wrap gap-x-3 gap-y-1 mt-1">
                      {coupon.brand && <span>Brand: <strong className="text-ag-purple">{coupon.brand}</strong></span>}
                      {coupon.category && <span>Category: <strong className="text-ag-purple">{coupon.category}</strong></span>}
                      {coupon.expiryDate ? (
                        <span>Expires: <strong>{new Date(coupon.expiryDate).toLocaleDateString()}</strong></span>
                      ) : (
                        <span>Expiry: <strong>No Expiry</strong></span>
                      )}
                    </div>
                  </div>

                  {/* Coupon Footer Actions */}
                  <div className="mt-5 pt-3.5 border-t border-ag-border/50 flex flex-col gap-3">
                    
                    {/* Promo Code Copy Bar (if code exists) */}
                    {coupon.code ? (
                      <div className="flex items-center justify-between bg-ag-black/50 border border-ag-border/60 rounded-xl px-3.5 py-2.5">
                        <span className="text-xs font-black uppercase text-ag-purple tracking-widest font-mono">
                          {coupon.code}
                        </span>
                        
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(coupon.code);
                            setCopiedCodeId(coupon._id);
                            setTimeout(() => setCopiedCodeId(null), 2000);
                          }}
                          className="text-[10px] font-black text-ag-green hover:underline cursor-pointer focus:outline-none"
                        >
                          {copiedCodeId === coupon._id ? 'Copied! 🎉' : 'Copy Code'}
                        </button>
                      </div>
                    ) : (
                      <div className="text-[10px] text-ag-muted font-bold italic py-2">
                        💡 Auto-applied at checkout - no promo code needed.
                      </div>
                    )}

                    {/* Meta Row: Source & Verification Switch */}
                    <div className="flex items-center justify-between text-[9px] pt-1">
                      
                      {/* Source badge */}
                      <span className="text-ag-muted font-bold uppercase tracking-wider">
                        Source: <span className="text-ag-white">{coupon.source}</span>
                      </span>

                      {/* Verification Switch Button */}
                      <button
                        onClick={() => handleToggleVerification(coupon)}
                        className={`font-black flex items-center gap-1.5 px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                          coupon.isVerified 
                            ? 'bg-ag-green/10 text-ag-green border-ag-green/20' 
                            : 'bg-ag-muted/10 text-ag-muted border-ag-border hover:border-ag-purple'
                        }`}
                        title="Click to toggle coupon verification status"
                      >
                        <span>{coupon.isVerified ? '✅ Verified' : '❓ Unverified'}</span>
                      </button>

                    </div>

                  </div>

                  {/* Product-level coupon redirection */}
                  {coupon.productUrl && (
                    <a
                      href={coupon.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-[10px] text-ag-purple hover:underline bg-ag-black/80 px-2 py-1 rounded border border-ag-border transition-all"
                      title="Open linked product url"
                    >
                      View Product ↗
                    </a>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>

      {dialog && <CustomPopup />}
    </div>
  );
};

export default Coupons;
