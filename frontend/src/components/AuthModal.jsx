import React, { useState } from 'react';
import { X, Mail, ShieldCheck, User, Phone, KeyRound, CheckCircle, ArrowRight, Lock, UserPlus, LogIn } from 'lucide-react';
import { api } from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  // Mode: 'LOGIN' | 'REGISTER' | 'OTP_REQUEST' | 'OTP_VERIFY'
  const [mode, setMode] = useState('LOGIN');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  // 1. Password Login (Permanent, secure across all devices)
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.login(email.trim().toLowerCase(), password);
      localStorage.setItem('apex_token', data.access_token);
      localStorage.setItem('apex_user', JSON.stringify(data.user));
      onAuthSuccess(data.user);
      onClose();
    } catch (err) {
      setError(err.message || 'Incorrect email or password');
    } finally {
      setLoading(false);
    }
  };

  // 2. Account Registration (Permanent account with password)
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const data = await api.register({
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        password: password
      });
      localStorage.setItem('apex_token', data.access_token);
      localStorage.setItem('apex_user', JSON.stringify(data.user));
      onAuthSuccess(data.user);
      onClose();
    } catch (err) {
      setError(err.message || 'Registration failed. This email may already be registered.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Request OTP Code
  const handleSendOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await api.sendOtp(email.trim().toLowerCase());
      setSuccessMsg(res.message || `Verification code sent to ${email}. Check your inbox or spam folder!`);
      setMode('OTP_VERIFY');
    } catch (err) {
      setError(err.message || 'Failed to send OTP code');
    } finally {
      setLoading(false);
    }
  };

  // 4. Verify OTP Code
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError('Please enter the 6-digit OTP code sent to your email');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const data = await api.verifyOtp(email.trim().toLowerCase(), otp.trim(), fullName, phone);
      localStorage.setItem('apex_token', data.access_token);
      localStorage.setItem('apex_user', JSON.stringify(data.user));
      onAuthSuccess(data.user);
      onClose();
    } catch (err) {
      setError(err.message || 'Invalid or expired verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-2xl p-6 sm:p-8 shadow-2xl max-h-[95vh] overflow-y-auto">
        {/* Mobile Pull Bar */}
        <div className="sm:hidden w-12 h-1 bg-neutral-700 rounded-full mx-auto mb-4" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab Navigation (Login vs Register) */}
        {(mode === 'LOGIN' || mode === 'REGISTER') && (
          <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-800 mb-6">
            <button
              type="button"
              onClick={() => { setMode('LOGIN'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'LOGIN' ? 'bg-emerald-600 text-white shadow-md' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('REGISTER'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'REGISTER' ? 'bg-emerald-600 text-white shadow-md' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
            {mode === 'REGISTER' ? <UserPlus className="w-6 h-6" /> : mode.startsWith('OTP') ? <Mail className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide">
            {mode === 'REGISTER'
              ? 'Join Apex Gaming Cafe'
              : mode === 'OTP_VERIFY'
              ? 'Enter Verification Code'
              : mode === 'OTP_REQUEST'
              ? 'Sign In with OTP'
              : 'Welcome Back, Gamer'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            {mode === 'REGISTER'
              ? 'Create a permanent account to save your bookings, passes & wallet balance'
              : mode === 'OTP_VERIFY'
              ? `Enter the 6-digit code sent to ${email}`
              : 'Sign in to access your stations, passes and balance'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        {successMsg && mode === 'OTP_VERIFY' && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1. SECURE PASSWORD LOGIN */}
        {mode === 'LOGIN' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-neutral-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500"
                  placeholder="yourname@gmail.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-neutral-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-50 text-sm flex items-center justify-center gap-2 mt-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-3 text-center border-t border-neutral-800 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => { setMode('OTP_REQUEST'); setError(''); }}
                className="text-neutral-400 hover:text-emerald-400 transition-colors cursor-pointer"
              >
                Sign in with Email OTP instead
              </button>
              <button
                type="button"
                onClick={() => { setMode('REGISTER'); setError(''); }}
                className="text-emerald-400 hover:underline cursor-pointer font-semibold"
              >
                New here? Sign up →
              </button>
            </div>
          </form>
        )}

        {/* 2. SECURE REGISTRATION */}
        {mode === 'REGISTER' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Gamer Name / Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. Alex Hunter"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-neutral-500" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500"
                  placeholder="+91 9876543210"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-neutral-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500"
                  placeholder="yourname@gmail.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Create Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-neutral-500" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500"
                  placeholder="Minimum 6 characters"
                />
              </div>
            </div>

            <div className="p-3 bg-neutral-950/70 rounded-xl border border-neutral-800/80 flex items-center gap-2 text-xs text-neutral-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Safe & Permanent: Your account is securely backed up and restored anytime you log in.</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-50 text-sm flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 3. REQUEST OTP (SECONDARY OPTION) */}
        {mode === 'OTP_REQUEST' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-neutral-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500"
                  placeholder="yourname@gmail.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-50 text-sm flex items-center justify-center gap-2 mt-2"
            >
              <span>{loading ? 'Sending Code...' : 'Send OTP to Email'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => { setMode('LOGIN'); setError(''); }}
                className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                ← Back to Password Sign In
              </button>
            </div>
          </form>
        )}

        {/* 4. VERIFY OTP */}
        {mode === 'OTP_VERIFY' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                6-Digit Verification Code
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.trim())}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-base tracking-widest font-mono text-emerald-400 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 text-center"
                  placeholder="••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-50 text-sm"
            >
              {loading ? 'Verifying Code...' : 'Verify & Sign In'}
            </button>

            <div className="flex items-center justify-between pt-2 text-xs">
              <button
                type="button"
                onClick={() => { setMode('OTP_REQUEST'); setError(''); }}
                className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                ← Change Email
              </button>
              <button
                type="button"
                onClick={handleSendOtp}
                className="text-emerald-400 hover:underline cursor-pointer"
              >
                Resend Code
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
