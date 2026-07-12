import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import client from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';

const Login = () => {
  const { login } = useStore();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await client.post('/api/auth/login', {
        email,
        password
      });
      
      // Store credentials via Zustand
      login(response.data);
      
      // Go to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ag-black flex items-center justify-center p-4 relative">
      {/* Background Radial Glow */}
      <div className="absolute w-[400px] h-[400px] bg-ag-purple/5 rounded-full blur-[100px] pointer-events-none select-none" />

      <div className="w-full max-w-md glass-card p-8 bg-ag-surface/70 fade-in-up">
        
        {/* Logo and Branding Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 select-none mb-3">
            <span className="text-ag-purple text-3xl font-black">🏷️</span>
            <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-ag-purple to-ag-violet bg-clip-text text-transparent">
              PriceDekho
            </span>
          </div>
          <p className="text-xs text-ag-muted font-semibold uppercase tracking-wider">
            Track and save on prices in real-time
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-ag-muted uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              className="w-full bg-ag-black border border-ag-border rounded-xl px-4 py-3 text-sm text-ag-white focus:outline-none focus:border-ag-purple focus:ring-1 focus:ring-ag-purple transition-all"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-bold text-ag-muted uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-ag-black border border-ag-border rounded-xl px-4 py-3 text-sm text-ag-white focus:outline-none focus:border-ag-purple focus:ring-1 focus:ring-ag-purple transition-all"
              required
            />
          </div>

          {error && (
            <p className="text-xs font-bold text-ag-red bg-ag-red/10 py-2.5 px-3 rounded-lg animate-pulse text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary py-3.5 shadow-lg shadow-ag-purple/20 justify-center text-sm font-bold mt-2"
          >
            {isLoading ? (
              <LoadingSpinner size={16} color="#FFFFFF" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Navigation Link to Register */}
        <div className="text-center mt-6">
          <p className="text-xs text-ag-muted">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-bold text-ag-purple hover:text-ag-violet transition-colors underline decoration-ag-purple/30 hover:decoration-ag-violet"
            >
              Register Now
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
