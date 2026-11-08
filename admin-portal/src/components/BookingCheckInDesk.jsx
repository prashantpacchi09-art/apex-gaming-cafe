import React, { useState } from 'react';
import { Search, Clock, Check, Ban } from 'lucide-react';

export default function BookingCheckInDesk({
  bookings = [],
  loading,
  filterDate,
  setFilterDate,
  filterStatus,
  setFilterStatus,
  onUpdateStatus,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter bookings by search term (code, user name, email, or station)
  const filteredBookings = bookings.filter((b) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const code = (b.booking_code || '').toLowerCase();
    const name = (b.user?.full_name || '').toLowerCase();
    const email = (b.user?.email || '').toLowerCase();
    const station = (b.station?.name || '').toLowerCase();
    return code.includes(term) || name.includes(term) || email.includes(term) || station.includes(term);
  });

  return (
    <div className="space-y-6">
      
      {/* Search & Filter Toolbar */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Quick Code / Name Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search code (e.g. APX-), customer, or rig..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Right: Date & Status Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-[11px] font-bold text-neutral-400 uppercase">Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            />
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setFilterDate(new Date().toISOString().split('T')[0])}
                className="px-2 py-1 text-[10px] font-bold bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 rounded-lg cursor-pointer"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() + 1);
                  setFilterDate(d.toISOString().split('T')[0]);
                }}
                className="px-2 py-1 text-[10px] font-bold bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 rounded-lg cursor-pointer"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => setFilterDate('')}
                className="px-2 py-1 text-[10px] font-bold bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 rounded-lg cursor-pointer"
              >
                All
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[11px] font-bold text-neutral-400 uppercase">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="CHECKED_IN">CHECKED_IN</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <span className="text-xs text-neutral-400 ml-auto md:ml-0 font-medium">
            Showing <strong className="text-white">{filteredBookings.length}</strong> record(s)
          </span>
        </div>

      </div>

      {/* Main Container: Desktop Table & Mobile Cards */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-neutral-950 text-neutral-400 uppercase tracking-wider text-[11px] border-b border-neutral-800">
              <tr>
                <th className="py-3.5 px-5">Pass Code</th>
                <th className="py-3.5 px-5">Gamer Info</th>
                <th className="py-3.5 px-5">Assigned Station</th>
                <th className="py-3.5 px-5">Time Slot</th>
                <th className="py-3.5 px-5">Amount</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Desk Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-neutral-500">
                    Loading reservation records...
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-neutral-500">
                    No reservations matched your criteria.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-neutral-850/50 transition-colors">
                    <td className="py-4 px-5">
                      <span className="font-mono font-bold text-emerald-400 bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800">
                        {b.booking_code}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-bold text-white text-sm">{b.user?.full_name || 'Walk-in Gamer'}</div>
                      <div className="text-[11px] text-neutral-400">{b.user?.email || b.user?.phone}</div>
                    </td>
                    <td className="py-4 px-5 font-semibold text-neutral-200">
                      {b.station?.name || `Station #${b.station_id}`}
                      <span className="text-[10px] text-neutral-500 block">{b.station?.category?.replace('_', ' ')}</span>
                    </td>
                    <td className="py-4 px-5">
                      <span className="font-semibold text-neutral-200 text-sm">{b.start_time} - {b.end_time}</span>
                      <span className="text-[11px] text-neutral-500 block">{b.date} ({b.duration_hours}h)</span>
                    </td>
                    <td className="py-4 px-5 font-bold text-emerald-400 text-sm">
                      ₹{b.total_amount}
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${
                          b.status === 'CONFIRMED'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : b.status === 'CHECKED_IN'
                            ? 'bg-neutral-800 text-neutral-200 border border-neutral-700'
                            : b.status === 'COMPLETED'
                            ? 'bg-neutral-800 text-neutral-400'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {b.status === 'CONFIRMED' && (
                          <button
                            onClick={() => onUpdateStatus(b.id, 'CHECKED_IN')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm shadow-emerald-600/30 cursor-pointer flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Check In</span>
                          </button>
                        )}
                        {b.status === 'CHECKED_IN' && (
                          <button
                            onClick={() => onUpdateStatus(b.id, 'COMPLETED')}
                            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 border border-neutral-700 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Complete</span>
                          </button>
                        )}
                        {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && (
                          <button
                            onClick={() => onUpdateStatus(b.id, 'CANCELLED')}
                            className="px-2.5 py-1.5 bg-neutral-950 hover:bg-rose-950/40 border border-neutral-800 hover:border-rose-800 text-rose-400 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Ban className="w-3 h-3" />
                            <span>Cancel</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards (Shown on phones and tablets) */}
        <div className="lg:hidden divide-y divide-neutral-800">
          {loading ? (
            <div className="py-12 text-center text-neutral-500 text-xs">
              Loading reservation records...
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="py-12 text-center text-neutral-500 text-xs">
              No reservations matched your criteria.
            </div>
          ) : (
            filteredBookings.map((b) => (
              <div key={b.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs bg-neutral-950 text-emerald-400 px-2.5 py-1 rounded-md border border-neutral-800">
                    {b.booking_code}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
                      b.status === 'CONFIRMED'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : b.status === 'CHECKED_IN'
                        ? 'bg-neutral-800 text-neutral-200 border border-neutral-700'
                        : b.status === 'COMPLETED'
                        ? 'bg-neutral-800 text-neutral-400'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                <div className="flex items-start justify-between text-xs">
                  <div>
                    <div className="font-bold text-white text-sm">{b.user?.full_name || 'Walk-in Gamer'}</div>
                    <div className="text-[11px] text-neutral-400">{b.user?.email || b.user?.phone}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-black text-sm">₹{b.total_amount}</span>
                  </div>
                </div>

                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-neutral-500 text-[10px] block uppercase">Station</span>
                    <span className="font-bold text-neutral-200">{b.station?.name || `Station #${b.station_id}`}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-neutral-500 text-[10px] block uppercase">Time Slot</span>
                    <span className="font-bold text-neutral-200">{b.start_time} - {b.end_time}</span>
                  </div>
                </div>

                {/* Mobile Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  {b.status === 'CONFIRMED' && (
                    <button
                      onClick={() => onUpdateStatus(b.id, 'CHECKED_IN')}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/30 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Check In Gamer</span>
                    </button>
                  )}
                  {b.status === 'CHECKED_IN' && (
                    <button
                      onClick={() => onUpdateStatus(b.id, 'COMPLETED')}
                      className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 border border-neutral-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Complete Session</span>
                    </button>
                  )}
                  {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && (
                    <button
                      onClick={() => onUpdateStatus(b.id, 'CANCELLED')}
                      className="py-2.5 px-4 bg-neutral-950 border border-neutral-800 hover:border-rose-800 text-rose-400 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
