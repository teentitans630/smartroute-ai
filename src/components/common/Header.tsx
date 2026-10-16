import React from 'react';
import {
  Volume2,
  VolumeX,
  Shield,
  RotateCcw,
  Radio,
} from 'lucide-react';
import { useHighway } from '../../context/HighwayContext';

export type MobileTab = 'hud' | 'map' | 'hazards' | 'authority';

interface HeaderProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { driverState, toggleAudioMute, jumpToKm } = useHighway();

  const currentChainageFormatted = `KM ${Math.floor(driverState.currentKm)}+${Math.round(
    (driverState.currentKm % 1) * 1000
  )
    .toString()
    .padStart(3, '0')}`;

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-3.5 sm:px-6 py-2.5 bg-slate-900/95 border-b border-slate-800 backdrop-blur-md">
      {/* Brand Title */}
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-red-600 text-white shadow-sm shadow-red-950/50 shrink-0">
          <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-sm sm:text-base font-extrabold tracking-tight text-white whitespace-nowrap">
              SafeRoute AI
            </span>
            <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
              NH-16 AP
            </span>
          </div>
          <span className="text-[10px] sm:text-xs text-slate-400 font-mono">
            {currentChainageFormatted} · {driverState.currentSpeed} km/h
          </span>
        </div>
      </div>

      {/* Desktop Mode Switcher (Visible on md+ screens) */}
      <div className="hidden md:flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
        <button
          type="button"
          onClick={() => onTabChange('hud')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'hud'
              ? 'bg-slate-800 text-amber-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Driver Cockpit
        </button>
        <button
          type="button"
          onClick={() => onTabChange('map')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'map'
              ? 'bg-slate-800 text-amber-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          GIS Highway Map
        </button>
        <button
          type="button"
          onClick={() => onTabChange('hazards')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'hazards'
              ? 'bg-slate-800 text-amber-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Corridor Alerts
        </button>
        <button
          type="button"
          onClick={() => onTabChange('authority')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'authority'
              ? 'bg-slate-800 text-amber-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Control Room Desk
        </button>
      </div>

      {/* Header Quick Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Audio Mute/Unmute */}
        <button
          type="button"
          onClick={toggleAudioMute}
          className={`min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] p-2 rounded-xl border flex items-center justify-center transition-colors ${
            driverState.audioMuted
              ? 'bg-slate-800/80 border-slate-700 text-slate-400'
              : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
          }`}
          title={driverState.audioMuted ? 'Voice warning muted' : 'Voice warning active'}
          aria-label="Toggle Warning Audio"
        >
          {driverState.audioMuted ? (
            <VolumeX className="w-4 h-4 text-slate-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-emerald-400" />
          )}
        </button>

        {/* Quick Simulation Reset to 1.8km before hazard */}
        <button
          type="button"
          onClick={() => jumpToKm(382.4)}
          className="min-h-[40px] sm:min-h-[44px] px-2.5 sm:px-3 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl flex items-center gap-1.5 transition-colors whitespace-nowrap active:scale-95"
          title="Reset test drive position to 1.8 km before KM 384+200 hazard"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Reset Test</span>
        </button>
      </div>
    </header>
  );
};
