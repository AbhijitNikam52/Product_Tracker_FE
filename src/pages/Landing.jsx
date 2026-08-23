import React from 'react';
import { Link } from 'react-router-dom';
import useStore from '../store/useStore';

const Landing = () => {
  const { user } = useStore();

  return (
    <div className="min-h-screen bg-ag-black flex flex-col justify-between overflow-x-hidden relative">
      
      {/* Background Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-ag-purple/10 rounded-full blur-[120px] pointer-events-none select-none" />
      <div className="absolute bottom-1/4 right-10 w-[300px] h-[300px] bg-ag-violet/5 rounded-full blur-[90px] pointer-events-none select-none" />

      {/* Top Navbar */}
      <header className="px-6 py-5 md:px-12 max-w-7xl mx-auto w-full flex items-center justify-between z-10">
        <div className="flex items-center space-x-2">
          <span className="text-ag-purple text-2xl font-black">🏷️</span>
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-ag-purple to-ag-violet bg-clip-text text-transparent">
            PriceDekho
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <Link
              to="/dashboard"
              className="text-sm font-semibold text-ag-white bg-ag-purple/20 border border-ag-purple/30 px-5 py-2.5 rounded-xl hover:bg-ag-purple/30 transition-all"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-ag-muted hover:text-ag-white transition-colors px-3 py-2"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold text-white bg-ag-purple px-5 py-2.5 rounded-xl hover:bg-ag-violet transition-all shadow-md shadow-ag-purple/15"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20 flex-grow flex flex-col justify-center items-center text-center z-10">
        <div className="max-w-3xl fade-in-up">
          
          {/* Big Headline */}
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-6 leading-[1.1]">
            Stop Paying <br className="md:hidden" />
            <span className="bg-gradient-to-r from-ag-purple to-ag-violet bg-clip-text text-transparent">
              Too Much.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-base md:text-lg text-ag-muted font-medium leading-relaxed max-w-2xl mx-auto mb-10">
            PriceDekho tracks prices across Amazon, Flipkart, Myntra, Ajio, Meesho and more. 
            Get alerted directly in your inbox the exact moment prices drop.
          </p>

          {/* Call To Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link
              to={user ? '/dashboard' : '/register'}
              className="w-full sm:w-auto btn-primary px-8 py-4 text-base shadow-lg shadow-ag-purple/25 flex items-center justify-center space-x-2"
            >
              <span>Start Tracking Free</span>
              <span className="text-lg">→</span>
            </Link>
            
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-4 border border-ag-border rounded-2xl text-base font-semibold text-ag-white hover:border-ag-purple hover:bg-ag-surface/30 transition-all flex items-center justify-center"
            >
              See How It Works
            </a>
          </div>

        </div>

        {/* Feature Cards Grid */}
        <section id="features" className="w-full pt-12 border-t border-ag-border/50 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            
            {/* Feature 1 */}
            <div className="glass-card p-6 flex flex-col h-full bg-[#12121A]/50">
              <div className="w-12 h-12 bg-ag-purple/10 border border-ag-purple/20 rounded-2xl flex items-center justify-center mb-5 text-xl">
                📈
              </div>
              <h3 className="font-extrabold text-lg text-ag-white mb-2">Price History</h3>
              <p className="text-sm text-ag-muted leading-relaxed">
                See 90 days of price movement at a glance. Identify trends and buy at the absolute lowest.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card p-6 flex flex-col h-full bg-[#12121A]/50">
              <div className="w-12 h-12 bg-ag-purple/10 border border-ag-purple/20 rounded-2xl flex items-center justify-center mb-5 text-xl">
                🔔
              </div>
              <h3 className="font-extrabold text-lg text-ag-white mb-2">Smart Alerts</h3>
              <p className="text-sm text-ag-muted leading-relaxed">
                Email and dashboard alerts triggered the microsecond your target threshold is breached.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card p-6 flex flex-col h-full bg-[#12121A]/50">
              <div className="w-12 h-12 bg-ag-purple/10 border border-ag-purple/20 rounded-2xl flex items-center justify-center mb-5 text-xl">
                🌐
              </div>
              <h3 className="font-extrabold text-lg text-ag-white mb-2">Multi-Site</h3>
              <p className="text-sm text-ag-muted leading-relaxed">
                Works on Amazon, Flipkart, Myntra, Ajio, Meesho and falls back gracefully for other stores.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="glass-card p-6 flex flex-col h-full bg-[#12121A]/50">
              <div className="w-12 h-12 bg-ag-purple/10 border border-ag-purple/20 rounded-2xl flex items-center justify-center mb-5 text-xl">
                ⚡
              </div>
              <h3 className="font-extrabold text-lg text-ag-white mb-2">Instant Refresh</h3>
              <p className="text-sm text-ag-muted leading-relaxed">
                Don't wait. Manually trigger a headless scrape to query current product prices on demand.
              </p>
            </div>

          </div>
        </section>
      </main>

      {/* Landing Footer */}
      <footer className="w-full text-center py-8 border-t border-ag-border/50 text-xs text-ag-muted z-10 bg-ag-black">
        © 2026 PriceDekho · Built for smart shoppers
      </footer>

    </div>
  );
};

export default Landing;
