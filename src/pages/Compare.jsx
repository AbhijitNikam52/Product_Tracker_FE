import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import client from '../api/client';
import { toast } from 'react-toastify';

import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import CustomPopup from '../components/CustomPopup';
import CompareProductModal from '../components/CompareProductModal';
import LoadingSpinner from '../components/LoadingSpinner';

const Compare = () => {
  const {
    comparisonProducts,
    setComparisonProducts,
    removeComparisonProduct,
    updateComparisonProduct,
    isCompareModalOpen,
    openCompareModal,
    dialog,
    showConfirm,
    showAlert
  } = useStore();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshingId, setRefreshingId] = useState(null);

  useEffect(() => {
    const fetchComparisons = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await client.get('/api/comparison');
        setComparisonProducts(response.data);
      } catch (err) {
        console.error('Error fetching comparison products:', err);
        setError('Failed to load comparison products.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchComparisons();
  }, [setComparisonProducts]);

  const handleRefreshProduct = async (id) => {
    if (refreshingId) return;
    setRefreshingId(id);
    try {
      const response = await client.post(`/api/comparison/${id}/refresh`);
      if (response.data) {
        updateComparisonProduct(id, response.data);
      }
    } catch (err) {
      console.error('Error refreshing comparison product:', err);
      showAlert('Refresh Failed', err.response?.data?.error || 'Failed to refresh product prices.');
    } finally {
      setRefreshingId(null);
    }
  };

  const handleDeleteProduct = (product) => {
    showConfirm(
      'Delete Comparison Tracker?',
      `Are you sure you want to stop tracking and comparing prices for "${product.productName}"?`,
      async () => {
        try {
          await client.delete(`/api/comparison/${product._id}`);
          removeComparisonProduct(product._id);
          toast.success('Successfully stopped tracking and comparing prices!');
        } catch (err) {
          console.error('Error deleting comparison product:', err);
          toast.error(err.response?.data?.error || 'Failed to delete comparison product.');
        }
      }
    );
  };

  // Helper to determine the lowest priced link among available options
  const getLowestPriceLink = (links) => {
    const available = links.filter(l => l.isAvailable && l.currentPrice !== null);
    if (available.length === 0) return null;
    return available.reduce((min, link) => (link.currentPrice < min.currentPrice ? link : min), available[0]);
  };

  return (
    <div className="min-h-screen bg-ag-black flex flex-col pb-16">
      <Navbar />
      <Sidebar />

      <div className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 md:px-8">
        
        {/* Comparison Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-ag-white leading-tight">
              Price Comparison Engine
            </h2>
            <p className="text-xs text-ag-muted font-semibold mt-1">
              Compare a product across multiple URLs and auto-highlight the best deal
            </p>
          </div>

          <button
            onClick={openCompareModal}
            className="btn-primary space-x-2 shadow-lg shadow-ag-purple/15 text-sm py-3 px-5 self-start sm:self-auto"
          >
            <span>+</span>
            <span>Compare New Product</span>
          </button>
        </div>

        {/* Loading / Grid Layout */}
        {isLoading ? (
          <div className="py-24 flex items-center justify-center">
            <LoadingSpinner label="Loading comparison boards..." />
          </div>
        ) : error ? (
          <div className="py-16 text-center">
            <p className="text-ag-red text-sm font-semibold mb-4">{error}</p>
          </div>
        ) : comparisonProducts.length === 0 ? (
          <div className="py-16 text-center glass-card max-w-lg mx-auto bg-ag-surface/20 p-8 border border-ag-border flex flex-col items-center">
            <span className="text-4xl mb-4">⚖️</span>
            <h3 className="font-extrabold text-ag-white text-lg mb-2">No Comparisons Tracked</h3>
            <p className="text-xs text-ag-muted max-w-sm mx-auto mb-6 leading-relaxed">
              Create a multi-link comparison board to track a product across Amazon, Flipkart, and other retailers simultaneously.
            </p>
            <button onClick={openCompareModal} className="btn-primary text-xs py-3 px-6">
              Start Comparing Prices
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {comparisonProducts.map((product) => {
              const lowestLink = getLowestPriceLink(product.links);
              const symbol = '₹';

              return (
                <div key={product._id} className="glass-card p-6 bg-ag-surface/50 border border-ag-border flex flex-col justify-between hover:shadow-lg transition-all relative">
                  
                  {/* Card Header Info */}
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div>
                      <h4 className="text-ag-white font-extrabold text-base leading-snug">
                        {product.productName}
                      </h4>
                      <p className="text-[10px] text-ag-muted font-bold tracking-widest uppercase mt-0.5">
                        {product.links.length} Retailer Link{product.links.length !== 1 ? 's' : ''} compared
                      </p>
                    </div>

                    {/* Delete comparison button */}
                    <button
                      onClick={() => handleDeleteProduct(product)}
                      className="text-ag-muted hover:text-ag-red p-1 rounded transition-colors focus:outline-none"
                      title="Delete Comparison Tracker"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Comparisons URLs list */}
                  <div className="space-y-3 flex-grow mb-6">
                    {product.links.map((link) => {
                      const isLowest = lowestLink && lowestLink._id === link._id;
                      const formattedPrice = link.currentPrice !== null ? `${symbol}${link.currentPrice.toLocaleString()}` : 'N/A';
                      
                      return (
                        <div
                          key={link._id}
                          className={`p-3.5 rounded-2xl flex items-center justify-between border transition-all ${
                            isLowest
                              ? 'bg-ag-green/5 border-ag-green/30 shadow-sm shadow-ag-green/5'
                              : 'bg-ag-black/30 border-ag-border/50 opacity-60 select-none'
                          }`}
                        >
                          {/* Retailer badge and domain */}
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <span className={`badge capitalize text-[10px] py-0.5 px-2.5 ${
                              link.site === 'amazon'
                                ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                : link.site === 'flipkart'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                            }`}>
                              {link.site || 'web'}
                            </span>
                            
                            <span className="text-xs font-semibold text-ag-white truncate max-w-[150px] md:max-w-[200px]" title={link.url}>
                              {new URL(link.url).hostname.replace('www.', '')}
                            </span>
                          </div>

                          {/* Price and Action redirection */}
                          <div className="flex items-center space-x-3 flex-shrink-0">
                            <span className={`text-sm font-extrabold ${isLowest ? 'text-ag-green' : 'text-ag-muted'}`}>
                              {formattedPrice}
                            </span>

                            {isLowest ? (
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 bg-ag-green/10 text-ag-green hover:bg-ag-green text-[10px] font-extrabold border border-ag-green/30 hover:text-white rounded-lg transition-all flex items-center space-x-1"
                                title="Open Best Deal on Retailer site"
                              >
                                <span>Cheapest ✓</span>
                                <span>↗</span>
                              </a>
                            ) : (
                              <button
                                disabled
                                className="px-3 py-1 bg-ag-border text-ag-muted text-[10px] font-extrabold rounded-lg border border-transparent cursor-not-allowed select-none"
                                title="Higher price link disabled"
                              >
                                Locked 🔒
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Card Actions Footer */}
                  <div className="border-t border-ag-border/50 pt-4 flex items-center justify-between mt-auto">
                    <span className="text-[9.5px] font-semibold text-ag-muted">
                      Updated {product.links[0]?.lastCheckedAt ? `${new Date(product.links[0].lastCheckedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Pending'}
                    </span>

                    <button
                      onClick={() => handleRefreshProduct(product._id)}
                      disabled={refreshingId === product._id}
                      className="text-xs font-bold text-ag-purple hover:text-ag-violet flex items-center space-x-1 transition-colors focus:outline-none disabled:opacity-50"
                    >
                      {refreshingId === product._id ? (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5 text-ag-purple" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          <span>Refreshing...</span>
                        </>
                      ) : (
                        <>
                          <span>Compare Prices Now</span>
                          <span>⚡</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {isCompareModalOpen && <CompareProductModal />}
      {dialog && <CustomPopup />}
    </div>
  );
};

export default Compare;
