import React from 'react';
import { LayoutGrid, CalendarCheck, User, LogIn } from 'lucide-react';

export default function BottomNav({
  currentView,
  setCurrentView,
  currentUser,
  onOpenAuth,
}) {
  return (
    <div className="sm:hidden fixed bottom-0 inset-x-0 bg-neutral-950/95 backdrop-blur-xl border-t border-neutral-800/90 z-40 px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] shadow-2xl">
      <div className="grid grid-cols-3 items-center justify-around gap-1 max-w-md mx-auto">
        
        {/* Tab 1: Floor & Slots */}
        <button
          onClick={() => setCurrentView('booking')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
            currentView === 'booking'
              ? 'text-white font-bold bg-neutral-900 border border-neutral-700'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <LayoutGrid className={`w-5 h-5 mb-0.5 ${currentView === 'booking' ? 'text-emerald-400' : ''}`} />
          <span className="text-[10px] tracking-tight">Floor & Slots</span>
        </button>

        {/* Tab 2: My Passes / Bookings */}
        <button
          onClick={() => {
            if (!currentUser) {
              onOpenAuth();
            } else {
              setCurrentView('my-bookings');
            }
          }}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
            currentView === 'my-bookings'
              ? 'text-white font-bold bg-neutral-900 border border-neutral-700'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <CalendarCheck className={`w-5 h-5 mb-0.5 ${currentView === 'my-bookings' ? 'text-emerald-400' : ''}`} />
          <span className="text-[10px] tracking-tight">My Passes</span>
        </button>

        {/* Tab 3: Account / Sign In */}
        <button
          onClick={currentUser ? () => setCurrentView('my-bookings') : onOpenAuth}
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer text-neutral-400 hover:text-white"
        >
          {currentUser ? (
            <>
              <User className="w-5 h-5 mb-0.5 text-emerald-400" />
              <span className="text-[10px] tracking-tight truncate max-w-[70px] text-neutral-200">
                {currentUser.full_name.split(' ')[0]}
              </span>
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5 mb-0.5 text-emerald-400" />
              <span className="text-[10px] tracking-tight text-neutral-200">Sign In</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
}

