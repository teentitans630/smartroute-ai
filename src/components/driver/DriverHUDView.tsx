import React from 'react';
import {
  AlertTriangle,
  Volume2,
  Shield,
  ShieldAlert,
  Radio,
  Play,
  Pause,
  CheckCircle2,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { useHighway } from '../../context/HighwayContext';
import { soundAlert } from '../../services/audioAlert';
import { ReportHazardModal } from './ReportHazardModal';

interface DriverHUDViewProps {
  onOpenReportModal?: () => void;
  embeddedInPhoneShell?: boolean;
}

export const DriverHUDView: React.FC<DriverHUDViewProps> = ({
  onOpenReportModal,
  embeddedInPhoneShell = false,
}) => {
  const [internalReportOpen, setInternalReportOpen] = React.useState(false);

  const handleOpenReport = () => {
    if (onOpenReportModal) {
      onOpenReportModal();
    } else {
      setInternalReportOpen(true);
    }
  };
  const {
    driverState,
    activeProximityAlert,
    passingConfirmationPrompt,
    setSpeed,
    toggleDriving,
    toggleSafeDrivingMode,
    jumpToKm,
    dismissCurrentAlert,
    confirmHazardPresence,
    hazards,
  } = useHighway();

  const isOverspeed = driverState.currentSpeed > driverState.speedLimit;
  const isSafeMode = driverState.safeDrivingMode;

  const handleTestAudio = () => {
    if (activeProximityAlert) {
      soundAlert.triggerFullWarning(
        `⚠️ Stationary hazard ahead`,
        `Attention: ${activeProximityAlert.hazard.title} ${activeProximityAlert.distanceKm} kilometers ahead on NH-16. Slow down to ${activeProximityAlert.hazard.speedAdvisoryKm} kilometers per hour immediately.`,
        driverState.audioMuted
      );
    } else {
      soundAlert.triggerFullWarning(
        `⚠️ Proactive hazard warning`,
        `Attention: Stationary vehicle 1.5 kilometers ahead on NH-16. Slow down immediately.`,
        driverState.audioMuted
      );
    }
  };

  const currentChainageFormatted = `KM ${Math.floor(driverState.currentKm)}+${Math.round(
    (driverState.currentKm % 1) * 1000
  )
    .toString()
    .padStart(3, '0')}`;

  return (
    <div
      className={`relative flex flex-col w-full pb-20 md:pb-8 transition-colors duration-500 ${
        isSafeMode ? 'bg-black text-slate-100' : 'bg-slate-950 text-slate-100'
      }`}
    >
      <div className="flex-1 p-3.5 sm:p-5 max-w-lg mx-auto w-full space-y-3.5 sm:space-y-4">
        {/* SAFE MODE QUICK SWITCHER */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-200">Safe Driving Mode</span>
          </div>
          <button
            type="button"
            onClick={toggleSafeDrivingMode}
            className={`min-h-[36px] px-3 rounded-lg font-bold text-xs transition-colors ${
              isSafeMode
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {isSafeMode ? 'ACTIVE (OLED Black)' : 'OFF'}
          </button>
        </div>

        {/* ⚠️ LIVE PROACTIVE WARNING BANNER */}
        {activeProximityAlert && (
          <div
            className={`relative p-4 rounded-2xl border transition-all animate-in zoom-in-95 duration-200 ${
              activeProximityAlert.urgency === 'critical'
                ? 'bg-red-950/95 border-red-500 shadow-2xl shadow-red-950/60 animate-emergency-glow ring-2 ring-red-500/60'
                : 'bg-amber-950/95 border-amber-500 shadow-xl shadow-amber-950/50 ring-1 ring-amber-500/50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-11 h-11 rounded-xl text-white shrink-0 flex items-center justify-center ${
                  activeProximityAlert.urgency === 'critical'
                    ? 'bg-red-600 animate-pulse'
                    : 'bg-amber-600'
                }`}
              >
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-300">
                    ADVANCE COLLISION WARNING
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-red-900/80 rounded text-red-200 font-mono">
                    {activeProximityAlert.hazard.chainage}
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-extrabold text-white leading-tight">
                  Stationary vehicle {activeProximityAlert.distanceKm.toFixed(1)} km ahead on NH-16.
                </h4>
                <p className="text-xs text-red-100 font-medium">
                  {activeProximityAlert.hazard.category} halted in {activeProximityAlert.hazard.lane}. Slow down immediately.
                </p>
              </div>
            </div>

            {/* Advisory Speed Bar & Mobile Audio Trigger */}
            <div className="mt-3 pt-3 border-t border-red-500/30 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-red-200">Safe Target:</span>
                <span className="px-2 py-0.5 rounded bg-black/70 border border-red-400 font-mono font-extrabold text-amber-300 text-sm">
                  ≤ {activeProximityAlert.hazard.speedAdvisoryKm} km/h
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestAudio}
                  className="min-h-[38px] px-3 py-1.5 rounded-xl bg-red-900/80 hover:bg-red-800 border border-red-400/60 text-xs font-bold text-white flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <Volume2 className="w-4 h-4 text-amber-300" />
                  <span>Replay Voice Alert</span>
                </button>
                <button
                  type="button"
                  onClick={dismissCurrentAlert}
                  className="min-h-[38px] px-2 text-xs text-red-300 hover:text-white"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🔔 DRIVER VALIDATION CHECK (When passing a stationary hazard) */}
        {passingConfirmationPrompt && (
          <div className="p-4 rounded-2xl bg-slate-900/95 border-2 border-amber-500 shadow-2xl space-y-2.5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Passing Spot Check
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {passingConfirmationPrompt.chainage}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-white">
              Is the {passingConfirmationPrompt.category} still halted on the carriage-way?
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => confirmHazardPresence(passingConfirmationPrompt.id, true)}
                className="min-h-[46px] py-2 px-3 rounded-xl bg-red-600 active:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Yes, Still There</span>
              </button>
              <button
                type="button"
                onClick={() => confirmHazardPresence(passingConfirmationPrompt.id, false)}
                className="min-h-[46px] py-2 px-3 rounded-xl bg-emerald-600 active:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Cleared / Safe</span>
              </button>
            </div>
          </div>
        )}

        {/* 🚗 SPEEDOMETER & ROAD SPEED LIMIT CLUSTER */}
        <div
          className={`relative p-5 sm:p-6 rounded-3xl border transition-all ${
            isSafeMode
              ? 'bg-neutral-950 border-neutral-800'
              : 'bg-gradient-to-b from-slate-900 to-slate-950 border-slate-800 shadow-xl'
          }`}
        >
          <div className="flex items-center justify-between">
            {/* Speedometer Radial Gauge */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative flex items-center justify-center w-36 h-36 sm:w-44 sm:h-44">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="8"
                    strokeDasharray="190"
                    strokeDashoffset="45"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={isOverspeed ? '#ef4444' : '#0284c7'}
                    strokeWidth="8"
                    strokeDasharray="190"
                    strokeDashoffset={190 - (Math.min(driverState.currentSpeed, 140) / 140) * 145}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span
                    className={`text-4xl sm:text-5xl font-black font-mono-numbers tracking-tighter ${
                      isOverspeed ? 'text-red-500 animate-pulse' : 'text-white'
                    }`}
                  >
                    {driverState.currentSpeed}
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    KM / H
                  </span>
                </div>
              </div>

              <div className="mt-1 text-center">
                {isOverspeed ? (
                  <span className="text-xs font-bold text-red-400 flex items-center gap-1 justify-center">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>OVERSPEED WARNING</span>
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-slate-400">
                    Cruise Active · {currentChainageFormatted}
                  </span>
                )}
              </div>
            </div>

            {/* Indian Regulatory Speed Limit Sign */}
            <div className="flex flex-col items-center gap-1 pl-3 sm:pl-4 border-l border-slate-800">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white border-4 border-red-600 flex flex-col items-center justify-center shadow-lg">
                <span className="text-slate-900 font-black text-lg sm:text-xl font-mono-numbers leading-none">
                  {driverState.speedLimit}
                </span>
                <span className="text-[8px] font-extrabold text-slate-700 uppercase tracking-tight">
                  SPEED
                </span>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 text-center">
                Limit
              </span>
            </div>
          </div>

          {/* Natural Vehicle Cruise Telemetry Strip */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800">
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  driverState.isDriving
                    ? activeProximityAlert
                      ? 'bg-amber-400 animate-ping'
                      : 'bg-emerald-400 animate-pulse'
                    : 'bg-slate-500'
                }`}
              />
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-bold text-white truncate">
                  {driverState.isDriving
                    ? activeProximityAlert
                      ? `Adaptive Braking · Approaching Hazard`
                      : 'Adaptive Cruise Control · Active'
                    : 'Vehicle Cruise Paused'}
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  {driverState.isDriving
                    ? activeProximityAlert
                      ? `Slowing down safely towards ≤ ${activeProximityAlert.hazard.speedAdvisoryKm} km/h`
                      : 'Dynamic highway speed variation (82–89 km/h)'
                    : 'Tap resume to continue travel along NH-16'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleDriving}
              className={`min-h-[44px] px-3.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-colors active:scale-95 shrink-0 ${
                driverState.isDriving
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                  : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
              }`}
              title={driverState.isDriving ? 'Pause Highway Drive' : 'Resume Highway Drive'}
              aria-label="Pause or Resume Drive"
            >
              {driverState.isDriving ? (
                <>
                  <Pause className="w-4 h-4 text-amber-400" />
                  <span className="text-xs">Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs">Resume</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 🚨 PROMINENT REPORT HAZARD BUTTON */}
        <button
          type="button"
          onClick={handleOpenReport}
          className="w-full min-h-[56px] py-3.5 px-5 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-amber-600 active:from-red-700 active:to-amber-700 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-red-950/40 flex items-center justify-between active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-black/30">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300" />
            </div>
            <div className="text-left">
              <span className="block font-black tracking-wide leading-tight">
                REPORT HAZARD / BREAKDOWN
              </span>
              <span className="text-[11px] text-red-100 font-normal opacity-90">
                1-Tap broadcast to NHAI & alert oncoming drivers
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/80" />
        </button>

        {/* UPCOMING CORRIDOR HAZARDS SNIPPET */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-emerald-400" />
              <span>UPCOMING ON NH-16 CORRIDOR</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Next 10 km
            </span>
          </div>

          <div className="space-y-2">
            {hazards
              .filter((h) => h.status !== 'resolved')
              .slice(0, 3)
              .map((hazard) => {
                const dist = (hazard.kmMarker - driverState.currentKm).toFixed(1);
                const isAhead = Number(dist) > 0;
                return (
                  <div
                    key={hazard.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          hazard.status === 'active' ? 'bg-red-500 animate-pulse' : 'bg-amber-400'
                        }`}
                      />
                      <div>
                        <span className="font-semibold text-white block">{hazard.title}</span>
                        <span className="text-[10px] text-slate-400">
                          {hazard.chainage} · {hazard.lane}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`font-mono font-bold ${
                          isAhead ? 'text-amber-400' : 'text-slate-500'
                        }`}
                      >
                        {isAhead ? `${dist} km ahead` : 'Passed'}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        ≤ {hazard.speedAdvisoryKm} km/h
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* QUICK SIMULATION SHORTCUTS */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
            <span>TESTBENCH JUMPS</span>
            <span className="font-mono text-amber-400">KM {driverState.currentKm.toFixed(1)}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => jumpToKm(382.4)}
              className="min-h-[40px] py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-200 text-left border border-slate-700/60 transition-colors active:scale-95"
            >
              🎯 1.8km before Truck (KM 384.2)
            </button>
            <button
              type="button"
              onClick={() => jumpToKm(390.0)}
              className="min-h-[40px] py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-200 text-left border border-slate-700/60 transition-colors active:scale-95"
            >
              🎯 1.6km before Debris (KM 391.6)
            </button>
          </div>
        </div>
      </div>

      {/* Internal Report Hazard Modal if opened without parent callback */}
      <ReportHazardModal
        isOpen={internalReportOpen}
        onClose={() => setInternalReportOpen(false)}
      />
    </div>
  );
};
