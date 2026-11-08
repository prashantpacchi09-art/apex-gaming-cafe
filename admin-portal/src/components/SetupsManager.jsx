import React, { useState } from 'react';
import { Monitor, Gamepad2, Plus, RefreshCw, Power, Settings, Play, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function SetupsManager({ setups = [], onRefresh, onStartSessionForStation }) {
  const [loadingId, setLoadingId] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newSetup, setNewSetup] = useState({
    name: '',
    setup_type: 'PC',
    hourly_rate: 80,
    specifications: '',
    location: 'Floor',
  });

  const handleToggle = async (id) => {
    try {
      setLoadingId(id);
      await api.toggleSetupStatus(id);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Failed to toggle status');
    } finally {
      setLoadingId(null);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createSetup(newSetup);
      setIsAddOpen(false);
      setNewSetup({ name: '', setup_type: 'PC', hourly_rate: 80, specifications: '', location: 'Floor' });
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Failed to create station');
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white tracking-wide flex items-center gap-2">
            <Monitor className="w-5 h-5 text-emerald-400" />
            Gaming Setups & Rigs
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">Control live stations, toggle availability & manage rates</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Rig</span>
        </button>
      </div>

      {/* Rigs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {setups.map((s) => {
          const isBusy = s.status === 'IN_USE';
          const isAvailable = s.status === 'AVAILABLE';

          return (
            <div
              key={s.id}
              className={`p-4 rounded-2xl border transition-all ${
                isBusy
                  ? 'bg-neutral-900 border-emerald-500/40 shadow-lg'
                  : isAvailable
                  ? 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                  : 'bg-neutral-950/80 border-neutral-900 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                    s.setup_type?.includes('PS5')
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-neutral-800 text-neutral-200 border-neutral-700'
                  }`}>
                    {s.setup_type?.includes('PS5') ? <Gamepad2 className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{s.name}</h3>
                    <span className="text-[11px] text-neutral-400">{s.setup_type} • ₹{s.hourly_rate}/h</span>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isBusy
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : isAvailable
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {isBusy ? 'In Session' : isAvailable ? 'Available' : 'Maintenance'}
                </span>
              </div>

              {s.specifications && (
                <div className="text-[11px] text-neutral-400 bg-neutral-950 p-2 rounded-lg border border-neutral-850 mb-3 truncate">
                  {s.specifications}
                </div>
              )}

              {/* Active Session info if in use */}
              {isBusy && s.active_session && (
                <div className="bg-neutral-950 p-2.5 rounded-xl border border-emerald-500/30 mb-3 text-xs">
                  <span className="text-[10px] text-neutral-400 block uppercase font-medium">Active Player:</span>
                  <span className="font-bold text-white">{s.active_session.customer_name}</span>
                  <span className="text-[10px] text-emerald-400 block mt-0.5">Started at {s.active_session.start_time.split(' ')[1] || s.active_session.start_time}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1 border-t border-neutral-800">
                {isAvailable && (
                  <button
                    onClick={() => onStartSessionForStation(s)}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Start Session</span>
                  </button>
                )}

                <button
                  disabled={loadingId === s.id}
                  onClick={() => handleToggle(s.id)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1 ${
                    s.is_available
                      ? 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-rose-400 hover:border-rose-800'
                      : 'bg-emerald-950/40 border-emerald-800 text-emerald-300 hover:bg-emerald-900/40'
                  }`}
                >
                  <Power className="w-3 h-3" />
                  <span>{s.is_available ? 'Disable' : 'Enable'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Rig Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Add New Gaming Station</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Station Name</label>
                <input
                  type="text"
                  required
                  value={newSetup.name}
                  onChange={(e) => setNewSetup({ ...newSetup, name: e.target.value })}
                  placeholder="e.g. PC - 08 or PS5 - VIP"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Type</label>
                  <select
                    value={newSetup.setup_type}
                    onChange={(e) => setNewSetup({ ...newSetup, setup_type: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="PC">PC</option>
                    <option value="PS5">PS5</option>
                    <option value="PS4">PS4</option>
                    <option value="VR">VR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Hourly Rate (₹)</label>
                  <input
                    type="number"
                    required
                    value={newSetup.hourly_rate}
                    onChange={(e) => setNewSetup({ ...newSetup, hourly_rate: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Specifications</label>
                <input
                  type="text"
                  value={newSetup.specifications}
                  onChange={(e) => setNewSetup({ ...newSetup, specifications: e.target.value })}
                  placeholder="e.g. Ryzen 7 7800X3D, RTX 4070 Ti, 240Hz"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 cursor-pointer"
                >
                  Create Rig
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

