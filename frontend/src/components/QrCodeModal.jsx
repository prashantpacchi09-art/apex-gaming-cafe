import React from 'react';
import { X, Download, Smartphone, Globe, QrCode, ExternalLink } from 'lucide-react';

export default function QrCodeModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const webUrl = typeof window !== 'undefined' ? window.location.origin : 'https://apex-gamer-web.onrender.com';
  const appDownloadUrl = `${webUrl}/ApexGamer.apk`;
  const instagramUrl = 'https://www.instagram.com/apexgamingcafe_rnr/';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-2xl max-h-[92vh] overflow-y-auto">
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
            Apex Gaming Cafe Quick Connect
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Book slots online, download the mobile app, or follow us on Instagram
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
          {/* 1. Customer Web QR */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-3.5 text-center flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2.5">
              <Globe className="w-3.5 h-3.5" />
              <span>Customer Web</span>
            </div>
            <div className="p-2 bg-white rounded-xl shadow-md mb-2.5">
              <img
                src="/qr_customer_web.png"
                alt="Scan for Customer Web"
                className="w-32 h-32 object-contain"
              />
            </div>
            <span className="text-[11px] text-neutral-400 font-mono break-all mb-2">
              apex-gamer-web.onrender.com
            </span>
            <span className="text-[10px] text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded-full border border-neutral-800 mt-auto">
              No download • Instant booking
            </span>
          </div>

          {/* 2. Customer Android App QR */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-3.5 text-center flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2.5">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android App (APK)</span>
            </div>
            <div className="p-2 bg-white rounded-xl shadow-md mb-2.5">
              <img
                src="/qr_customer_app.png"
                alt="Scan to Install Android App"
                className="w-32 h-32 object-contain"
              />
            </div>
            <span className="text-[11px] text-neutral-400 mb-2">
              Fast 1-tap slot access
            </span>
            <a
              href={appDownloadUrl}
              download="ApexGamer.apk"
              className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 cursor-pointer mt-auto"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download APK</span>
            </a>
          </div>

          {/* 3. Instagram Follow QR */}
          <div className="bg-gradient-to-b from-neutral-950 to-pink-950/20 border border-pink-500/30 rounded-2xl p-3.5 text-center flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-xs font-bold text-pink-400 uppercase tracking-wider mb-2.5">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
              </svg>
              <span>Instagram</span>
            </div>
            <div className="p-1 bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 rounded-xl shadow-md mb-2.5">
              <img
                src="/instagram_qr.jpg"
                alt="Scan to follow @apexgamingcafe_rnr on Instagram"
                className="w-32 h-32 object-cover rounded-lg"
              />
            </div>
            <span className="text-xs font-bold text-white mb-2">
              @APEXGAMINGCAFE_RNR
            </span>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-1.5 px-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-pink-600/20 cursor-pointer mt-auto"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Follow on Instagram</span>
            </a>
          </div>
        </div>

        <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-400 text-center flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>💡 Tag <strong>@APEXGAMINGCAFE_RNR</strong> in your stories & reels to win free bonus gaming hours!</span>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-400 hover:text-pink-300 font-bold underline shrink-0"
          >
            Visit Profile →
          </a>
        </div>
      </div>
    </div>
  );
}

