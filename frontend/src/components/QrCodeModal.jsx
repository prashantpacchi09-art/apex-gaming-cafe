import React from 'react';
import { X, Download, Smartphone, Globe, QrCode } from 'lucide-react';

export default function QrCodeModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const webUrl = typeof window !== 'undefined' ? window.location.origin : 'https://apex-gamer-web.onrender.com';
  const appDownloadUrl = `${webUrl}/ApexGamer.apk`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
            <QrCode className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide">
            Apex Gaming Cafe on Mobile
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Scan to book on mobile web or download the dedicated Android app
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* 1. Customer Web QR */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-center flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">
              <Globe className="w-3.5 h-3.5" />
              <span>Customer Web</span>
            </div>
            <div className="p-2 bg-white rounded-xl shadow-md mb-3">
              <img
                src="/qr_customer_web.png"
                alt="Scan for Customer Web"
                className="w-36 h-36 object-contain"
              />
            </div>
            <span className="text-[11px] text-neutral-400 font-mono break-all mb-2">
              {webUrl}
            </span>
            <span className="text-[10px] text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded-full border border-neutral-800">
              No download • Instant booking
            </span>
          </div>

          {/* 2. Customer Android App QR */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-center flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android App (APK)</span>
            </div>
            <div className="p-2 bg-white rounded-xl shadow-md mb-3">
              <img
                src="/qr_customer_app.png"
                alt="Scan to Install Android App"
                className="w-36 h-36 object-contain"
              />
            </div>
            <a
              href={appDownloadUrl}
              download="ApexGamer.apk"
              className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 cursor-pointer mt-auto"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download APK</span>
            </a>
          </div>
        </div>

        <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-400 text-center">
          💡 Connect your phone to cafe Wi-Fi to scan and book directly with zero queue waiting!
        </div>
      </div>
    </div>
  );
}

