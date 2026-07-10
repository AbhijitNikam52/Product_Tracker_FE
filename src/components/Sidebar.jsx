import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import useStore from '../store/useStore';

const Sidebar = () => {
  const { isSidebarOpen, closeSidebar } = useStore();
  const location = useLocation();

  if (!isSidebarOpen) return null;

  const links = [
    { name: 'Home', path: '/home', icon: '🏠' },
    { name: 'Product Search', path: '/search', icon: '🔍' },
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Compare Prices', path: '/compare', icon: '⚖️' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Background Overlay */}
      <div 
        onClick={closeSidebar}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
      />

      {/* Sidebar Content */}
      <div className="relative flex flex-col w-72 max-w-xs bg-ag-surface border-r border-ag-border h-full p-6 text-ag-white z-10 slide-right animate-pulse-slow">
        
        {/* Close Button Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2 select-none">
            <span className="text-ag-purple text-2xl font-black">⬇</span>
            <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-ag-purple to-ag-violet bg-clip-text text-transparent">
              Antigravity Nav
            </span>
          </div>
          <button 
            onClick={closeSidebar}
            className="w-8 h-8 rounded-full border border-ag-border hover:border-ag-purple flex items-center justify-center text-ag-muted hover:text-ag-white transition-colors focus:outline-none text-sm"
          >
            ✕
          </button>
        </div>

        {/* Navigation Link list */}
        <nav className="space-y-2 flex-grow">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={closeSidebar}
                className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all duration-150 ${
                  isActive 
                    ? 'bg-ag-purple text-white shadow-lg shadow-ag-purple/20' 
                    : 'text-ag-muted hover:text-ag-white hover:bg-ag-black/40 border border-transparent hover:border-ag-border'
                }`}
              >
                <span className="text-base">{link.icon}</span>
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="border-t border-ag-border/50 pt-4 text-[10px] text-ag-muted font-bold tracking-wider uppercase text-center">
          © 2026 Antigravity v1.2
        </div>

      </div>
    </div>
  );
};

export default Sidebar;
