import React from 'react';
import { X, Printer, Download, Smartphone, Globe, QrCode } from 'lucide-react';

export default function AdminQrModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const currentHost = window.location.hostname || '192.168.29.25';
  const webUrl = `http://${currentHost}:5173`;
  const appDownloadUrl = `http://${currentHost}:5173/ApexGamer.apk`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[95vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
            <QrCode className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-wide">
            Apex Customer QR Codes & Standee
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Display at cafe counter or table stands so customers can book directly from their phone
          </p>
        </div>

        {/* Printable Card Container */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 mb-6 text-neutral-100">
          <div className="text-center mb-4 border-b border-neutral-850 pb-3">
            <h3 className="text-lg font-black text-white flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              APEX GAMING CAFE
            </h3>
            <p className="text-xs text-emerald-400 font-semibold mt-0.5">
              SCAN TO BOOK SLOTS • ZERO ONLINE ADVANCE (PAY AT COUNTER)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Customer Web QR */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-center flex flex-col items-center">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                <Globe className="w-3.5 h-3.5" />
                <span>1. Customer Web Booking</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl shadow-lg mb-2">
                <img
                  src="/qr_customer_web.png"
                  alt="Customer Web QR"
                  className="w-40 h-40 object-contain"
                />
              </div>
              <span className="text-xs text-white font-bold mb-1">
                Instant Mobile Booking
              </span>
              <span className="text-[11px] text-neutral-400 font-mono">
                {webUrl}
              </span>
            </div>

            {/* 2. Customer App QR */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-center flex flex-col items-center">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                <Smartphone className="w-3.5 h-3.5" />
                <span>2. Gamer Android App</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl shadow-lg mb-2">
                <img
                  src="/qr_customer_app.png"
                  alt="Customer App QR"
                  className="w-40 h-40 object-contain"
                />
              </div>
              <span className="text-xs text-white font-bold mb-1">
                Install ApexGamer App
              </span>
              <span className="text-[11px] text-neutral-400 font-mono">
                {appDownloadUrl}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-850 flex items-center justify-between text-[11px] text-neutral-400">
            <span>✨ Zero advance fee required</span>
            <span>🎮 PC • PS5 • PS4</span>
            <span>📍 Counter Cash / UPI</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/25 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Counter Standee / Card</span>
          </button>

          <a
            href={appDownloadUrl}
            download="ApexGamer.apk"
            className="w-full sm:w-auto py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Get APK File</span>
          </a>
        </div>
      </div>
    </div>
  );
}

