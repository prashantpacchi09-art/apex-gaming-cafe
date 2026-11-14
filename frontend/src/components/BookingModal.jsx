import React, { useState, useMemo } from 'react';
import { X, CheckCircle2, Gamepad2, Clock, Calendar, AlertCircle, Tag, ShieldCheck } from 'lucide-react';
import { api, calculateStationPrice } from '../services/api';

export default function BookingModal({
  isOpen,
  onClose,
  station,
  date,
  startHour,
  duration,
  currentUser,
  gamingPlans = [],
  isGta6Mode = false,
  onBookingSuccess,
  onOpenAuth,
}) {
  const [isGta6, setIsGta6] = useState(isGta6Mode || false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Sync if isGta6Mode prop changes
  React.useEffect(() => {
    setIsGta6(Boolean(isGta6Mode || date === '2026-11-19'));
  }, [isGta6Mode, date]);

  const pricing = useMemo(() => {
    return calculateStationPrice(station, duration, gamingPlans, isGta6);
  }, [station, duration, gamingPlans, isGta6]);

  if (!isOpen) return null;

  const startTimeStr = `${String(startHour).padStart(2, '0')}:00`;

  const handleConfirm = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const gtaPrefix = isGta6 ? '🎮 GTA VI Launch [No Discounts - Fixed Rate]' : '';
      const combinedNote = [gtaPrefix, notes].filter(Boolean).join(' | ');
      const counterNote = combinedNote ? `${combinedNote} [Pay at Counter]` : 'Pay at Counter';
      const res = await api.createBooking({
        station_id: station.id,
        date,
        start_time: startTimeStr,
        duration_hours: duration,
        notes: counterNote,
      });

      setConfirmedBooking(res);
      if (onBookingSuccess) onBookingSuccess(res);
    } catch (err) {
      setError(err.message || 'Failed to complete booking');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmedBooking(null);
    setError('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-2xl p-5 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Mobile Pull Bar */}
        <div className="sm:hidden w-12 h-1 bg-neutral-700 rounded-full mx-auto mb-3" />
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {confirmedBooking ? (
          /* Success Screen with Pass / Ticket */
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black text-white tracking-wide mb-1">Slot Reserved!</h3>
            <p className="text-xs text-neutral-400 mb-6">Your gaming station is booked. Show this pass code at the cafe desk.</p>

            {/* Gaming Pass Ticket Card */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 mb-6 text-left relative overflow-hidden shadow-xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Apex Pass
                </span>
                <span className="text-xs font-mono font-bold bg-neutral-800 text-emerald-300 px-3 py-1 rounded-full border border-neutral-700">
                  {confirmedBooking.booking_code}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                <div>
                  <span className="text-neutral-500 block">Rig / Station</span>
                  <span className="text-white font-bold text-sm">{station.name}</span>
                  <span className="text-[11px] text-neutral-400 block truncate">{station.specs}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Schedule</span>
                  <span className="text-white font-bold text-sm">{date}</span>
                  <span className="text-emerald-400 font-semibold">{confirmedBooking.start_time} - {confirmedBooking.end_time}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-neutral-800 text-xs">
                <div>
                  <span className="text-neutral-500 block">Payment Mode</span>
                  <span className="text-emerald-400 font-bold">Pay at Counter</span>
                </div>
                <div className="text-right">
                  <span className="text-neutral-500 block">Amount on Arrival</span>
                  <span className="text-base font-black text-emerald-400">₹{confirmedBooking.total_amount}</span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-neutral-850 text-center">
                <span className="text-[11px] text-neutral-400">
                  ✨ No online advance needed. Pay via Cash / UPI at the cafe counter.
                </span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3 rounded-xl font-bold bg-neutral-800 hover:bg-neutral-700 text-white transition-all cursor-pointer border border-neutral-700"
            >
              Done & Return to Map
            </button>
          </div>
        ) : (
          /* Confirmation details form */
          <div>
            <div className="flex items-center gap-3 mb-5 border-b border-neutral-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Review & Confirm Slot</h3>
                <p className="text-xs text-neutral-400">Lock in your seat at Apex Gaming Cafe</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Summary Details */}
            <div className="space-y-3 bg-neutral-950 p-4 rounded-xl border border-neutral-800 mb-5 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400 flex items-center gap-1.5">
                  <Gamepad2 className="w-4 h-4 text-emerald-400" /> Station
                </span>
                <span className="font-bold text-white">{station?.name} ({station?.category.replace('_', ' ')})</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-neutral-400 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-neutral-400" /> Date
                </span>
                <span className="font-semibold text-neutral-200">{date}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-neutral-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-neutral-400" /> Time Window
                </span>
                <span className="font-semibold text-neutral-200">
                  {startTimeStr} ({duration} {duration === 1 ? 'Hour' : 'Hours'})
                </span>
              </div>

              {isGta6 ? (
                <div className="flex items-center justify-between text-xs text-pink-300 bg-pink-950/40 border border-pink-500/30 px-3 py-2 rounded-lg">
                  <span className="font-bold flex items-center gap-1.5">
                    🌴 GTA VI Special Launch:
                  </span>
                  <span className="font-extrabold text-rose-300">Fixed Rate • No Discounts</span>
                </div>
              ) : pricing.discount > 0 && (
                <>
                  <div className="flex justify-between items-center text-xs text-neutral-400 pt-2 border-t border-neutral-850">
                    <span>Standard Rate:</span>
                    <span className="line-through text-neutral-500">₹{pricing.originalPrice}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-emerald-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" /> Plan Discount:
                    </span>
                    <span>-₹{pricing.discount}</span>
                  </div>
                </>
              )}

              <div className="border-t border-neutral-800 pt-2.5 flex justify-between items-center">
                <span className="text-neutral-200 font-semibold">Total Price:</span>
                <span className="text-xl font-black text-emerald-400">₹{pricing.finalPrice}</span>
              </div>
            </div>

            {/* GTA VI Launch Mode Selector */}
            <div 
              onClick={() => setIsGta6(!isGta6)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between mb-4 ${
                isGta6 
                  ? 'bg-pink-950/40 border-pink-500/60 shadow-lg shadow-pink-500/10' 
                  : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🌴</span>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Play Grand Theft Auto VI (GTA 6)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-black border border-pink-500/30">
                      From Nov 19
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    {isGta6 ? (
                      <span className="text-rose-400 font-semibold">Fixed ₹150/hr • Strictly no discount offers or passes apply</span>
                    ) : (
                      <span>Tick if you are booking for the GTA VI launch</span>
                    )}
                  </div>
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={isGta6} 
                onChange={(e) => setIsGta6(e.target.checked)} 
                className="accent-pink-500 w-4 h-4 cursor-pointer shrink-0"
              />
            </div>

            {/* Special Request Notes */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-neutral-400 mb-1">
                Special Requests / Pre-install Game (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Please update Valorant / Have 2 PS5 controllers ready"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500 placeholder-neutral-600"
              />
            </div>

            {/* Zero Advance Notice */}
            <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-bold text-emerald-400">Pay at Cafe Counter</span>
              </div>
              <span className="text-[11px] text-neutral-400">Zero Advance • Cash / UPI on arrival</span>
            </div>

            {/* Action Button */}
            {!currentUser ? (
              <div className="text-center">
                <p className="text-xs text-amber-400 mb-3">Sign in with Gmail to reserve your slot (Pay at counter)</p>
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="w-full py-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-lg shadow-emerald-600/25 transition-all text-sm"
                >
                  Sign In with Gmail to Reserve
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={handleConfirm}
                className="w-full py-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition-all hover:scale-101 cursor-pointer disabled:opacity-50 text-sm"
              >
                {loading ? 'Reserving Slot...' : `Reserve Slot • Pay ₹${pricing.finalPrice} at Counter`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
