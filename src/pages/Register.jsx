import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import client from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';

const Register = () => {
  const { login } = useStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await client.post('/api/auth/register', {
        email,
        password
      });

      // Log in user on successful sign up
      login(response.data);
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.error || 'Registration failed. Please check details.');
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
            <span className="text-ag-purple text-3xl font-black">⬇</span>
            <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-ag-purple to-ag-violet bg-clip-text text-transparent">
              Antigravity
            </span>
          </div>
          <p className="text-xs text-ag-muted font-semibold uppercase tracking-wider">
            Start saving on your shopping list
          </p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-ag-muted uppercase tracking-wider mb-1.5">
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
            <label htmlFor="password" className="block text-xs font-bold text-ag-muted uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              className="w-full bg-ag-black border border-ag-border rounded-xl px-4 py-3 text-sm text-ag-white focus:outline-none focus:border-ag-purple focus:ring-1 focus:ring-ag-purple transition-all"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-bold text-ag-muted uppercase tracking-wider mb-1.5">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
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
              'Create Account'
            )}
          </button>
        </form>

        {/* Link back to login */}
        <div className="text-center mt-6">
          <p className="text-xs text-ag-muted">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-ag-purple hover:text-ag-violet transition-colors underline decoration-ag-purple/30 hover:decoration-ag-violet"
            >
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Register;
