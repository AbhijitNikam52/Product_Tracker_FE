import React, { useState } from 'react';
import useStore from '../store/useStore';
import client from '../api/client';
import { toast } from 'react-toastify';

import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import AlertBanner from '../components/AlertBanner';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const { user, updateUser } = useStore();

  // Profile fields state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [emailNotifications, setEmailNotifications] = useState(user?.emailNotifications !== false);
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Password fields state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);
    setProfileLoading(true);

    try {
      const response = await client.put('/api/auth/profile', {
        name,
        phone,
        emailNotifications
      });

      // Update details in global Zustand store & localStorage
      updateUser({
        name: response.data.user.name,
        phone: response.data.user.phone,
        emailNotifications: response.data.user.emailNotifications
      });

      setProfileSuccess(true);
      toast.success('Profile details updated successfully!');
      // Auto-hide success message after 4 seconds
      setTimeout(() => setProfileSuccess(false), 4000);
    } catch (err) {
      console.error('Profile update error:', err);
      const errMsg = err.response?.data?.error || 'Failed to update profile settings.';
      setProfileError(errMsg);
      toast.error(errMsg);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!oldPassword || !newPassword || !confirmPassword) {
      const errMsg = 'Please fill in all password fields.';
      setPasswordError(errMsg);
      toast.error(errMsg);
      return;
    }

    if (newPassword.length < 6) {
      const errMsg = 'New password must be at least 6 characters long.';
      setPasswordError(errMsg);
      toast.error(errMsg);
      return;
    }

    if (newPassword !== confirmPassword) {
      const errMsg = 'New passwords do not match.';
      setPasswordError(errMsg);
      toast.error(errMsg);
      return;
    }

    setPasswordLoading(true);
    try {
      await client.put('/api/auth/profile', {
        oldPassword,
        newPassword
      });

      setPasswordSuccess(true);
      toast.success('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      // Auto-hide success message after 4 seconds
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (err) {
      console.error('Password change error:', err);
      const errMsg = err.response?.data?.error || 'Failed to change password. Double check old password.';
      setPasswordError(errMsg);
      toast.error(errMsg);
    } finally {
      setPasswordLoading(false);
    }
  };

  const getEmailInitial = () => {
    if (!user || !user.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-ag-black flex flex-col pb-16">
      <Navbar />
      <Sidebar />
      <AlertBanner />

      <div className="flex-grow max-w-4xl w-full mx-auto px-4 py-8 md:px-8">
        
        {/* Page Title Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-black text-ag-white leading-tight flex items-center space-x-2">
            <span className="text-ag-purple text-2xl">👤</span>
            <span>Account Settings</span>
          </h2>
          <p className="text-xs text-ag-muted font-semibold mt-1">
            Manage your personal profile details, notification preferences, and password security
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Column: User Summary Card */}
          <div className="md:col-span-1 space-y-6">
            <div className="glass-card p-6 text-center flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-ag-purple to-ag-violet flex items-center justify-center text-3xl font-black text-white shadow-xl select-none mb-4 ring-4 ring-ag-purple/20 animate-pulse-slow">
                {getEmailInitial()}
              </div>
              <h3 className="font-extrabold text-ag-white text-base truncate w-full" title={user?.name || 'Account User'}>
                {user?.name || 'Shopper Profile'}
              </h3>
              <p className="text-xs text-ag-muted font-semibold truncate w-full mb-4">
                {user?.email}
              </p>
              <div className="w-full pt-4 border-t border-ag-border/50 text-left space-y-3">
                <div>
                  <span className="block text-[9px] font-bold text-ag-muted uppercase tracking-wider">Account Status</span>
                  <span className="inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-ag-green/10 text-ag-green border border-ag-green/20">
                    Active Subscriber
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-ag-muted uppercase tracking-wider">Tracking Alerts</span>
                  <span className="text-[11px] font-semibold text-ag-white mt-0.5 block">
                    Enabled (Email Alerts Active)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Update Forms */}
          <div className="md:col-span-2 space-y-8">
            
            {/* Form 1: Profile Information */}
            <div className="glass-card p-6 shadow-xl">
              <h4 className="text-sm font-black text-ag-white mb-6 uppercase tracking-wider border-b border-ag-border/50 pb-2.5">
                Profile Details
              </h4>
              
              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-ag-muted uppercase tracking-wider mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full bg-ag-black border border-ag-border rounded-xl px-4 py-2.5 text-xs text-ag-white focus:outline-none focus:border-ag-purple focus:ring-1 focus:ring-ag-purple transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-ag-muted uppercase tracking-wider mb-2">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full bg-ag-black border border-ag-border rounded-xl px-4 py-2.5 text-xs text-ag-white focus:outline-none focus:border-ag-purple focus:ring-1 focus:ring-ag-purple transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-ag-muted uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full bg-ag-black/40 border border-ag-border/50 text-ag-muted rounded-xl px-4 py-2.5 text-xs cursor-not-allowed select-none"
                  />
                  <span className="text-[10px] text-ag-muted mt-1.5 block font-medium">
                    Registered email address cannot be changed.
                  </span>
                </div>

                {/* Notifications Preference */}
                <div className="pt-2">
                  <label className="flex items-start space-x-3 cursor-pointer group select-none">
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      className="mt-0.5 rounded border-ag-border bg-ag-black text-ag-purple focus:ring-ag-purple focus:ring-offset-ag-black h-4 w-4 accent-ag-purple cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-ag-white group-hover:text-ag-purple transition-colors">
                        Receive Email Drop Alerts
                      </span>
                      <p className="text-[10px] text-ag-muted mt-0.5 leading-relaxed">
                        Send automated email alerts to your inbox as soon as a monitored product's price hits your target price threshold.
                      </p>
                    </div>
                  </label>
                </div>

                {profileError && (
                  <p className="text-xs font-bold text-ag-red bg-ag-red/10 py-2 px-3 rounded-lg animate-pulse text-center">
                    {profileError}
                  </p>
                )}

                {profileSuccess && (
                  <p className="text-xs font-bold text-ag-green bg-ag-green/10 py-2 px-3 rounded-lg text-center">
                    ✓ Profile details saved successfully!
                  </p>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="btn-primary py-2.5 px-6 text-xs font-bold shadow-md shadow-ag-purple/15 flex items-center justify-center space-x-2"
                  >
                    {profileLoading ? (
                      <LoadingSpinner size={14} color="#FFFFFF" label="Saving..." />
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Form 2: Change Password */}
            <div className="glass-card p-6 shadow-xl">
              <h4 className="text-sm font-black text-ag-white mb-6 uppercase tracking-wider border-b border-ag-border/50 pb-2.5">
                Change Password
              </h4>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-ag-muted uppercase tracking-wider mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-ag-black border border-ag-border rounded-xl px-4 py-2.5 text-xs text-ag-white focus:outline-none focus:border-ag-purple focus:ring-1 focus:ring-ag-purple transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-ag-muted uppercase tracking-wider mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full bg-ag-black border border-ag-border rounded-xl px-4 py-2.5 text-xs text-ag-white focus:outline-none focus:border-ag-purple focus:ring-1 focus:ring-ag-purple transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-ag-muted uppercase tracking-wider mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full bg-ag-black border border-ag-border rounded-xl px-4 py-2.5 text-xs text-ag-white focus:outline-none focus:border-ag-purple focus:ring-1 focus:ring-ag-purple transition-all"
                    />
                  </div>
                </div>

                {passwordError && (
                  <p className="text-xs font-bold text-ag-red bg-ag-red/10 py-2 px-3 rounded-lg animate-pulse text-center">
                    {passwordError}
                  </p>
                )}

                {passwordSuccess && (
                  <p className="text-xs font-bold text-ag-green bg-ag-green/10 py-2 px-3 rounded-lg text-center">
                    ✓ Password updated successfully!
                  </p>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="btn-primary py-2.5 px-6 text-xs font-bold shadow-md shadow-ag-purple/15 flex items-center justify-center space-x-2"
                  >
                    {passwordLoading ? (
                      <LoadingSpinner size={14} color="#FFFFFF" label="Updating..." />
                    ) : (
                      <span>Update Password</span>
                    )}
                  </button>
                </div>
              </form>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Profile;
