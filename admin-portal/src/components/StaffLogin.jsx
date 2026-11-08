import React, { useState } from 'react';
import { Shield, Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export default function StaffLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.login(email, password);
      if (!data.user?.is_admin) {
        throw new Error('Access denied: This portal is strictly restricted to Cafe Staff & Administrators.');
      }
      localStorage.setItem('apex_admin_token', data.access_token);
      localStorage.setItem('apex_admin_user', JSON.stringify(data.user));
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message || 'Staff verification failed');
    } finally {
      setLoading(false);
    }
  };

  const fillStaffDemo = () => {
    setEmail('admin@apexgaming.com');
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        
        {/* Header Badge */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-neutral-950 border border-neutral-800 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide">
            Apex Staff Desk
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Official check-in, live floor supervision & slot management portal
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
              Staff Email / ID
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-neutral-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500"
                placeholder="admin@apexgaming.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
              Security PIN / Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-neutral-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-850 text-xs text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Permanent Sign-in: You will stay logged in on this device.</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-50 text-sm mt-2"
          >
            {loading ? 'Authenticating Staff...' : 'Sign In to Admin Desk'}
          </button>
        </form>

        {/* Demo Helper */}
        <div className="mt-6 pt-5 border-t border-neutral-800 flex items-center justify-between text-xs">
          <span className="text-neutral-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Quick Demo:
          </span>
          <button
            type="button"
            onClick={fillStaffDemo}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-200 border border-neutral-700 font-medium transition-colors cursor-pointer"
          >
            Fill Admin Demo
          </button>
        </div>

      </div>
    </div>
  );
}
