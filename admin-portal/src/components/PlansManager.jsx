import React, { useState } from 'react';
import { Tag, Plus, Edit2, CheckCircle2, XCircle, Sparkles, Flame } from 'lucide-react';
import { api } from '../services/api';

export default function PlansManager({ plans = [], onRefresh }) {
  const [editingPlan, setEditingPlan] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 0,
    price: 140,
    original_price: 160,
    duration_hours: 2,
    target_setup_type: 'PC',
    is_popular: false,
    badge_text: 'Popular',
  });

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingPlan) return;
    try {
      setLoading(true);
      await api.updatePlan(editingPlan.id, {
        title: editingPlan.title,
        price: Number(editingPlan.price),
        original_price: Number(editingPlan.original_price),
        badge_text: editingPlan.badge_text,
        is_popular: Boolean(editingPlan.is_popular),
        is_active: Boolean(editingPlan.is_active),
      });
      setEditingPlan(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Failed to update plan');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.createPlan({
        ...formData,
        price: Number(formData.price),
        original_price: Number(formData.original_price),
        duration_hours: Number(formData.duration_hours),
        type: Number(formData.type),
      });
      setIsAddOpen(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Failed to create plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white tracking-wide flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-400" />
            Gaming Plans & Discount Offers
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">Manage hourly passes, bulk anytime packages & custom discounts</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Plan</span>
        </button>
      </div>

      {/* Plans List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((p) => {
          const discount = Math.max(0, p.original_price - p.price);

          return (
            <div
              key={p.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                p.is_popular
                  ? 'bg-neutral-900 border-emerald-500/40 shadow-xl'
                  : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-950 border border-neutral-800 px-2 py-0.5 rounded text-neutral-400">
                    {p.target_setup_type} • {p.type === 0 ? `${p.duration_hours}h Pass` : 'Anytime'}
                  </span>
                  {p.badge_text && (
                    <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full">
                      <Flame className="w-3 h-3" />
                      {p.badge_text}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-white text-base leading-tight mb-1">{p.title}</h3>
                {p.description && (
                  <p className="text-xs text-neutral-400 mb-3 truncate">{p.description}</p>
                )}

                {/* Pricing Box */}
                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850 flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[10px] text-neutral-500 block uppercase">Discounted Rate</span>
                    <span className="text-lg font-black text-emerald-400">₹{p.price}</span>
                  </div>
                  {discount > 0 && (
                    <div className="text-right">
                      <span className="text-[10px] text-neutral-500 block uppercase">Original</span>
                      <span className="text-xs text-neutral-500 line-through">₹{p.original_price}</span>
                      <span className="text-[10px] font-bold text-emerald-400 block">Save ₹{discount}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingPlan(p)}
                  className="flex-1 py-2 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 text-neutral-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Edit Rate</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Edit Gaming Plan</h3>
            <form onSubmit={handleUpdate} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editingPlan.title}
                  onChange={(e) => setEditingPlan({ ...editingPlan, title: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingPlan.price}
                    onChange={(e) => setEditingPlan({ ...editingPlan, price: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-neutral-200 font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingPlan.original_price}
                    onChange={(e) => setEditingPlan({ ...editingPlan, original_price: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Badge Text</label>
                <input
                  type="text"
                  value={editingPlan.badge_text || ''}
                  onChange={(e) => setEditingPlan({ ...editingPlan, badge_text: e.target.value })}
                  placeholder="e.g. Best Deal, Save ₹40"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-4 py-1">
                <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPlan.is_popular}
                    onChange={(e) => setEditingPlan({ ...editingPlan, is_popular: e.target.checked })}
                    className="rounded bg-neutral-950 border-neutral-800 text-emerald-500"
                  />
                  <span>Mark as Popular</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPlan.is_active}
                    onChange={(e) => setEditingPlan({ ...editingPlan, is_active: e.target.checked })}
                    className="rounded bg-neutral-950 border-neutral-800 text-emerald-500"
                  />
                  <span>Is Active</span>
                </label>
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Plan Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Create New Plan</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. PS5 Weekend 3-Hour Pass"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Duration (Hours)</label>
                  <input
                    type="number"
                    value={formData.duration_hours}
                    onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Target Station</label>
                  <select
                    value={formData.target_setup_type}
                    onChange={(e) => setFormData({ ...formData, target_setup_type: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="PC">PC</option>
                    <option value="PC 1">PC 1</option>
                    <option value="PC 2">PC 2</option>
                    <option value="PS5">PS5</option>
                    <option value="PS4">PS4</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Discounted (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-neutral-200 font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Original (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
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
                  disabled={loading}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

