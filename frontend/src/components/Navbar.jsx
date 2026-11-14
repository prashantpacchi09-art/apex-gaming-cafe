import React from 'react';
import { Gamepad2, LogOut, LayoutGrid, CalendarCheck, QrCode } from 'lucide-react';

export default function Navbar({ currentView, setCurrentView, currentUser, onLogout, onOpenAuth, onOpenQr, onOpenRates, onOpenGta6 }) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-black/90 border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setCurrentView('booking')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-emerald-400 shadow-sm group-hover:border-emerald-500/50 transition-colors">
            <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-lg sm:text-xl font-black tracking-wider text-white">
              APEX GAMING
            </span>
            <span className="text-[10px] sm:text-xs block text-neutral-400 font-semibold tracking-widest uppercase">
              Slot Booking
            </span>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setCurrentView('booking')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              currentView === 'booking'
                ? 'bg-neutral-900 text-white border border-neutral-700'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
            }`}
          >
            <LayoutGrid className="w-4 h-4 text-emerald-400" />
            <span>Floor & Slots</span>
          </button>

          <button
            onClick={onOpenGta6}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black bg-gradient-to-r from-pink-600/30 to-purple-600/30 hover:from-pink-600/40 hover:to-purple-600/40 text-pink-300 border border-pink-500/40 shadow-sm transition-all cursor-pointer animate-pulse"
          >
            <span className="text-sm">🌴</span>
            <span>GTA VI Launch</span>
          </button>

          <button
            onClick={onOpenRates}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold text-neutral-300 hover:text-white hover:bg-neutral-900/60 transition-all cursor-pointer"
          >
            <span>💰 Rates & Passes</span>
          </button>

          {currentUser && (
            <button
              onClick={() => setCurrentView('my-bookings')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentView === 'my-bookings'
                  ? 'bg-neutral-900 text-white border border-neutral-700'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
              }`}
            >
              <CalendarCheck className="w-4 h-4 text-emerald-400" />
              <span>My Passes</span>
            </button>
          )}
        </nav>

        {/* User Auth Info / Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenGta6}
            className="md:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-pink-950/50 text-pink-300 border border-pink-500/40 cursor-pointer"
          >
            <span>🌴 GTA 6</span>
          </button>

          <button
            onClick={onOpenRates}
            className="md:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-neutral-900 text-emerald-400 border border-neutral-800 cursor-pointer"
          >
            <span>Rates</span>
          </button>

          <button
            onClick={onOpenQr}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-900 hover:bg-neutral-850 text-emerald-400 border border-neutral-800 transition-colors cursor-pointer"
            title="Scan QR or Download Mobile App"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Get Mobile App</span>
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-semibold text-white">{currentUser.full_name}</div>
                <div className="text-xs text-neutral-400">{currentUser.email}</div>
              </div>
              <div className="sm:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700 text-emerald-400 font-bold text-xs uppercase">
                {currentUser.full_name ? currentUser.full_name.charAt(0) : 'U'}
              </div>
              <button
                onClick={onLogout}
                title="Log out"
                className="p-1.5 sm:p-2 text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
