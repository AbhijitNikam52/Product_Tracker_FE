import React, { useState, useEffect } from 'react';

/**
 * Premium Admin Pagination Component
 * Supports preset page sizes (10, 25, 50, 100, 200, 500) and custom page size input.
 */
const Pagination = ({
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
  presetSizes = [10, 25, 50, 100, 200, 500]
}) => {
  const [isCustom, setIsCustom] = useState(false);
  const [customInputValue, setCustomInputValue] = useState(itemsPerPage.toString());

  // Keep custom input value in sync if itemsPerPage changes externally
  useEffect(() => {
    setCustomInputValue(itemsPerPage.toString());
    if (!presetSizes.includes(Number(itemsPerPage))) {
      setIsCustom(true);
    } else {
      setIsCustom(false);
    }
  }, [itemsPerPage, presetSizes]);

  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = totalItems === 0 ? 0 : (safeCurrentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(safeCurrentPage * itemsPerPage, totalItems);

  // Generate page numbers to render
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, safeCurrentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handleSelectChange = (e) => {
    const val = e.target.value;
    if (val === 'custom') {
      setIsCustom(true);
    } else {
      setIsCustom(false);
      const newSize = parseInt(val, 10);
      if (newSize && newSize > 0) {
        onItemsPerPageChange(newSize);
        onPageChange(1);
      }
    }
  };

  const handleCustomSubmit = (e) => {
    if (e) e.preventDefault();
    const parsed = parseInt(customInputValue, 10);
    if (parsed && parsed > 0) {
      onItemsPerPageChange(parsed);
      onPageChange(1);
    }
  };

  return (
    <div className="glass-card p-4 bg-ag-surface/30 border border-ag-border rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-ag-muted mt-4">
      
      {/* Left side: Items info & Rows per page selector */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-start">
        
        {/* Item count text */}
        <div className="text-ag-white font-bold">
          Showing <span className="text-ag-purple font-black">{startItem}</span> to{' '}
          <span className="text-ag-purple font-black">{endItem}</span> of{' '}
          <span className="text-ag-white font-black">{totalItems}</span> records
        </div>

        {/* Per page selector */}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-ag-muted font-bold">Rows per page:</span>
          
          <select
            value={isCustom ? 'custom' : itemsPerPage}
            onChange={handleSelectChange}
            className="bg-ag-black border border-ag-border rounded-lg px-2.5 py-1.5 text-xs text-ag-white focus:outline-none focus:border-ag-purple font-bold cursor-pointer"
          >
            {presetSizes.map(size => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
            <option value="custom">Custom Size...</option>
          </select>

          {/* Custom size input box */}
          {isCustom && (
            <form onSubmit={handleCustomSubmit} className="flex items-center space-x-1 animate-scale-up">
              <input
                type="number"
                min="1"
                max="5000"
                value={customInputValue}
                onChange={(e) => setCustomInputValue(e.target.value)}
                placeholder="Count"
                className="w-16 bg-ag-black border border-ag-purple rounded-lg px-2 py-1 text-xs text-ag-white text-center focus:outline-none font-bold"
              />
              <button
                type="submit"
                className="px-2 py-1 bg-ag-purple text-white rounded-lg text-[10px] font-black hover:bg-ag-violet transition-all cursor-pointer"
              >
                Apply
              </button>
            </form>
          )}
        </div>

      </div>

      {/* Right side: Page Navigation Buttons */}
      <div className="flex items-center space-x-1.5 w-full md:w-auto justify-center md:justify-end">
        
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={safeCurrentPage === 1 || totalItems === 0}
          className="px-2.5 py-1.5 rounded-lg border border-ag-border bg-ag-black/40 hover:bg-ag-surface hover:border-ag-purple text-ag-white disabled:opacity-30 disabled:hover:bg-ag-black/40 disabled:hover:border-ag-border transition-all font-black text-xs cursor-pointer"
          title="First Page"
        >
          ««
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage === 1 || totalItems === 0}
          className="px-3 py-1.5 rounded-lg border border-ag-border bg-ag-black/40 hover:bg-ag-surface hover:border-ag-purple text-ag-white disabled:opacity-30 disabled:hover:bg-ag-black/40 disabled:hover:border-ag-border transition-all font-black text-xs cursor-pointer"
          title="Previous Page"
        >
          ‹ Prev
        </button>

        {/* Dynamic Page Number Buttons */}
        {getPageNumbers().map(pageNum => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`min-w-[32px] h-8 rounded-lg border font-black text-xs transition-all cursor-pointer ${
              safeCurrentPage === pageNum
                ? 'bg-ag-purple border-ag-purple text-white shadow-md shadow-ag-purple/20'
                : 'border-ag-border bg-ag-black/40 text-ag-muted hover:text-ag-white hover:border-ag-purple hover:bg-ag-surface'
            }`}
          >
            {pageNum}
          </button>
        ))}

        {/* Next Page */}
        <button
          onClick={() => onPageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage >= totalPages || totalItems === 0}
          className="px-3 py-1.5 rounded-lg border border-ag-border bg-ag-black/40 hover:bg-ag-surface hover:border-ag-purple text-ag-white disabled:opacity-30 disabled:hover:bg-ag-black/40 disabled:hover:border-ag-border transition-all font-black text-xs cursor-pointer"
          title="Next Page"
        >
          Next ›
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={safeCurrentPage >= totalPages || totalItems === 0}
          className="px-2.5 py-1.5 rounded-lg border border-ag-border bg-ag-black/40 hover:bg-ag-surface hover:border-ag-purple text-ag-white disabled:opacity-30 disabled:hover:bg-ag-black/40 disabled:hover:border-ag-border transition-all font-black text-xs cursor-pointer"
          title="Last Page"
        >
          »»
        </button>

      </div>

    </div>
  );
};

export default Pagination;
