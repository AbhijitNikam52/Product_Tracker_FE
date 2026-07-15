import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import client from '../api/client';
import { toast } from 'react-toastify';

import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import AlertBanner from '../components/AlertBanner';
import LoadingSpinner from '../components/LoadingSpinner';
import CustomPopup from '../components/CustomPopup';

// Recharts imports for premium analytics graphs
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const CHART_COLORS = ['#4F46E5', '#0D9488', '#10B981', '#F59E0B', '#EF4444'];

const STORES_CONFIG = {
  amazon: { name: 'Amazon', bg: 'from-amber-500 to-yellow-600', text: 'text-white border-amber-600' },
  flipkart: { name: 'Flipkart', bg: 'from-blue-600 to-indigo-700', text: 'text-white border-blue-700' },
  myntra: { name: 'Myntra', bg: 'from-pink-500 to-rose-600', text: 'text-white border-pink-600' },
  ajio: { name: 'Ajio', bg: 'from-teal-700 to-slate-800', text: 'text-white border-teal-800' },
  croma: { name: 'Croma', bg: 'from-cyan-600 to-teal-700', text: 'text-white border-cyan-600' },
  reliancedigital: { name: 'Reliance Digital', bg: 'from-red-500 to-orange-600', text: 'text-white border-red-600' },
  vijaysales: { name: 'Vijay Sales', bg: 'from-red-700 to-rose-800', text: 'text-white border-rose-700' }
};

const AdminDashboard = () => {
  const {
    dialog,
    showConfirm,
    showAlert,
    closeDialog,
    savedProducts,
    setSavedProducts,
    saveProduct,
    removeSavedProduct
  } = useStore();

  // Tab State: 'overview' | 'users' | 'items' | 'comparisons' | 'coupons' | 'homeProducts'
  const [activeTab, setActiveTab] = useState('overview');

  // Home Products States
  const [homeProductSearch, setHomeProductSearch] = useState('');
  const [selectedHomeProductSite, setSelectedHomeProductSite] = useState('all');
  const [showHomeProductModal, setShowHomeProductModal] = useState(false);
  const [homeProductUrl, setHomeProductUrl] = useState('');
  const [isFetchingHomeProduct, setIsFetchingHomeProduct] = useState(false);
  const [fetchedHomeProduct, setFetchedHomeProduct] = useState(null);
  const [fetchHomeProductError, setFetchHomeProductError] = useState(null);

  // Backend Data State
  const [dashboardData, setDashboardData] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [itemsList, setItemsList] = useState([]);
  const [comparisonsList, setComparisonsList] = useState([]);
  const [couponsList, setCouponsList] = useState([]);
  
  // UI Loaders
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // Search & Filtering State
  const [userSearch, setUserSearch] = useState('');
  const [itemSearch, setItemSearch] = useState('');
  const [compareSearch, setCompareSearch] = useState('');
  const [couponSearch, setCouponSearch] = useState('');
  const [selectedSite, setSelectedSite] = useState('all');
  const [selectedCouponType, setSelectedCouponType] = useState('all');
  const [selectedCouponStore, setSelectedCouponStore] = useState('all');
  const [selectedCouponSource, setSelectedCouponSource] = useState('all');

  // Coupon Form Modal State
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponForm, setCouponForm] = useState({
    code: '',
    description: '',
    discountType: 'other',
    discountValue: '',
    couponType: 'store',
    store: 'amazon',
    category: '',
    brand: '',
    productUrl: '',
    isVerified: true,
    expiryDate: '',
    isActive: true
  });

  // Fetch Dashboard Stats & System info
  const fetchDashboardStats = async () => {
    try {
      const res = await client.get('/api/admin/dashboard');
      setDashboardData(res.data);
    } catch (err) {
      console.error('Error fetching admin dashboard stats:', err);
      setPageError('Failed to load system metrics. Verify server is running.');
    }
  };

  // Fetch Users List
  const fetchUsers = async () => {
    try {
      const res = await client.get('/api/admin/users');
      setUsersList(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  // Fetch Tracked Items
  const fetchItems = async () => {
    try {
      const res = await client.get('/api/admin/items');
      setItemsList(res.data);
    } catch (err) {
      console.error('Error fetching tracked items:', err);
    }
  };

  // Fetch Compared Items
  const fetchComparisons = async () => {
    try {
      const res = await client.get('/api/admin/comparisons');
      setComparisonsList(res.data);
    } catch (err) {
      console.error('Error fetching comparisons:', err);
    }
  };

  // Fetch Coupons
  const fetchCoupons = async () => {
    try {
      const res = await client.get('/api/admin/coupons');
      setCouponsList(res.data);
    } catch (err) {
      console.error('Error fetching coupons:', err);
    }
  };

  // Fetch Saved/Home Products
  const fetchHomeProducts = async () => {
    try {
      const res = await client.get('/api/saved-products');
      setSavedProducts(res.data);
    } catch (err) {
      console.error('Error fetching saved products:', err);
    }
  };

  const handleSaveCoupon = async (e) => {
    if (e) e.preventDefault();
    setActionInProgress(true);
    try {
      const payload = {
        ...couponForm,
        discountValue: couponForm.discountValue ? parseFloat(couponForm.discountValue) : null,
        expiryDate: couponForm.expiryDate || null
      };

      if (editingCoupon) {
        // Edit existing
        const res = await client.put(`/api/admin/coupons/${editingCoupon._id}`, payload);
        setCouponsList(prev => prev.map(c => c._id === editingCoupon._id ? res.data : c));
        triggerNotification('Coupon updated successfully.');
      } else {
        // Create new
        const res = await client.post('/api/admin/coupons', payload);
        setCouponsList(prev => [res.data, ...prev]);
        triggerNotification('Coupon created successfully.');
      }
      setShowCouponModal(false);
      setEditingCoupon(null);
    } catch (err) {
      console.error('Error saving coupon:', err);
      triggerNotification(err.response?.data?.error || 'Failed to save coupon.', true);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleDeleteCoupon = (coupon) => {
    showConfirm(
      'Delete Coupon?',
      `Are you sure you want to delete coupon "${coupon.code || coupon.description}"?`,
      async () => {
        setActionInProgress(true);
        try {
          await client.delete(`/api/admin/coupons/${coupon._id}`);
          setCouponsList(prev => prev.filter(c => c._id !== coupon._id));
          triggerNotification('Coupon deleted successfully.');
        } catch (err) {
          console.error('Error deleting coupon:', err);
          triggerNotification(err.response?.data?.error || 'Failed to delete coupon.', true);
        } finally {
          setActionInProgress(false);
        }
      }
    );
  };

  const handleToggleVerification = async (coupon) => {
    setActionInProgress(true);
    try {
      const updatedVerified = !coupon.isVerified;
      await client.post(`/api/coupons/${coupon._id}/verify`, { isVerified: updatedVerified });
      setCouponsList(prev => prev.map(c => c._id === coupon._id ? { ...c, isVerified: updatedVerified } : c));
      triggerNotification(`Coupon verification set to ${updatedVerified}`);
    } catch (err) {
      console.error('Error toggling verification:', err);
      triggerNotification(err.response?.data?.error || 'Failed to update verification status.', true);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleToggleActive = async (coupon) => {
    setActionInProgress(true);
    try {
      const updatedActive = !coupon.isActive;
      await client.put(`/api/admin/coupons/${coupon._id}`, { isActive: updatedActive });
      setCouponsList(prev => prev.map(c => c._id === coupon._id ? { ...c, isActive: updatedActive } : c));
      triggerNotification(updatedActive ? 'Coupon activated.' : 'Coupon deactivated.');
    } catch (err) {
      console.error('Error toggling status:', err);
      triggerNotification(err.response?.data?.error || 'Failed to update status.', true);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleSyncAffiliate = async () => {
    setActionInProgress(true);
    try {
      const res = await client.post('/api/admin/coupons/sync-affiliate');
      await fetchCoupons();
      triggerNotification(res.data.message || 'Affiliate coupons synced successfully.');
    } catch (err) {
      console.error('Error syncing affiliate coupons:', err);
      triggerNotification('Failed to sync affiliate coupons.', true);
    } finally {
      setActionInProgress(false);
    }
  };

  // Initial Load
  useEffect(() => {
    const loadAllData = async () => {
      setPageLoading(true);
      setPageError(null);
      await Promise.all([
        fetchDashboardStats(), 
        fetchUsers(), 
        fetchItems(),
        fetchComparisons(),
        fetchCoupons(),
        fetchHomeProducts()
      ]);
      setPageLoading(false);
    };

    loadAllData();
  }, []);

  // Show status feedback banners
  const triggerNotification = (msg, isError = false) => {
    if (isError) {
      toast.error(msg);
    } else {
      toast.success(msg);
    }
    setActionMessage({ text: msg, isError });
    setTimeout(() => setActionMessage(null), 5000);
  };

  // User Actions
  const handleToggleRole = async (userId, currentRole) => {
    const targetRole = currentRole === 'admin' ? 'user' : 'admin';
    setActionInProgress(true);
    try {
      await client.put(`/api/admin/users/${userId}/role`, { role: targetRole });
      triggerNotification(`Successfully changed user role to ${targetRole}.`);
      await fetchUsers();
      await fetchDashboardStats();
    } catch (err) {
      console.error(err);
      triggerNotification(err.response?.data?.error || 'Failed to update user role.', true);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleDeleteUser = (userObj) => {
    showConfirm(
      'Delete User?',
      `Are you sure you want to delete user "${userObj.email}"? This will permanently stop and delete all their tracked products, price history, and notification logs. This action is irreversible.`,
      async () => {
        closeDialog();
        setActionInProgress(true);
        try {
          await client.delete(`/api/admin/users/${userObj._id}`);
          triggerNotification(`Successfully deleted user "${userObj.email}" and all associated trackers.`);
          await Promise.all([fetchUsers(), fetchItems(), fetchComparisons(), fetchDashboardStats()]);
        } catch (err) {
          console.error(err);
          triggerNotification(err.response?.data?.error || 'Failed to delete user.', true);
        } finally {
          setActionInProgress(false);
        }
      },
      () => closeDialog()
    );
  };

  // Item Actions
  const handleRefreshItem = async (itemId) => {
    setActionInProgress(true);
    try {
      const res = await client.post(`/api/admin/items/${itemId}/refresh`);
      if (res.data.success) {
        triggerNotification(`Force refreshed product price. New price is: ₹${res.data.item.currentPrice?.toLocaleString('en-IN') || 'N/A'}`);
        await Promise.all([fetchItems(), fetchDashboardStats()]);
      }
    } catch (err) {
      console.error(err);
      triggerNotification(err.response?.data?.error || 'Failed to refresh product details.', true);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleDeleteItem = (itemObj) => {
    showConfirm(
      'Delete Tracked Item?',
      `Are you sure you want to stop tracking and delete "${itemObj.productName}" globally?`,
      async () => {
        closeDialog();
        setActionInProgress(true);
        try {
          await client.delete(`/api/admin/items/${itemObj._id}`);
          triggerNotification(`Successfully stopped tracking product.`);
          await Promise.all([fetchItems(), fetchDashboardStats()]);
        } catch (err) {
          console.error(err);
          triggerNotification(err.response?.data?.error || 'Failed to delete product tracker.', true);
        } finally {
          setActionInProgress(false);
        }
      },
      () => closeDialog()
    );
  };

  // Comparison Actions
  const handleRefreshComparison = async (compId) => {
    setActionInProgress(true);
    try {
      const res = await client.post(`/api/admin/comparisons/${compId}/refresh`);
      if (res.data.success) {
        triggerNotification(`Successfully forced scraped updates for all comparison URLs.`);
        await fetchComparisons();
      }
    } catch (err) {
      console.error(err);
      triggerNotification('Failed to scrape comparison links.', true);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleDeleteComparison = (compObj) => {
    showConfirm(
      'Delete Comparison Tracker?',
      `Are you sure you want to delete comparison catalog "${compObj.productName}" globally?`,
      async () => {
        closeDialog();
        setActionInProgress(true);
        try {
          await client.delete(`/api/admin/comparisons/${compObj._id}`);
          triggerNotification(`Successfully deleted comparison tracker.`);
          await Promise.all([fetchComparisons(), fetchDashboardStats()]);
        } catch (err) {
          console.error(err);
          triggerNotification('Failed to delete comparison tracker.', true);
        } finally {
          setActionInProgress(false);
        }
      },
      () => closeDialog()
    );
  };

  // System Controls
  const handleTriggerAllChecks = async () => {
    setActionInProgress(true);
    try {
      const res = await client.post('/api/admin/scheduler/trigger');
      triggerNotification(res.data.message || 'Manual site-wide price scraping checks started.');
      setTimeout(async () => {
        await Promise.all([fetchItems(), fetchDashboardStats()]);
      }, 5000);
    } catch (err) {
      console.error(err);
      triggerNotification('Failed to trigger background scrape job.', true);
    } finally {
      setActionInProgress(false);
    }
  };

  // Home Product Actions
  const handleOpenHomeProductModal = () => {
    setHomeProductUrl('');
    setFetchedHomeProduct(null);
    setFetchHomeProductError(null);
    setIsFetchingHomeProduct(false);
    setShowHomeProductModal(true);
  };

  const handleFetchHomeProductDetails = async (e) => {
    if (e) e.preventDefault();
    if (!homeProductUrl || !homeProductUrl.startsWith('http')) {
      setFetchHomeProductError('Please provide a valid product URL starting with http/https');
      return;
    }

    setIsFetchingHomeProduct(true);
    setFetchHomeProductError(null);
    setFetchedHomeProduct(null);

    try {
      const response = await client.post('/api/items', { url: homeProductUrl, targetPrice: 0 });
      setFetchedHomeProduct(response.data);
    } catch (err) {
      console.error('Error fetching preview:', err);
      setFetchHomeProductError(err.response?.data?.error || 'Could not fetch product details. Try another link.');
    } finally {
      setIsFetchingHomeProduct(false);
    }
  };

  const handleAddHomeProduct = async () => {
    if (!fetchedHomeProduct) return;
    setActionInProgress(true);
    try {
      const payload = {
        title: fetchedHomeProduct.productName,
        imageUrl: fetchedHomeProduct.imageUrl,
        price: fetchedHomeProduct.price,
        rating: '',
        productUrl: homeProductUrl,
        site: fetchedHomeProduct.site
      };

      const res = await client.post('/api/saved-products', payload);
      saveProduct(res.data);
      triggerNotification('Product added to home page successfully.');
      setShowHomeProductModal(false);
    } catch (err) {
      console.error('Error saving home product:', err);
      triggerNotification(err.response?.data?.error || 'Failed to add product to home page.', true);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleDeleteHomeProduct = (productObj) => {
    showConfirm(
      'Remove Product from Home Page?',
      `Are you sure you want to remove "${productObj.title}" from the shared catalog on the home page?`,
      async () => {
        closeDialog();
        setActionInProgress(true);
        try {
          await client.delete(`/api/saved-products/${productObj._id}`);
          triggerNotification('Product removed from home page.');
          removeSavedProduct(productObj._id);
        } catch (err) {
          console.error(err);
          triggerNotification('Failed to remove product from home page.', true);
        } finally {
          setActionInProgress(false);
        }
      },
      () => closeDialog()
    );
  };

  // Search/Filters calculations
  const filteredHomeProducts = savedProducts.filter((prod) => {
    const title = prod.title || '';
    const matchesSearch = title.toLowerCase().includes(homeProductSearch.toLowerCase());
    const matchesSite = selectedHomeProductSite === 'all' || prod.site === selectedHomeProductSite;
    return matchesSearch && matchesSite;
  });

  const filteredUsers = usersList.filter((u) => {
    const search = userSearch.toLowerCase();
    return (
      (u.email || '').toLowerCase().includes(search) ||
      (u.name || '').toLowerCase().includes(search) ||
      (u._id || '').toLowerCase().includes(search)
    );
  });

  const filteredItems = itemsList.filter((item) => {
    const matchesSearch = 
      (item.productName || '').toLowerCase().includes(itemSearch.toLowerCase()) ||
      (item.ownerEmail || '').toLowerCase().includes(itemSearch.toLowerCase()) ||
      (item.url || '').toLowerCase().includes(itemSearch.toLowerCase());
    const matchesSite = selectedSite === 'all' || item.site === selectedSite;
    return matchesSearch && matchesSite;
  });

  const filteredComparisons = comparisonsList.filter((c) => {
    const search = compareSearch.toLowerCase();
    return (
      (c.productName || '').toLowerCase().includes(search) ||
      (c.ownerEmail || '').toLowerCase().includes(search)
    );
  });

  // Calculate stats values safely
  const metrics = dashboardData?.metrics || {};
  const siteStats = dashboardData?.siteStats || {};
  const categoryStats = dashboardData?.categoryStats || {};
  const topSearches = dashboardData?.topSearches || [];
  const sysInfo = dashboardData?.systemInfo || {};

  // Formatter for Recharts Category Pie Chart
  const categoryChartData = Object.entries(categoryStats).map(([name, value]) => ({
    name,
    value
  })).filter(item => item.value > 0);

  // Formatter for Recharts Retailer Share Pie Chart
  const retailerChartData = Object.entries(siteStats).map(([name, value]) => ({
    name: name.toUpperCase(),
    value
  })).filter(item => item.value > 0);

  return (
    <div className="min-h-screen bg-ag-black flex flex-col pb-16">
      <Navbar />
      <Sidebar />
      <AlertBanner />

      <div className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 md:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-ag-white leading-tight flex items-center space-x-2">
              <span className="text-ag-purple">⚙️</span>
              <span>Admin Console</span>
            </h2>
            <p className="text-xs text-ag-muted font-semibold mt-1">
              Global system monitoring, search analytics graphs, e-commerce scrapes control, and database access
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={async () => {
                setPageLoading(true);
                await Promise.all([
                  fetchDashboardStats(), 
                  fetchUsers(), 
                  fetchItems(),
                  fetchComparisons()
                ]);
                setPageLoading(false);
                triggerNotification('Console records synchronized.');
              }}
              disabled={pageLoading || actionInProgress}
              className="px-4 py-2.5 bg-ag-surface border border-ag-border rounded-xl text-xs font-bold text-ag-white hover:border-ag-purple transition-all flex items-center space-x-1.5 disabled:opacity-50"
            >
              <span>🔄</span>
              <span>Sync Console</span>
            </button>
          </div>
        </div>

        {/* Global Action Message Banner */}
        {actionMessage && (
          <div className={`p-4 mb-6 rounded-xl border text-xs font-bold transition-all slide-down flex items-center justify-between ${
            actionMessage.isError 
              ? 'bg-ag-red/10 border-ag-red text-ag-red' 
              : 'bg-ag-green/10 border-ag-green text-ag-green'
          }`}>
            <span>{actionMessage.isError ? '⚠️' : '✓'} {actionMessage.text}</span>
            <button onClick={() => setActionMessage(null)} className="text-ag-muted hover:text-white ml-2">✕</button>
          </div>
        )}

        {pageLoading ? (
          <div className="py-24 flex items-center justify-center">
            <LoadingSpinner size={45} label="Loading system configurations..." />
          </div>
        ) : pageError ? (
          <div className="py-16 text-center max-w-md mx-auto glass-card p-8">
            <span className="text-4xl block mb-4">🚨</span>
            <p className="text-ag-red text-sm font-black mb-4">{pageError}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary text-xs"
            >
              Reload Page
            </button>
          </div>
        ) : (
          <>
            {/* Stats Overview Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="glass-card p-4 bg-ag-surface/20 border border-ag-border flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold text-ag-muted uppercase tracking-wider mb-0.5">Total Users</p>
                  <h4 className="text-xl font-black text-ag-white">{metrics.totalUsers || 0}</h4>
                </div>
                <span className="text-xl">👥</span>
              </div>
              <div className="glass-card p-4 bg-ag-surface/20 border border-ag-border flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold text-ag-muted uppercase tracking-wider mb-0.5">Trackers Running</p>
                  <h4 className="text-xl font-black text-ag-purple">{metrics.totalItems || 0}</h4>
                </div>
                <span className="text-xl">📦</span>
              </div>
              <div className="glass-card p-4 bg-ag-surface/20 border border-ag-border flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold text-ag-muted uppercase tracking-wider mb-0.5">Comparisons</p>
                  <h4 className="text-xl font-black text-ag-violet">{metrics.totalComparisons || 0}</h4>
                </div>
                <span className="text-xl">⚖️</span>
              </div>
              <div className="glass-card p-4 bg-ag-surface/20 border border-ag-border flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold text-ag-muted uppercase tracking-wider mb-0.5">Total Coupons</p>
                  <h4 className="text-xl font-black text-ag-green">{metrics.totalCoupons || couponsList.length || 0}</h4>
                </div>
                <span className="text-xl">🎟️</span>
              </div>
              <div className="glass-card p-4 bg-ag-surface/20 border border-ag-border flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold text-ag-muted uppercase tracking-wider mb-0.5">Home Products</p>
                  <h4 className="text-xl font-black text-ag-amber">{metrics.totalSavedProducts || savedProducts.length || 0}</h4>
                </div>
                <span className="text-xl">🏠</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-ag-border gap-2 mb-6 overflow-x-auto">
              {[
                { id: 'overview', name: 'Overview & Controls', icon: '💻' },
                { id: 'users', name: `Manage Users (${usersList.length})`, icon: '👥' },
                { id: 'items', name: `Tracked Products (${itemsList.length})`, icon: '🏷️' },
                { id: 'comparisons', name: `Compared Items (${comparisonsList.length})`, icon: '⚖️' },
                { id: 'coupons', name: `Manage Coupons (${couponsList.length})`, icon: '🎟️' },
                { id: 'homeProducts', name: 'Add Home Products', icon: '🏠' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-xs font-black transition-all border-b-2 flex items-center space-x-1.5 -mb-px whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-ag-purple text-ag-purple'
                      : 'border-transparent text-ag-muted hover:text-ag-white'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>

            {/* Loader indicator for background actions */}
            {actionInProgress && (
              <div className="mb-4 text-xs font-bold text-ag-purple animate-pulse flex items-center space-x-1.5 bg-ag-purple/5 p-2.5 rounded-lg border border-ag-purple/10">
                <span className="animate-spin text-xs">🌀</span>
                <span>Executing request on database...</span>
              </div>
            )}

            {/* TAB CONTENT 1: OVERVIEW & CONTROLS */}
            {activeTab === 'overview' && (
              <div className="space-y-6 fade-in-up">
                
                {/* Analytics Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Chart 1: Categories Graph */}
                  <div className="glass-card p-6 bg-ag-surface/30 border border-ag-border space-y-4">
                    <h3 className="text-xs font-black text-ag-white uppercase tracking-wider border-b border-ag-border/50 pb-2 flex items-center justify-between">
                      <span>Mostly Tracked Categories</span>
                      <span className="text-[10px] text-ag-muted font-bold normal-case">By Keyword Match</span>
                    </h3>

                    <div className="h-64 flex items-center justify-center">
                      {categoryChartData.length === 0 ? (
                        <p className="text-xs text-ag-muted">No tracked products found to categorize.</p>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                              labelLine={true}
                              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            >
                              {categoryChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ background: '#0F1626', border: '1px solid #1E293B', borderRadius: '8px' }}
                              itemStyle={{ color: '#F9FAFB', fontSize: '11px', fontWeight: 'bold' }}
                            />
                            <Legend 
                              verticalAlign="bottom" 
                              align="center"
                              iconSize={8}
                              iconType="circle"
                              wrapperStyle={{ fontSize: '10px', color: '#9CA3AF', fontWeight: '600' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* Chart 2: Retailer Share Pie Chart */}
                  <div className="glass-card p-6 bg-ag-surface/30 border border-ag-border space-y-4">
                    <h3 className="text-xs font-black text-ag-white uppercase tracking-wider border-b border-ag-border/50 pb-2 flex items-center justify-between">
                      <span>Tracker Retailer Share</span>
                      <span className="text-[10px] text-ag-muted font-bold normal-case">By Retailer Platform</span>
                    </h3>

                    <div className="h-64 flex items-center justify-center">
                      {retailerChartData.length === 0 ? (
                        <p className="text-xs text-ag-muted">No tracked products found to chart.</p>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={retailerChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                              labelLine={true}
                              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            >
                              {retailerChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ background: '#0F1626', border: '1px solid #1E293B', borderRadius: '8px' }}
                              itemStyle={{ color: '#F9FAFB', fontSize: '11px', fontWeight: 'bold' }}
                            />
                            <Legend 
                              verticalAlign="bottom" 
                              align="center"
                              iconSize={8}
                              iconType="circle"
                              wrapperStyle={{ fontSize: '10px', color: '#9CA3AF', fontWeight: '600' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                </div>

                <div className="grid grid-cols-1 gap-6">
                  
                  {/* System Specs */}
                  <div className="glass-card p-6 bg-ag-surface/30 border border-ag-border space-y-4 w-full">
                    <h3 className="text-xs font-black text-ag-white uppercase tracking-wider border-b border-ag-border/50 pb-2">
                      System Resources & Status
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 bg-ag-black/40 border border-ag-border rounded-xl">
                        <span className="text-[9px] font-bold text-ag-muted block">HOST OS PLATFORM</span>
                        <span className="text-xs font-black text-ag-white uppercase">{sysInfo.platform || 'Unknown'}</span>
                      </div>
                      <div className="p-3 bg-ag-black/40 border border-ag-border rounded-xl">
                        <span className="text-[9px] font-bold text-ag-muted block">CPU CORE COUNT</span>
                        <span className="text-xs font-black text-ag-white">{sysInfo.cpuCount || 0} Cores</span>
                      </div>
                      <div className="p-3 bg-ag-black/40 border border-ag-border rounded-xl">
                        <span className="text-[9px] font-bold text-ag-muted block">DATABASE CONNECTION</span>
                        <span className="text-xs font-black text-ag-green flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-ag-green animate-ping"></span>
                          <span>{sysInfo.dbStatus || 'Connected'}</span>
                        </span>
                      </div>
                      <div className="p-3 bg-ag-black/40 border border-ag-border rounded-xl">
                        <span className="text-[9px] font-bold text-ag-muted block">SYSTEM UPTIME</span>
                        <span className="text-xs font-black text-ag-white">
                          {sysInfo.uptime ? `${(sysInfo.uptime / 3600).toFixed(1)} hours` : 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Memory Usage */}
                    {sysInfo.memoryUsage && (
                      <div className="p-4 bg-ag-black/40 border border-ag-border rounded-xl space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-ag-muted">RAM Memory Usage:</span>
                          <span className="font-black text-ag-white">
                            {sysInfo.memoryUsage.usedGB} GB / {sysInfo.memoryUsage.totalGB} GB ({sysInfo.memoryUsage.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-ag-border h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-ag-purple h-full rounded-full transition-all duration-500" 
                            style={{ width: `${sysInfo.memoryUsage.percentage}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Scraper controls */}
                    <div className="pt-4 border-t border-ag-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <h4 className="text-xs font-black text-ag-white">Orchestrate Scraper Engine</h4>
                        <p className="text-[10px] text-ag-muted font-medium mt-0.5">
                          Manually trigger the background crawler to scrape all products in real-time.
                        </p>
                      </div>
                      <button
                        onClick={handleTriggerAllChecks}
                        disabled={actionInProgress}
                        className="btn-primary space-x-2 text-xs py-2.5 px-4 shadow-lg shadow-ag-purple/10 disabled:opacity-50 flex-shrink-0 cursor-pointer"
                      >
                        <span>⚡</span>
                        <span>Run Scheduler Scrapes Now</span>
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* TAB CONTENT 2: MANAGE USERS */}
            {activeTab === 'users' && (
              <div className="space-y-4 fade-in-up">
                
                {/* Search Bar */}
                <div className="relative max-w-md">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ag-muted text-xs">🔍</span>
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search users by email, name, or database ID..."
                    className="w-full bg-ag-surface/55 border border-ag-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-ag-white focus:outline-none focus:border-ag-purple focus:ring-1 focus:ring-ag-purple transition-all"
                  />
                </div>

                {/* Table Container */}
                <div className="glass-card overflow-hidden bg-ag-surface/20 border border-ag-border">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-ag-black/50 border-b border-ag-border text-[10px] font-black text-ag-muted uppercase tracking-wider">
                          <th className="px-6 py-4">User Details</th>
                          <th className="px-6 py-4">Database ID</th>
                          <th className="px-6 py-4">Registered On</th>
                          <th className="px-6 py-4">Role Status</th>
                          <th className="px-6 py-4 text-center">Trackers</th>
                          <th className="px-6 py-4 text-center">Comparisons</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ag-border/50 text-xs">
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="px-6 py-12 text-center text-ag-muted font-bold">
                              No users match search criterion.
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((user) => (
                            <tr key={user._id} className="hover:bg-ag-surface/10 transition-colors">
                              
                              {/* Email & Name */}
                              <td className="px-6 py-4">
                                <div className="font-bold text-ag-white">{user.email}</div>
                                <div className="text-[10px] text-ag-muted mt-0.5 font-medium">
                                  {user.name ? `Name: ${user.name}` : 'No profile name'}
                                  {user.phone && ` | Phone: ${user.phone}`}
                                </div>
                              </td>

                              {/* DB ID */}
                              <td className="px-6 py-4 font-mono text-[10px] text-ag-muted">
                                {user._id}
                              </td>

                              {/* Registered At */}
                              <td className="px-6 py-4 text-ag-muted">
                                {new Date(user.createdAt).toLocaleDateString()}
                              </td>

                              {/* Role Badge */}
                              <td className="px-6 py-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase select-none ${
                                  user.role === 'admin' 
                                    ? 'bg-ag-amber/10 border border-ag-amber/30 text-ag-amber' 
                                    : 'bg-ag-purple/10 border border-ag-purple/20 text-ag-purple'
                                }`}>
                                  {user.role}
                                </span>
                              </td>

                              {/* Trackers Count */}
                              <td className="px-6 py-4 text-center font-black text-ag-white">
                                {user.itemCount || 0}
                              </td>

                              {/* Comparisons Count */}
                              <td className="px-6 py-4 text-center font-black text-ag-white">
                                {user.compareCount || 0}
                              </td>

                              {/* Actions */}
                              <td className="px-6 py-4 text-right space-x-2">
                                <button
                                  onClick={() => handleToggleRole(user._id, user.role)}
                                  disabled={actionInProgress}
                                  className="px-2.5 py-1.5 rounded-lg border border-ag-border hover:border-ag-purple text-[10px] font-bold text-ag-white transition-all disabled:opacity-50 hover:bg-ag-purple/5 cursor-pointer"
                                  title={user.role === 'admin' ? 'Change role to user' : 'Make admin'}
                                >
                                  {user.role === 'admin' ? 'Demote User' : 'Promote Admin'}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user)}
                                  disabled={actionInProgress}
                                  className="px-2.5 py-1.5 rounded-lg border border-ag-border hover:border-ag-red hover:bg-ag-red/5 text-[10px] font-bold text-ag-red transition-all disabled:opacity-50 cursor-pointer"
                                  title="Delete User and stop all tracks"
                                >
                                  Delete
                                </button>
                              </td>

                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT 3: GLOBAL TRACKED ITEMS */}
            {activeTab === 'items' && (
              <div className="space-y-4 fade-in-up">
                
                {/* Search and Retailer Filters */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="relative w-full max-w-md">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ag-muted text-xs">🔍</span>
                    <input
                      type="text"
                      value={itemSearch}
                      onChange={(e) => setItemSearch(e.target.value)}
                      placeholder="Search items by product name, URL, or owner email..."
                      className="w-full bg-ag-surface/55 border border-ag-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-ag-white focus:outline-none focus:border-ag-purple focus:ring-1 focus:ring-ag-purple transition-all"
                    />
                  </div>

                  {/* Retailers Selector Pills */}
                  <div className="flex flex-wrap gap-1">
                    {['all', 'amazon', 'flipkart', 'myntra', 'ajio', 'meesho'].map((site) => (
                      <button
                        key={site}
                        onClick={() => setSelectedSite(site)}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-bold capitalize transition-all border ${
                          selectedSite === site
                            ? 'bg-ag-purple text-white border-ag-purple'
                            : 'bg-ag-surface/50 text-ag-muted border-ag-border hover:text-ag-white hover:border-ag-purple'
                        }`}
                      >
                        {site === 'all' ? 'All Retailers' : site}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table Container */}
                <div className="glass-card overflow-hidden bg-ag-surface/20 border border-ag-border">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-ag-black/50 border-b border-ag-border text-[10px] font-black text-ag-muted uppercase tracking-wider">
                          <th className="px-6 py-4">Product Info</th>
                          <th className="px-6 py-4 text-center">Price Hits</th>
                          <th className="px-6 py-4">Retailer</th>
                          <th className="px-6 py-4">Tracked By</th>
                          <th className="px-6 py-4">Target Price</th>
                          <th className="px-6 py-4">Current Price</th>
                          <th className="px-6 py-4">Status / Checked</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ag-border/50 text-xs">
                        {filteredItems.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="px-6 py-12 text-center text-ag-muted font-bold">
                              No products found in database registry.
                            </td>
                          </tr>
                        ) : (
                          filteredItems.map((item) => (
                            <tr key={item._id} className="hover:bg-ag-surface/10 transition-colors">
                              
                              {/* Product Image & Title */}
                              <td className="px-6 py-4 max-w-sm">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-ag-black border border-ag-border rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center p-0.5">
                                    {item.imageUrl ? (
                                      <img
                                        src={item.imageUrl}
                                        alt="Product"
                                        className="w-full h-full object-contain"
                                      />
                                    ) : (
                                      <span className="text-lg">📦</span>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-bold text-ag-white truncate max-w-[240px]" title={item.productName}>
                                      {item.productName || 'Unnamed Tracker'}
                                    </div>
                                    <a
                                      href={item.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[10px] text-ag-purple hover:underline truncate block max-w-[240px] mt-0.5 font-medium"
                                    >
                                      Visit Retailer Link ↗
                                    </a>
                                  </div>
                                </div>
                              </td>

                              {/* Price Hits Count */}
                              <td className="px-6 py-4 text-center">
                                <span className="bg-ag-purple/10 border border-ag-purple/20 px-2.5 py-1 rounded text-xs font-black text-ag-purple">
                                  {item.checkCount || 0}
                                </span>
                              </td>

                              {/* Site Badge */}
                              <td className="px-6 py-4">
                                <span className="text-[9px] font-black uppercase bg-ag-purple/10 border border-ag-purple/20 text-ag-purple px-2 py-0.5 rounded">
                                  {item.site || 'retailer'}
                                </span>
                              </td>

                              {/* Owner Info */}
                              <td className="px-6 py-4 text-ag-white">
                                <span className="font-semibold">{item.ownerEmail}</span>
                                {item.ownerName && (
                                  <span className="block text-[9px] text-ag-muted mt-0.5 font-medium">({item.ownerName})</span>
                                )}
                              </td>

                              {/* Target Price */}
                              <td className="px-6 py-4 font-black text-ag-white">
                                ₹{item.targetPrice?.toLocaleString('en-IN') || '0'}
                              </td>

                              {/* Current Price */}
                              <td className="px-6 py-4">
                                <div className="font-black text-ag-green">
                                  {item.currentPrice !== null ? `₹${item.currentPrice.toLocaleString('en-IN')}` : 'Scraping Fail'}
                                </div>
                                {item.initialPrice && item.currentPrice && item.initialPrice !== item.currentPrice && (
                                  <div className="text-[9px] text-ag-muted mt-0.5 font-medium">
                                    Initial: ₹{item.initialPrice.toLocaleString('en-IN')}
                                  </div>
                                )}
                              </td>

                              {/* Scraper Status */}
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-1.5">
                                  <span className={`w-1.5 h-1.5 rounded-full ${item.isAvailable ? 'bg-ag-green' : 'bg-ag-red'}`}></span>
                                  <span className="font-semibold text-ag-white">{item.isAvailable ? 'Active' : 'Offline'}</span>
                                </div>
                                <span className="text-[9px] text-ag-muted block mt-1 font-medium">
                                  Checked: {item.lastCheckedAt ? new Date(item.lastCheckedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                                </span>
                              </td>

                              {/* Actions */}
                              <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                <button
                                  onClick={() => handleRefreshItem(item._id)}
                                  disabled={actionInProgress}
                                  className="px-2.5 py-1.5 rounded-lg border border-ag-border hover:border-ag-green hover:bg-ag-green/5 text-[10px] font-bold text-ag-white transition-all disabled:opacity-50 cursor-pointer"
                                  title="Force scrape immediately"
                                >
                                  Scrape Now
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item)}
                                  disabled={actionInProgress}
                                  className="px-2.5 py-1.5 rounded-lg border border-ag-border hover:border-ag-red hover:bg-ag-red/5 text-[10px] font-bold text-ag-red transition-all disabled:opacity-50 cursor-pointer"
                                  title="Remove product tracker globally"
                                >
                                  Delete
                                </button>
                              </td>

                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT 4: GLOBAL COMPARED PRODUCTS */}
            {activeTab === 'comparisons' && (
              <div className="space-y-4 fade-in-up">
                
                {/* Search Bar */}
                <div className="relative max-w-md">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ag-muted text-xs">🔍</span>
                  <input
                    type="text"
                    value={compareSearch}
                    onChange={(e) => setCompareSearch(e.target.value)}
                    placeholder="Search comparisons by product title or owner email..."
                    className="w-full bg-ag-surface/55 border border-ag-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-ag-white focus:outline-none focus:border-ag-purple focus:ring-1 focus:ring-ag-purple transition-all"
                  />
                </div>

                {/* Table Container */}
                <div className="glass-card overflow-hidden bg-ag-surface/20 border border-ag-border">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-ag-black/50 border-b border-ag-border text-[10px] font-black text-ag-muted uppercase tracking-wider">
                          <th className="px-6 py-4">Comparison Title</th>
                          <th className="px-6 py-4">Compared Links / Current Prices</th>
                          <th className="px-6 py-4">Compared By</th>
                          <th className="px-6 py-4">Added On</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ag-border/50 text-xs">
                        {filteredComparisons.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-6 py-12 text-center text-ag-muted font-bold">
                              No compared product logs found in database.
                            </td>
                          </tr>
                        ) : (
                          filteredComparisons.map((comp) => (
                            <tr key={comp._id} className="hover:bg-ag-surface/10 transition-colors">
                              
                              {/* Title */}
                              <td className="px-6 py-4 font-bold text-ag-white max-w-xs">
                                {comp.productName}
                                <span className="block text-[9px] text-ag-muted font-medium mt-1">
                                  ID: {comp._id}
                                </span>
                              </td>

                              {/* Compared links & prices */}
                              <td className="px-6 py-4 space-y-2">
                                {(comp.links || []).map((link, idx) => (
                                  <div key={link._id || idx} className="flex items-center justify-between bg-ag-black/30 border border-ag-border/50 p-2 rounded-lg text-[10px] max-w-lg">
                                    <div className="truncate flex-grow pr-4">
                                      <span className="bg-ag-purple/10 border border-ag-purple/20 text-ag-purple text-[8px] font-black px-1.5 py-0.5 rounded mr-1.5 uppercase select-none">
                                        {link.site || 'link'}
                                      </span>
                                      <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-ag-white hover:text-ag-purple hover:underline"
                                      >
                                        {link.url}
                                      </a>
                                    </div>
                                    <span className="font-black text-ag-green flex-shrink-0">
                                      {link.currentPrice !== null ? `₹${link.currentPrice.toLocaleString('en-IN')}` : 'Unavailable'}
                                    </span>
                                  </div>
                                ))}
                              </td>

                              {/* Owner */}
                              <td className="px-6 py-4 text-ag-white">
                                <span className="font-semibold">{comp.ownerEmail}</span>
                                {comp.ownerName && (
                                  <span className="block text-[9px] text-ag-muted mt-0.5 font-medium">({comp.ownerName})</span>
                                )}
                              </td>

                              {/* Created At */}
                              <td className="px-6 py-4 text-ag-muted">
                                {new Date(comp.createdAt).toLocaleDateString()}
                              </td>

                              {/* Actions */}
                              <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                <button
                                  onClick={() => handleRefreshComparison(comp._id)}
                                  disabled={actionInProgress}
                                  className="px-2.5 py-1.5 rounded-lg border border-ag-border hover:border-ag-green hover:bg-ag-green/5 text-[10px] font-bold text-ag-white transition-all disabled:opacity-50 cursor-pointer"
                                  title="Force scrape all compared URLs"
                                >
                                  Scrape Links
                                </button>
                                <button
                                  onClick={() => handleDeleteComparison(comp)}
                                  disabled={actionInProgress}
                                  className="px-2.5 py-1.5 rounded-lg border border-ag-border hover:border-ag-red hover:bg-ag-red/5 text-[10px] font-bold text-ag-red transition-all disabled:opacity-50 cursor-pointer"
                                  title="Remove comparison logs globally"
                                >
                                  Delete
                                </button>
                              </td>

                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT 5: MANAGE COUPONS */}
            {activeTab === 'coupons' && (
              <div className="space-y-6 fade-in-up">
                
                {/* Search & Actions Row */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  {/* Search input */}
                  <div className="relative w-full md:w-80">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ag-muted text-xs">🔎</span>
                    <input
                      type="text"
                      value={couponSearch}
                      onChange={(e) => setCouponSearch(e.target.value)}
                      placeholder="Search coupons by code or description..."
                      className="w-full bg-ag-surface border border-ag-border rounded-lg pl-9 pr-4 py-2 text-xs text-ag-white focus:outline-none focus:border-ag-purple"
                    />
                  </div>

                  {/* Filters & Actions */}
                  <div className="flex flex-wrap gap-3 w-full md:w-auto items-center justify-end">
                    
                    {/* Store Filter */}
                    <select
                      value={selectedCouponStore}
                      onChange={(e) => setSelectedCouponStore(e.target.value)}
                      className="bg-ag-surface border border-ag-border text-xs rounded-lg px-3 py-2 text-ag-white focus:outline-none"
                    >
                      <option value="all">All Stores</option>
                      <option value="amazon">Amazon</option>
                      <option value="flipkart">Flipkart</option>
                      <option value="myntra">Myntra</option>
                      <option value="ajio">Ajio</option>
                      <option value="generic">Other / Generic</option>
                    </select>

                    {/* Type Filter */}
                    <select
                      value={selectedCouponType}
                      onChange={(e) => setSelectedCouponType(e.target.value)}
                      className="bg-ag-surface border border-ag-border text-xs rounded-lg px-3 py-2 text-ag-white focus:outline-none"
                    >
                      <option value="all">All Types</option>
                      <option value="store">Store-wide</option>
                      <option value="category">Category-level</option>
                      <option value="brand">Brand-level</option>
                      <option value="product">Product-level</option>
                      <option value="bank_offer">Bank Offer</option>
                    </select>

                    {/* Source Filter */}
                    <select
                      value={selectedCouponSource}
                      onChange={(e) => setSelectedCouponSource(e.target.value)}
                      className="bg-ag-surface border border-ag-border text-xs rounded-lg px-3 py-2 text-ag-white focus:outline-none"
                    >
                      <option value="all">All Sources</option>
                      <option value="scraped">Scraped</option>
                      <option value="admin">Admin Added</option>
                      <option value="affiliate">Affiliate Feed</option>
                    </select>

                    {/* Sync Affiliate Feed Button */}
                    <button
                      onClick={handleSyncAffiliate}
                      disabled={actionInProgress}
                      className="px-4 py-2 bg-ag-surface hover:bg-ag-surface/80 border border-ag-border hover:border-ag-green hover:text-ag-green rounded-lg text-xs font-bold text-ag-white transition-all cursor-pointer"
                    >
                      Sync Affiliate 🔄
                    </button>

                    {/* Add Coupon Button */}
                    <button
                      onClick={() => {
                        setEditingCoupon(null);
                        setCouponForm({
                          code: '',
                          description: '',
                          discountType: 'other',
                          discountValue: '',
                          couponType: 'store',
                          store: 'amazon',
                          category: '',
                          brand: '',
                          productUrl: '',
                          isVerified: true,
                          expiryDate: '',
                          isActive: true
                        });
                        setShowCouponModal(true);
                      }}
                      className="px-4 py-2 bg-ag-purple hover:bg-ag-violet rounded-lg text-xs font-black text-white transition-all cursor-pointer"
                    >
                      + Add Coupon
                    </button>
                  </div>
                </div>

                {/* Coupons Table */}
                <div className="glass-card overflow-hidden border border-ag-border">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-ag-black/50 border-b border-ag-border text-ag-muted font-bold text-[10px] uppercase tracking-wider">
                          <th className="px-6 py-4">Coupon Info</th>
                          <th className="px-6 py-4">Store</th>
                          <th className="px-6 py-4">Type</th>
                          <th className="px-6 py-4">Source</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Verified</th>
                          <th className="px-6 py-4">Expiry</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ag-border/50 text-xs text-ag-muted">
                        {couponsList.filter(c => {
                          const queryMatch = !couponSearch.trim() || 
                            (c.code || '').toLowerCase().includes(couponSearch.toLowerCase()) || 
                            c.description.toLowerCase().includes(couponSearch.toLowerCase());
                          const storeMatch = selectedCouponStore === 'all' || c.store === selectedCouponStore;
                          const typeMatch = selectedCouponType === 'all' || c.couponType === selectedCouponType;
                          const sourceMatch = selectedCouponSource === 'all' || c.source === selectedCouponSource;
                          return queryMatch && storeMatch && typeMatch && sourceMatch;
                        }).length === 0 ? (
                          <tr>
                            <td colSpan="8" className="px-6 py-12 text-center text-ag-muted font-semibold">
                              No coupons or offers found in database.
                            </td>
                          </tr>
                        ) : (
                          couponsList.filter(c => {
                            const queryMatch = !couponSearch.trim() || 
                              (c.code || '').toLowerCase().includes(couponSearch.toLowerCase()) || 
                              c.description.toLowerCase().includes(couponSearch.toLowerCase());
                            const storeMatch = selectedCouponStore === 'all' || c.store === selectedCouponStore;
                            const typeMatch = selectedCouponType === 'all' || c.couponType === selectedCouponType;
                            const sourceMatch = selectedCouponSource === 'all' || c.source === selectedCouponSource;
                            return queryMatch && storeMatch && typeMatch && sourceMatch;
                          }).map(coupon => (
                            <tr key={coupon._id} className="hover:bg-ag-surface/10 transition-colors">
                              
                              {/* Coupon Info */}
                              <td className="px-6 py-4">
                                <div className="space-y-1 max-w-sm">
                                  {coupon.code ? (
                                    <span className="font-extrabold bg-ag-purple/10 text-ag-purple border border-ag-purple/20 px-2 py-0.5 rounded text-[11px] uppercase tracking-wide">
                                      {coupon.code}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-ag-muted italic font-medium">Auto-applied offer / No code</span>
                                  )}
                                  <p className="text-ag-white font-semibold leading-relaxed text-[11px] mt-1">
                                    {coupon.description}
                                  </p>
                                  {coupon.discountValue && (
                                    <span className="text-[10px] text-ag-green font-bold block mt-0.5">
                                      Value: {coupon.discountType === 'percentage' ? `${coupon.discountValue}% off` : `₹${coupon.discountValue} off`}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Store */}
                              <td className="px-6 py-4 capitalize text-ag-white font-bold">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] border ${
                                  coupon.store === 'amazon' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                  coupon.store === 'flipkart' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                  coupon.store === 'myntra' ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' :
                                  coupon.store === 'ajio' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                  'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                }`}>
                                  {coupon.store}
                                </span>
                              </td>

                              {/* Type */}
                              <td className="px-6 py-4 capitalize font-semibold text-ag-muted">
                                {coupon.couponType.replace('_', ' ')}
                                {coupon.brand && <span className="block text-[10px] text-ag-purple mt-0.5 font-bold">Brand: {coupon.brand}</span>}
                                {coupon.category && <span className="block text-[10px] text-ag-purple mt-0.5 font-bold">Cat: {coupon.category}</span>}
                              </td>

                              {/* Source */}
                              <td className="px-6 py-4">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-wide uppercase ${
                                  coupon.source === 'scraped' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                  coupon.source === 'affiliate' ? 'bg-purple-500/10 text-ag-purple border border-ag-purple/20' :
                                  'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                }`}>
                                  {coupon.source}
                                </span>
                              </td>

                              {/* Status */}
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => handleToggleActive(coupon)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                    coupon.isActive 
                                      ? 'bg-ag-green/20 text-ag-green border border-ag-green/20 hover:bg-ag-red/20 hover:text-ag-red hover:border-ag-red/20' 
                                      : 'bg-ag-red/20 text-ag-red border border-ag-red/20 hover:bg-ag-green/20 hover:text-ag-green hover:border-ag-green/20'
                                  }`}
                                >
                                  {coupon.isActive ? 'Active' : 'Paused'}
                                </button>
                              </td>

                              {/* Verified */}
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => handleToggleVerification(coupon)}
                                  className={`px-2.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                                    coupon.isVerified 
                                      ? 'bg-ag-green/10 text-ag-green border border-ag-green/20' 
                                      : 'bg-ag-muted/10 text-ag-muted border border-ag-border'
                                  }`}
                                >
                                  <span>{coupon.isVerified ? '✅ Verified' : '❓ Unverified'}</span>
                                </button>
                              </td>

                              {/* Expiry */}
                              <td className="px-6 py-4 text-ag-muted font-medium">
                                {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'Never'}
                              </td>

                              {/* Actions */}
                              <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                <button
                                  onClick={() => {
                                    setEditingCoupon(coupon);
                                    setCouponForm({
                                      code: coupon.code,
                                      description: coupon.description,
                                      discountType: coupon.discountType || 'other',
                                      discountValue: coupon.discountValue || '',
                                      couponType: coupon.couponType,
                                      store: coupon.store,
                                      category: coupon.category || '',
                                      brand: coupon.brand || '',
                                      productUrl: coupon.productUrl || '',
                                      isVerified: coupon.isVerified,
                                      expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
                                      isActive: coupon.isActive
                                    });
                                    setShowCouponModal(true);
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg border border-ag-border hover:border-ag-purple hover:bg-ag-purple/5 text-[10px] font-bold text-ag-white transition-all cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteCoupon(coupon)}
                                  className="px-2.5 py-1.5 rounded-lg border border-ag-border hover:border-ag-red hover:bg-ag-red/5 text-[10px] font-bold text-ag-red transition-all cursor-pointer"
                                >
                                  Delete
                                </button>
                              </td>

                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT 6: HOME PRODUCTS */}
            {activeTab === 'homeProducts' && (
              <div className="space-y-6 fade-in-up flex flex-col items-center justify-center py-16 text-center max-w-xl mx-auto">
                <span className="text-5xl block animate-pulse">🏠</span>
                <div className="space-y-2">
                  <h3 className="font-extrabold text-lg text-ag-white">Home Page Product Catalog</h3>
                  <p className="text-xs text-ag-muted leading-relaxed">
                    Publish products directly to the main catalog on the home page. Paste a product URL from a supported store, fetch its details, and verify before pinning it to the homepage.
                  </p>
                </div>
                <button
                  onClick={handleOpenHomeProductModal}
                  className="px-6 py-3 bg-ag-purple hover:bg-ag-violet rounded-xl text-xs font-black text-white transition-all cursor-pointer shadow-lg shadow-ag-purple/20 flex items-center space-x-2 animate-scale-up"
                >
                  <span>➕</span>
                  <span>Add Product to Home Page</span>
                </button>
              </div>
            )}

          </>
        )}

      </div>

      {/* Coupon Creation / Editing Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg overflow-hidden border border-ag-border shadow-2xl animate-scale-up">
            
            <div className="px-6 py-4 border-b border-ag-border bg-ag-black/50 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-ag-white">
                {editingCoupon ? 'Edit Coupon Code / Offer' : 'Create New Coupon / Offer'}
              </h3>
              <button
                onClick={() => {
                  setShowCouponModal(false);
                  setEditingCoupon(null);
                }}
                className="text-ag-muted hover:text-ag-white text-base focus:outline-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {/* Store & Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-ag-muted uppercase tracking-wider block mb-1">Store *</label>
                  <select
                    value={couponForm.store}
                    onChange={(e) => setCouponForm(prev => ({ ...prev, store: e.target.value }))}
                    className="w-full bg-ag-black border border-ag-border rounded-lg px-3 py-2.5 text-xs text-ag-white focus:outline-none focus:border-ag-purple"
                    required
                  >
                    <option value="amazon">Amazon</option>
                    <option value="flipkart">Flipkart</option>
                    <option value="myntra">Myntra</option>
                    <option value="ajio">Ajio</option>
                    <option value="croma">Croma</option>
                    <option value="reliancedigital">Reliance Digital</option>
                    <option value="vijaysales">Vijay Sales</option>
                    <option value="generic">Other / Generic</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-ag-muted uppercase tracking-wider block mb-1">Coupon Type *</label>
                  <select
                    value={couponForm.couponType}
                    onChange={(e) => setCouponForm(prev => ({ ...prev, couponType: e.target.value }))}
                    className="w-full bg-ag-black border border-ag-border rounded-lg px-3 py-2.5 text-xs text-ag-white focus:outline-none focus:border-ag-purple"
                    required
                  >
                    <option value="store">Store-level</option>
                    <option value="category">Category-level</option>
                    <option value="brand">Brand-level</option>
                    <option value="product">Product-level</option>
                    <option value="bank_offer">Bank Offer</option>
                  </select>
                </div>
              </div>

              {/* Code & Description */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="text-[10px] font-bold text-ag-muted uppercase tracking-wider block mb-1">Promo Code</label>
                  <input
                    type="text"
                    value={couponForm.code}
                    onChange={(e) => setCouponForm(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="e.g. SAVE20"
                    className="w-full bg-ag-black border border-ag-border rounded-lg px-3 py-2.5 text-xs text-ag-white focus:outline-none focus:border-ag-purple placeholder:text-ag-muted uppercase font-bold"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-ag-muted uppercase tracking-wider block mb-1">Offer Description *</label>
                  <input
                    type="text"
                    value={couponForm.description}
                    onChange={(e) => setCouponForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="e.g. 10% instant discount up to ₹1250 on HDFC Cards"
                    className="w-full bg-ag-black border border-ag-border rounded-lg px-3 py-2.5 text-xs text-ag-white focus:outline-none focus:border-ag-purple placeholder:text-ag-muted"
                    required
                  />
                </div>
              </div>

              {/* Discount Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-ag-muted uppercase tracking-wider block mb-1">Discount Type</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm(prev => ({ ...prev, discountType: e.target.value }))}
                    className="w-full bg-ag-black border border-ag-border rounded-lg px-3 py-2.5 text-xs text-ag-white focus:outline-none focus:border-ag-purple"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                    <option value="other">Other / Custom</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-ag-muted uppercase tracking-wider block mb-1">Discount Value</label>
                  <input
                    type="number"
                    step="any"
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm(prev => ({ ...prev, discountValue: e.target.value }))}
                    placeholder="e.g. 10 or 500"
                    className="w-full bg-ag-black border border-ag-border rounded-lg px-3 py-2.5 text-xs text-ag-white focus:outline-none focus:border-ag-purple placeholder:text-ag-muted"
                  />
                </div>
              </div>

              {/* Conditional Fields: Brand, Category, Product URL */}
              {couponForm.couponType === 'brand' && (
                <div>
                  <label className="text-[10px] font-bold text-ag-muted uppercase tracking-wider block mb-1">Brand Name *</label>
                  <input
                    type="text"
                    value={couponForm.brand}
                    onChange={(e) => setCouponForm(prev => ({ ...prev, brand: e.target.value }))}
                    placeholder="e.g. Sony, Nike, Samsung"
                    className="w-full bg-ag-black border border-ag-border rounded-lg px-3 py-2.5 text-xs text-ag-white focus:outline-none focus:border-ag-purple"
                    required
                  />
                </div>
              )}

              {couponForm.couponType === 'category' && (
                <div>
                  <label className="text-[10px] font-bold text-ag-muted uppercase tracking-wider block mb-1">Category *</label>
                  <input
                    type="text"
                    value={couponForm.category}
                    onChange={(e) => setCouponForm(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g. Electronics, Fashion, Books"
                    className="w-full bg-ag-black border border-ag-border rounded-lg px-3 py-2.5 text-xs text-ag-white focus:outline-none focus:border-ag-purple"
                    required
                  />
                </div>
              )}

              {couponForm.couponType === 'product' && (
                <div>
                  <label className="text-[10px] font-bold text-ag-muted uppercase tracking-wider block mb-1">Product Page URL *</label>
                  <input
                    type="url"
                    value={couponForm.productUrl}
                    onChange={(e) => setCouponForm(prev => ({ ...prev, productUrl: e.target.value }))}
                    placeholder="e.g. https://www.amazon.in/dp/B0CHX2F28B"
                    className="w-full bg-ag-black border border-ag-border rounded-lg px-3 py-2.5 text-xs text-ag-white focus:outline-none focus:border-ag-purple placeholder:text-ag-muted"
                    required
                  />
                </div>
              )}

              {/* Expiry Date */}
              <div>
                <label className="text-[10px] font-bold text-ag-muted uppercase tracking-wider block mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={couponForm.expiryDate}
                  onChange={(e) => setCouponForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                  className="w-full bg-ag-black border border-ag-border rounded-lg px-3 py-2.5 text-xs text-ag-white focus:outline-none focus:border-ag-purple"
                />
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center space-x-2 text-xs font-bold text-ag-white cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={couponForm.isVerified}
                    onChange={(e) => setCouponForm(prev => ({ ...prev, isVerified: e.target.checked }))}
                    className="rounded text-ag-purple focus:ring-ag-purple focus:ring-opacity-20 h-4 w-4 bg-ag-black border-ag-border"
                  />
                  <span>Mark as Verified</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-bold text-ag-white cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={couponForm.isActive}
                    onChange={(e) => setCouponForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded text-ag-purple focus:ring-ag-purple focus:ring-opacity-20 h-4 w-4 bg-ag-black border-ag-border"
                  />
                  <span>Set Active</span>
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-ag-border/50">
                <button
                  type="button"
                  onClick={() => {
                    setShowCouponModal(false);
                    setEditingCoupon(null);
                  }}
                  className="px-4 py-2 border border-ag-border hover:bg-ag-surface/50 text-ag-muted hover:text-ag-white text-xs font-extrabold rounded-lg transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionInProgress}
                  className="px-5 py-2 bg-ag-purple hover:bg-ag-violet text-white text-xs font-extrabold rounded-lg shadow-md shadow-ag-purple/10 transition-all cursor-pointer disabled:opacity-50 font-black"
                >
                  {actionInProgress ? 'Saving...' : 'Save Coupon'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Home Product Creation Modal */}
      {showHomeProductModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg overflow-hidden border border-ag-border shadow-2xl animate-scale-up">
            
            <div className="px-6 py-4 border-b border-ag-border bg-ag-black/50 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-ag-white">
                Add Product to Home Catalog
              </h3>
              <button
                onClick={() => {
                  setShowHomeProductModal(false);
                  setFetchedHomeProduct(null);
                  setFetchHomeProductError(null);
                }}
                className="text-ag-muted hover:text-ag-white text-base focus:outline-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* URL Input and Fetch Button */}
              <form onSubmit={handleFetchHomeProductDetails} className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-ag-muted uppercase tracking-wider block mb-1">
                    Product Page URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={homeProductUrl}
                      onChange={(e) => setHomeProductUrl(e.target.value)}
                      placeholder="Paste Amazon, Flipkart, Myntra, Ajio URL..."
                      className="flex-grow bg-ag-black border border-ag-border rounded-lg px-3 py-2.5 text-xs text-ag-white focus:outline-none focus:border-ag-purple"
                      required
                      disabled={isFetchingHomeProduct}
                    />
                    <button
                      type="submit"
                      disabled={isFetchingHomeProduct}
                      className="px-4 py-2 bg-ag-purple hover:bg-ag-purple/90 disabled:bg-ag-purple/50 rounded-lg text-xs font-black text-white transition-all cursor-pointer flex items-center justify-center min-w-[90px]"
                    >
                      {isFetchingHomeProduct ? 'Fetching...' : 'Fetch Info'}
                    </button>
                  </div>
                </div>
              </form>

              {/* Fetching status loader */}
              {isFetchingHomeProduct && (
                <div className="py-6 flex items-center justify-center">
                  <LoadingSpinner size={24} label="Scraping product page..." />
                </div>
              )}

              {/* Error feedback */}
              {fetchHomeProductError && (
                <div className="p-3 bg-ag-red/10 border border-ag-red/20 rounded-lg text-xs font-bold text-ag-red text-center">
                  {fetchHomeProductError}
                </div>
              )}

              {/* Fetched Product Details Preview */}
              {fetchedHomeProduct && (
                <div className="space-y-4 border border-ag-border bg-ag-black/30 p-4 rounded-xl">
                  <div className="flex gap-3">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-ag-black/50 border border-ag-border rounded-lg flex items-center justify-center p-1.5 overflow-hidden flex-shrink-0">
                      {fetchedHomeProduct.imageUrl ? (
                        <img
                          src={fetchedHomeProduct.imageUrl}
                          alt={fetchedHomeProduct.productName}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <span className="text-xl">📦</span>
                      )}
                    </div>

                    {/* Product Meta */}
                    <div className="space-y-1 flex-grow">
                      <div className="flex justify-between items-start gap-2">
                        <span className="inline-block bg-ag-purple/10 text-ag-purple border border-ag-purple/20 text-[9px] font-bold uppercase px-2 py-0.5 rounded">
                          {fetchedHomeProduct.site}
                        </span>
                        <span className="text-xs font-black text-ag-green">
                          {fetchedHomeProduct.price !== null ? `₹${fetchedHomeProduct.price.toLocaleString('en-IN')}` : 'Out of Stock'}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-ag-white line-clamp-2">
                        {fetchedHomeProduct.productName}
                      </h4>
                    </div>
                  </div>

                  {/* Add to home page action */}
                  <div className="pt-3 border-t border-ag-border/50 flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setShowHomeProductModal(false);
                        setFetchedHomeProduct(null);
                      }}
                      className="px-4 py-2 border border-ag-border hover:border-ag-white rounded-lg text-xs font-bold text-ag-muted hover:text-ag-white transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddHomeProduct}
                      className="px-5 py-2 bg-ag-green hover:bg-ag-green/90 rounded-lg text-xs font-black text-white transition-all cursor-pointer flex items-center space-x-1"
                    >
                      <span>✓ Add to Home Page</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {dialog && <CustomPopup />}
    </div>
  );
};

export default AdminDashboard;
