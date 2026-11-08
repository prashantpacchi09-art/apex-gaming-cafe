import React, { useState } from 'react';
import { X, Mail, ShieldCheck, User, Phone, KeyRound, CheckCircle, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  // Step: 'EMAIL' | 'OTP' | 'PASSWORD'
  const [step, setStep] = useState('EMAIL');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [receivedOtp, setReceivedOtp] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  // Step 1: Send OTP to Gmail
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid Gmail address');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await api.sendOtp(email);
      setReceivedOtp(res.demo_otp || '');
      setSuccessMsg(`Verification code sent to ${email}`);
      setStep('OTP');
    } catch (err) {
      setError(err.message || 'Failed to send OTP code');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Sign In permanently
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setError('Please enter the 6-digit OTP code');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const data = await api.verifyOtp(email, otp, fullName, phone);
      // Permanent persistent storage
      localStorage.setItem('apex_token', data.access_token);
      localStorage.setItem('apex_user', JSON.stringify(data.user));
      onAuthSuccess(data.user);
      onClose();
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  // Fallback: Standard Password Login
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.login(email, password);
      localStorage.setItem('apex_token', data.access_token);
      localStorage.setItem('apex_user', JSON.stringify(data.user));
      onAuthSuccess(data.user);
      onClose();
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const autoFillOtp = () => {
    if (receivedOtp) {
      setOtp(receivedOtp);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-2xl p-6 sm:p-8 shadow-2xl">
        {/* Mobile Pull Bar */}
        <div className="sm:hidden w-12 h-1 bg-neutral-700 rounded-full mx-auto mb-4" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <Mail className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide">
            {step === 'OTP' ? 'Enter OTP Code' : step === 'PASSWORD' ? 'Sign In with Password' : 'Sign In with Gmail'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            {step === 'OTP'
              ? `We sent a 6-digit verification code to ${email}`
              : 'Permanent one-time sign in. No repeated logins required.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        {successMsg && step === 'OTP' && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* STEP 1: GMAIL & DETAILS */}
        {step === 'EMAIL' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Gmail / Email Address
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
                Gamer Name / Tag (Optional)
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. Alex Hunter"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Mobile Number (Optional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-neutral-500" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500"
                  placeholder="+91 9876543210"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-50 text-sm flex items-center justify-center gap-2 mt-2"
            >
              <span>{loading ? 'Sending Verification Code...' : 'Send OTP to Gmail'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => { setStep('PASSWORD'); setError(''); }}
                className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
              >
                Sign in with Password instead
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: VERIFY OTP */}
        {step === 'OTP' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {/* Quick OTP display badge */}
            {receivedOtp && (
              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-between text-xs">
                <span className="text-neutral-400">
                  Verification Code: <strong className="font-mono text-emerald-400 text-sm">{receivedOtp}</strong>
                </span>
                <button
                  type="button"
                  onClick={autoFillOtp}
                  className="px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-lg font-bold hover:bg-emerald-500/25 transition-colors cursor-pointer"
                >
                  Auto-fill
                </button>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                6-Digit OTP Code
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
                  placeholder="123456"
                />
              </div>
            </div>

            <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80 flex items-center gap-2 text-xs text-neutral-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Permanent sign-in: You will stay signed in on this device.</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-50 text-sm"
            >
              {loading ? 'Verifying Code...' : 'Verify & Sign In Permanently'}
            </button>

            <div className="flex items-center justify-between pt-2 text-xs">
              <button
                type="button"
                onClick={() => { setStep('EMAIL'); setError(''); }}
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

        {/* STEP 3: FALLBACK PASSWORD LOGIN */}
        {step === 'PASSWORD' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500"
                placeholder="yourname@gmail.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-50 text-sm"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => { setStep('EMAIL'); setError(''); }}
                className="text-xs text-emerald-400 hover:underline cursor-pointer"
              >
                ← Back to Gmail OTP Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
