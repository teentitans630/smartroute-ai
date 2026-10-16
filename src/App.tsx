import React, { useState } from 'react';
import { HighwayProvider } from './context/HighwayContext';
import { Header, MobileTab } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { DriverHUDView } from './components/driver/DriverHUDView';
import { HazardsListView } from './components/hazards/HazardsListView';
import { AuthorityDashboardView } from './components/authority/AuthorityDashboardView';
import { GisMap } from './components/gis/GisMap';
import { ReportHazardModal } from './components/driver/ReportHazardModal';
import { ToastContainer } from './components/common/ToastContainer';

export default function App() {
  const [activeTab, setActiveTab] = useState<MobileTab>('hud');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  return (
    <HighwayProvider>
      <div className="flex flex-col h-screen h-dvh max-h-screen max-h-dvh overflow-hidden bg-slate-950 text-slate-100 selection:bg-amber-500/30 selection:text-amber-200">
        {/* Mobile-Optimized Top Header */}
        <Header activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Content Area based on Active Tab */}
        <main className="flex-1 flex flex-col w-full overflow-y-auto overflow-x-hidden">
          {activeTab === 'hud' && (
            <div className="flex-1 w-full max-w-xl mx-auto flex flex-col">
              <DriverHUDView onOpenReportModal={() => setIsReportModalOpen(true)} />
            </div>
          )}

          {activeTab === 'map' && (
            <div className="flex-1 w-full h-full flex flex-col pb-16 md:pb-0 overflow-hidden">
              <GisMap fullScreenMode={true} />
            </div>
          )}

          {activeTab === 'hazards' && (
            <div className="flex-1 w-full">
              <HazardsListView />
            </div>
          )}

          {activeTab === 'authority' && (
            <div className="flex-1 w-full max-w-7xl mx-auto">
              <AuthorityDashboardView />
            </div>
          )}
        </main>

        {/* Mobile Fixed Bottom Navigation Bar (Shown on mobile screens < 768px) */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenReportModal={() => setIsReportModalOpen(true)}
        />

        {/* Global 1-Tap Emergency Breakdown Report Modal */}
        <ReportHazardModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
        />

        {/* Global Real-Time Sync Notifications */}
        <ToastContainer />
      </div>
    </HighwayProvider>
  );
}
