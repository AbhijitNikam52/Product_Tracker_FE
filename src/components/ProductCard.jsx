import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import useStore from '../store/useStore';
import client from '../api/client';
import { toast } from 'react-toastify';

const ProductCard = ({ item }) => {
  const { openGraph, updateItem, removeItem, showConfirm, showAlert } = useStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState(null);

  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [tempTargetPrice, setTempTargetPrice] = useState(item.targetPrice.toString());
  const [isSavingTarget, setIsSavingTarget] = useState(false);

  const [showCoupons, setShowCoupons] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState(null);

  const symbol = item.currency === 'USD' ? '$' : '₹';

  // Calculate percentage price difference
  const getPriceDiff = () => {
    if (!item.initialPrice || !item.currentPrice) return null;
    const diff = item.currentPrice - item.initialPrice;
    if (diff === 0) return { val: '0.0%', isDrop: false, isEqual: true };
    
    const pct = (diff / item.initialPrice) * 100;
    return {
      val: `${Math.abs(pct).toFixed(1)}%`,
      isDrop: diff < 0,
      isEqual: false
    };
  };

  const diffInfo = getPriceDiff();

  // Color mappings for supported sites
  const getSiteBadgeStyles = (site) => {
    switch (site) {
      case 'amazon':
        return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
      case 'flipkart':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'myntra':
        return 'bg-pink-500/10 text-pink-400 border border-pink-500/20';
      case 'ajio':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'meesho':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
    }
  };

  // Trigger manual refresh with rate limiting handled on backend
  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setRefreshError(null);
    try {
      const response = await client.post(`/api/items/${item._id}/refresh`);
      if (response.data && response.data.item) {
        updateItem(item._id, response.data.item);
      }
    } catch (err) {
      console.error('Error refreshing item:', err);
      const errMsg = err.response?.data?.error || 'Failed to refresh. Try again later.';
      setRefreshError(errMsg);
      // Auto-clear error after 4 seconds
      setTimeout(() => setRefreshError(null), 4000);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle delete confirmation
  const handleDelete = () => {
    showConfirm(
      'Stop Tracking Product?',
      `Are you sure you want to stop tracking "${item.productName || 'this item'}"?\nThis will permanently delete the price tracking history.`,
      async () => {
        try {
          await client.delete(`/api/items/${item._id}`);
          removeItem(item._id);
          toast.success('Successfully stopped tracking product!');
        } catch (err) {
          console.error('Error deleting item:', err);
          toast.error(err.response?.data?.error || 'Failed to delete item.');
        }
      }
    );
  };

  const handleSaveTarget = async () => {
    const val = parseFloat(tempTargetPrice);
    if (isNaN(val) || val <= 0) {
      toast.error('Please enter a valid target price greater than 0.');
      return;
    }
    setIsSavingTarget(true);
    try {
      const response = await client.put(`/api/items/${item._id}`, { targetPrice: val });
      if (response.data) {
        updateItem(item._id, response.data);
        setIsEditingTarget(false);
        toast.success('Target price updated successfully!');
      }
    } catch (err) {
      console.error('Error updating target price:', err);
      toast.error(err.response?.data?.error || 'Failed to update target price.');
    } finally {
      setIsSavingTarget(false);
    }
  };

  const isTargetHit = item.currentPrice !== null && item.currentPrice <= item.targetPrice;

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden relative fade-in-up">
      
      {/* Top Banner Overlays */}
      <div className="absolute top-3 left-3 z-10">
        <span className={`badge capitalize tracking-wide shadow-sm py-1 px-3 ${getSiteBadgeStyles(item.site)}`}>
          {item.site || 'web'}
        </span>
      </div>

      <div className="absolute top-3 right-3 z-10">
        {item.alertSent || isTargetHit ? (
          <span className="badge bg-ag-green/20 text-ag-green border border-ag-green/30 py-1 px-3 shadow-sm">
            🎉 Target Hit!
          </span>
        ) : !item.isAvailable ? (
          <span className="badge bg-ag-red/20 text-ag-red border border-ag-red/30 py-1 px-3 shadow-sm">
            ❌ Unavailable
          </span>
        ) : (
          <span className="badge bg-ag-amber/20 text-ag-amber border border-ag-amber/30 py-1 px-3 shadow-sm">
            👁 Watching
          </span>
        )}
      </div>

      {/* Product Image Area */}
      <div className="h-48 w-full bg-ag-black border-b border-ag-border relative overflow-hidden flex items-center justify-center">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.productName}
            className="w-full h-full object-contain p-4 transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = ''; // Clear image to render fallback
            }}
          />
        ) : (
          // Fallback image gradient
          <div className="w-full h-full bg-gradient-to-br from-ag-purple/10 to-ag-violet/5 flex flex-col items-center justify-center">
            <span className="text-ag-purple text-4xl mb-1">🏷️</span>
            <span className="text-[10px] text-ag-muted font-semibold tracking-widest uppercase">
              No Image Loaded
            </span>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex flex-col flex-grow">
        
        {/* Title Link */}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-ag-white hover:text-ag-purple font-semibold text-sm line-clamp-2 h-10 mb-2 leading-relaxed transition-colors flex items-start gap-1 group"
          title={`Open original product page on ${item.site || 'retailer website'}`}
        >
          <span>{item.productName || 'Tracked Product'}</span>
          <span className="text-[10px] text-ag-muted group-hover:text-ag-purple transition-colors mt-0.5 flex-shrink-0">↗</span>
        </a>

        {/* Pricing Metrics */}
        <div className="flex items-baseline justify-between mt-auto pt-2">
          <div>
            <p className="text-xs text-ag-muted font-bold tracking-wider uppercase">
              Current Price
            </p>
            <p className={`text-2xl font-black tracking-tight ${
              isTargetHit ? 'text-ag-green' : 'text-ag-red'
            }`}>
              {item.currentPrice !== null ? `${symbol}${item.currentPrice.toLocaleString()}` : 'N/A'}
            </p>
          </div>

          {/* Target Price */}
          <div className="text-right flex flex-col items-end min-w-[100px]">
            <p className="text-xs text-ag-muted font-bold tracking-wider uppercase flex items-center gap-1">
              Target
              {!isEditingTarget && (
                <button
                  onClick={() => {
                    setTempTargetPrice(item.targetPrice.toString());
                    setIsEditingTarget(true);
                  }}
                  className="text-[10px] text-ag-purple hover:text-ag-violet p-0.5 rounded transition-colors focus:outline-none"
                  title="Edit Target Price"
                >
                  ✏️
                </button>
              )}
            </p>
            {isEditingTarget ? (
              <div className="flex items-center gap-1.5 mt-0.5">
                <input
                  type="number"
                  step="any"
                  value={tempTargetPrice}
                  onChange={(e) => setTempTargetPrice(e.target.value)}
                  className="w-16 bg-ag-black border border-ag-border text-xs rounded px-1.5 py-0.5 text-right font-semibold text-ag-white focus:outline-none focus:border-ag-purple focus:ring-1 focus:ring-ag-purple"
                  autoFocus
                  disabled={isSavingTarget}
                />
                <button
                  onClick={handleSaveTarget}
                  disabled={isSavingTarget}
                  className="text-xs text-ag-green font-black hover:scale-110 transition-transform focus:outline-none"
                  title="Save"
                >
                  ✓
                </button>
                <button
                  onClick={() => setIsEditingTarget(false)}
                  disabled={isSavingTarget}
                  className="text-xs text-ag-red font-black hover:scale-110 transition-transform focus:outline-none"
                  title="Cancel"
                >
                  ✗
                </button>
              </div>
            ) : (
              <p className="text-sm font-extrabold text-ag-white">
                {symbol}{item.targetPrice.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Percentage Diff & Timestamp Rows */}
        <div className="mt-3 flex items-center justify-between border-t border-ag-border/50 pt-2 text-[11px]">
          <div>
            {diffInfo && !diffInfo.isEqual ? (
              <span className={`inline-flex items-center font-bold px-2 py-0.5 rounded-lg ${
                diffInfo.isDrop 
                  ? 'bg-ag-green/10 text-ag-green' 
                  : 'bg-ag-red/10 text-ag-red'
              }`}>
                {diffInfo.isDrop ? '↓ ' : '↑ '} {diffInfo.val}
              </span>
            ) : (
              <span className="text-ag-muted bg-ag-border/30 px-2 py-0.5 rounded-lg font-bold">
                No Change
              </span>
            )}
          </div>

          <div className="text-ag-muted font-medium">
            {item.lastCheckedAt ? (
              <span>Checked {formatDistanceToNow(new Date(item.lastCheckedAt))} ago</span>
            ) : (
              <span>Pending Check</span>
            )}
          </div>
        </div>

        {/* Rate limit error message */}
        {refreshError && (
          <div className="mt-2 text-center text-[10px] text-ag-red font-semibold bg-ag-red/10 py-1 px-2 rounded-lg animate-pulse">
            {refreshError}
          </div>
        )}

        {/* Collapsible Coupons Section */}
        {item.coupons && item.coupons.length > 0 && (
          <div className="mt-4 border-t border-ag-border/50 pt-3">
            <button
              onClick={() => setShowCoupons(!showCoupons)}
              className="w-full flex items-center justify-between text-xs font-bold text-ag-muted hover:text-ag-white transition-colors focus:outline-none"
            >
              <span className="flex items-center gap-1.5">
                🏷️ {item.coupons.length} Offers Available
              </span>
              <span>{showCoupons ? '▲' : '▼'}</span>
            </button>

            {showCoupons && (
              <div className="mt-3 space-y-2 max-h-40 overflow-y-auto pr-1">
                {item.coupons.map((coupon) => (
                  <div 
                    key={coupon._id} 
                    className="p-2 rounded-lg bg-ag-black/40 border border-ag-border/60 hover:border-ag-purple/40 transition-colors flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                        coupon.couponType === 'bank_offer' 
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                          : 'bg-ag-purple/10 text-ag-purple border border-ag-purple/20'
                      }`}>
                        {coupon.couponType.replace('_', ' ')}
                      </span>
                      <span className="text-[8px] font-bold text-ag-green">
                        {coupon.isVerified ? '✓ Verified' : ''}
                      </span>
                    </div>

                    <p className="text-[10px] font-medium leading-normal text-ag-white">
                      {coupon.description}
                    </p>

                    {coupon.code && (
                      <div className="flex items-center justify-between gap-2 mt-1 bg-ag-black/60 rounded px-2 py-0.5 border border-ag-border/30">
                        <span className="text-[10px] font-extrabold uppercase text-ag-purple tracking-wider font-mono">
                          {coupon.code}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(coupon.code);
                            setCopiedCodeId(coupon._id);
                            toast.success(`Coupon code "${coupon.code}" copied!`);
                            setTimeout(() => setCopiedCodeId(null), 2000);
                          }}
                          className="text-[9px] font-black text-ag-green hover:underline cursor-pointer focus:outline-none"
                        >
                          {copiedCodeId === coupon._id ? 'Copied! 🎉' : 'Copy Code'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="border-t border-ag-border/70 bg-[#0F0F16] px-4 py-3 flex items-center justify-between">
        
        {/* Open Price History Link */}
        <button
          onClick={() => openGraph(item._id)}
          className="text-xs font-bold text-ag-purple hover:text-ag-violet flex items-center space-x-1 transition-colors focus:outline-none"
        >
          <span>Price History</span>
          <span className="text-[10px]">📈</span>
        </button>

        {/* Action icons */}
        <div className="flex items-center space-x-2">
          
          {/* Manual Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`p-2 rounded-lg border border-ag-border text-ag-muted hover:text-ag-white hover:border-ag-purple transition-all focus:outline-none bg-ag-black/30 ${
              isRefreshing ? 'cursor-not-allowed' : ''
            }`}
            title="Refresh Price Now"
          >
            {isRefreshing ? (
              <svg className="animate-spin h-3.5 w-3.5 text-ag-purple" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            )}
          </button>

          {/* Delete Tracked Item Button */}
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg border border-ag-border text-ag-muted hover:text-ag-red hover:border-ag-red/50 transition-all focus:outline-none bg-ag-black/30"
            title="Delete Item"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
