import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import client from '../api/client';
import { toast } from 'react-toastify';

import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import AlertBanner from '../components/AlertBanner';
import LoadingSpinner from '../components/LoadingSpinner';
import CustomPopup from '../components/CustomPopup';
import Pagination from '../components/Pagination';

// Recharts imports for premium analytics graphs
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
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
    closeDialog,
    savedProducts,
    setSavedProducts,
    saveProduct,
    removeSavedProduct
  } = useStore();

  // Tab State: 'overview' | 'users' | 'items' | 'comparisons' | 'homeProducts' | 'syncAudit'
  const [activeTab, setActiveTab] = useState('overview');

  // Realtime Price Sync & Audit States
  const [syncReportsList, setSyncReportsList] = useState([]);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncProgressMsg, setSyncProgressMsg] = useState('');
  const [selectedReportModal, setSelectedReportModal] = useState(null);
  const [isFetchingReportModal, setIsFetchingReportModal] = useState(false);
  const [logSearchTerm, setLogSearchTerm] = useState('');
  const [logFilterType, setLogFilterType] = useState('ALL');

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
  
  // UI Loaders
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // Search & Filtering State
  const [userSearch, setUserSearch] = useState('');
  const [itemSearch, setItemSearch] = useState('');
  const [compareSearch, setCompareSearch] = useState('');
  const [selectedSite, setSelectedSite] = useState('all');

  // Pagination State for Each Tab (Default 10 records per page)
  const [userPage, setUserPage] = useState(1);
  const [userItemsPerPage, setUserItemsPerPage] = useState(10);

  const [itemPage, setItemPage] = useState(1);
  const [itemItemsPerPage, setItemItemsPerPage] = useState(10);

  const [comparePage, setComparePage] = useState(1);
  const [compareItemsPerPage, setCompareItemsPerPage] = useState(10);

  // Auto Reset Page on Filter/Search Change
  useEffect(() => setUserPage(1), [userSearch]);
  useEffect(() => setItemPage(1), [itemSearch, selectedSite]);
  useEffect(() => setComparePage(1), [compareSearch]);

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

  // Fetch Saved/Home Products
  const fetchHomeProducts = async () => {
    try {
      const res = await client.get('/api/saved-products');
      setSavedProducts(res.data);
    } catch (err) {
      console.error('Error fetching saved products:', err);
    }
  };

  // Fetch Sync Reports History
  const fetchSyncReports = async () => {
    try {
      const res = await client.get('/api/admin/sync-reports');
      setSyncReportsList(res.data);
    } catch (err) {
      console.error('Error fetching sync reports:', err);
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
        fetchHomeProducts(),
        fetchSyncReports()
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

  // Bulk Price Scraper Sync Actions
  const handleRunLiveBulkSync = async () => {
    showConfirm(
      'Run Realtime Bulk Price Sync?',
      `This will scrape live product pages for all ${itemsList.length} tracked items, update changed prices (e.g. ₹300 ➔ ₹280), update stock availability, and save a full execution audit report. Proceed now?`,
      async () => {
        closeDialog();
        setIsSyncingAll(true);
        setSyncProgressMsg(`Scraping all ${itemsList.length} product pages in real-time...`);
        try {
          const res = await client.post('/api/admin/sync-all');
          triggerNotification(res.data.message || 'Live bulk price sync completed!');
          await Promise.all([
            fetchSyncReports(),
            fetchItems(),
            fetchDashboardStats()
          ]);
          if (res.data.report?._id) {
            handleViewReportDetails(res.data.report._id);
          }
        } catch (err) {
          console.error('Error during bulk price sync:', err);
          triggerNotification(err.response?.data?.error || 'Live bulk sync failed.', true);
        } finally {
          setIsSyncingAll(false);
          setSyncProgressMsg('');
        }
      },
      () => closeDialog()
    );
  };

  const handleViewReportDetails = async (reportId) => {
    setIsFetchingReportModal(true);
    setLogSearchTerm('');
    setLogFilterType('ALL');
    try {
      const res = await client.get(`/api/admin/sync-reports/${reportId}`);
      setSelectedReportModal(res.data);
    } catch (err) {
      console.error('Error fetching report details:', err);
      triggerNotification('Failed to load report console logs.', true);
    } finally {
      setIsFetchingReportModal(false);
    }
  };

  const handleDeleteSyncReport = (report) => {
    showConfirm(
      'Delete Sync Report Log?',
      `Are you sure you want to delete report log from ${new Date(report.startedAt).toLocaleString()}?`,
      async () => {
        closeDialog();
        try {
          await client.delete(`/api/admin/sync-reports/${report._id}`);
          setSyncReportsList(prev => prev.filter(r => r._id !== report._id));
          triggerNotification('Sync report log deleted.');
        } catch (err) {
          console.error(err);
          triggerNotification('Failed to delete sync report log.', true);
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

  // Full Database Search & Filter Calculations Across Whole Database
  const filteredHomeProducts = savedProducts.filter((prod) => {
    const title = prod.title || '';
    const matchesSearch = title.toLowerCase().includes(homeProductSearch.toLowerCase().trim());
    const matchesSite = selectedHomeProductSite === 'all' || prod.site === selectedHomeProductSite;
    return matchesSearch && matchesSite;
  });

  const filteredUsers = usersList.filter((u) => {
    const search = userSearch.toLowerCase().trim();
    if (!search) return true;
    return (
      (u.email || '').toLowerCase().includes(search) ||
      (u.name || '').toLowerCase().includes(search) ||
      (u.phone || '').toLowerCase().includes(search) ||
      (u.role || '').toLowerCase().includes(search) ||
      (u._id || '').toLowerCase().includes(search)
    );
  });

  const filteredItems = itemsList.filter((item) => {
    const search = itemSearch.toLowerCase().trim();
    const matchesSearch = !search || 
      (item.productName || '').toLowerCase().includes(search) ||
      (item.ownerEmail || '').toLowerCase().includes(search) ||
      (item.ownerName || '').toLowerCase().includes(search) ||
      (item.site || '').toLowerCase().includes(search) ||
      (item._id || '').toLowerCase().includes(search) ||
      (item.url || '').toLowerCase().includes(search);
    const matchesSite = selectedSite === 'all' || item.site === selectedSite;
    return matchesSearch && matchesSite;
  });

  const filteredComparisons = comparisonsList.filter((c) => {
    const search = compareSearch.toLowerCase().trim();
    if (!search) return true;
    const linksMatch = (c.links || []).some(link => 
      (link.url || '').toLowerCase().includes(search) ||
      (link.site || '').toLowerCase().includes(search)
    );
    return (
      (c.productName || '').toLowerCase().includes(search) ||
      (c.ownerEmail || '').toLowerCase().includes(search) ||
      (c.ownerName || '').toLowerCase().includes(search) ||
      (c._id || '').toLowerCase().includes(search) ||
      linksMatch
    );
  });

  const safeUserPage = Math.min(userPage, Math.max(1, Math.ceil(filteredUsers.length / userItemsPerPage)));
  const paginatedUsers = filteredUsers.slice(
    (safeUserPage - 1) * userItemsPerPage,
    safeUserPage * userItemsPerPage
  );

  const safeItemPage = Math.min(itemPage, Math.max(1, Math.ceil(filteredItems.length / itemItemsPerPage)));
  const paginatedItems = filteredItems.slice(
    (safeItemPage - 1) * itemItemsPerPage,
    safeItemPage * itemItemsPerPage
  );

  const safeComparePage = Math.min(comparePage, Math.max(1, Math.ceil(filteredComparisons.length / compareItemsPerPage)));
  const paginatedComparisons = filteredComparisons.slice(
    (safeComparePage - 1) * compareItemsPerPage,
    safeComparePage * compareItemsPerPage
  );

  // Stats calculation
  const metrics = dashboardData?.metrics || {};
  const siteStats = dashboardData?.siteStats || {};
  const categoryStats = dashboardData?.categoryStats || {};
  const sysInfo = dashboardData?.systemInfo || {};

  const categoryChartData = Object.entries(categoryStats).map(([name, value]) => ({
    name,
    value
  })).filter(item => item.value > 0);

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
              className="px-4 py-2.5 bg-ag-surface border border-ag-border rounded-xl text-xs font-bold text-ag-white hover:border-ag-purple transition-all flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
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
            <button onClick={() => setActionMessage(null)} className="text-ag-muted hover:text-white ml-2 cursor-pointer">✕</button>
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
                { id: 'homeProducts', name: 'Add Home Products', icon: '🏠' },
                { id: 'syncAudit', name: `Realtime Price Sync & Audit (${syncReportsList.length})`, icon: '⚡' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-xs font-black transition-all border-b-2 flex items-center space-x-1.5 -mb-px whitespace-nowrap cursor-pointer ${
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
                    onChange={(e) => {
                      setUserSearch(e.target.value);
                      setUserPage(1);
                    }}
                    placeholder="Search users by email, name, phone, or database ID..."
                    className="w-full bg-ag-surface/55 border border-ag-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-ag-white focus:outline-none focus:border-ag-purple focus:ring-1 focus:ring-ag-purple transition-all"
                  />
                </div>

                {/* Table Container */}
                <div className="glass-card overflow-hidden bg-ag-surface/20 border border-ag-border rounded-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
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
                        {paginatedUsers.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="px-6 py-12 text-center text-ag-muted font-bold">
                              No users match search criterion in entire database.
                            </td>
                          </tr>
                        ) : (
                          paginatedUsers.map((user) => (
                            <tr key={user._id} className="hover:bg-ag-surface/10 transition-colors">
                              
                              {/* Email & Name */}
                              <td className="px-6 py-4">
                                <div className="font-bold text-ag-white" title={user.email}>{user.email}</div>
                                <div className="text-[10px] text-ag-muted mt-0.5 font-medium">
                                  {user.name ? `Name: ${user.name}` : 'No profile name'}
                                  {user.phone && ` | Phone: ${user.phone}`}
                                </div>
                              </td>

                              {/* DB ID */}
                              <td className="px-6 py-4 font-mono text-[10px] text-ag-muted" title={user._id}>
                                {user._id}
                              </td>

                              {/* Registered At */}
                              <td className="px-6 py-4 text-ag-muted whitespace-nowrap">
                                {new Date(user.createdAt).toLocaleDateString()}
                              </td>

                              {/* Role Badge */}
                              <td className="px-6 py-4 whitespace-nowrap">
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
                              <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
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

                {/* Pagination Controls */}
                <Pagination
                  currentPage={safeUserPage}
                  totalItems={filteredUsers.length}
                  itemsPerPage={userItemsPerPage}
                  onPageChange={setUserPage}
                  onItemsPerPageChange={setUserItemsPerPage}
                  presetSizes={[10, 25, 50, 100, 200, 500]}
                />

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
                      onChange={(e) => {
                        setItemSearch(e.target.value);
                        setItemPage(1);
                      }}
                      placeholder="Search items by product name, URL, owner email..."
                      className="w-full bg-ag-surface/55 border border-ag-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-ag-white focus:outline-none focus:border-ag-purple focus:ring-1 focus:ring-ag-purple transition-all"
                    />
                  </div>

                  {/* Retailers Selector Pills */}
                  <div className="flex flex-wrap gap-1">
                    {['all', 'amazon', 'flipkart', 'myntra', 'ajio', 'meesho'].map((site) => (
                      <button
                        key={site}
                        onClick={() => {
                          setSelectedSite(site);
                          setItemPage(1);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-bold capitalize transition-all border cursor-pointer ${
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
                <div className="glass-card overflow-hidden bg-ag-surface/20 border border-ag-border rounded-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
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
                        {paginatedItems.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="px-6 py-12 text-center text-ag-muted font-bold">
                              No products match search criterion in entire database.
                            </td>
                          </tr>
                        ) : (
                          paginatedItems.map((item) => (
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
                                      title={item.url}
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
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-[9px] font-black uppercase bg-ag-purple/10 border border-ag-purple/20 text-ag-purple px-2 py-0.5 rounded">
                                  {item.site || 'retailer'}
                                </span>
                              </td>

                              {/* Owner Info */}
                              <td className="px-6 py-4 text-ag-white">
                                <span className="font-semibold block truncate max-w-[180px]" title={item.ownerEmail}>{item.ownerEmail}</span>
                                {item.ownerName && (
                                  <span className="block text-[9px] text-ag-muted mt-0.5 font-medium">({item.ownerName})</span>
                                )}
                              </td>

                              {/* Target Price */}
                              <td className="px-6 py-4 font-black text-ag-white whitespace-nowrap">
                                ₹{item.targetPrice?.toLocaleString('en-IN') || '0'}
                              </td>

                              {/* Current Price */}
                              <td className="px-6 py-4 whitespace-nowrap">
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
                              <td className="px-6 py-4 whitespace-nowrap">
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

                {/* Pagination Controls */}
                <Pagination
                  currentPage={safeItemPage}
                  totalItems={filteredItems.length}
                  itemsPerPage={itemItemsPerPage}
                  onPageChange={setItemPage}
                  onItemsPerPageChange={setItemItemsPerPage}
                  presetSizes={[10, 25, 50, 100, 200, 500]}
                />

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
                    onChange={(e) => {
                      setCompareSearch(e.target.value);
                      setComparePage(1);
                    }}
                    placeholder="Search comparisons by product title, URL, owner email..."
                    className="w-full bg-ag-surface/55 border border-ag-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-ag-white focus:outline-none focus:border-ag-purple focus:ring-1 focus:ring-ag-purple transition-all"
                  />
                </div>

                {/* Table Container */}
                <div className="glass-card overflow-hidden bg-ag-surface/20 border border-ag-border rounded-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[950px]">
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
                        {paginatedComparisons.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-6 py-12 text-center text-ag-muted font-bold">
                              No compared product logs match search criterion.
                            </td>
                          </tr>
                        ) : (
                          paginatedComparisons.map((comp) => (
                            <tr key={comp._id} className="hover:bg-ag-surface/10 transition-colors">
                              
                              {/* Title */}
                              <td className="px-6 py-4 font-bold text-ag-white max-w-xs">
                                <div className="truncate max-w-[200px]" title={comp.productName}>
                                  {comp.productName}
                                </div>
                                <span className="block text-[9px] text-ag-muted font-medium mt-1 font-mono">
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
                                        title={link.url}
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
                              <td className="px-6 py-4 text-ag-white whitespace-nowrap">
                                <span className="font-semibold">{comp.ownerEmail}</span>
                                {comp.ownerName && (
                                  <span className="block text-[9px] text-ag-muted mt-0.5 font-medium">({comp.ownerName})</span>
                                )}
                              </td>

                              {/* Created At */}
                              <td className="px-6 py-4 text-ag-muted whitespace-nowrap">
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

                {/* Pagination Controls */}
                <Pagination
                  currentPage={safeComparePage}
                  totalItems={filteredComparisons.length}
                  itemsPerPage={compareItemsPerPage}
                  onPageChange={setComparePage}
                  onItemsPerPageChange={setCompareItemsPerPage}
                  presetSizes={[10, 25, 50, 100, 200, 500]}
                />

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

            {/* TAB CONTENT 7: REALTIME PRICE SYNC & AUDIT */}
            {activeTab === 'syncAudit' && (
              <div className="space-y-6 fade-in-up">
                
                {/* Realtime Sync Action Box */}
                <div className="glass-card p-6 bg-gradient-to-r from-ag-surface/40 via-ag-purple/10 to-ag-surface/40 border border-ag-purple/30 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-ag-purple/5">
                  <div className="space-y-2 text-left max-w-2xl">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">⚡</span>
                      <h3 className="text-base font-black text-ag-white">Realtime Bulk Scraper Sync Engine</h3>
                      <span className="bg-ag-purple/20 text-ag-purple border border-ag-purple/30 text-[9px] font-black uppercase px-2 py-0.5 rounded">
                        Live Auto-Update
                      </span>
                    </div>
                    <p className="text-xs text-ag-muted leading-relaxed font-medium">
                      Trigger an automated real-time web scrape across all <strong className="text-ag-white">{itemsList.length} tracked products</strong> in your database. 
                      If a product's price changed (e.g. from <span className="text-ag-white font-bold">₹300 ➔ ₹280</span>), it updates the database, creates historical price points, updates stock availability, and triggers user alerts. Generates an inspection report with full console execution logs.
                    </p>
                  </div>

                  <button
                    onClick={handleRunLiveBulkSync}
                    disabled={isSyncingAll || actionInProgress || itemsList.length === 0}
                    className="px-6 py-3.5 bg-ag-purple hover:bg-ag-violet disabled:bg-ag-purple/50 rounded-xl text-xs font-black text-white transition-all cursor-pointer shadow-lg shadow-ag-purple/20 flex items-center space-x-2.5 flex-shrink-0 animate-scale-up disabled:cursor-not-allowed"
                  >
                    {isSyncingAll ? (
                      <>
                        <span className="animate-spin text-sm">🌀</span>
                        <span>Syncing {itemsList.length} Products...</span>
                      </>
                    ) : (
                      <>
                        <span>⚡</span>
                        <span>Run Live Bulk Price Sync Now</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Sync Progress Indicator */}
                {isSyncingAll && (
                  <div className="p-4 bg-ag-purple/10 border border-ag-purple/30 rounded-xl flex items-center justify-center space-x-3 text-xs font-bold text-ag-purple animate-pulse">
                    <span className="animate-spin text-sm">🌀</span>
                    <span>{syncProgressMsg || 'Scraping live product pages and updating price changes... Please keep window open.'}</span>
                  </div>
                )}

                {/* Audit Execution Reports History Table */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-ag-white">Execution Audit Reports History</h4>
                      <p className="text-[11px] text-ag-muted font-medium">
                        Chronological record of all bulk scraper sync runs with console log inspect options.
                      </p>
                    </div>
                    <button
                      onClick={fetchSyncReports}
                      className="px-3 py-1.5 bg-ag-surface border border-ag-border hover:border-ag-purple rounded-lg text-xs font-bold text-ag-white transition-all cursor-pointer flex items-center space-x-1"
                    >
                      <span>🔄</span>
                      <span>Refresh Reports</span>
                    </button>
                  </div>

                  <div className="glass-card overflow-hidden bg-ag-surface/20 border border-ag-border rounded-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[950px]">
                        <thead>
                          <tr className="bg-ag-black/50 border-b border-ag-border text-[10px] font-black text-ag-muted uppercase tracking-wider">
                            <th className="px-6 py-4">Execution Timestamp</th>
                            <th className="px-6 py-4">Triggered By</th>
                            <th className="px-6 py-4">Duration</th>
                            <th className="px-6 py-4 text-center">Products Checked</th>
                            <th className="px-6 py-4 text-center">Price Changes</th>
                            <th className="px-6 py-4 text-center">Stock / Errors</th>
                            <th className="px-6 py-4 text-right">Audit Console Logs</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-ag-border/50 text-xs">
                          {syncReportsList.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="px-6 py-12 text-center text-ag-muted font-bold">
                                No sync execution reports found yet. Click "Run Live Bulk Price Sync Now" to generate the first report.
                              </td>
                            </tr>
                          ) : (
                            syncReportsList.map((report) => (
                              <tr key={report._id} className="hover:bg-ag-surface/10 transition-colors">
                                
                                {/* Timestamp */}
                                <td className="px-6 py-4">
                                  <div className="font-bold text-ag-white">
                                    {new Date(report.startedAt).toLocaleString()}
                                  </div>
                                  <span className="text-[10px] text-ag-muted font-mono block mt-0.5">
                                    ID: {report._id}
                                  </span>
                                </td>

                                {/* Triggered By */}
                                <td className="px-6 py-4 font-semibold text-ag-muted whitespace-nowrap">
                                  {report.triggeredBy || 'Admin'}
                                </td>

                                {/* Duration */}
                                <td className="px-6 py-4 font-mono font-bold text-ag-purple whitespace-nowrap">
                                  {report.durationMs ? `${(report.durationMs / 1000).toFixed(1)}s` : 'N/A'}
                                </td>

                                {/* Total Products */}
                                <td className="px-6 py-4 text-center font-black text-ag-white">
                                  {report.summary?.totalProducts || 0}
                                </td>

                                {/* Price Changes (Updated Count) */}
                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                                    (report.summary?.updatedCount || 0) > 0
                                      ? 'bg-ag-green/20 text-ag-green border border-ag-green/30'
                                      : 'bg-ag-surface text-ag-muted border border-ag-border'
                                  }`}>
                                    {report.summary?.updatedCount || 0} Updated
                                  </span>
                                </td>

                                {/* Stock / Errors */}
                                <td className="px-6 py-4 text-center space-x-1.5 whitespace-nowrap">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                    {report.summary?.unavailableCount || 0} Stock
                                  </span>
                                  {(report.summary?.failedCount || 0) > 0 && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-ag-red/10 text-ag-red border border-ag-red/20">
                                      {report.summary?.failedCount} Errors
                                    </span>
                                  )}
                                </td>

                                {/* Action Buttons */}
                                <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                  <button
                                    onClick={() => handleViewReportDetails(report._id)}
                                    disabled={isFetchingReportModal}
                                    className="px-3 py-1.5 rounded-lg bg-ag-purple/10 border border-ag-purple/30 hover:bg-ag-purple/20 text-ag-purple text-[10px] font-black transition-all cursor-pointer flex items-center space-x-1 inline-flex"
                                  >
                                    <span>👁️</span>
                                    <span>View Execution Report</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSyncReport(report)}
                                    className="px-2.5 py-1.5 rounded-lg border border-ag-border hover:border-ag-red hover:bg-ag-red/5 text-[10px] font-bold text-ag-red transition-all cursor-pointer inline-flex"
                                    title="Delete report log"
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

              </div>
            )}

          </>
        )}

      </div>

      {/* Terminal Console Log Modal for Sync Execution Reports */}
      {selectedReportModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-5xl bg-[#090D16] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
            
            {/* High-tech Console Header */}
            <div className="px-6 py-4 bg-[#0F172A] border-b border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                {/* Mac OS dot buttons */}
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/80 block"></span>
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80 block"></span>
                  <span className="w-3 h-3 rounded-full bg-green-500/80 block"></span>
                </div>
                <div>
                  <h3 className="font-mono font-extrabold text-xs text-ag-white flex items-center space-x-2">
                    <span className="text-ag-green font-bold">root@pricedekho-scraper-audit:~#</span>
                    <span>Execution_Log_{new Date(selectedReportModal.startedAt).toISOString().split('T')[0]}.log</span>
                  </h3>
                  <p className="text-[10px] font-mono text-ag-muted mt-0.5">
                    Executed on {new Date(selectedReportModal.startedAt).toLocaleString()} ({((selectedReportModal.durationMs || 0) / 1000).toFixed(1)}s duration)
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedReportModal(null)}
                className="text-ag-muted hover:text-ag-white text-base focus:outline-none cursor-pointer self-end sm:self-auto"
              >
                ✕
              </button>
            </div>

            {/* Summary Bar */}
            <div className="px-6 py-2.5 bg-[#0C121E] border-b border-[#1E293B] flex flex-wrap items-center justify-between text-[11px] font-mono text-ag-muted gap-2">
              <div className="flex flex-wrap gap-4">
                <span>Total Checked: <strong className="text-ag-white">{selectedReportModal.summary?.totalProducts || 0}</strong></span>
                <span className="text-ag-green font-bold">Updated/Changed: <strong>{selectedReportModal.summary?.updatedCount || 0}</strong></span>
                <span className="text-ag-purple">Unchanged: <strong>{selectedReportModal.summary?.unchangedCount || 0}</strong></span>
                <span className="text-amber-400">Out of Stock: <strong>{selectedReportModal.summary?.unavailableCount || 0}</strong></span>
                <span className="text-ag-red">Errors: <strong>{selectedReportModal.summary?.failedCount || 0}</strong></span>
              </div>

              {/* Filter pills */}
              <div className="flex items-center space-x-1">
                {['ALL', 'PRICE_DROP', 'PRICE_RISE', 'UNCHANGED', 'UNAVAILABLE', 'ERROR'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setLogFilterType(type)}
                    className={`px-2 py-0.5 rounded text-[9px] font-black uppercase transition-all cursor-pointer ${
                      logFilterType === type 
                        ? 'bg-ag-purple text-white' 
                        : 'bg-[#162032] text-ag-muted hover:text-white'
                    }`}
                  >
                    {type.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Filter Bar */}
            <div className="px-6 py-2 bg-[#090D16] border-b border-[#1E293B]">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ag-muted text-xs font-mono">🔎</span>
                <input
                  type="text"
                  value={logSearchTerm}
                  onChange={(e) => setLogSearchTerm(e.target.value)}
                  placeholder="Filter console log lines by product title, store, or price..."
                  className="w-full bg-[#0F172A] border border-[#1E293B] rounded-lg pl-9 pr-4 py-1.5 text-xs font-mono text-ag-white focus:outline-none focus:border-ag-purple"
                />
              </div>
            </div>

            {/* Terminal Console Output Box */}
            <div className="p-6 bg-[#060911] overflow-y-auto font-mono text-xs space-y-2 flex-grow max-h-[60vh] leading-relaxed">
              {(() => {
                const logs = selectedReportModal.logs || [];
                const search = logSearchTerm.toLowerCase().trim();

                const filteredLogs = logs.filter((log) => {
                  const matchesSearch = !search ||
                    (log.productName || '').toLowerCase().includes(search) ||
                    (log.site || '').toLowerCase().includes(search) ||
                    (log.changeDetails || '').toLowerCase().includes(search);
                  
                  const matchesType = logFilterType === 'ALL' || log.logType === logFilterType;

                  return matchesSearch && matchesType;
                });

                if (filteredLogs.length === 0) {
                  return (
                    <div className="py-12 text-center text-ag-muted italic">
                      No console log entries match current filter criteria.
                    </div>
                  );
                }

                return filteredLogs.map((log, idx) => {
                  let badgeBg = 'bg-gray-500/10 text-gray-400 border-gray-500/30';
                  let badgeLabel = 'INFO';
                  let linePrefix = '🔵';

                  if (log.logType === 'PRICE_DROP') {
                    badgeBg = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-black';
                    badgeLabel = '🟢 PRICE DROPPED';
                    linePrefix = '📉';
                  } else if (log.logType === 'PRICE_RISE') {
                    badgeBg = 'bg-amber-500/20 text-amber-400 border-amber-500/40 font-black';
                    badgeLabel = '🟡 PRICE INCREASED';
                    linePrefix = '📈';
                  } else if (log.logType === 'UNAVAILABLE') {
                    badgeBg = 'bg-orange-500/20 text-orange-400 border-orange-500/40 font-black';
                    badgeLabel = '🟠 OUT OF STOCK';
                    linePrefix = '📦';
                  } else if (log.logType === 'ERROR') {
                    badgeBg = 'bg-rose-500/20 text-rose-400 border-rose-500/40 font-black';
                    badgeLabel = '🔴 SCRAPE ERROR';
                    linePrefix = '❌';
                  } else if (log.logType === 'UNCHANGED') {
                    badgeBg = 'bg-purple-500/10 text-ag-purple border-ag-purple/30 font-bold';
                    badgeLabel = '🔵 UNCHANGED';
                    linePrefix = '✓';
                  }

                  const timeStr = log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '';

                  return (
                    <div 
                      key={idx} 
                      className="p-3 bg-[#0B0F19] hover:bg-[#0E1524] border border-[#1E293B]/70 rounded-xl transition-colors space-y-1.5 text-[11px]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-ag-muted text-[10px] font-mono">[{timeStr}]</span>
                          <span className={`px-2 py-0.5 rounded border text-[9px] font-mono uppercase ${badgeBg}`}>
                            {badgeLabel}
                          </span>
                          <span className="uppercase text-[9px] font-black tracking-wide text-ag-purple bg-ag-purple/10 px-1.5 py-0.5 rounded border border-ag-purple/20">
                            {log.site}
                          </span>
                        </div>
                        
                        <a 
                          href={log.productUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-[10px] text-ag-purple hover:underline font-mono"
                        >
                          View Site Page ↗
                        </a>
                      </div>

                      <div className="text-ag-white font-bold flex items-start space-x-1.5">
                        <span className="text-xs">{linePrefix}</span>
                        <span className="leading-snug">{log.productName}</span>
                      </div>

                      <div className={`text-[11px] font-mono font-semibold ${
                        log.logType === 'PRICE_DROP' ? 'text-emerald-400' :
                        log.logType === 'PRICE_RISE' ? 'text-amber-400' :
                        log.logType === 'ERROR' ? 'text-rose-400' : 'text-ag-muted'
                      }`}>
                        {log.changeDetails}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-[#0F172A] border-t border-[#1E293B] flex justify-between items-center text-xs font-mono">
              <span className="text-ag-muted text-[11px]">
                Showing {selectedReportModal.logs?.length || 0} detailed execution line records.
              </span>
              <button
                onClick={() => setSelectedReportModal(null)}
                className="px-4 py-1.5 bg-[#1E293B] hover:bg-[#334155] text-white font-bold rounded-lg transition-all cursor-pointer"
              >
                Close Console Report
              </button>
            </div>

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
