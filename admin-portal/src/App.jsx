import React, { useState, useEffect, useCallback, useRef } from 'react';
import AdminNavbar from './components/AdminNavbar';
import AdminBottomNav from './components/AdminBottomNav';
import StaffLogin from './components/StaffLogin';
import AdminKpiCards from './components/AdminKpiCards';
import BookingCheckInDesk from './components/BookingCheckInDesk';
import SetupsManager from './components/SetupsManager';
import SessionsManager from './components/SessionsManager';
import CustomersManager from './components/CustomersManager';
import PlansManager from './components/PlansManager';
import ReportsView from './components/ReportsView';
import AdminQrModal from './components/AdminQrModal';
import { api } from './services/api';
import { Monitor, Clock, Ticket, Users, Tag, TrendingUp, Bell, CheckCircle2, X } from 'lucide-react';

function playChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.45);
  } catch (e) {
    console.debug('Audio chime error:', e);
  }
}

export default function App() {
  const [staffUser, setStaffUser] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [currentTab, setCurrentTab] = useState('setups'); // 'setups' | 'sessions' | 'bookings' | 'customers' | 'plans' | 'reports'

  // Data states
  const [stats, setStats] = useState(null);
  const [setups, setSetups] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [filterDate, setFilterDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [newBookingToast, setNewBookingToast] = useState(null);

  // Track known booking IDs to trigger instant alerts
  const knownBookingIdsRef = useRef(new Set());
  const isFirstLoadRef = useRef(true);

  // Check existing cached admin user & token on mount for permanent sign-in
  useEffect(() => {
    const cachedStaff = localStorage.getItem('apex_admin_user');
    if (cachedStaff) {
      try {
        const parsed = JSON.parse(cachedStaff);
        if (parsed?.is_admin) {
          setStaffUser(parsed);
          setLoadingInitial(false);
        }
      } catch (e) {
        console.error('Failed to parse cached admin:', e);
      }
    }

    const token = localStorage.getItem('apex_admin_token');
    if (token) {
      api.getMe()
        .then((user) => {
          if (user?.is_admin) {
            setStaffUser(user);
            localStorage.setItem('apex_admin_user', JSON.stringify(user));
          } else {
            localStorage.removeItem('apex_admin_token');
            localStorage.removeItem('apex_admin_user');
            setStaffUser(null);
          }
        })
        .catch((err) => {
          // If 401 explicitly, clear. Otherwise keep cached admin session for offline/mobile stability
          if (err?.response?.status === 401) {
            localStorage.removeItem('apex_admin_token');
            localStorage.removeItem('apex_admin_user');
            setStaffUser(null);
          }
        })
        .finally(() => setLoadingInitial(false));
    } else {
      setLoadingInitial(false);
    }
  }, []);

  // Process incoming bookings and trigger alert on new customer booking
  const processBookings = useCallback((bookingsData) => {
    if (!bookingsData || !Array.isArray(bookingsData)) return;

    if (!isFirstLoadRef.current) {
      const newArrival = bookingsData.find(
        (b) => !knownBookingIdsRef.current.has(b.id) && b.status === 'CONFIRMED'
      );

      if (newArrival) {
        playChime();
        setNewBookingToast({
          code: newArrival.booking_code,
          name: newArrival.customer_name,
          station: newArrival.station?.name || 'Station',
          time: newArrival.start_time,
          amount: newArrival.total_amount,
        });
      }
    }

    bookingsData.forEach((b) => knownBookingIdsRef.current.add(b.id));
    isFirstLoadRef.current = false;
  }, []);

  // Fetch all desk data
  const fetchAllData = useCallback(async () => {
    if (!staffUser) return;
    try {
      setIsRefreshing(true);
      const [statsData, setupsData, sessionsData, customersData, plansData, bookingsData] = await Promise.all([
        api.getAdminStats().catch(() => null),
        api.getSetups().catch(() => []),
        api.getSessions(true).catch(() => []),
        api.getCustomers().catch(() => []),
        api.getPlans().catch(() => []),
        api.getAllBookings(filterDate, filterStatus).catch(() => []),
      ]);

      if (statsData) setStats(statsData);
      setSetups(setupsData);
      setSessions(sessionsData);
      setCustomers(customersData);
      setPlans(plansData);
      if (bookingsData) {
        processBookings(bookingsData);
        setBookings(bookingsData);
      }
    } catch (err) {
      console.error('Error fetching admin desk data:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [staffUser, filterDate, filterStatus, processBookings]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Real-time background sync: Polls every 4 seconds so all phones, laptops & desktop software stay 100% in sync!
  useEffect(() => {
    if (!staffUser) return;

    const interval = setInterval(async () => {
      try {
        const [bookingsData, sessionsData, setupsData, statsData] = await Promise.all([
          api.getAllBookings(filterDate, filterStatus).catch(() => null),
          api.getSessions(true).catch(() => null),
          api.getSetups().catch(() => null),
          api.getAdminStats().catch(() => null),
        ]);
        if (bookingsData) {
          processBookings(bookingsData);
          setBookings(bookingsData);
        }
        if (sessionsData) {
          setSessions(sessionsData);
        }
        if (setupsData) {
          setSetups(setupsData);
        }
        if (statsData) {
          setStats(statsData);
        }
      } catch {
        // silent sync
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [staffUser, filterDate, filterStatus, processBookings]);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      if (newStatus === 'CHECKED_IN') {
        await api.checkinBooking(bookingId);
      } else {
        await api.updateBookingStatus(bookingId, newStatus);
      }
      fetchAllData();
    } catch (err) {
      alert(err.message || 'Action failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('apex_admin_token');
    localStorage.removeItem('apex_admin_user');
    setStaffUser(null);
  };

  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-neutral-500 text-xs">
        Initializing Apex Admin Suite...
      </div>
    );
  }

  if (!staffUser) {
    return <StaffLogin onLoginSuccess={(user) => setStaffUser(user)} />;
  }

  const tabItems = [
    { id: 'setups', label: 'Rigs & Floor', icon: Monitor },
    { id: 'sessions', label: 'Live Sessions', icon: Clock },
    { id: 'bookings', label: 'Bookings Desk', icon: Ticket },
    { id: 'customers', label: 'Gamers & Wallet', icon: Users },
    { id: 'plans', label: 'Plans & Offers', icon: Tag },
    { id: 'reports', label: 'Revenue Reports', icon: TrendingUp },
  ];

  const pendingBookingsCount = bookings.filter((b) => b.status === 'CONFIRMED').length;

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col font-sans selection:bg-emerald-600 selection:text-white pb-18 lg:pb-6">
      <AdminNavbar
        staffUser={staffUser}
        onLogout={handleLogout}
        onRefresh={fetchAllData}
        isRefreshing={isRefreshing}
        onOpenQr={() => setIsQrOpen(true)}
        newBookingCount={pendingBookingsCount}
      />

      {/* New Booking Real-time Notification Banner */}
      {newBookingToast && (
        <div className="fixed top-20 right-4 left-4 sm:left-auto sm:w-96 z-50 bg-emerald-950/95 border-2 border-emerald-500 rounded-2xl p-4 shadow-2xl backdrop-blur-xl animate-bounce">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-black flex items-center justify-center font-bold">
                <Bell className="w-4 h-4 animate-ring" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
                  New Customer Booking!
                </span>
                <span className="text-sm font-bold text-white block">
                  {newBookingToast.name} • {newBookingToast.station}
                </span>
              </div>
            </div>
            <button
              onClick={() => setNewBookingToast(null)}
              className="text-neutral-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2 text-xs text-neutral-300 flex items-center justify-between border-t border-emerald-800/60 pt-2">
            <span>Time: <strong>{newBookingToast.time}</strong></span>
            <span className="text-emerald-400 font-bold">Pay at Counter: ₹{newBookingToast.amount}</span>
          </div>
          <button
            onClick={() => {
              setCurrentTab('bookings');
              setNewBookingToast(null);
            }}
            className="w-full mt-2 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            Open Check-In Desk ({newBookingToast.code})
          </button>
        </div>
      )}

      {/* QR Codes Modal */}
      <AdminQrModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 w-full">
        {/* KPI Dashboard Cards */}
        <AdminKpiCards stats={stats} />

        {/* Desktop Tab Switcher */}
        <div className="hidden lg:flex items-center gap-2 p-1 bg-neutral-900 border border-neutral-800 rounded-2xl mb-6">
          {tabItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 relative ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.id === 'bookings' && pendingBookingsCount > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 text-black font-black text-[10px] flex items-center justify-center">
                    {pendingBookingsCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Views */}
        {currentTab === 'setups' && (
          <SetupsManager
            setups={setups}
            onRefresh={fetchAllData}
            onStartSessionForStation={(st) => setCurrentTab('sessions')}
          />
        )}

        {currentTab === 'sessions' && (
          <SessionsManager
            sessions={sessions}
            setups={setups}
            customers={customers}
            onRefresh={fetchAllData}
          />
        )}

        {currentTab === 'bookings' && (
          <BookingCheckInDesk
            bookings={bookings}
            loading={isRefreshing}
            filterDate={filterDate}
            setFilterDate={setFilterDate}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {currentTab === 'customers' && (
          <CustomersManager
            customers={customers}
            plans={plans}
            onRefresh={fetchAllData}
          />
        )}

        {currentTab === 'plans' && (
          <PlansManager
            plans={plans}
            onRefresh={fetchAllData}
          />
        )}

        {currentTab === 'reports' && (
          <ReportsView />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden">
        <AdminBottomNav
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          bookingBadgeCount={pendingBookingsCount}
        />
      </div>

      <footer className="hidden lg:block mt-auto border-t border-neutral-900 bg-neutral-950 py-5 text-center text-xs text-neutral-600">
        <p>Apex Gaming Cafe • Staff Operations & Management Suite</p>
      </footer>
    </div>
  );
}
