import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import client from '../api/client';
import LoadingSpinner from './LoadingSpinner';
import { toast } from 'react-toastify';

const AddItemModal = () => {
  const { isAddModalOpen, closeAddModal, addItem, initialAddUrl } = useStore();
  
  const [step, setStep] = useState(1);
  const [url, setUrl] = useState('');
  const [targetPrice, setTargetPrice] = useState('');

  useEffect(() => {
    if (isAddModalOpen) {
      setUrl(initialAddUrl || '');
    }
  }, [isAddModalOpen, initialAddUrl]);
  
  // Loading & Error States
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  
  // Scraped Preview Data
  const [previewData, setPreviewData] = useState(null);

  if (!isAddModalOpen) return null;

  const validateUrl = (testUrl) => {
    return /^https?:\/\/.+/.test(testUrl);
  };

  // Step 1: Submit URL to obtain preview details
  const handleFetchPreview = async (e) => {
    e.preventDefault();
    setError(null);

    if (!url) {
      setError('Please enter a product URL.');
      return;
    }
    
    if (!validateUrl(url)) {
      setError('Please provide a valid URL starting with http:// or https://');
      return;
    }

    setIsFetching(true);
    try {
      // POST with targetPrice: 0 triggers the scraper preview
      const response = await client.post('/api/items', { url, targetPrice: 0 });
      setPreviewData(response.data);
      setStep(2);
    } catch (err) {
      console.error('Error fetching preview:', err);
      setError(err.response?.data?.error || 'Could not fetch product price. Try another link.');
    } finally {
      setIsFetching(false);
    }
  };

  // Step 2: Confirm Target Price and register tracker
  const handleStartTracking = async (e) => {
    e.preventDefault();
    setError(null);

    const priceNum = parseFloat(targetPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please enter a valid target price greater than 0.');
      return;
    }

    setIsFetching(true);
    try {
      const response = await client.post('/api/items', {
        url,
        targetPrice: priceNum
      });
      
      // Add the created item to Zustand store
      addItem(response.data);
      toast.success(`Started tracking "${response.data.productName || 'product'}"!`);
      
      // Reset state and close modal
      handleReset();
      closeAddModal();
    } catch (err) {
      console.error('Error starting tracker:', err);
      const errMsg = err.response?.data?.error || 'Failed to start tracking. Please try again.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsFetching(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setUrl('');
    setTargetPrice('');
    setError(null);
    setPreviewData(null);
  };

  const symbol = previewData?.currency === 'USD' ? '$' : '₹';
  const isTargetHigherThanCurrent = previewData && previewData.price !== null && parseFloat(targetPrice) >= previewData.price;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
      <div className="w-full max-w-lg bg-ag-surface border border-ag-border rounded-3xl shadow-2xl overflow-hidden fade-in-up">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-ag-border flex justify-between items-center bg-[#0D0D14]">
          <h3 className="font-extrabold text-lg text-ag-white">
            {step === 1 ? 'Track a Product' : 'Configure Alert Price'}
          </h3>
          <button
            onClick={() => {
              handleReset();
              closeAddModal();
            }}
            className="w-8 h-8 rounded-full border border-ag-border hover:border-ag-purple flex items-center justify-center text-ag-muted hover:text-ag-white transition-colors focus:outline-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {isFetching && step === 1 ? (
            <div className="py-12">
              <LoadingSpinner label="Contacting site & fetching pricing details..." />
            </div>
          ) : (
            <form onSubmit={step === 1 ? handleFetchPreview : handleStartTracking}>
              
              {/* STEP 1: Paste URL */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="url" className="block text-xs font-bold text-ag-muted uppercase tracking-wider mb-2">
                      Product URL
                    </label>
                    <input
                      id="url"
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="Paste Amazon, Flipkart, Myntra, Ajio URL..."
                      className="w-full bg-ag-black border border-ag-border rounded-xl px-4 py-3 text-sm text-ag-white focus:outline-none focus:border-ag-purple focus:ring-1 focus:ring-ag-purple transition-all"
                    />
                  </div>
                  
                  {error && (
                    <p className="text-xs font-bold text-ag-red bg-ag-red/10 py-2 px-3 rounded-lg animate-pulse">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full btn-primary py-3.5 mt-2 justify-center shadow-lg shadow-ag-purple/20"
                  >
                    <span>Fetch Product Details</span>
                    <span className="ml-2">→</span>
                  </button>
                </div>
              )}

              {/* STEP 2: Configure Price Alert */}
              {step === 2 && previewData && (
                <div className="space-y-5">
                  {/* Product Preview Card */}
                  <div className="flex space-x-3 p-3 bg-ag-black/50 border border-ag-border rounded-2xl">
                    <div className="w-20 h-20 bg-ag-surface border border-ag-border rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                      {previewData.imageUrl ? (
                        <img
                          src={previewData.imageUrl}
                          alt="Scraped Preview"
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <span className="text-ag-purple text-2xl">⬇</span>
                      )}
                    </div>
                    
                    <div className="flex flex-col justify-center min-w-0 flex-grow">
                      <span className="text-[10px] uppercase font-bold text-ag-purple select-none tracking-wider mb-0.5">
                        {previewData.site}
                      </span>
                      <h4 className="text-xs font-bold text-ag-white truncate pr-2">
                        {previewData.productName}
                      </h4>
                      <p className="text-sm font-black text-ag-green mt-1">
                        Current Price: {previewData.price !== null && previewData.price !== undefined ? `${symbol}${previewData.price.toLocaleString()}` : 'N/A (Out of stock/Unavailable)'}
                      </p>
                    </div>
                  </div>

                  {/* Price Setting */}
                  <div>
                    <label htmlFor="targetPrice" className="block text-xs font-bold text-ag-muted uppercase tracking-wider mb-2">
                      Your Target Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ag-muted font-bold text-sm">
                        {symbol}
                      </span>
                      <input
                        id="targetPrice"
                        type="number"
                        step="any"
                        value={targetPrice}
                        onChange={(e) => setTargetPrice(e.target.value)}
                        placeholder="Enter buy target threshold..."
                        className="w-full bg-ag-black border border-ag-border rounded-xl pl-8 pr-4 py-3 text-sm text-ag-white focus:outline-none focus:border-ag-purple focus:ring-1 focus:ring-ag-purple transition-all"
                        required
                        autoFocus
                      />
                    </div>

                    {/* Dynamic Helper Info */}
                    {targetPrice && !isNaN(parseFloat(targetPrice)) && parseFloat(targetPrice) > 0 && (
                      <div className="mt-2 text-[11px] font-semibold text-ag-muted">
                        {isTargetHigherThanCurrent ? (
                          <span className="text-ag-amber bg-ag-amber/10 py-1.5 px-3 rounded-lg block animate-pulse">
                            ⚠️ Warning: Your target price is higher than or equal to the current price. You will receive an alert immediately!
                          </span>
                        ) : (
                          <span>
                            We'll send an email alert when the price drops to or below {symbol}
                            {parseFloat(targetPrice).toLocaleString()}.
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {error && (
                    <p className="text-xs font-bold text-ag-red bg-ag-red/10 py-2 px-3 rounded-lg animate-pulse">
                      {error}
                    </p>
                  )}

                  {/* Buttons footer */}
                  <div className="flex space-x-3 pt-2 border-t border-ag-border/50">
                    <button
                      type="button"
                      onClick={() => {
                        setStep(1);
                        setError(null);
                      }}
                      className="w-1/3 border border-ag-border rounded-xl text-xs font-bold text-ag-muted hover:text-ag-white hover:border-ag-purple transition-all"
                    >
                      ← Back
                    </button>
                    
                    <button
                      type="submit"
                      disabled={isFetching}
                      className="w-2/3 btn-primary py-3.5 shadow-lg shadow-ag-purple/20 justify-center text-xs font-bold"
                    >
                      {isFetching ? 'Saving Tracker...' : 'Start Tracking'}
                    </button>
                  </div>
                </div>
              )}

            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;
