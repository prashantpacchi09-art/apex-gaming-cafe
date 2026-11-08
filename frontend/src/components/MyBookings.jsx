import React, { useEffect, useState, useCallback } from 'react';
import { CalendarCheck, Ticket, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function MyBookings({ onBackToMap }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [message, setMessage] = useState('');

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getMyBookings();
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking pass?')) return;
    try {
      setCancellingId(id);
      await api.cancelBooking(id);
      setMessage('Booking cancelled successfully.');
      fetchBookings();
    } catch (err) {
      alert(err.message || 'Failed to cancel');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide flex items-center gap-2">
            <Ticket className="w-8 h-8 text-emerald-400" />
            My Gaming Passes
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Track your reserved seats, view verification codes, or manage schedules
          </p>
        </div>
        <button
          onClick={onBackToMap}
          className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors cursor-pointer"
        >
          Book Another Slot
        </button>
      </div>

      {message && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>{message}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-neutral-500">Loading your passes...</div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 bg-neutral-900 border border-neutral-800 rounded-2xl">
          <CalendarCheck className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-neutral-300">No Reservations Yet</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 mb-6">
            You don't have any gaming slots booked right now. Explore our high-end rigs and pick a time!
          </p>
          <button
            onClick={onBackToMap}
            className="px-6 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            Explore Floor Map
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookings.map((booking) => {
            const isCancelled = booking.status === 'CANCELLED';
            const isCompleted = booking.status === 'COMPLETED';

            return (
              <div
                key={booking.id}
                className={`relative rounded-2xl border p-5 transition-all ${
                  isCancelled
                    ? 'bg-neutral-950 border-neutral-900 text-neutral-600'
                    : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 shadow-xl'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3 border-b border-neutral-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm bg-neutral-950 border border-neutral-800 text-emerald-400 px-3 py-1 rounded-lg">
                      {booking.booking_code}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      isCancelled
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : isCompleted
                        ? 'bg-neutral-800 text-neutral-400'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>

                {/* Body Details */}
                <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                  <div>
                    <span className="text-neutral-500 block">Gaming Station</span>
                    <span className="text-white font-bold text-sm">
                      {booking.station?.name || `Station #${booking.station_id}`}
                    </span>
                    <span className="text-[11px] text-neutral-400 truncate block">
                      {booking.station?.category.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-500 block">Session Timing</span>
                    <span className="text-neutral-200 font-semibold">{booking.date}</span>
                    <span className="text-emerald-400 font-bold block">
                      {booking.start_time} - {booking.end_time} ({booking.duration_hours}h)
                    </span>
                  </div>
                </div>

                {booking.notes && (
                  <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800 text-xs text-neutral-400 mb-4">
                    <span className="text-neutral-500 font-medium">Request:</span> {booking.notes}
                  </div>
                )}

                {/* Footer with Price & Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
                  <div>
                    <span className="text-[11px] text-neutral-500 block">Total Billed</span>
                    <span className="text-base font-black text-emerald-400">₹{booking.total_amount}</span>
                  </div>

                  {!isCancelled && !isCompleted && (
                    <button
                      type="button"
                      disabled={cancellingId === booking.id}
                      onClick={() => handleCancel(booking.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors cursor-pointer"
                    >
                      {cancellingId === booking.id ? 'Cancelling...' : 'Cancel Reservation'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
