import React from 'react';
import { X, Tag, Sparkles, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function RatesModal({ isOpen, onClose, gamingPlans = [], onSelectPlan }) {
  if (!isOpen) return null;

  const categories = [
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-2xl max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
            <Tag className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-wide">
            Official Gaming Rates & Passes
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Official cafe rates for PS5, PS4, RX 7600 & R5 5600GT • Pay Cash/UPI at Counter
          </p>
        </div>

        {/* Pricing Category Cards */}
        <div className="space-y-5">
          {categories.map((cat) => (
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
