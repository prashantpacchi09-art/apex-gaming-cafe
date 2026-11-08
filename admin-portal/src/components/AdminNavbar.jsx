import React from 'react';
import { Shield, RefreshCw, LogOut, User, QrCode, Bell } from 'lucide-react';

export default function AdminNavbar({ staffUser, onLogout, onRefresh, isRefreshing, onOpenQr, newBookingCount }) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-neutral-950/90 border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3 select-none">
          <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 text-emerald-400 flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black tracking-wider text-white">
                APEX CAFE DESK
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest">
                Staff Only
              </span>
            </div>
            <span className="text-[11px] block text-neutral-400 font-medium">
              Operations & Check-In Desk
            </span>
          </div>
        </div>

        {/* Actions & Staff Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* QR Standee Button */}
          <button
            onClick={onOpenQr}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors cursor-pointer"
            title="Customer QR Codes & Standee"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">QR Standee</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-900 hover:bg-neutral-850 text-neutral-300 border border-neutral-800 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh bookings data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {staffUser && (
            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-neutral-800">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-bold text-white flex items-center justify-end gap-1">
                  <User className="w-3 h-3 text-emerald-400" />
                  {staffUser.full_name}
                </div>
                <div className="text-[10px] text-neutral-400">{staffUser.email}</div>
              </div>

              <div className="sm:hidden w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 text-emerald-400 flex items-center justify-center font-bold text-xs uppercase">
                {staffUser.full_name ? staffUser.full_name.charAt(0) : 'A'}
              </div>

              <button
                onClick={onLogout}
                title="Log out of Staff Portal"
                className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
