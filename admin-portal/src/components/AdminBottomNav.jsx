import React from 'react';
import { Monitor, Clock, Ticket, Users, Tag, TrendingUp } from 'lucide-react';

export default function AdminBottomNav({ currentTab, setCurrentTab, bookingBadgeCount = 0 }) {
  const tabs = [
    { id: 'setups', label: 'Rigs', icon: Monitor },
    { id: 'sessions', label: 'Sessions', icon: Clock },
    { id: 'bookings', label: 'Bookings', icon: Ticket, badge: bookingBadgeCount },
    { id: 'customers', label: 'Gamers', icon: Users },
    { id: 'plans', label: 'Plans', icon: Tag },
    { id: 'reports', label: 'Reports', icon: TrendingUp },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-neutral-950/95 backdrop-blur-xl border-t border-neutral-850 px-2 py-1.5 flex items-center justify-around">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setCurrentTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer relative ${isActive
                ? 'text-emerald-400 font-bold'
                : 'text-neutral-500 hover:text-neutral-300 font-medium'
              }`}
          >
            <div className={`p-1 rounded-lg transition-all relative ${isActive ? 'bg-emerald-500/10' : ''
              }`}>
              <Icon className="w-4 h-4" />
              {tab.badge > 0 && (
                <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-emerald-500 text-black font-extrabold text-[9px] flex items-center justify-center shadow-sm">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            {isActive && (
              <span className="w-1 h-1 rounded-full bg-emerald-400 mt-0.5" />
            )}
          </button>
        );
      })}
    </nav>
  );
}

