import React from 'react';
import { Monitor, Tv, Car, Tag, Clock, Sparkles, CheckCircle2 } from 'lucide-react';
import { calculateStationPrice } from '../services/api';

export default function FloorMap({
  stations,
  selectedStation,
  onSelectStation,
  bookingsToday,
  selectedTimeSlot,
  gamingPlans = [],
  selectedDuration = 2,
  onSelectDuration,
}) {
  // Group stations dynamically by category or zone
  const getZoneTitle = (zoneName) => {
    if (zoneName === 'PC Arena') return '🖥️ PC Gaming Rigs (Esports & Battle Stations)';
    if (zoneName === 'Console Lounge') return '🎮 Next-Gen Console Lounge (PlayStation 5 / Xbox)';
    if (zoneName === 'VIP Suite') return '👑 VIP Cabin & Sim Racing Arena';
    return `🕹️ ${zoneName}`;
  };

  const zones = Array.from(new Set(stations.map(s => s.zone || 'Main Hall')));

  const isStationOccupied = (stationId) => {
    if (!selectedTimeSlot) return false;
    const [startHour, duration] = selectedTimeSlot;
    const startMins = startHour * 60;
    const endMins = startMins + duration * 60;

    return bookingsToday.some((b) => {
      if (b.station_id !== stationId) return false;
      const [bh1, bm1] = b.start_time.split(':').map(Number);
      const [bh2, bm2] = b.end_time.split(':').map(Number);
      const bStart = bh1 * 60 + bm1;
      const bEnd = bh2 * 60 + bm2;
      return startMins < bEnd && endMins > bStart;
    });
  };

  const getIcon = (category) => {
    const cat = (category || '').toUpperCase();
    if (cat.includes('PC')) return Monitor;
    if (cat.includes('SIM') || cat.includes('RACE')) return Car;
    return Tv;
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-neutral-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-wide">Live Cafe Floor Map</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-800 text-neutral-300 border border-neutral-700">
              Synced with Desk
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Real setups configured directly in your cafe desktop management software
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
            <span className="text-neutral-300 font-medium">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-emerald-300"></span>
            <span className="text-neutral-200 font-medium">Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></span>
            <span className="text-neutral-300 font-medium">Booked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-neutral-600"></span>
            <span className="text-neutral-400">Offline</span>
          </div>
        </div>
      </div>

      {/* Zone Layout */}
      <div className="space-y-6">
        {zones.map((zone) => {
          const zoneStations = stations.filter((s) => (s.zone || 'Main Hall') === zone);
          if (zoneStations.length === 0) return null;

          return (
            <div key={zone} className="bg-neutral-950 p-4 rounded-xl border border-neutral-800/80">
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-300 mb-3 flex items-center gap-2">
                <span>{getZoneTitle(zone)}</span>
                <div className="flex-1 h-px bg-neutral-800" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {zoneStations.map((station) => {
                  const Icon = getIcon(station.category);
                  const isSelected = selectedStation?.id === station.id;
                  const isOccupied = isStationOccupied(station.id);
                  const isUnderMaintenance = station.status !== 'AVAILABLE';

                  let statusClasses = 'bg-neutral-900 border-neutral-800 hover:border-emerald-500 text-neutral-200';
                  if (isSelected) {
                    statusClasses = 'bg-neutral-900 border-2 border-emerald-500 text-white ring-2 ring-emerald-500/30 shadow-lg';
                  } else if (isUnderMaintenance) {
                    statusClasses = 'bg-neutral-950/40 border-neutral-800/50 text-neutral-600 opacity-60 cursor-not-allowed';
                  } else if (isOccupied) {
                    statusClasses = 'bg-neutral-950/80 border-rose-900/60 text-neutral-300';
                  } else {
                    statusClasses = 'bg-neutral-950 border-neutral-800 hover:border-emerald-500 hover:bg-neutral-900';
                  }

                  return (
                    <button
                      key={station.id}
                      type="button"
                      disabled={isUnderMaintenance}
                      onClick={() => onSelectStation(station)}
                      className={`relative p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${statusClasses}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 font-bold text-sm">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-neutral-400'}`} />
                          <span className="text-white">{station.name}</span>
                        </div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-200 border border-neutral-700">
                          ₹{station.hourly_rate}/h
                        </span>
                      </div>

                      <div className="text-[11px] text-neutral-400 truncate mb-2" title={station.specs}>
                        {station.specs}
                      </div>

                      <div className="flex items-center justify-between text-[10px]">
                        <span className="capitalize text-neutral-500">{station.category}</span>
                        {isUnderMaintenance ? (
                          <span className="text-neutral-500 font-semibold">In Session / Maint.</span>
                        ) : isOccupied ? (
                          <span className="text-rose-400 bg-rose-950/50 border border-rose-500/40 px-2 py-0.5 rounded-full font-bold">Slot Booked</span>
                        ) : (
                          <span className="text-emerald-400 bg-emerald-950/50 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">Available</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Station Full Pricing & Discount Passes Card */}
      {selectedStation && (
        <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-neutral-950 border-2 border-emerald-500/40 shadow-2xl animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-850 pb-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <h3 className="text-base font-black text-white">
                  {selectedStation.name} • Official Rate Card & Discount Passes
                </h3>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Standard: <strong className="text-white">₹{selectedStation.hourly_rate}/hour</strong> • Click any pass below to lock in duration & rate
              </p>
            </div>
            <span className="self-start sm:self-auto px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs uppercase">
              {selectedStation.category}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {[1, 2, 3, 4, 5].map((hours) => {
              const p = calculateStationPrice(selectedStation, hours, gamingPlans);
              const isChosen = selectedDuration === hours;

              return (
                <button
                  key={hours}
                  type="button"
                  onClick={() => onSelectDuration && onSelectDuration(hours)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                    isChosen
                      ? 'bg-neutral-900 border-2 border-emerald-500 shadow-lg shadow-emerald-500/20'
                      : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
                  }`}
                >
                  {p.discount > 0 && (
                    <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-full bg-emerald-500 text-black font-extrabold text-[9px] shadow-sm">
                      SAVE ₹{p.discount}
                    </span>
                  )}

                  <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-300 mb-1">
                    <Clock className={`w-3.5 h-3.5 ${isChosen ? 'text-emerald-400' : 'text-neutral-500'}`} />
                    <span>{hours} {hours === 1 ? 'Hour' : 'Hours'}</span>
                  </div>

                  <div className="mt-1">
                    <div className="text-base font-black text-white">
                      ₹{p.finalPrice}
                    </div>
                    {p.discount > 0 ? (
                      <div className="text-[10px] text-neutral-500 line-through">
                        ₹{p.originalPrice}
                      </div>
                    ) : (
                      <div className="text-[10px] text-neutral-500">
                        Base rate
                      </div>
                    )}
                  </div>

                  <div className="mt-2 text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                    {isChosen ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Selected</span>
                      </>
                    ) : (
                      <span className="text-neutral-400 hover:text-emerald-400">Tap to Select</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-3.5 pt-3 border-t border-neutral-850 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <Tag className="w-3.5 h-3.5" />
              Multi-hour discount passes are applied automatically!
            </span>
            <span className="text-[11px] text-neutral-400">
              Zero advance payment • Pay at counter on arrival
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
