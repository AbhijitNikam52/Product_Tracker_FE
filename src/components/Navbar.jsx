import React, { useState, useRef, useEffect } from 'react';
import useStore from '../store/useStore';
import client from '../api/client';

const Navbar = () => {
  const { 
    user, 
    logout, 
    notifications, 
    unreadCount, 
    markAllRead, 
    toggleSidebar,
    cart,
    removeFromCart,
    clearCart
  } = useStore();
  
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const dropdownRef = useRef(null);
  const cartDropdownRef = useRef(null);

  // Close dropdowns if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
      if (cartDropdownRef.current && !cartDropdownRef.current.contains(event.target)) {
        setIsCartOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotifClick = async () => {
    setIsNotifOpen(!isNotifOpen);
    setIsCartOpen(false); // Close cart when notification is opened
    if (!isNotifOpen && unreadCount > 0) {
      try {
        await client.patch('/api/notifications/mark-read');
        markAllRead();
      } catch (err) {
        console.error('Error marking notifications as read', err);
      }
    }
  };

  const handleCartClick = () => {
    setIsCartOpen(!isCartOpen);
    setIsNotifOpen(false); // Close notifications when cart is opened
  };

  const getEmailInitial = () => {
    if (!user || !user.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price || 0), 0);

  return (
    <nav className="sticky top-0 z-40 bg-[#0A0A0F]/95 backdrop-blur-md border-b border-ag-border px-4 py-3 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Hamburger */}
        <div className="flex items-center space-x-3 select-none">
          {user && (
            <button
              onClick={toggleSidebar}
              className="px-2.5 py-1.5 border border-ag-border hover:border-ag-purple rounded-xl text-lg font-black text-ag-muted hover:text-ag-white focus:outline-none transition-colors"
              title="Open Navigation Drawer"
            >
              ☰
            </button>
          )}

          <div className="flex items-center space-x-2">
            <span className="text-ag-purple text-2xl font-black flex items-center animate-bounce duration-1000">
              ⬇
            </span>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-ag-purple to-ag-violet bg-clip-text text-transparent">
              Antigravity
            </span>
          </div>
        </div>

        {/* User Actions */}
        {user && (
          <div className="flex items-center space-x-4">
            
            {/* Notification Center */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={handleNotifClick}
                className="relative p-2 text-ag-muted hover:text-ag-white focus:outline-none transition-colors duration-150"
                aria-label="Notifications"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-ag-red text-[10px] font-bold text-white ring-2 ring-[#0A0A0F]">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-ag-surface border border-ag-border rounded-2xl shadow-2xl py-2 z-50 slide-down">
                  <div className="px-4 py-2 border-b border-ag-border flex justify-between items-center">
                    <span className="font-bold text-sm text-ag-white">Price Alerts</span>
                    <span className="text-[11px] text-ag-muted font-medium">Last 20 updates</span>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-xs text-ag-muted">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          className={`px-4 py-3 border-b border-ag-border last:border-0 hover:bg-ag-black/40 transition-colors duration-150 ${
                            !notif.isRead ? 'border-l-2 border-l-ag-purple bg-ag-purple/5' : ''
                          }`}
                        >
                          <p className="text-xs text-ag-white leading-relaxed">{notif.message}</p>
                          <span className="text-[9px] text-ag-muted mt-1 block">
                            {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Shopping Cart Dropdown */}
            <div className="relative" ref={cartDropdownRef}>
              <button
                onClick={handleCartClick}
                className="relative p-2 text-ag-muted hover:text-ag-white focus:outline-none transition-colors duration-150"
                aria-label="Shopping Cart"
                title="View Shopping Cart"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                {cart.length > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-ag-purple text-[10px] font-bold text-white ring-2 ring-[#0A0A0F] animate-pulse-slow">
                    {cart.length}
                  </span>
                )}
              </button>

              {/* Cart Dropdown Menu */}
              {isCartOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-ag-surface border border-ag-border rounded-2xl shadow-2xl py-2 z-50 slide-down">
                  <div className="px-4 py-2 border-b border-ag-border flex justify-between items-center bg-[#0D0D14] rounded-t-2xl">
                    <span className="font-bold text-sm text-ag-white flex items-center space-x-1.5">
                      <span>🛒</span>
                      <span>Shopping Cart</span>
                    </span>
                    {cart.length > 0 && (
                      <button
                        onClick={clearCart}
                        className="text-[10px] font-black text-ag-red hover:underline uppercase tracking-wider bg-transparent border-0 cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto">
                    {cart.length === 0 ? (
                      <div className="px-4 py-12 text-center text-xs text-ag-muted">
                        <span className="text-3xl block mb-2">🛒</span>
                        Your cart is empty.
                      </div>
                    ) : (
                      cart.map((item) => (
                        <div
                          key={item.id}
                          className="px-4 py-3 border-b border-ag-border last:border-0 hover:bg-ag-black/40 transition-colors duration-150 flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-2.5 min-w-0 flex-grow pr-2">
                            <div className="w-10 h-10 bg-ag-black border border-ag-border rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt="Product Thumbnail"
                                  className="w-full h-full object-contain p-0.5"
                                />
                              ) : (
                                <span className="text-[10px]">📦</span>
                              )}
                            </div>
                            <div className="min-w-0 flex-grow">
                              <h5 className="text-[11px] font-bold text-ag-white truncate pr-1 leading-tight" title={item.title}>
                                {item.title}
                              </h5>
                              <div className="flex items-center space-x-1.5 mt-0.5 select-none">
                                <span className="text-[8px] px-1 rounded bg-ag-purple/20 text-ag-purple border border-ag-purple/20 uppercase font-black tracking-wider">
                                  {item.site}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2.5 flex-shrink-0">
                            <span className="text-[11px] font-black text-ag-green">
                              {item.price !== null ? `₹${item.price.toLocaleString('en-IN')}` : 'N/A'}
                            </span>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-ag-muted hover:text-ag-red transition-colors text-xs p-1 focus:outline-none"
                              title="Remove item"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {cart.length > 0 && (
                    <div className="p-4 border-t border-ag-border bg-[#0D0D14] rounded-b-2xl space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-ag-muted">Subtotal:</span>
                        <span className="font-black text-ag-green text-sm">
                          ₹{cartSubtotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <a
                          href={cart[0].productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full btn-primary text-center py-2 text-[10px] font-black justify-center cursor-pointer select-none"
                        >
                          Checkout First Item ↗
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Avatar & Email */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ag-purple to-ag-violet flex items-center justify-center text-sm font-bold text-white shadow-md select-none">
                {getEmailInitial()}
              </div>
              <span className="hidden md:inline text-sm font-medium text-ag-white/90 truncate max-w-[120px]">
                {user.email}
              </span>
            </div>

            {/* Divider */}
            <span className="h-4 w-px bg-ag-border hidden md:inline" />

            {/* Logout Button */}
            <button
              onClick={logout}
              className="text-sm font-medium text-ag-muted hover:text-ag-red transition-colors duration-150 px-2 py-1 rounded-lg hover:bg-ag-red/10"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
