import React from 'react';
import { Smartphone, LayoutDashboard, Sparkles, ArrowRight } from 'lucide-react';
import { DriverHUDView } from '../driver/DriverHUDView';
import { AuthorityDashboardView } from '../authority/AuthorityDashboardView';

export const DualSplitView: React.FC = () => {
  return (
    <div className="flex flex-col w-full h-[calc(100vh-65px)] bg-slate-950 overflow-hidden">
      {/* Informative Banner */}
      <div className="px-4 py-2 bg-gradient-to-r from-red-950/80 via-slate-900 to-blue-950/80 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong className="text-white">Dual-Interface Interactive Simulation:</strong> Actions in the Driver HUD immediately reflect on the NHAI GIS Control Room and vice-versa!
          </span>
        </div>
        <div className="hidden lg:flex items-center gap-2 font-mono text-xs text-amber-400">
          <span>Report Hazard on Phone</span>
          <ArrowRight className="w-3.5 h-3.5" />
          <span>Alerts Broadcasted & Plotted on Map</span>
        </div>
      </div>

      {/* 2-Pane Split Container */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Pane: Mobile Driver View (5 cols on lg) */}
        <div className="lg:col-span-4 xl:col-span-4 border-r border-slate-800 h-full overflow-y-auto bg-black flex flex-col">
          <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span>DRIVER COCKPIT / IN-CABIN HUD</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">LIVE GPS FEED</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <DriverHUDView embeddedInPhoneShell={true} />
          </div>
        </div>

        {/* Right Pane: Highway Authority Control Room (8 cols on lg) */}
        <div className="lg:col-span-8 xl:col-span-8 h-full overflow-y-auto bg-slate-950 flex flex-col">
          <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <LayoutDashboard className="w-3.5 h-3.5 text-blue-400" />
              <span>HIGHWAY AUTHORITY GIS & INCIDENT COMMAND CENTER</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">CORRIDOR NH-16 AP</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <AuthorityDashboardView />
          </div>
        </div>
      </div>
    </div>
  );
};
