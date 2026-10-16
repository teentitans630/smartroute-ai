import React, { useState } from 'react';
import {
  X,
  Shield,
  Truck,
  Phone,
  Navigation,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { HazardIncident, PatrolUnit } from '../../types/highway';
import { useHighway } from '../../context/HighwayContext';

interface DispatchModalProps {
  isOpen: boolean;
  incident: HazardIncident | null;
  onClose: () => void;
}

export const DispatchModal: React.FC<DispatchModalProps> = ({
  isOpen,
  incident,
  onClose,
}) => {
  const { patrolUnits, dispatchUnit } = useHighway();
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');

  if (!isOpen || !incident) return null;

  // Preselect first available unit
  const availableUnits = patrolUnits.filter((u) => u.status === 'available');
  const activeSelectedId = selectedUnitId || availableUnits[0]?.id || patrolUnits[0]?.id;

  const handleDispatch = () => {
    if (!activeSelectedId) return;
    dispatchUnit(incident.id, activeSelectedId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border-t sm:border border-slate-700 rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Mobile pull handle */}
        <div className="sm:hidden w-10 h-1.5 bg-slate-700 rounded-full mx-auto my-2" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-slate-800/90 border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-950 border border-blue-500/40 rounded-lg text-blue-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Dispatch Highway Safety Unit</h3>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Route nearest patrol interceptor, crane, or ambulance
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Target Incident Summary Card */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-red-400">{incident.id}</span>
              <span className="text-xs font-mono text-slate-400">{incident.chainage}</span>
            </div>
            <h4 className="text-sm font-bold text-white">{incident.title}</h4>
            <p className="text-xs text-slate-400">
              {incident.category} · {incident.lane} · Reported {incident.reportedAt}
            </p>
          </div>

          {/* Unit Selection List */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2.5 tracking-wider">
              SELECT PATROL FLEET VEHICLE (NEAREST FIRST)
            </label>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {patrolUnits.map((unit) => {
                const distanceKm = Math.abs(incident.kmMarker - unit.currentKm).toFixed(1);
                const estimatedMins = Math.max(3, Math.round((Number(distanceKm) / 60) * 60));
                const isSelected = activeSelectedId === unit.id;
                const isAvailable = unit.status === 'available';

                return (
                  <div
                    key={unit.id}
                    onClick={() => isAvailable && setSelectedUnitId(unit.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-950/50 border-blue-500 ring-1 ring-blue-500'
                        : isAvailable
                        ? 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800'
                        : 'bg-slate-900/40 border-slate-800 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          isSelected ? 'bg-blue-900/60 text-blue-300' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {unit.type === 'crane' ? (
                          <Truck className="w-4 h-4" />
                        ) : (
                          <Shield className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{unit.name}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                              isAvailable
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            {unit.status.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Currently at KM {unit.currentKm.toFixed(1)} ({unit.corridor})
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-amber-400 text-xs block">
                        ~{estimatedMins} min ETA
                      </span>
                      <span className="text-[10px] text-slate-500">{distanceKm} km away</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 text-slate-300 font-semibold text-xs hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDispatch}
              className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-950/40 flex items-center justify-center gap-2 transition-all"
            >
              <Navigation className="w-4 h-4" />
              <span>Confirm & Dispatch Unit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
