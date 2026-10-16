import React from 'react';
import {
  Gauge,
  Map,
  AlertTriangle,
  ListFilter,
  LayoutDashboard,
} from 'lucide-react';
import { MobileTab } from './Header';
import { useHighway } from '../../context/HighwayContext';

interface BottomNavProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  onOpenReportModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenReportModal,
}) => {
  const { hazards } = useHighway();
  const activeHazardsCount = hazards.filter((h) => h.status === 'active').length;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 px-2 py-1.5 md:hidden select-none">
      <div className="grid grid-cols-5 items-center max-w-md mx-auto">
        {/* Tab 1: HUD */}
        <button
          type="button"
          onClick={() => onTabChange('hud')}
          className={`min-h-[48px] flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'hud' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Gauge className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Driver HUD</span>
        </button>

        {/* Tab 2: Map */}
        <button
          type="button"
          onClick={() => onTabChange('map')}
          className={`min-h-[48px] flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'map' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Map className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Corridor Map</span>
        </button>

        {/* Central Action: Quick Report Breakdown / Hazard */}
        <div className="flex items-center justify-center -mt-4">
          <button
            type="button"
            onClick={onOpenReportModal}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-red-600 to-amber-600 text-white flex flex-col items-center justify-center shadow-lg shadow-red-950/80 border-2 border-slate-900 active:scale-95 transition-transform"
            aria-label="Report Highway Hazard"
          >
            <AlertTriangle className="w-5 h-5 text-yellow-300" />
            <span className="text-[8px] font-black uppercase tracking-tighter">REPORT</span>
          </button>
        </div>

        {/* Tab 3: Hazards List */}
        <button
          type="button"
          onClick={() => onTabChange('hazards')}
          className={`relative min-h-[48px] flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'hazards' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <ListFilter className="w-5 h-5 mb-0.5" />
            {activeHazardsCount > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center font-mono">
                {activeHazardsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Hazards</span>
        </button>

        {/* Tab 4: Authority Control Room */}
        <button
          type="button"
          onClick={() => onTabChange('authority')}
          className={`min-h-[48px] flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'authority' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Control Desk</span>
        </button>
      </div>
    </nav>
  );
};
