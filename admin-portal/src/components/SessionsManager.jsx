import React, { useState, useEffect } from 'react';
import { Play, Square, Clock, Plus, IndianRupee, User, Monitor, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function SessionsManager({ sessions = [], setups = [], customers = [], onRefresh }) {
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [endingId, setEndingId] = useState(null);
  const [formData, setFormData] = useState({
    station_id: '',
    customer_id: '',
    customer_name: '',
    customer_phone: '',
    hourly_rate: 80,
    remarks: '',
  });

  // Available setups that are not in use
  const availableSetups = setups.filter((s) => s.is_available && s.status === 'AVAILABLE');

  const handleStart = async (e) => {
    e.preventDefault();
    if (!formData.station_id) {
      alert('Please select a station');
      return;
    }
    try {
      await api.startSession({
        station_id: Number(formData.station_id),
        customer_id: formData.customer_id ? Number(formData.customer_id) : undefined,
        customer_name: formData.customer_name || 'Walk-in Gamer',
        customer_phone: formData.customer_phone,
        hourly_rate: Number(formData.hourly_rate),
        remarks: formData.remarks,
      });
      setIsStartOpen(false);
      setFormData({
        station_id: '',
        customer_id: '',
        customer_name: '',
        customer_phone: '',
        hourly_rate: 80,
        remarks: '',
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Failed to start session');
    }
  };

  const handleEnd = async (sessionId, currentAmount) => {
    if (!window.confirm(`End session and charge ₹${currentAmount}?`)) return;
    try {
      setEndingId(sessionId);
      await api.endSession(sessionId, { final_amount: currentAmount });
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Failed to end session');
    } finally {
      setEndingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white tracking-wide flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            Live Active Sessions
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">Real-time session timers, player tracking & instant billing</p>
        </div>
        <button
          onClick={() => setIsStartOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Session</span>
        </button>
      </div>

      {/* Active Sessions List */}
      {sessions.length === 0 ? (
        <div className="text-center py-16 bg-neutral-900 border border-neutral-800 rounded-2xl">
          <Clock className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-neutral-300">No Active Sessions</h3>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto mt-1 mb-4">
            No gamers are currently playing. Click below to start a walk-in player session.
          </p>
          <button
            onClick={() => setIsStartOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Start Session Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((sess) => {
            const hours = Math.floor(sess.elapsed_minutes / 60);
            const mins = sess.elapsed_minutes % 60;
            const timeStr = `${hours}h ${mins}m`;

            return (
              <div
                key={sess.id}
                className="bg-neutral-900 border border-neutral-800 hover:border-emerald-500/40 p-4 rounded-2xl shadow-xl space-y-3"
              >
                {/* Station & Status Header */}
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold text-white text-sm">{sess.station_name}</span>
                    <span className="text-[10px] text-neutral-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                      {sess.station_type}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    ₹{sess.hourly_rate}/h
                  </span>
                </div>

                {/* Gamer Info */}
                <div className="flex items-start justify-between text-xs">
                  <div>
                    <span className="text-neutral-500 text-[10px] block uppercase">Gamer</span>
                    <span className="font-bold text-neutral-100 text-sm">{sess.customer_name}</span>
                    {sess.customer_phone && (
                      <span className="text-neutral-400 block text-[11px]">{sess.customer_phone}</span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-neutral-500 text-[10px] block uppercase">Started</span>
                    <span className="text-neutral-300 font-medium">
                      {sess.start_time.split(' ')[1] || sess.start_time}
                    </span>
                  </div>
                </div>

                {/* Live Counter & Amount Box */}
                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block font-semibold">Played Time</span>
                    <span className="text-base font-black text-white tracking-wider">{timeStr}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-neutral-500 uppercase block font-semibold">Current Bill</span>
                    <span className="text-base font-black text-emerald-400">₹{sess.total_amount}</span>
                  </div>
                </div>

                {/* Action: End & Bill */}
                <button
                  type="button"
                  disabled={endingId === sess.id}
                  onClick={() => handleEnd(sess.id, sess.total_amount)}
                  className="w-full py-2.5 bg-neutral-950 hover:bg-rose-950/40 border border-neutral-800 hover:border-rose-800 text-rose-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>{endingId === sess.id ? 'Settling Bill...' : `End Session & Bill (₹${sess.total_amount})`}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Start Session Modal */}
      {isStartOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Play className="w-5 h-5 text-emerald-400" />
              Start New Gaming Session
            </h3>

            <form onSubmit={handleStart} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Select Rig / Station</label>
                <select
                  required
                  value={formData.station_id}
                  onChange={(e) => {
                    const stId = e.target.value;
                    const st = setups.find((s) => s.id === Number(stId));
                    setFormData({
                      ...formData,
                      station_id: stId,
                      hourly_rate: st ? st.hourly_rate : formData.hourly_rate,
                    });
                  }}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Choose Available Rig --</option>
                  {availableSetups.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.setup_type} • ₹{s.hourly_rate}/h)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Gamer / Customer Name</label>
                <input
                  type="text"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  placeholder="e.g. John / Walk-in Gamer"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Phone (Optional)</label>
                  <input
                    type="text"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    placeholder="9876543210"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Hourly Rate (₹)</label>
                  <input
                    type="number"
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsStartOpen(false)}
                  className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 cursor-pointer"
                >
                  Start Rig Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

