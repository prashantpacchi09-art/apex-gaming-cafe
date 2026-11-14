import React from 'react';
import { X, Download, Share2, Gamepad2, Calendar, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Gta6PosterModal({ isOpen, onClose, onPreBook }) {
  if (!isOpen) return null;

  const shareText = encodeURIComponent(
    "🌴 GRAND THEFT AUTO VI ARRIVES AT APEX GAMING CAFE!\n\n" +
    "🎮 Available from: November 19th\n" +
    "⚡ Rate: Only ₹150/hr on PlayStation 5 (Fixed Rate • No discounts)\n" +
    "🎟️ Pre-book your slot online & get your instant pass code:\n" +
    "https://apex-gamer-web.onrender.com"
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-neutral-950 border border-pink-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[92vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 text-neutral-400 hover:text-white p-2 rounded-full bg-black/60 border border-neutral-700 hover:border-neutral-500 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Visual Poster */}
        <div className="md:w-1/2 bg-black flex items-center justify-center p-3 sm:p-4 overflow-hidden border-b md:border-b-0 md:border-r border-neutral-800">
          <div className="relative group rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 max-h-[50vh] md:max-h-full">
            <img
              src="/gta6_poster.jpg"
              alt="Apex Gaming Cafe - GTA VI Official Promotional Poster"
              className="w-full h-full object-contain rounded-2xl group-hover:scale-101 transition-transform duration-300"
            />
            <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] text-pink-300 border border-pink-500/30 font-bold">
              HD Official Poster
            </div>
          </div>
        </div>

        {/* Right Column: Launch Details, No-Discount Policy, & Actions */}
        <div className="md:w-1/2 p-5 sm:p-7 flex flex-col justify-between overflow-y-auto">
          
          <div>
            {/* Header Badge */}
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wider uppercase bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-sm">
                🌴 Vice City Launch
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-neutral-900 text-emerald-400 border border-neutral-800">
                PlayStation 5
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
              Grand Theft Auto VI
            </h2>
            <p className="text-xs text-neutral-400 mb-4">
              Experience the next generation of open-world gaming with 4K 60FPS ray-tracing, dynamic weather, and DualSense haptic triggers at Apex Gaming Cafe.
            </p>

            {/* Launch Spec Highlights */}
            <div className="space-y-2.5 bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400 flex items-center gap-1.5 font-semibold">
                  <Calendar className="w-4 h-4 text-cyan-400" /> Playable Starting:
                </span>
                <span className="font-extrabold text-cyan-300 text-sm">November 19th, 2026</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400 flex items-center gap-1.5 font-semibold">
                  <Gamepad2 className="w-4 h-4 text-pink-400" /> Platform:
                </span>
                <span className="font-bold text-white">PlayStation 5 (4K 60FPS)</span>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-800">
                <span className="text-neutral-300 font-bold">Launch Rate:</span>
                <span className="text-xl font-black text-emerald-400">₹150 / hour</span>
              </div>
            </div>

            {/* STRICT NO-DISCOUNT POLICY ALERT */}
            <div className="bg-rose-950/40 border border-rose-500/40 rounded-2xl p-3.5 mb-5 flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-black text-rose-300 block mb-0.5 uppercase tracking-wide">
                  Fixed Rate Policy — No Discounts Applicable
                </span>
                <span className="text-rose-200/80 leading-relaxed block text-[11px]">
                  Grand Theft Auto VI is an exclusive special launch event. <strong>No membership passes, multi-hour discount combos, or coupon codes</strong> are applicable. All sessions are billed at the fixed standard rate of ₹150/hr.
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2 border-t border-neutral-850">
            {/* Primary CTA: Pre-book */}
            <button
              onClick={() => {
                onClose();
                if (onPreBook) onPreBook();
              }}
              className="w-full py-3 px-4 rounded-xl font-black text-sm bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white shadow-lg shadow-pink-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Pre-Book GTA VI Slot (From Nov 19)</span>
            </button>

            {/* Secondary CTAs: Download & WhatsApp Share */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href="/gta6_poster.png"
                download="Apex_Gaming_Cafe_GTA6_Launch_Poster.png"
                className="py-2.5 px-3 rounded-xl font-bold text-xs bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-200 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Download Poster</span>
              </a>

              <a
                href={`https://api.whatsapp.com/send?text=${shareText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl font-bold text-xs bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Share WhatsApp</span>
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
