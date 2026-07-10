import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import client from '../api/client';

import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import AlertBanner from '../components/AlertBanner';
import AddItemModal from '../components/AddItemModal';
import CustomPopup from '../components/CustomPopup';

const STORES_CONFIG = {
  amazon: { name: 'Amazon', bg: 'from-amber-500 to-yellow-600', text: 'text-white border-amber-600' },
  flipkart: { name: 'Flipkart', bg: 'from-blue-600 to-indigo-700', text: 'text-white border-blue-700' },
  myntra: { name: 'Myntra', bg: 'from-pink-500 to-rose-600', text: 'text-white border-pink-600' },
  ajio: { name: 'Ajio', bg: 'from-teal-700 to-slate-800', text: 'text-white border-teal-800' },
  croma: { name: 'Croma', bg: 'from-cyan-600 to-teal-700', text: 'text-white border-cyan-600' },
  reliancedigital: { name: 'Reliance Digital', bg: 'from-red-500 to-orange-600', text: 'text-white border-red-600' },
  vijaysales: { name: 'Vijay Sales', bg: 'from-red-700 to-rose-800', text: 'text-white border-rose-700' }
};

const SUGGESTIONS = [
  'iPhone 15 Pro Max 256GB Natural Titanium',
  'Logitech MX Master 3S Mouse',
  'Sony WH-1000XM5 Headphones',
  'MacBook Air M3 8GB 256GB Space Grey'
];

const SEARCH_MESSAGES = [
  'Initializing Playwright headless browser...',
  'Bypassing bot-detection systems securely...',
  'Batch 1: Scanning Amazon and Flipkart listings...',
  'Batch 1: Crawling Myntra and Ajio catalogs...',
  'Extracting product page URLs from search results...',
  'Batch 2: Inspecting Croma electronics stock...',
  'Batch 2: Parsing Reliance Digital offers...',
  'Batch 2: Fetching Vijay Sales product configurations...',
  'Parsing prices, currencies, and rating attributes...',
  'Compiling final cross-platform price report...'
];

const SearchProduct = () => {
  const { openAddModal, cart, addToCart, savedProducts, saveProduct } = useStore();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  
  // Rotating status message
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    let interval;
    if (isSearching) {
      interval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % SEARCH_MESSAGES.length);
      }, 2500);
    } else {
      setMessageIndex(0);
    }
    return () => clearInterval(interval);
  }, [isSearching]);

  const handleSearch = async (e, searchQuery = query) => {
    if (e) e.preventDefault();
    
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    setQuery(trimmed);
    setIsSearching(true);
    setError(null);
    setResults(null);

    try {
      const response = await client.get(`/api/search`, {
        params: { q: trimmed }
      });
      setResults(response.data);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.response?.data?.error || 'A network error occurred. Please try searching again.');
    } finally {
      setIsSearching(false);
    }
  };

  const selectSuggestion = (sug) => {
    handleSearch(null, sug);
  };

  const renderStars = (ratingStr) => {
    const num = parseFloat(ratingStr);
    if (isNaN(num)) return null;

    const fullStars = Math.floor(num);
    const halfStar = num % 1 >= 0.4 && num % 1 <= 0.8;
    const ratingRounded = Math.round(num * 10) / 10;

    return (
      <div className="flex items-center space-x-1 mt-1.5 select-none" title={`Rating: ${ratingStr} out of 5`}>
        <div className="flex text-ag-amber text-xs">
          {[...Array(5)].map((_, i) => {
            if (i < fullStars) return <span key={i}>★</span>;
            if (i === fullStars && halfStar) return <span key={i} className="opacity-75">★</span>;
            return <span key={i} className="text-ag-border text-opacity-50">★</span>;
          })}
        </div>
        <span className="text-[10px] font-bold text-ag-muted bg-ag-black/50 px-1.5 py-0.5 rounded border border-ag-border ml-1">
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
        <div className="mb-8">
          <h2 className="text-2xl font-black text-ag-white leading-tight flex items-center space-x-2">
            <span className="text-ag-purple">🔍</span>
            <span>Product Link & Price Finder</span>
          </h2>
          <p className="text-sm font-semibold text-ag-muted mt-1.5 max-w-2xl leading-relaxed">
            Search for any product name and its descriptors. We will crawl major Indian online platforms in real-time, matching images, prices, and links.
          </p>
        </div>

        {/* Search Bar / Input Row */}
        <div className="glass-card p-6 mb-8 shadow-xl">
          <form onSubmit={(e) => handleSearch(e)} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ag-muted font-bold text-base select-none">
                🔎
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a product (e.g. iPhone 15 Pro Max 256GB Natural Titanium)..."
                disabled={isSearching}
                className="w-full bg-ag-black border border-ag-border rounded-xl pl-11 pr-4 py-3.5 text-sm text-ag-white focus:outline-none focus:border-ag-purple focus:ring-1 focus:ring-ag-purple transition-all placeholder:text-ag-muted"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="btn-primary py-3.5 px-8 font-extrabold text-sm flex-shrink-0 shadow-lg shadow-ag-purple/20 min-w-[140px] justify-center"
            >
              {isSearching ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Scanning...</span>
                </div>
              ) : (
                'Find Best Price'
              )}
            </button>
          </form>

          {/* Suggestions */}
          {!isSearching && !results && (
            <div className="mt-5">
              <span className="text-[10px] font-bold text-ag-muted uppercase tracking-wider block mb-2.5">
                Popular Searches
              </span>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((sug) => (
                  <button
                    key={sug}
                    onClick={() => selectSuggestion(sug)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-ag-black hover:bg-ag-purple/10 border border-ag-border hover:border-ag-purple/50 text-ag-muted hover:text-ag-white transition-all cursor-pointer"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 bg-ag-red/10 border border-ag-red/30 rounded-2xl mb-8 flex items-center space-x-3 text-ag-red">
            <span className="text-xl">⚠️</span>
            <p className="text-xs font-bold">{error}</p>
          </div>
        )}

        {/* LOADING / SCANNER STATE */}
        {isSearching && (
          <div className="glass-card p-8 text-center max-w-2xl mx-auto shadow-2xl space-y-6 fade-in-up mt-8 border border-ag-purple/20">
            {/* Spinning pulse effect */}
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-ag-purple/10 border-t-ag-purple animate-spin" />
              <div className="absolute w-12 h-12 rounded-full bg-ag-purple/5 border border-ag-purple animate-ping opacity-75" />
              <span className="text-3xl relative">🤖</span>
            </div>

            <div className="space-y-2">
              <h3 className="font-extrabold text-lg text-ag-white">Real-Time Store Crawl In Progress</h3>
              <p className="text-xs font-bold text-ag-purple animate-pulse">
                {SEARCH_MESSAGES[messageIndex]}
              </p>
              <p className="text-[11px] text-ag-muted leading-relaxed max-w-md mx-auto">
                Please wait. We are launching secure browser worker instances to search Amazon, Flipkart, Myntra, Ajio, Croma, Reliance Digital, and Vijay Sales individually.
              </p>
            </div>

            {/* Live Progress Checklist */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-ag-border/50 text-left">
              {Object.keys(STORES_CONFIG).map((key, i) => (
                <div key={key} className="flex items-center space-x-2 p-2 bg-ag-black/50 rounded-xl border border-ag-border">
                  <span className="text-xs animate-bounce" style={{ animationDelay: `${i * 150}ms` }}>⏳</span>
                  <span className="text-[11px] font-bold text-ag-muted">{STORES_CONFIG[key].name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RESULTS GRID */}
        {results && (
          <div className="space-y-6 fade-in-up">
            <div className="flex items-center justify-between border-b border-ag-border/50 pb-4">
              <h3 className="font-extrabold text-base text-ag-white">
                Matched Listings for "{query}"
              </h3>
              <span className="text-[10px] font-black text-ag-green bg-ag-green/10 border border-ag-green/30 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Crawl Successful
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {results.map((res) => {
                const isSuccess = res.status === 'success';
                const store = STORES_CONFIG[res.site] || { name: res.siteName, bg: 'from-gray-700 to-gray-800', text: 'text-white' };
                const isInCart = cart.some(item => item.productUrl === res.productUrl);
                const isSaved = savedProducts.some(p => p.productUrl === res.productUrl);

                if (!isSuccess) {
                  return (
                    <div 
                      key={res.site}
                      className="glass-card overflow-hidden opacity-50 relative flex flex-col h-full border border-dashed border-ag-border"
                    >
                      {/* Store Header Badge */}
                      <div className={`px-4 py-2 font-black text-[10px] uppercase bg-gradient-to-r ${store.bg} ${store.text} select-none`}>
                        {store.name}
                      </div>

                      <div className="p-6 flex-grow flex flex-col justify-center items-center text-center space-y-3">
                        <span className="text-3xl text-ag-muted opacity-40">🔎</span>
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-ag-white">No Matching Item</h4>
                          <p className="text-[10px] text-ag-muted leading-relaxed">
                            No listings found, item is out of stock, or site temporarily blocked connection.
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div 
                    key={res.site}
                    className="glass-card overflow-hidden flex flex-col h-full shadow-lg group hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* Store Header Badge */}
                    <div className={`px-4 py-2 font-black text-[10px] uppercase bg-gradient-to-r ${store.bg} ${store.text} flex items-center justify-between`}>
                      <span>{store.name}</span>
                      <span className="bg-white/20 px-1.5 py-0.5 rounded text-[8px]">ACTIVE</span>
                    </div>

                    {/* Image Container */}
                    <div className="h-40 bg-ag-black/50 border-b border-ag-border flex items-center justify-center p-4 overflow-hidden relative">
                      {res.imageUrl ? (
                        <img 
                          src={res.imageUrl} 
                          alt={res.title} 
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
                          className="text-xs font-bold text-ag-white leading-snug line-clamp-2"
                          title={res.title}
                        >
                          {res.title}
                        </h4>
                        
                        {/* Rating block */}
                        {res.rating ? (
                          renderStars(res.rating)
                        ) : (
                          <span className="text-[9px] font-semibold text-ag-muted block mt-1.5 select-none">
                            No ratings available
                          </span>
                        )}
                      </div>

                      {/* Price Section */}
                      <div className="pt-2">
                        <span className="text-[9px] font-bold text-ag-muted uppercase tracking-wider block">
                          Current Price
                        </span>
                        <span className="text-base font-black text-ag-green">
                          {res.price !== null 
                            ? `₹${res.price.toLocaleString('en-IN')}` 
                            : 'Out of Stock'
                          }
                        </span>
                      </div>

                      {/* Buttons */}
                      <div className="space-y-2 pt-2 border-t border-ag-border/50">
                        <div className="flex space-x-2">
                          <a 
                            href={res.productUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-1/2 py-2 px-3 border border-ag-border rounded-xl text-[10px] font-bold text-center text-ag-muted hover:text-ag-white hover:border-ag-purple transition-all flex items-center justify-center cursor-pointer select-none"
                          >
                            Visit Store ↗
                          </a>
                          
                          {res.price !== null && (
                            <button
                              onClick={() => openAddModal(res.productUrl)}
                              className="w-1/2 py-2 px-3 border border-ag-border hover:border-ag-purple text-ag-muted hover:text-ag-white text-[10px] font-black rounded-xl transition-all flex items-center justify-center"
                            >
                              🔔 Track Alert
                            </button>
                          )}
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => addToCart(res)}
                            disabled={isInCart}
                            className={`w-1/2 py-2 px-3 text-[10px] font-black rounded-xl transition-all flex items-center justify-center ${
                              isInCart 
                                ? 'bg-ag-purple/20 text-ag-purple border border-ag-purple/20 cursor-not-allowed' 
                                : 'bg-ag-purple hover:bg-ag-violet text-white shadow-md shadow-ag-purple/10'
                            }`}
                          >
                            {isInCart ? '✓ Added' : '🛒 Add Cart'}
                          </button>

                          <button
                            onClick={() => saveProduct(res)}
                            disabled={isSaved}
                            className={`w-1/2 py-2 px-3 text-[10px] font-black rounded-xl transition-all flex items-center justify-center ${
                              isSaved
                                ? 'bg-ag-green/20 text-ag-green border border-ag-green/20 cursor-not-allowed'
                                : 'bg-ag-surface border border-ag-border hover:border-ag-green text-ag-muted hover:text-ag-white'
                            }`}
                          >
                            {isSaved ? '✓ Saved' : '🏠 Save Home'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      <AddItemModal />
      <CustomPopup />
    </div>
  );
};

export default SearchProduct;
