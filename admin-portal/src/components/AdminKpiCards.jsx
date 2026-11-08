import React from 'react';
import { Calendar, Clock, IndianRupee, Monitor } from 'lucide-react';

export default function AdminKpiCards({ stats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* 1. Today's Bookings */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 sm:p-5 rounded-2xl relative overflow-hidden group hover:border-neutral-700 transition-all">
        <span className="text-xs text-neutral-400 flex items-center gap-1.5 mb-2 font-medium">
          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          Today's Reservations
        </span>
        <div className="text-2xl sm:text-3xl font-black text-white">
          {stats.today_bookings_count}
        </div>
        <span className="text-[10px] text-neutral-500 block mt-1">Booked slot blocks</span>
      </div>

      {/* 2. Active Sessions */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 sm:p-5 rounded-2xl relative overflow-hidden group hover:border-neutral-700 transition-all">
        <span className="text-xs text-neutral-400 flex items-center gap-1.5 mb-2 font-medium">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          Active In-Cafe Gamers
        </span>
        <div className="text-2xl sm:text-3xl font-black text-white">
          {stats.active_bookings_count}
        </div>
        <span className="text-[10px] text-neutral-500 block mt-1">Currently checked in</span>
      </div>

      {/* 3. Projected Revenue */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 sm:p-5 rounded-2xl relative overflow-hidden group hover:border-neutral-700 transition-all">
        <span className="text-xs text-neutral-400 flex items-center gap-1.5 mb-2 font-medium">
          <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
          Today's Revenue
        </span>
        <div className="text-2xl sm:text-3xl font-black text-emerald-400">
          ₹{stats.today_revenue}
        </div>
        <span className="text-[10px] text-neutral-500 block mt-1">Collected / projected</span>
      </div>

      {/* 4. Total Stations */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 sm:p-5 rounded-2xl relative overflow-hidden group hover:border-neutral-700 transition-all">
        <span className="text-xs text-neutral-400 flex items-center gap-1.5 mb-2 font-medium">
          <Monitor className="w-3.5 h-3.5 text-emerald-400" />
          Floor Stations
        </span>
        <div className="text-2xl sm:text-3xl font-black text-neutral-200">
          {stats.total_stations}
        </div>
        <span className="text-[10px] text-neutral-500 block mt-1">PC rigs & consoles</span>
      </div>
    </div>
  );
}
