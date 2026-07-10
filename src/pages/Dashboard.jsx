import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import client from '../api/client';

import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import AlertBanner from '../components/AlertBanner';
import EmptyState from '../components/EmptyState';
import ProductCard from '../components/ProductCard';
import AddItemModal from '../components/AddItemModal';
import PriceGraph from '../components/PriceGraph';
import LoadingSpinner from '../components/LoadingSpinner';
import CustomPopup from '../components/CustomPopup';

const Dashboard = () => {
  const {
    items,
    setItems,
    setNotifications,
    openAddModal,
    isAddModalOpen,
    graphItemId,
    dialog
  } = useStore();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSite, setSelectedSite] = useState('all');

  const filteredItems = items.filter((item) => {
    const matchesSearch = (item.productName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSite = selectedSite === 'all' || item.site === selectedSite;
    return matchesSearch && matchesSite;
  });

  // Fetch initial items and notifications
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [itemsRes, notifRes] = await Promise.all([
          client.get('/api/items'),
          client.get('/api/notifications')
        ]);
        setItems(itemsRes.data);
        setNotifications(notifRes.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try refreshing.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [setItems, setNotifications]);

  // Set up background polling interval (every 60 seconds)
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const [itemsRes, notifRes] = await Promise.all([
          client.get('/api/items'),
          client.get('/api/notifications')
        ]);
        // Update store values silently
        setItems(itemsRes.data);
        setNotifications(notifRes.data);
      } catch (err) {
        console.warn('[Silent Poll] Failed to background refresh data:', err.message);
      }
    }, 60000);

    return () => clearInterval(pollInterval);
  }, [setItems, setNotifications]);

  // Count items and triggered alerts
  const itemsCount = items.length;
  const alertsCount = items.filter((item) => item.alertSent).length;

  return (
    <div className="min-h-screen bg-ag-black flex flex-col pb-16">
      
      {/* 1. Header Navigation */}
      <Navbar />
      <Sidebar />

      {/* 2. Top-level Alert Banner */}
      <AlertBanner />

      {/* 3. Main Workspace Container */}
      <div className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 md:px-8">
        
        {/* Actions Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black text-ag-white leading-tight">
              Tracking Dashboard
            </h2>
            <p className="text-xs text-ag-muted font-semibold mt-1">
              Monitor product price drops in real-time
            </p>
          </div>

          {/* Add Item Button */}
          <button
            onClick={openAddModal}
            className="btn-primary space-x-2 shadow-lg shadow-ag-purple/15 text-sm py-3 px-5 self-start sm:self-auto"
          >
            <span>+</span>
            <span>Track Product</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Tracked Items */}
          <div className="glass-card p-5 bg-ag-surface/30 border border-ag-border hover:border-ag-purple/30 transition-all flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-ag-muted uppercase tracking-wider mb-1">
                Products Tracked
              </p>
              <h3 className="text-2xl font-black text-ag-white">
                {itemsCount}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-ag-purple/10 border border-ag-purple/20 flex items-center justify-center text-lg text-ag-purple">
              📦
            </div>
          </div>

          {/* Card 2: Active Alerts */}
          <div className="glass-card p-5 bg-ag-surface/30 border border-ag-border hover:border-ag-green/30 transition-all flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-ag-muted uppercase tracking-wider mb-1">
                Triggered Alerts
              </p>
              <h3 className="text-2xl font-black text-ag-green">
                {alertsCount}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-ag-green/10 border border-ag-green/20 flex items-center justify-center text-lg text-ag-green">
              🔔
            </div>
          </div>

          {/* Card 3: Scraper Frequency */}
          <div className="glass-card p-5 bg-ag-surface/30 border border-ag-border hover:border-ag-amber/30 transition-all flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-ag-muted uppercase tracking-wider mb-1">
                Check Status
              </p>
              <h3 className="text-sm font-black text-ag-amber uppercase tracking-wider">
                Every Minute
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-ag-amber/10 border border-ag-amber/20 flex items-center justify-center text-lg text-ag-amber">
              ⚡
            </div>
          </div>
        </div>

        {/* Search and Filters Bar */}
        {itemsCount > 0 && (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 p-4 bg-ag-surface/20 border border-ag-border rounded-2xl">
            {/* Search Input */}
            <div className="relative flex-grow max-w-md">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ag-muted text-xs">
                🔍
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tracked products by name..."
                className="w-full bg-ag-black border border-ag-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-ag-white focus:outline-none focus:border-ag-purple focus:ring-1 focus:ring-ag-purple transition-all"
              />
            </div>

            {/* Site Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {['all', 'amazon', 'flipkart', 'myntra', 'ajio', 'meesho'].map((site) => (
                <button
                  key={site}
                  onClick={() => setSelectedSite(site)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold capitalize transition-all border ${
                    selectedSite === site
                      ? 'bg-ag-purple text-white border-ag-purple shadow-sm shadow-ag-purple/20'
                      : 'bg-ag-black/40 text-ag-muted border-ag-border hover:text-ag-white hover:border-ag-purple'
                  }`}
                >
                  {site === 'all' ? 'All Retailers' : site}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading / Error / Grid States */}
        {isLoading ? (
          <div className="py-24 flex items-center justify-center">
            <LoadingSpinner size={40} label="Initializing your trackers..." />
          </div>
        ) : error ? (
          <div className="py-16 text-center">
            <p className="text-ag-red text-sm font-semibold mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-ag-surface border border-ag-border rounded-xl text-xs font-bold text-ag-white hover:border-ag-purple transition-all"
            >
              Retry Connection
            </button>
          </div>
        ) : itemsCount === 0 ? (
          <EmptyState />
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center glass-card bg-ag-surface/20 border border-ag-border max-w-md mx-auto p-6 animate-pulse">
            <p className="text-xs text-ag-muted font-bold mb-2">No matching products found</p>
            <p className="text-[10px] text-ag-muted">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          /* Responsive Product Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <ProductCard key={item._id} item={item} />
            ))}
          </div>
        )}

      </div>

      {/* 4. Modals (Conditionally rendered based on store trigger state) */}
      {isAddModalOpen && <AddItemModal />}
      {graphItemId && <PriceGraph />}
      {dialog && <CustomPopup />}

    </div>
  );
};

export default Dashboard;
