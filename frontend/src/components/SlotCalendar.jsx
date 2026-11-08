import React, { useMemo } from 'react';
import { Calendar, Clock, CheckCircle2, Tag, ShieldCheck } from 'lucide-react';
import { calculateStationPrice } from '../services/api';

export default function SlotCalendar({
  selectedDate,
  setSelectedDate,
  selectedStation,
  selectedSlot,
  setSelectedSlot,
  duration,
  setDuration,
  bookingsToday = [],
  gamingPlans = [],
  onProceedBooking,
}) {
  // Cafe operational hours: 10:00 AM to 11:00 PM (23:00)
  const minDate = useMemo(() => new Date().toISOString().split('T')[0], []);
  const timeHours = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

  const formatHour = (hour) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const isSlotBookedForSelectedStation = (hour) => {
    if (!selectedStation) return false;
    const slotStartMins = hour * 60;
    const slotEndMins = slotStartMins + duration * 60;

    return bookingsToday.some((b) => {
      if (b.station_id !== selectedStation.id) return false;
      const [h1, m1] = b.start_time.split(':').map(Number);
      const [h2, m2] = b.end_time.split(':').map(Number);
      const bStart = h1 * 60 + m1;
      const bEnd = h2 * 60 + m2;
      return slotStartMins < bEnd && slotEndMins > bStart;
    });
  };

  const currentPricing = useMemo(() => {
    return calculateStationPrice(selectedStation, duration, gamingPlans);
  }, [selectedStation, duration, gamingPlans]);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col justify-between">
      <div>
        <div className="border-b border-neutral-800 pb-4 mb-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">Time & Duration</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Select date, hours & starting slot</p>
            </div>
            {currentPricing.discount > 0 && (
              <span className="flex items-center gap-1 text-[11px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-full">
                <Tag className="w-3 h-3" />
                Discount Applied
              </span>
            )}
          </div>
        </div>

        {/* 1. Date Picker */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            Booking Date
          </label>
          <input
            type="date"
            value={selectedDate}
            min={minDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm font-medium text-neutral-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
          />
        </div>

        {/* 2. Duration Selector with Admin Plan Discounts */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Duration & Special Rates
            </label>
            <span className="text-[11px] text-neutral-400">Consecutive Hours</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((hours) => {
              const pricing = calculateStationPrice(selectedStation, hours, gamingPlans);
              const isSelected = duration === hours;

              return (
                <button
                  key={hours}
                  type="button"
                  onClick={() => setDuration(hours)}
                  className={`py-2 px-2 rounded-xl text-center border transition-all cursor-pointer flex flex-col items-center justify-center relative ${
                    isSelected
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/30'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700'
                  }`}
                >
                  <span className="text-xs font-bold leading-tight">{hours} {hours === 1 ? 'Hour' : 'Hours'}</span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className={`text-xs font-extrabold ${isSelected ? 'text-white' : 'text-emerald-400'}`}>
                      ₹{pricing.finalPrice}
                    </span>
                    {pricing.discount > 0 && (
                      <span className={`text-[10px] line-through ${isSelected ? 'text-emerald-200' : 'text-neutral-500'}`}>
                        ₹{pricing.originalPrice}
                      </span>
                    )}
                  </div>
                  {pricing.discount > 0 && (
                    <span className={`mt-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      isSelected
                        ? 'bg-neutral-900/60 text-emerald-200'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      Save ₹{pricing.discount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Slot Matrix */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Starting Time Slot
            </label>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Available
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Full
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {timeHours.map((hour) => {
              const isBooked = isSlotBookedForSelectedStation(hour);
              const isSelected = selectedSlot === hour;

              return (
                <button
                  key={hour}
                  type="button"
                  disabled={isBooked}
                  onClick={() => setSelectedSlot(hour)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-400 font-bold shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/40'
                      : isBooked
                      ? 'bg-neutral-950/90 text-rose-400/90 border-rose-950/80 cursor-not-allowed line-through'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-200 hover:border-emerald-500 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <span>{formatHour(hour)}</span>
                  {isBooked ? (
                    <span className="text-[10px] bg-rose-950/90 border border-rose-500/40 text-rose-400 font-bold px-1.5 py-0.5 rounded uppercase">
                      Full
                    </span>
                  ) : isSelected ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary Box & Proceed Button */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
        <div className="flex items-center justify-between text-xs text-neutral-400 mb-1.5">
          <span>Station Selected:</span>
          <span className="font-semibold text-white">
            {selectedStation ? selectedStation.name : 'None selected'}
          </span>
        </div>

        {currentPricing.discount > 0 && (
          <>
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
              <span>Standard Rate:</span>
              <span className="line-through text-neutral-500">₹{currentPricing.originalPrice}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-emerald-400 mb-1.5 font-medium">
              <span>Admin Plan Discount:</span>
              <span>-₹{currentPricing.discount}</span>
            </div>
          </>
        )}

        <div className="flex items-center justify-between text-xs text-neutral-300 pt-2 border-t border-neutral-800 mb-2">
          <span className="font-medium">Total Amount:</span>
          <span className="text-xl font-black text-emerald-400">
            ₹{currentPricing.finalPrice}
          </span>
        </div>

        <div className="text-[11px] text-emerald-400 font-medium mb-3 flex items-center justify-center gap-1.5 bg-emerald-500/10 py-1.5 rounded-lg border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>Zero Advance • Pay at Counter on Arrival</span>
        </div>

        <button
          type="button"
          disabled={!selectedStation || selectedSlot === null}
          onClick={onProceedBooking}
          className="w-full py-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition-all hover:scale-101 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
        >
          {selectedStation && selectedSlot !== null
            ? `Reserve Slot • Pay ₹${currentPricing.finalPrice} at Counter`
            : 'Select Station & Slot First'}
        </button>
      </div>
    </div>
  );
}
