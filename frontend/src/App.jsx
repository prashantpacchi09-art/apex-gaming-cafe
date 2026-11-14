import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import FloorMap from './components/FloorMap';
import SlotCalendar from './components/SlotCalendar';
import BookingModal from './components/BookingModal';
import AuthModal from './components/AuthModal';
import MyBookings from './components/MyBookings';
import QrCodeModal from './components/QrCodeModal';
import RatesModal from './components/RatesModal';
import Gta6PosterModal from './components/Gta6PosterModal';
import { api, calculateStationPrice } from './services/api';
import { Gamepad2, Sparkles, Zap, ShieldCheck, ArrowRight, Tag, Flame, Smartphone, QrCode } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('booking'); // 'booking' | 'my-bookings'
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isRatesOpen, setIsRatesOpen] = useState(false);
  const [isGta6PosterOpen, setIsGta6PosterOpen] = useState(false);
  const [isGta6BookingMode, setIsGta6BookingMode] = useState(false);

  // Booking states
  const [stations, setStations] = useState([]);
  const [gamingPlans, setGamingPlans] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState(14); // 2:00 PM default
  const [duration, setDuration] = useState(2); // 2 hours default
  const [bookingsToday, setBookingsToday] = useState([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [mobileBookingTab, setMobileBookingTab] = useState('rigs'); // 'rigs' | 'slots'

  // Permanent sign-in: Restore cached user profile immediately
  useEffect(() => {
    const cachedUser = localStorage.getItem('apex_user');
    if (cachedUser) {
      try {
        setCurrentUser(JSON.parse(cachedUser));
      } catch (e) {
        console.error('Failed to parse cached user:', e);
      }
    }

    const token = localStorage.getItem('apex_token');
    if (token) {
      api.getMe()
        .then(user => {
          setCurrentUser(user);
          localStorage.setItem('apex_user', JSON.stringify(user));
        })
        .catch(err => {
          if (err.message && err.message.toLowerCase().includes('not authenticated')) {
            localStorage.removeItem('apex_token');
            localStorage.removeItem('apex_user');
            setCurrentUser(null);
          }
        });
    }
  }, []);

  // Fetch stations and plans on mount
  useEffect(() => {
    api.getStations()
      .then(data => {
        setStations(data);
        if (data.length > 0) {
          setSelectedStation(prev => prev || data[0]);
        }
      })
      .catch(console.error);

    api.getGamingPlans()
      .then(data => setGamingPlans(data))
      .catch(console.error);
  }, []);

  // Fetch availability when selectedDate changes
  const refreshAvailability = useCallback(() => {
    api.getAvailability(selectedDate)
      .then(data => setBookingsToday(data))
      .catch(console.error);
  }, [selectedDate]);

  useEffect(() => {
    refreshAvailability();
  }, [refreshAvailability]);

  const handleLogout = () => {
    localStorage.removeItem('apex_token');
    localStorage.removeItem('apex_user');
    setCurrentUser(null);
    setCurrentView('booking');
  };

  const handleBookingCompleted = () => {
    refreshAvailability();
  };

  const stickyPricing = useMemo(() => {
    return calculateStationPrice(selectedStation, duration, gamingPlans, isGta6BookingMode);
  }, [selectedStation, duration, gamingPlans, isGta6BookingMode]);

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenQr={() => setIsQrOpen(true)}
        onOpenRates={() => setIsRatesOpen(true)}
        onOpenGta6={() => setIsGta6PosterOpen(true)}
      />

      {/* QR Codes Modal */}
      <QrCodeModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} />

      {/* Rates & Price List Modal */}
      <RatesModal isOpen={isRatesOpen} onClose={() => setIsRatesOpen(false)} gamingPlans={gamingPlans} />

      {/* Main Content Areas */}
      <main className="flex-1 pb-24 sm:pb-8">
        {currentView === 'booking' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            
            {/* GTA VI Official Launch Hero Showcase Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-950/60 via-purple-950/50 to-neutral-950 border border-pink-500/40 p-4 sm:p-6 mb-5 shadow-2xl shadow-pink-950/30">
              <div className="absolute -top-16 -right-16 w-64 h-64 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
                {/* Poster Thumbnail */}
                <div 
                  onClick={() => setIsGta6PosterOpen(true)}
                  className="relative shrink-0 w-full sm:w-44 h-48 sm:h-56 rounded-2xl overflow-hidden border border-pink-500/40 shadow-xl cursor-pointer group"
                >
                  <img 
                    src="/gta6_poster.jpg" 
                    alt="GTA VI Official Launch Poster" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex items-end p-2.5">
                    <span className="text-[10px] font-bold text-pink-300 flex items-center gap-1 bg-black/70 px-2 py-0.5 rounded-lg border border-pink-500/30">
                      🔍 Tap to Enlarge
                    </span>
                  </div>
                </div>

                {/* Details & No Discount Announcement */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md">
                      🌴 GTA VI Official Launch
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-neutral-900 text-cyan-400 border border-cyan-500/30">
                      Playable From Nov 19th
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-neutral-900 text-pink-300 border border-pink-500/30">
                      PlayStation 5
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight mb-1">
                    Grand Theft Auto VI at Apex Gaming Cafe
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-300 mb-3 max-w-2xl">
                    Experience Vice City in 4K 60FPS ray-tracing with DualSense haptic triggers on our PlayStation 5 lounge setup.
                  </p>

                  {/* Pricing & Strict No Discount Policy */}
                  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-400 font-semibold">Launch Rate:</span>
                      <span className="text-xl sm:text-2xl font-black text-emerald-400">₹150 / hr</span>
                    </div>
                    <div className="px-3 py-1 rounded-xl bg-rose-950/60 border border-rose-500/50 text-[11px] font-bold text-rose-300 flex items-center gap-1.5">
                      <span>⛔</span>
                      <span>Fixed Rate — Strictly No Discounts or Passes Apply</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0">
                  <button
                    onClick={() => {
                      const ps5 = stations.find(s => s.name?.includes('PS5') || s.category?.includes('PS5'));
                      if (ps5) setSelectedStation(ps5);
                      setSelectedDate('2026-11-19');
                      setIsGta6BookingMode(true);
                      setIsBookingModalOpen(true);
                    }}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white shadow-lg shadow-pink-600/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Gamepad2 className="w-4 h-4" />
                    <span>Pre-Book GTA VI (Nov 19)</span>
                  </button>

                  <button
                    onClick={() => setIsGta6PosterOpen(true)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs bg-neutral-900/90 hover:bg-neutral-850 border border-pink-500/30 text-pink-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>🖼️ View Poster & Pass Code</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Promotional Offers & Marketing Cards Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
              {/* Promo Card 1: PS5 Hot Rates */}
              <div 
                onClick={() => {
                  const ps5 = stations.find(s => s.name?.includes('PS5') || s.category?.includes('PS5'));
                  if (ps5) setSelectedStation(ps5);
                  setMobileBookingTab('rigs');
                  setIsRatesOpen(true);
                }}
                className="bg-neutral-900 border border-neutral-800 hover:border-emerald-500/50 rounded-2xl p-4 transition-all cursor-pointer group shadow-lg flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-1">
                    <Flame className="w-3.5 h-3.5 text-emerald-400" />
                    <span>PS5 DISCOUNT PASSES</span>
                  </div>
                  <div className="text-white font-extrabold text-sm group-hover:text-emerald-400 transition-colors">
                    2h ₹250 • 3h ₹360 • 5h ₹550
                  </div>
                  <span className="text-[11px] text-neutral-400">Save up to ₹200 on PlayStation 5</span>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  View Rates →
                </span>
              </div>

              {/* Promo Card 2: PC Battle Stations */}
              <div 
                onClick={() => {
                  const pc = stations.find(s => s.name?.includes('PC') || s.category?.includes('PC'));
                  if (pc) setSelectedStation(pc);
                  setMobileBookingTab('rigs');
                }}
                className="bg-neutral-900 border border-neutral-800 hover:border-emerald-500/50 rounded-2xl p-4 transition-all cursor-pointer group shadow-lg flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-1">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>PC ARENA (RX 7600 & R5 5600GT)</span>
                  </div>
                  <div className="text-white font-extrabold text-sm group-hover:text-emerald-400 transition-colors">
                    RX 7600 ₹80/hr • R5 5600GT ₹60/hr
                  </div>
                  <span className="text-[11px] text-neutral-400">High-FPS esports rigs with 144Hz+ displays</span>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-neutral-800 text-emerald-400 border border-neutral-700">
                  Select Rig →
                </span>
              </div>

              {/* Promo Card 3: Pay at Counter & Mobile QR */}
              <div 
                onClick={() => setIsRatesOpen(true)}
                className="bg-neutral-900 border border-neutral-800 hover:border-emerald-500/50 rounded-2xl p-4 transition-all cursor-pointer group shadow-lg flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>ZERO ADVANCE FEE</span>
                  </div>
                  <div className="text-white font-extrabold text-sm group-hover:text-emerald-400 transition-colors">
                    Pay at Cafe Counter!
                  </div>
                  <span className="text-[11px] text-neutral-400">Cash / UPI on arrival • View Full Rate Card</span>
                </div>
                <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Tag className="w-3.5 h-3.5" />
                  <span>All Rates</span>
                </span>
              </div>
            </div>

            {/* Simple, Clean Header */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 mb-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  <h1 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                    Live Floor & Station Reservation
                  </h1>
                </div>
                <p className="text-xs text-neutral-400">
                  Click on any rig to see full specs, hourly rate cards, and discount passes. <strong className="text-emerald-400">Zero advance fee — Pay at counter on arrival.</strong>
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className="px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-[11px] font-medium text-neutral-300">
                  📍 Pay at Counter
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-400">
                  ⚡ Instant Pass
                </span>
              </div>
            </div>

            {/* Mobile Step Switcher */}
            <div className="lg:hidden flex items-center p-1 bg-neutral-900 border border-neutral-800 rounded-2xl mb-6 shadow-lg">
              <button
                onClick={() => setMobileBookingTab('rigs')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  mobileBookingTab === 'rigs'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span>1. Choose Rig</span>
                {selectedStation && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
              </button>
              <button
                onClick={() => setMobileBookingTab('slots')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  mobileBookingTab === 'slots'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span>2. Date & Time</span>
                <span className="text-[10px] bg-neutral-950 px-1.5 py-0.5 rounded text-neutral-300 font-mono border border-neutral-800">
                  {selectedSlot}:00 ({duration}h)
                </span>
              </button>
            </div>

            {/* Split View: Left (Floor Map) & Right (Slot Calendar) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className={`lg:col-span-7 ${mobileBookingTab !== 'rigs' ? 'hidden lg:block' : 'block'}`}>
                <FloorMap
                  stations={stations}
                  selectedStation={selectedStation}
                  onSelectStation={(st) => setSelectedStation(st)}
                  bookingsToday={bookingsToday}
                  selectedTimeSlot={[selectedSlot, duration]}
                  gamingPlans={gamingPlans}
                  selectedDuration={duration}
                  onSelectDuration={(h) => setDuration(h)}
                />
              </div>

              <div className={`lg:col-span-5 sticky top-24 ${mobileBookingTab !== 'slots' ? 'hidden lg:block' : 'block'}`}>
                <SlotCalendar
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  selectedStation={selectedStation}
                  selectedSlot={selectedSlot}
                  setSelectedSlot={setSelectedSlot}
                  duration={duration}
                  setDuration={setDuration}
                  bookingsToday={bookingsToday}
                  gamingPlans={gamingPlans}
                  onProceedBooking={() => setIsBookingModalOpen(true)}
                />
              </div>
            </div>

            {/* Mobile Floating Action Bar */}
            {selectedStation && (
              <div className="lg:hidden fixed bottom-14 inset-x-0 z-30 px-3 pb-1">
                <div className="bg-neutral-900/95 backdrop-blur-xl border border-neutral-800 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                      <span className="truncate">{selectedStation.name}</span>
                    </div>
                    <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <span>₹{stickyPricing.finalPrice}</span>
                      {stickyPricing.discount > 0 && (
                        <span className="text-neutral-500 line-through text-[10px]">₹{stickyPricing.originalPrice}</span>
                      )}
                      <span className="text-neutral-400 text-[10px]">({duration}h)</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (mobileBookingTab === 'rigs') {
                        setMobileBookingTab('slots');
                      } else {
                        setIsBookingModalOpen(true);
                      }
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <span>{mobileBookingTab === 'rigs' ? 'Pick Slot' : 'Book Now'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {currentView === 'my-bookings' && (
          <MyBookings onBackToMap={() => setCurrentView('booking')} />
        )}
      </main>

      {/* Bottom Navigation for Mobile */}
      <BottomNav
        currentView={currentView}
        setCurrentView={setCurrentView}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
        }}
      />

      <Gta6PosterModal
        isOpen={isGta6PosterOpen}
        onClose={() => setIsGta6PosterOpen(false)}
        onPreBook={() => {
          const ps5 = stations.find(s => s.name?.includes('PS5') || s.category?.includes('PS5'));
          if (ps5) setSelectedStation(ps5);
          setSelectedDate('2026-11-19');
          setIsGta6BookingMode(true);
          setIsBookingModalOpen(true);
        }}
      />

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setIsGta6BookingMode(false);
        }}
        station={selectedStation}
        date={selectedDate}
        startHour={selectedSlot}
        duration={duration}
        currentUser={currentUser}
        gamingPlans={gamingPlans}
        isGta6Mode={isGta6BookingMode}
        onBookingSuccess={handleBookingCompleted}
        onOpenAuth={() => {
          setIsBookingModalOpen(false);
          setIsAuthOpen(true);
        }}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-neutral-900 bg-neutral-950 py-6 text-center text-xs text-neutral-500">
        <p>© 2026 Apex Gaming Cafe. Real-time Station Booking & Esports Hub.</p>
      </footer>
    </div>
  );
}
