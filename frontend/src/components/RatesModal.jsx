import React, { useState } from 'react';
import { X, Tag, Sparkles, Clock, CheckCircle2, ShieldCheck, Flame } from 'lucide-react';

export default function RatesModal({ isOpen, onClose, gamingPlans = [], onSelectPlan }) {
  const [activeTab, setActiveTab] = useState('HOURLY'); // 'HOURLY' | 'ANYTIME'

  if (!isOpen) return null;

  const hourlyCategories = [
    {
      title: '🎮 PlayStation 5 (PS5)',
      type: 'PS5',
      baseRate: '₹150 / hour',
      color: 'emerald',
      passes: [
        { hours: 1, price: 150, orig: 150, save: 0 },
        { hours: 2, price: 250, orig: 300, save: 50 },
        { hours: 3, price: 360, orig: 450, save: 90 },
        { hours: 4, price: 460, orig: 600, save: 140 },
        { hours: 5, price: 550, orig: 750, save: 200 },
      ]
    },
    {
      title: '🕹️ PlayStation 4 (PS4)',
      type: 'PS4',
      baseRate: '₹100 / hour',
      color: 'purple',
      passes: [
        { hours: 1, price: 100, orig: 100, save: 0 },
        { hours: 2, price: 170, orig: 200, save: 30 },
        { hours: 3, price: 250, orig: 300, save: 50 },
        { hours: 4, price: 320, orig: 400, save: 80 },
        { hours: 5, price: 370, orig: 500, save: 130 },
      ]
    },
    {
      title: '🖥️ PC - AMD Radeon RX 7600 (Esports Rig)',
      type: 'PC (RX 7600)',
      baseRate: '₹80 / hour',
      color: 'cyan',
      passes: [
        { hours: 1, price: 80, orig: 80, save: 0 },
        { hours: 2, price: 140, orig: 160, save: 20 },
        { hours: 3, price: 200, orig: 240, save: 40 },
        { hours: 4, price: 260, orig: 320, save: 60 },
        { hours: 5, price: 300, orig: 400, save: 100 },
      ]
    },
    {
      title: '💻 PC - AMD Ryzen 5 5600GT (Gaming Rig)',
      type: 'PC (R5 5600GT)',
      baseRate: '₹60 / hour',
      color: 'blue',
      passes: [
        { hours: 1, price: 60, orig: 60, save: 0 },
        { hours: 2, price: 100, orig: 120, save: 20 },
        { hours: 3, price: 140, orig: 180, save: 40 },
        { hours: 4, price: 180, orig: 240, save: 60 },
        { hours: 5, price: 210, orig: 300, save: 90 },
      ]
    }
  ];

  const anytimeCategories = [
    {
      title: '🎮 PS5 Anytime Play Packages (Valid 30 Days)',
      type: 'PS5',
      note: 'Use your hours across multiple visits anytime within 30 days',
      passes: [
        { hours: 7, price: 750, orig: 1050, save: 300 },
        { hours: 10, price: 1050, orig: 1500, save: 450 },
        { hours: 15, price: 1500, orig: 2250, save: 750 },
        { hours: 20, price: 1900, orig: 3000, save: 1100 },
        { hours: 25, price: 2300, orig: 3750, save: 1450 },
        { hours: 30, price: 2650, orig: 4500, save: 1850 },
      ]
    },
    {
      title: '🕹️ PS4 Anytime Play Packages (Valid 30 Days)',
      type: 'PS4',
      note: 'Use your hours across multiple visits anytime within 30 days',
      passes: [
        { hours: 7, price: 500, orig: 700, save: 200 },
        { hours: 10, price: 700, orig: 1000, save: 300 },
        { hours: 15, price: 950, orig: 1500, save: 550 },
        { hours: 20, price: 1250, orig: 2000, save: 750 },
        { hours: 25, price: 1500, orig: 2500, save: 1000 },
        { hours: 30, price: 1750, orig: 3000, save: 1250 },
      ]
    },
    {
      title: '🖥️ PC - RX 7600 Anytime Packages (Valid 30 Days)',
      type: 'PC (RX 7600)',
      note: 'High-FPS Esports Rig anytime pass',
      passes: [
        { hours: 7, price: 400, orig: 560, save: 160 },
        { hours: 10, price: 550, orig: 800, save: 250 },
        { hours: 15, price: 780, orig: 1200, save: 420 },
        { hours: 20, price: 1000, orig: 1600, save: 600 },
        { hours: 25, price: 1200, orig: 2000, save: 800 },
        { hours: 30, price: 1400, orig: 2400, save: 1000 },
      ]
    },
    {
      title: '💻 PC - R5 5600GT Anytime Packages (Valid 30 Days)',
      type: 'PC (R5 5600GT)',
      note: 'Standard Gaming Rig anytime pass',
      passes: [
        { hours: 7, price: 300, orig: 420, save: 120 },
        { hours: 10, price: 420, orig: 600, save: 180 },
        { hours: 15, price: 600, orig: 900, save: 300 },
        { hours: 20, price: 780, orig: 1200, save: 420 },
        { hours: 25, price: 950, orig: 1500, save: 550 },
        { hours: 30, price: 1100, orig: 1800, save: 700 },
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-2xl max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
            <Tag className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-wide">
            Official Gaming Rates & Passes
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Official cafe rates • Zero online fee (Pay at counter)
          </p>

          {/* Toggle Tabs */}
          <div className="inline-flex items-center gap-1.5 p-1 bg-neutral-950 border border-neutral-800 rounded-2xl mt-4">
            <button
              onClick={() => setActiveTab('HOURLY')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'HOURLY'
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>⚡ Same-Day Passes (1h - 5h)</span>
            </button>
            <button
              onClick={() => setActiveTab('ANYTIME')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'ANYTIME'
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>🎟️ Anytime Packages (7h - 30h)</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Hourly Passes */}
        {activeTab === 'HOURLY' && (
          <div className="space-y-4">
            {/* GTA VI Launch Notice */}
            <div className="bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-neutral-900 border border-pink-500/40 rounded-2xl p-4 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🌴</span>
                  <div>
                    <div className="text-sm font-black text-white flex items-center gap-2">
                      <span>GRAND THEFT AUTO VI (GTA 6)</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-extrabold border border-pink-500/30">
                        From Nov 19
                      </span>
                    </div>
                    <span className="text-xs text-neutral-400">PlayStation 5 4K 60FPS Lounge Setup</span>
                  </div>
                </div>
                <div className="text-right sm:self-auto self-start">
                  <div className="text-base font-black text-emerald-400">₹150 / hr</div>
                  <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wide">Fixed Rate • No Discounts</div>
                </div>
              </div>
              <div className="text-[11px] text-neutral-300/80 bg-black/40 rounded-xl p-2.5 border border-neutral-800">
                ⚡ <strong>Special Launch Event Policy:</strong> Multi-hour combo discounts and membership passes do <strong>not</strong> apply to GTA VI sessions. All GTA VI gaming time is billed at the fixed standard rate of ₹150/hr.
              </div>
            </div>

            {hourlyCategories.map((cat) => (
              <div key={cat.type} className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-neutral-850 pb-2.5 mb-3">
                  <span className="font-bold text-sm text-white">{cat.title}</span>
                  <span className="text-xs text-emerald-400 font-bold bg-neutral-900 px-2.5 py-0.5 rounded-full border border-neutral-800 self-start sm:self-auto">
                    Base: {cat.baseRate}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {cat.passes.map((p) => (
                    <div
                      key={p.hours}
                      className="bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-center flex flex-col justify-between relative"
                    >
                      {p.save > 0 && (
                        <span className="absolute -top-1.5 right-1 px-1.5 py-0.2 rounded-full bg-emerald-500 text-black font-extrabold text-[8px]">
                          -₹{p.save}
                        </span>
                      )}
                      <span className="text-xs text-neutral-400 font-semibold mb-1">
                        {p.hours} {p.hours === 1 ? 'Hour' : 'Hours'}
                      </span>
                      <span className="text-base font-black text-white">
                        ₹{p.price}
                      </span>
                      {p.save > 0 ? (
                        <span className="text-[10px] text-neutral-500 line-through">
                          ₹{p.orig}
                        </span>
                      ) : (
                        <span className="text-[10px] text-neutral-500">Standard</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Anytime Packages (7h, 10h, 15h, 20h, 25h, 30h) */}
        {activeTab === 'ANYTIME' && (
          <div className="space-y-4">
            {anytimeCategories.map((cat) => (
              <div key={cat.type} className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-neutral-850 pb-2 mb-3">
                  <span className="font-bold text-sm text-white">{cat.title}</span>
                  <span className="text-[11px] text-emerald-400 font-bold bg-neutral-900 px-2.5 py-0.5 rounded-full border border-neutral-800">
                    Valid for 30 Days
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 mb-3">{cat.note}</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {cat.passes.map((p) => (
                    <div
                      key={p.hours}
                      className="bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-center flex flex-col justify-between relative"
                    >
                      <span className="absolute -top-1.5 right-1 px-1.5 py-0.2 rounded-full bg-emerald-500 text-black font-extrabold text-[8px]">
                        Save ₹{p.save}
                      </span>
                      <span className="text-xs text-neutral-400 font-semibold mb-1">
                        {p.hours} Hours
                      </span>
                      <span className="text-base font-black text-white">
                        ₹{p.price}
                      </span>
                      <span className="text-[10px] text-neutral-500 line-through">
                        ₹{p.orig}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            Zero Advance Booking
          </span>
          <span>Pay Cash / UPI at Counter</span>
        </div>
      </div>
    </div>
  );
}
