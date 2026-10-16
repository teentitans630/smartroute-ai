import React, { useState } from 'react';
import { Maximize2, Minimize2, Wifi, Battery, Signal } from 'lucide-react';
import { DriverHUDView } from './DriverHUDView';

export const PhoneContainer: React.FC = () => {
  const [isFullWindow, setIsFullWindow] = useState(false);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-6 bg-slate-950 overflow-y-auto min-h-[calc(100vh-65px)]">
      {/* Phone Frame or Full Window View */}
      <div
        className={`relative transition-all duration-300 w-full ${
          isFullWindow
            ? 'max-w-4xl h-[86vh]'
            : 'max-w-[410px] h-[780px]'
        } flex flex-col rounded-[38px] bg-black border-4 border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8),0_0_20px_rgba(239,68,68,0.15)] overflow-hidden`}
      >
        {/* Dynamic Island / Top Camera Bezel */}
        <div className="relative z-40 flex items-center justify-between px-6 pt-3 pb-1 bg-black text-white select-none">
          <span className="text-xs font-semibold font-mono tracking-tight">14:38</span>

          {/* Notch / Dynamic Island */}
          <div className="w-24 h-4 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500/80 mr-2" />
            <span className="text-[9px] font-mono text-slate-400">SafeRoute</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>

        {/* Driver App View Body */}
        <div className="relative flex-1 overflow-hidden">
          <DriverHUDView embeddedInPhoneShell={!isFullWindow} />
        </div>

        {/* Bottom Phone Home Indicator Bar */}
        <div className="relative z-30 py-2 bg-black flex items-center justify-center">
          <div className="w-32 h-1 rounded-full bg-slate-700" />
        </div>

        {/* Expand / Collapse toggle for desktop users */}
        <button
          type="button"
          onClick={() => setIsFullWindow(!isFullWindow)}
          className="absolute top-3 right-2 z-50 p-1.5 rounded-full bg-slate-800/80 text-slate-300 hover:text-white transition-colors hidden sm:block"
          title={isFullWindow ? 'Fit Mobile Phone Frame' : 'Expand to Wide Display'}
        >
          {isFullWindow ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
        </button>
      </div>

      <div className="mt-3 text-center text-xs text-slate-500 hidden sm:block">
        Simulated In-Cabin Mobile HUD · Audio alerts sound when approaching active hazards
      </div>
    </div>
  );
};
