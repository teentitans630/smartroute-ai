import React from 'react';
import {
  X,
  Camera,
  Cpu,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Maximize2,
  Activity,
} from 'lucide-react';
import { HazardIncident } from '../../types/highway';

interface AiVisionModalProps {
  isOpen: boolean;
  incident: HazardIncident | null;
  onClose: () => void;
}

export const AiVisionModal: React.FC<AiVisionModalProps> = ({
  isOpen,
  incident,
  onClose,
}) => {
  if (!isOpen || !incident) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border-t sm:border border-slate-700 rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Mobile drag handle */}
        <div className="sm:hidden w-10 h-1.5 bg-slate-700 rounded-full mx-auto my-2" />

        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-3.5 bg-slate-800 border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-red-950 border border-red-500/40 text-red-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  Edge AI V2X Vision Telemetry
                </span>
                <span className="text-[10px] px-1.5 py-0.2 bg-red-900/60 text-red-300 rounded font-mono">
                  LIVE CAM-AP09
                </span>
              </div>
              <span className="text-xs text-slate-400">
                NH-16 Mast Pole · {incident.chainage} · Optical 4K Stream
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Simulated CCTV Feed Screen */}
        <div className="relative aspect-video bg-slate-950 overflow-hidden flex items-center justify-center border-b border-slate-800">
          {/* Simulated Highway Road Perspective */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 opacity-90" />

          {/* Road Perspective lines */}
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
            {/* Vanishing horizon */}
            <line x1="0" y1="45" x2="100" y2="45" stroke="#334155" strokeWidth="0.5" strokeDasharray="1 1" />
            {/* Road bounds */}
            <polygon points="40,45 60,45 92,100 8,100" fill="#0f172a" />
            {/* Lane dividers */}
            <line x1="50" y1="45" x2="50" y2="100" stroke="#fbbf24" strokeWidth="0.8" strokeDasharray="3 3" />
            <line x1="45" y1="45" x2="28" y2="100" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="2 4" />
            <line x1="55" y1="45" x2="72" y2="100" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="2 4" />
          </svg>

          {/* Stationary Vehicle Neural Bounding Box */}
          <div className="relative z-10 w-64 p-3 border-2 border-red-500 bg-red-950/20 rounded backdrop-blur-[1px] animate-pulse">
            {/* Corner brackets */}
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-red-400" />
            <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-red-400" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-red-400" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-red-400" />

            {/* Neural Tag */}
            <div className="flex items-center justify-between text-[11px] font-mono text-red-300 font-bold bg-black/80 px-2 py-0.5 rounded -mt-6 ml-1 w-fit border border-red-500/50">
              <span>{incident.category.toUpperCase()} · 98.4% CONF</span>
            </div>

            {/* Simulated Vehicle Silhouette */}
            <div className="h-28 flex flex-col items-center justify-center text-center text-slate-300 py-2">
              <span className="text-3xl mb-1">🚛</span>
              <span className="text-xs font-mono font-bold text-amber-300">
                STATIONARY DURATION: 06m 42s
              </span>
              <span className="text-[10px] text-red-300 font-mono">
                VELOCITY: 0.00 km/h · LANE: RIGHT
              </span>
            </div>

            {/* Hazard alert flag */}
            <div className="bg-red-600/90 text-white text-[10px] font-bold py-0.5 text-center rounded uppercase tracking-wider">
              HIGHWAY CARRIAGE-WAY OBSTRUCTION
            </div>
          </div>

          {/* OSD Telemetry Overlay */}
          <div className="absolute top-3 left-3 text-[10px] font-mono text-emerald-400 space-y-0.5 z-20 bg-black/60 p-2 rounded border border-emerald-500/30">
            <div>CAM_ID: NH16_AP_KM384_N2</div>
            <div>FPS: 29.97 · LATENCY: 28ms</div>
            <div>WEATHER: CLEAR · VISIBILITY: &gt; 9.8 KM</div>
            <div>STATUS: CONTINUOUS REAR-END COLLISION RISK</div>
          </div>

          <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-300 bg-black/60 px-2 py-1 rounded border border-slate-700 z-20">
            TIME: 2026-10-16 · 14:38:22 IST
          </div>
        </div>

        {/* AI Analysis Summary */}
        <div className="p-5 space-y-3 text-xs">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">RISK CLASSIFICATION</span>
              <span className="font-bold text-red-400 text-sm">Critical Collision Risk</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">LANE OBSTRUCTED</span>
              <span className="font-bold text-amber-400 text-sm">{incident.lane.split(' ')[0]}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">DRIVERS NOTIFIED</span>
              <span className="font-bold text-emerald-400 text-sm font-mono">1,482 Vehicles</span>
            </div>
          </div>

          <p className="text-slate-300 leading-relaxed">
            SafeRoute AI Edge Camera flagged this vehicle halted in the right-most high-speed lane without regulatory hazard warning reflectors. Proactive audio warning geofence is actively notifying all vehicles within a 2.5 km radius.
          </p>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors"
            >
              Close Feed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
