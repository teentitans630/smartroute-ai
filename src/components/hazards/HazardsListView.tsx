import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  Navigation,
  Check,
  Search,
  Filter,
} from 'lucide-react';
import { useHighway } from '../../context/HighwayContext';
import { IncidentStatus } from '../../types/highway';

export const HazardsListView: React.FC = () => {
  const {
    hazards,
    driverState,
    jumpToKm,
    resolveIncident,
    confirmHazardPresence,
  } = useHighway();

  const [statusFilter, setStatusFilter] = useState<'all' | IncidentStatus>('all');
  const [search, setSearch] = useState('');

  const filtered = hazards.filter((h) => {
    if (statusFilter !== 'all' && h.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        h.title.toLowerCase().includes(q) ||
        h.chainage.toLowerCase().includes(q) ||
        h.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full pb-24 md:pb-8 p-3.5 sm:p-5 max-w-2xl mx-auto space-y-3.5">
      {/* Header & Search */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>NH-16 Corridor Hazards</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Near KM {driverState.currentKm.toFixed(1)}
          </span>
        </div>

        {/* Search & Filter pills */}
        <div className="space-y-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hazard by vehicle or chainage..."
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {(['all', 'active', 'dispatched', 'resolved'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`min-h-[36px] px-3 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                  statusFilter === s
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {s} ({s === 'all' ? hazards.length : hazards.filter((h) => h.status === s).length})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hazards Cards Feed (Mobile-First Card Layout) */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400 text-xs">
            No incidents match your filter.
          </div>
        ) : (
          filtered.map((hazard) => {
            const distance = (hazard.kmMarker - driverState.currentKm).toFixed(1);
            const isAhead = Number(distance) > 0;
            const isActive = hazard.status === 'active';
            const isDispatched = hazard.status === 'dispatched';
            const isResolved = hazard.status === 'resolved';

            return (
              <div
                key={hazard.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isActive
                    ? 'bg-slate-900/90 border-red-500/50 shadow-md shadow-red-950/20'
                    : isDispatched
                    ? 'bg-slate-900/90 border-amber-500/50'
                    : 'bg-slate-900/50 border-slate-800 opacity-80'
                }`}
              >
                {/* Top Row: Category, Chainage, Distance */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-red-950 text-red-400 border border-red-500/40'
                          : isDispatched
                          ? 'bg-amber-950 text-amber-400 border border-amber-500/40'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                      }`}
                    >
                      {hazard.status} · {hazard.severity}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1.5 leading-snug">
                      {hazard.title}
                    </h3>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-mono font-bold text-xs block ${
                        isAhead ? 'text-amber-400' : 'text-slate-500'
                      }`}
                    >
                      {isAhead ? `${distance} km ahead` : 'Passed'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {hazard.chainage}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mb-3">{hazard.description}</p>

                {/* Details Strip */}
                <div className="flex flex-wrap items-center justify-between gap-2 py-2 px-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 mb-3">
                  <span>Lane: <strong className="text-slate-200">{hazard.lane}</strong></span>
                  <span>Advisory: <strong className="text-amber-400">≤ {hazard.speedAdvisoryKm} km/h</strong></span>
                  <span>Verifications: <strong className="text-emerald-400">{hazard.confirmedCount}</strong></span>
                </div>

                {/* Mobile Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => jumpToKm(hazard.kmMarker - 1.5)}
                    className="min-h-[40px] flex-1 py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1 active:scale-95 transition-transform"
                  >
                    <Navigation className="w-3.5 h-3.5 text-amber-400" />
                    <span>Drive Here (1.5km out)</span>
                  </button>

                  {!isResolved ? (
                    <button
                      type="button"
                      onClick={() => resolveIncident(hazard.id)}
                      className="min-h-[40px] px-3.5 rounded-xl bg-emerald-600/90 active:bg-emerald-700 text-xs font-bold text-white flex items-center justify-center gap-1 active:scale-95 transition-transform"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Safe</span>
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-400 font-semibold px-2 py-1">
                      Corridor Cleared
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
