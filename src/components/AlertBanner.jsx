import React, { useState } from 'react';
import useStore from '../store/useStore';
import client from '../api/client';

const AlertBanner = () => {
  const { unreadCount, markAllRead } = useStore();
  const [isDismissing, setIsDismissing] = useState(false);

  if (unreadCount === 0 || isDismissing) return null;

  const handleMarkAllRead = async () => {
    setIsDismissing(true);
    try {
      await client.patch('/api/notifications/mark-read');
      // Delay state change slightly to allow exit animation
      setTimeout(() => {
        markAllRead();
        setIsDismissing(false);
      }, 200);
    } catch (err) {
      console.error('Error marking all as read from banner', err);
      setIsDismissing(false);
    }
  };

  return (
    <div
      className={`w-full bg-[#12121A] border-y border-ag-border border-l-4 border-l-gradient bg-gradient-to-r from-ag-purple/10 to-transparent transition-all duration-200 ${
        isDismissing ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0 slide-down'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 md:px-8 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">🎉</span>
          <p className="text-sm font-semibold text-ag-white">
            {unreadCount} price drop alert{unreadCount > 1 ? 's' : ''}! Check your tracked products below.
          </p>
        </div>
        
        <button
          onClick={handleMarkAllRead}
          className="text-xs font-bold text-ag-purple hover:text-ag-violet hover:underline focus:outline-none transition-colors duration-150"
        >
          Mark all read
        </button>
      </div>
    </div>
  );
};

export default AlertBanner;
