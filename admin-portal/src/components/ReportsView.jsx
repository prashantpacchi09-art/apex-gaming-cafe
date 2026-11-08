import React, { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, Monitor, CheckCircle2, Calendar, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export default function ReportsView() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const data = await api.getReportsSummary();
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white tracking-wide flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Financial & Operational Reports
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">Real-time revenue metrics, occupancy rates & billing breakdown</p>
        </div>
        <button
          onClick={fetchReport}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-850 text-neutral-300 border border-neutral-800 rounded-xl text-xs font-semibold cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {report && (
        <div className="space-y-5">
          {/* Revenue Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl shadow-xl">
              <span className="text-xs text-neutral-400 flex items-center gap-1.5 mb-2 font-medium">
                <IndianRupee className="w-4 h-4 text-emerald-400" /> Today's Total Billed
              </span>
              <div className="text-3xl font-black text-white">₹{report.today_revenue}</div>
              <span className="text-[11px] text-neutral-500 block mt-1">Live from desk + online</span>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl shadow-xl">
              <span className="text-xs text-neutral-400 flex items-center gap-1.5 mb-2 font-medium">
                <Calendar className="w-4 h-4 text-emerald-400" /> Past 7 Days Revenue
              </span>
              <div className="text-3xl font-black text-emerald-400">₹{report.week_revenue}</div>
              <span className="text-[11px] text-neutral-500 block mt-1">Weekly total earnings</span>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl shadow-xl">
              <span className="text-xs text-neutral-400 flex items-center gap-1.5 mb-2 font-medium">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> Past 30 Days Revenue
              </span>
              <div className="text-3xl font-black text-white">₹{report.month_revenue}</div>
              <span className="text-[11px] text-neutral-500 block mt-1">Monthly recurring run rate</span>
            </div>
          </div>

          {/* Operational Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl shadow-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-neutral-400 block mb-1 font-medium">Floor Utilization</span>
                <div className="text-2xl font-black text-white">
                  {report.active_rigs} / {report.total_rigs} Rigs
                </div>
                <span className="text-[11px] text-emerald-400 font-bold block mt-1">
                  {report.occupancy_percent}% Active Occupancy
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-emerald-400">
                <Monitor className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl shadow-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-neutral-400 block mb-1 font-medium">Total Lifetime Sessions</span>
                <div className="text-2xl font-black text-white">
                  {report.total_completed_sessions} Sessions
                </div>
                <span className="text-[11px] text-neutral-400 block mt-1">
                  Completed in cafe database
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

