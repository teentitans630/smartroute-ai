import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Truck,
  Car,
  Package,
  Droplet,
  Compass,
  MapPin,
  Check,
} from 'lucide-react';
import { HazardType, VehicleCategory } from '../../types/highway';
import { useHighway } from '../../context/HighwayContext';

interface ReportHazardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_HAZARDS: {
  type: HazardType;
  title: string;
  category: VehicleCategory;
  lane: 'Right (Fast Lane)' | 'Left (Slow Lane)' | 'Shoulder / Lay-by' | 'Median Border';
  speedAdvisoryKm: number;
  icon: React.ReactNode;
  severity: 'critical' | 'high' | 'moderate';
  description: string;
}[] = [
  {
    type: 'stationary_vehicle',
    title: 'Stationary Commercial Truck',
    category: 'Heavy Multi-Axle Truck',
    lane: 'Right (Fast Lane)',
    speedAdvisoryKm: 40,
    severity: 'critical',
    icon: <Truck className="w-5 h-5 text-red-400" />,
    description: 'Breakdown vehicle halted in travel lane without reflective triangles.',
  },
  {
    type: 'stationary_vehicle',
    title: 'Breakdown Car / Flat Tyre',
    category: 'Stationary SUV / Car',
    lane: 'Left (Slow Lane)',
    speedAdvisoryKm: 50,
    severity: 'high',
    icon: <Car className="w-5 h-5 text-amber-400" />,
    description: 'Private vehicle stalled on highway lane with hazard blinkers.',
  },
  {
    type: 'road_debris',
    title: 'Heavy Cargo / Iron Rods on Road',
    category: 'Cargo / Container Debris',
    lane: 'Left (Slow Lane)',
    speedAdvisoryKm: 45,
    severity: 'high',
    icon: <Package className="w-5 h-5 text-amber-400" />,
    description: 'Obstruction fallen from freight vehicle onto driving carriage-way.',
  },
  {
    type: 'oil_spill',
    title: 'Diesel Fuel / Chemical Slick',
    category: 'Hazardous Material Tanker',
    lane: 'Right (Fast Lane)',
    speedAdvisoryKm: 30,
    severity: 'high',
    icon: <Droplet className="w-5 h-5 text-amber-400" />,
    description: 'High skidding risk oil patch covering road surface.',
  },
];

export const ReportHazardModal: React.FC<ReportHazardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { driverState, reportIncident } = useHighway();

  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [selectedLane, setSelectedLane] = useState<
    'Right (Fast Lane)' | 'Left (Slow Lane)' | 'Shoulder / Lay-by' | 'Median Border'
  >('Right (Fast Lane)');
  const [customNote, setCustomNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentChainage = `KM ${Math.floor(driverState.currentKm)}+${Math.round(
    (driverState.currentKm % 1) * 1000
  )
    .toString()
    .padStart(3, '0')}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const preset = PRESET_HAZARDS[selectedPresetIndex];

    setTimeout(() => {
      reportIncident({
        type: preset.type,
        title: preset.title,
        category: preset.category,
        corridor: 'NH-16 Vijayawada - Guntur Corridor',
        chainage: currentChainage,
        kmMarker: Math.round(driverState.currentKm * 10) / 10,
        lane: selectedLane,
        status: 'active',
        severity: preset.severity,
        source: 'Driver Crowd-Report',
        coordinates: {
          lat: 16.35 + (driverState.currentKm - 380) * 0.008,
          lng: 80.50 + (driverState.currentKm - 380) * 0.005,
        },
        speedAdvisoryKm: preset.speedAdvisoryKm,
        description: customNote.trim() || preset.description,
        hasVisualCapture: false,
      });

      setIsSubmitting(false);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1200);
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border-t sm:border border-slate-700 rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Mobile Pull Handle Indicator */}
        <div className="sm:hidden w-10 h-1.5 bg-slate-700 rounded-full mx-auto my-2" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-slate-800/80 border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-950/80 border border-red-500/40 rounded-lg text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                Report Breakdown / Hazard
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400">
                1-Tap broadcast to NHAI & nearby vehicles
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

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-950 border border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white">Hazard Broadcasted!</h4>
            <p className="text-sm text-slate-300">
              NHAI Patrol alert triggered at <span className="font-mono text-amber-400">{currentChainage}</span>.
              Oncoming drivers are receiving advance speed warnings.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
            {/* GPS Chainage Auto-Tag */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Verified GPS Highway Location:</span>
              </div>
              <div className="font-mono font-bold text-amber-400">
                NH-16 · {currentChainage}
              </div>
            </div>

            {/* Quick 1-Tap Hazard Category Presets */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2.5">
                SELECT HAZARD TYPE (1-TAP QUICK PICK)
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {PRESET_HAZARDS.map((preset, idx) => {
                  const isSelected = selectedPresetIndex === idx;
                  return (
                    <button
                      key={preset.title}
                      type="button"
                      onClick={() => setSelectedPresetIndex(idx)}
                      className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-amber-950/40 border-amber-500 ring-1 ring-amber-500'
                          : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="p-1.5 rounded-lg bg-slate-900">{preset.icon}</div>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-amber-400" />}
                      </div>
                      <span className="text-xs font-semibold text-white leading-tight">
                        {preset.title}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        Advisory: {preset.speedAdvisoryKm} km/h
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lane Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                AFFECTED HIGHWAY LANE
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  'Right (Fast Lane)',
                  'Left (Slow Lane)',
                  'Shoulder / Lay-by',
                  'Median Border',
                ].map((lane) => {
                  const isSelected = selectedLane === lane;
                  return (
                    <button
                      key={lane}
                      type="button"
                      onClick={() =>
                        setSelectedLane(
                          lane as 'Right (Fast Lane)' | 'Left (Slow Lane)' | 'Shoulder / Lay-by' | 'Median Border'
                        )
                      }
                      className={`py-2 px-2.5 text-center text-xs font-medium rounded-lg border transition-colors ${
                        isSelected
                          ? 'bg-slate-100 text-slate-900 border-white font-semibold'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {lane.split(' ')[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Description / Voice Note */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ADDITIONAL OBSERVATION (OPTIONAL)
              </label>
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="e.g., Driver standing in road, unlit rear, oil puddle"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-700 text-slate-300 font-semibold text-sm hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-sm shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 transition-all"
              >
                {isSubmitting ? (
                  <span>Broadcasting Alert...</span>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    <span>Broadcast Hazard Alert</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
