import React, { useState } from 'react';
import { Users, Search, Plus, Wallet, Phone, Award, Clock, ArrowUpRight, Zap, CheckCircle2, Flame, Tag } from 'lucide-react';
import { api } from '../services/api';

export default function CustomersManager({ customers = [], plans = [], onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  // Top Up Wallet Modal state
  const [topupTarget, setTopupTarget] = useState(null);
  const [topupAmount, setTopupAmount] = useState(200);

  // Plan Recharge Modal state
  const [rechargeTarget, setRechargeTarget] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [planFilterType, setPlanFilterType] = useState('ALL'); // 'ALL' | 'PC' | 'PS5' | 'ANYTIME'

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [newCust, setNewCust] = useState({
    name: '',
    mobile: '',
    email: '',
    wallet_balance: 0,
    notes: '',
  });

  const filtered = customers.filter((c) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.name?.toLowerCase().includes(term) ||
      c.mobile?.toLowerCase().includes(term) ||
      c.code?.toLowerCase().includes(term) ||
      c.active_plan_title?.toLowerCase().includes(term)
    );
  });

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.createCustomer(newCust);
      setIsAddOpen(false);
      setNewCust({ name: '', mobile: '', email: '', wallet_balance: 0, notes: '' });
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Failed to create customer');
    } finally {
      setLoading(false);
    }
  };

  const handleTopup = async (e) => {
    e.preventDefault();
    if (!topupTarget) return;
    try {
      setLoading(true);
      await api.topupWallet(topupTarget.id, {
        amount: Number(topupAmount),
        description: 'Mobile Desk Wallet Top-up',
      });
      setSuccessMessage(`Topped up ₹${topupAmount} for ${topupTarget.name}!`);
      setTopupTarget(null);
      if (onRefresh) onRefresh();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to top up wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleRechargePlan = async (e) => {
    e.preventDefault();
    if (!rechargeTarget || !selectedPlanId) {
      alert('Please select a gaming plan');
      return;
    }
    const plan = plans.find((p) => p.id === Number(selectedPlanId));
    if (!plan) return;

    try {
      setLoading(true);
      const res = await api.rechargeCustomerPlan(rechargeTarget.id, {
        plan_id: plan.id,
        price: plan.price,
        payment_method: paymentMethod,
      });
      setSuccessMessage(res.message || `Recharged ${plan.title}!`);
      setRechargeTarget(null);
      setSelectedPlanId('');
      if (onRefresh) onRefresh();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to recharge plan');
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = plans.filter((p) => {
    if (planFilterType === 'ALL') return true;
    if (planFilterType === 'PC') return p.target_setup_type?.toUpperCase().includes('PC');
    if (planFilterType === 'PS5') return p.target_setup_type?.toUpperCase().includes('PS5');
    if (planFilterType === 'ANYTIME') return p.type === 1;
    return true;
  });

  const selectedPlanObj = plans.find((p) => p.id === Number(selectedPlanId));

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white tracking-wide flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            Customers & Plans Recharge Desk
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">Recharge gaming plans, top up wallets & track member passes</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Customer</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-neutral-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by customer name, phone, code or plan..."
          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Customer Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-neutral-900 border border-neutral-800 rounded-2xl text-xs text-neutral-500">
          No registered customers found matching "{searchTerm}".
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 p-4 rounded-2xl shadow-xl flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] bg-neutral-950 border border-neutral-800 px-2 py-0.5 rounded text-neutral-400">
                    {c.code}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <Wallet className="w-3.5 h-3.5" /> ₹{c.wallet_balance}
                  </span>
                </div>

                <h3 className="font-bold text-white text-base leading-tight">{c.name}</h3>
                <div className="text-xs text-neutral-400 flex items-center gap-2 mt-1">
                  {c.mobile && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-neutral-500" /> {c.mobile}
                    </span>
                  )}
                  {c.reward_points > 0 && (
                    <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
                      <Award className="w-3 h-3" /> {c.reward_points} pts
                    </span>
                  )}
                </div>

                {/* Active Plan / Pass Badge */}
                {c.active_plan_title ? (
                  <div className="mt-2.5 p-2 bg-emerald-500/10 border border-emerald-500/25 rounded-xl">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-300 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-emerald-400" /> {c.active_plan_title}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-neutral-950 px-1.5 py-0.5 rounded">
                        {c.pass_hours_remaining}h left
                      </span>
                    </div>
                    {c.pass_expiry_date && (
                      <span className="text-[10px] text-neutral-400 block mt-0.5">
                        Expires: {c.pass_expiry_date.split(' ')[0]}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="mt-2 text-[11px] text-neutral-500 flex items-center gap-1">
                    <Tag className="w-3 h-3" /> No active gaming plan
                  </div>
                )}
              </div>

              {/* Stats Summary */}
              <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-850 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-neutral-500 text-[10px] block uppercase">Hours Played</span>
                  <span className="font-semibold text-neutral-200">{c.total_hours}h</span>
                </div>
                <div className="text-right">
                  <span className="text-neutral-500 text-[10px] block uppercase">Total Spent</span>
                  <span className="font-semibold text-emerald-400">₹{c.total_spent}</span>
                </div>
              </div>

              {/* Two Action Buttons: Recharge Plan & Top Up Wallet */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setRechargeTarget(c);
                    setSelectedPlanId(plans.length > 0 ? plans[0].id : '');
                    setPaymentMethod('Cash');
                  }}
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Recharge Plan</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTopupTarget(c);
                    setTopupAmount(200);
                  }}
                  className="py-2.5 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 hover:border-neutral-700 text-neutral-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Top Up</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. PLAN RECHARGE MODAL                                   */}
      {/* ======================================================== */}
      {rechargeTarget && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  Recharge Gaming Plan
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Select pass for <strong className="text-white">{rechargeTarget.name}</strong> ({rechargeTarget.mobile || 'No phone'})
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-neutral-950 px-2 py-1 rounded-lg border border-neutral-800">
                Wallet: ₹{rechargeTarget.wallet_balance}
              </span>
            </div>

            {/* Category Switcher */}
            <div className="flex items-center gap-1 p-1 bg-neutral-950 border border-neutral-850 rounded-xl mb-4 text-xs font-bold">
              {['ALL', 'PC', 'PS5', 'ANYTIME'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setPlanFilterType(t)}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                    planFilterType === t
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <form onSubmit={handleRechargePlan} className="space-y-4">
              {/* Plan Picker List */}
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {filteredPlans.map((p) => {
                  const isSelected = selectedPlanId === p.id;
                  const discount = Math.max(0, p.original_price - p.price);

                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPlanId(p.id)}
                      className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                          : 'bg-neutral-950 border-neutral-850 hover:border-neutral-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-xs">{p.title}</span>
                          {p.badge_text && (
                            <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded">
                              {p.badge_text}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-neutral-400 block mt-0.5">
                          {p.duration_hours}h {p.target_setup_type} • Valid 30 days
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-emerald-400 block">₹{p.price}</span>
                        {discount > 0 && (
                          <span className="text-[10px] line-through text-neutral-500">₹{p.original_price}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Cash', 'UPI', 'Wallet'].map((method) => {
                    const isSelected = paymentMethod === method;
                    const isWallet = method === 'Wallet';
                    const hasWalletFunds = selectedPlanObj ? (rechargeTarget.wallet_balance >= selectedPlanObj.price) : true;

                    return (
                      <button
                        key={method}
                        type="button"
                        disabled={isWallet && !hasWalletFunds}
                        onClick={() => setPaymentMethod(method)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 border-emerald-400 text-white'
                            : isWallet && !hasWalletFunds
                            ? 'bg-neutral-950 border-neutral-900 text-neutral-600 cursor-not-allowed'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                        }`}
                      >
                        {method}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Summary Breakdown */}
              {selectedPlanObj && (
                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-neutral-500 text-[10px] block uppercase font-semibold">Total Payable</span>
                    <span className="text-lg font-black text-emerald-400">₹{selectedPlanObj.price}</span>
                  </div>
                  <div className="text-right text-[11px]">
                    <span className="text-neutral-400 block">Method: <strong className="text-white">{paymentMethod}</strong></span>
                    {selectedPlanObj.original_price > selectedPlanObj.price && (
                      <span className="text-emerald-400 font-semibold">
                        Discount: -₹{selectedPlanObj.original_price - selectedPlanObj.price}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRechargeTarget(null)}
                  className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedPlanId}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Recharging...' : `Recharge (₹${selectedPlanObj ? selectedPlanObj.price : 0})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. TOP UP WALLET MODAL                                   */}
      {/* ======================================================== */}
      {topupTarget && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Top Up Wallet</h3>
            <p className="text-xs text-neutral-400 mb-4">
              Adding funds to <strong className="text-white">{topupTarget.name}</strong>'s balance (Current: ₹{topupTarget.wallet_balance})
            </p>

            {/* Quick Amount Pills */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[100, 200, 500, 1000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTopupAmount(amt)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    topupAmount === amt
                      ? 'bg-emerald-600 border-emerald-400 text-white'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  +₹{amt}
                </button>
              ))}
            </div>

            <form onSubmit={handleTopup} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Recharge Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="10"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-neutral-200 font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTopupTarget(null)}
                  className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Adding...' : `Add ₹${topupAmount}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. ADD CUSTOMER MODAL                                    */}
      {/* ======================================================== */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Register New Gamer</h3>
            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newCust.name}
                  onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
                  placeholder="e.g. Alex Mercer"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    value={newCust.mobile}
                    onChange={(e) => setNewCust({ ...newCust, mobile: e.target.value })}
                    placeholder="9876543210"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Starting Balance (₹)</label>
                  <input
                    type="number"
                    value={newCust.wallet_balance}
                    onChange={(e) => setNewCust({ ...newCust, wallet_balance: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={newCust.email}
                  onChange={(e) => setNewCust({ ...newCust, email: e.target.value })}
                  placeholder="alex@gmail.com"
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
                  disabled={loading}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Registering...' : 'Register Gamer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
