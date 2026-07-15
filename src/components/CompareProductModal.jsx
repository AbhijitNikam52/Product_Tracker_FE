import React, { useState } from 'react';
import useStore from '../store/useStore';
import client from '../api/client';
import LoadingSpinner from './LoadingSpinner';
import { toast } from 'react-toastify';

const CompareProductModal = () => {
  const { isCompareModalOpen, closeCompareModal, addComparisonProduct, showAlert } = useStore();
  const [productName, setProductName] = useState('');
  const [urls, setUrls] = useState(['', '']); // start with 2 fields
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCompareModalOpen) return null;

  const handleAddUrlField = () => {
    if (urls.length >= 5) {
      showAlert('Limit Reached', 'You can compare up to 5 links at a time.');
      return;
    }
    setUrls([...urls, '']);
  };

  const handleRemoveUrlField = (index) => {
    if (urls.length <= 1) {
      showAlert('Error', 'Please provide at least one product URL.');
      return;
    }
    const newUrls = [...urls];
    newUrls.splice(index, 1);
    setUrls(newUrls);
  };

  const handleUrlChange = (index, value) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!productName.trim()) {
      toast.error('Please enter a product name.');
      return;
    }

    const activeUrls = urls.filter(u => u.trim() !== '');
    if (activeUrls.length === 0) {
      toast.error('Please enter at least one valid product URL.');
      return;
    }

    // Basic URL validation
    const invalidUrl = activeUrls.find(u => !/^https?:\/\/.+/.test(u));
    if (invalidUrl) {
      toast.error('Please check your links. They must start with http:// or https://');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await client.post('/api/comparison', {
        productName: productName.trim(),
        urls: activeUrls
      });
      if (response.data) {
        addComparisonProduct(response.data);
        toast.success(`Started comparison tracking for "${productName.trim()}"!`);
        closeCompareModal();
      }
    } catch (err) {
      console.error('Error adding comparison:', err);
      toast.error(err.response?.data?.error || 'Failed to initialize comparison tracker.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
      <div className="w-full max-w-xl bg-ag-surface border border-ag-border rounded-3xl shadow-2xl overflow-hidden fade-in-up max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-ag-border flex justify-between items-center bg-[#0D0D14] flex-shrink-0">
          <h3 className="font-extrabold text-lg text-ag-white">
            Compare Multi-Platform Prices
          </h3>
          <button
            onClick={closeCompareModal}
            className="w-8 h-8 rounded-full border border-ag-border hover:border-ag-purple flex items-center justify-center text-ag-muted hover:text-ag-white transition-colors focus:outline-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Modal Body / Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-grow">
          {isSubmitting ? (
            <div className="py-16">
              <LoadingSpinner label="Scraping all retailer URLs in parallel... Please wait" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Product Label */}
              <div>
                <label htmlFor="prodName" className="block text-xs font-bold text-ag-muted uppercase tracking-wider mb-2">
                  Compare Product Name
                </label>
                <input
                  id="prodName"
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. SanDisk Cruzer Blade 64GB"
                  className="w-full bg-ag-black border border-ag-border rounded-xl px-4 py-3 text-sm text-ag-white focus:outline-none focus:border-ag-purple focus:ring-1 focus:ring-ag-purple transition-all"
                  required
                />
              </div>

              {/* URL Fields list */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-ag-muted uppercase tracking-wider">
                  Retailer URLs (Amazon, Flipkart, Myntra, Ajio, Meesho)
                </label>
                
                {urls.map((url, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="flex-grow relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ag-purple select-none bg-ag-purple/10 px-2 py-0.5 rounded border border-ag-purple/20">
                        Link {index + 1}
                      </span>
                      <input
                        type="text"
                        value={url}
                        onChange={(e) => handleUrlChange(index, e.target.value)}
                        placeholder="Paste Amazon, Flipkart, Myntra, Ajio, Meesho URL..."
                        className="w-full bg-ag-black border border-ag-border rounded-xl pl-20 pr-4 py-3 text-sm text-ag-white focus:outline-none focus:border-ag-purple focus:ring-1 focus:ring-ag-purple transition-all"
                      />
                    </div>
                    
                    {/* Delete URL Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveUrlField(index)}
                      className="p-3 border border-ag-border hover:border-ag-red hover:bg-ag-red/10 text-ag-muted hover:text-ag-red rounded-xl transition-all focus:outline-none flex-shrink-0"
                      title="Remove Link"
                    >
                      🗑️
                    </button>
                  </div>
                ))}

                {/* Add Another Link Button */}
                <button
                  type="button"
                  onClick={handleAddUrlField}
                  className="w-full py-2.5 border border-dashed border-ag-border hover:border-ag-purple rounded-xl text-xs font-bold text-ag-muted hover:text-ag-purple transition-all flex items-center justify-center space-x-1"
                >
                  <span>+</span>
                  <span>Add Another Retailer URL</span>
                </button>
              </div>

              {/* Form Actions Footer */}
              <div className="flex space-x-3 pt-4 border-t border-ag-border/50">
                <button
                  type="button"
                  onClick={closeCompareModal}
                  className="w-1/3 border border-ag-border rounded-xl text-xs font-bold text-ag-muted hover:text-ag-white hover:border-ag-purple transition-all py-3.5"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  className="w-2/3 btn-primary py-3.5 shadow-lg shadow-ag-purple/20 justify-center text-xs font-bold"
                >
                  Create Comparison Tracker
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default CompareProductModal;
