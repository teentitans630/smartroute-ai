import React, { useState } from 'react';
import {
  Shield,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Filter,
  Search,
  Plus,
  Download,
  Eye,
  Navigation,
  RefreshCw,
  Truck,
  Car,
  Activity,
  Flame,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { HazardIncident, IncidentStatus, SeverityLevel } from '../../types/highway';
import { useHighway } from '../../context/HighwayContext';
import { GisMap } from '../gis/GisMap';
import { DispatchModal } from './DispatchModal';
import { AiVisionModal } from './AiVisionModal';

export const AuthorityDashboardView: React.FC = () => {
  const {
    hazards,
    patrolUnits,
    highRiskSegments,
    resolveIncident,
    jumpToKm,
    reportIncident,
  } = useHighway();

  const [statusFilter, setStatusFilter] = useState<'all' | IncidentStatus>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | SeverityLevel>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIncidentForDispatch, setSelectedIncidentForDispatch] = useState<HazardIncident | null>(null);
  const [selectedIncidentForVision, setSelectedIncidentForVision] = useState<HazardIncident | null>(null);
  const [highlightedIncidentId, setHighlightedIncidentId] = useState<string | null>(null);

  // Compute KPI metrics
  const activeHazardsCount = hazards.filter((h) => h.status === 'active').length;
  const dispatchedCount = hazards.filter((h) => h.status === 'dispatched').length;
  const resolvedCount = hazards.filter((h) => h.status === 'resolved').length;
  const criticalHazardsCount = hazards.filter(
    (h) => h.status === 'active' && h.severity === 'critical'
  ).length;

  // Filtered incidents
  const filteredIncidents = hazards.filter((inc) => {
    if (statusFilter !== 'all' && inc.status !== statusFilter) return false;
    if (severityFilter !== 'all' && inc.severity !== severityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        inc.title.toLowerCase().includes(q) ||
        inc.chainage.toLowerCase().includes(q) ||
        inc.category.toLowerCase().includes(q) ||
        inc.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = 'Incident ID,Chainage,Category,Severity,Status,Lane,Source,Reported Time,Speed Advisory\n';
    const rows = hazards
      .map(
        (h) =>
          `"${h.id}","${h.chainage}","${h.category}","${h.severity}","${h.status}","${h.lane}","${h.source}","${h.reportedAt}","${h.speedAdvisoryKm} km/h"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SafeRoute_NH16_Incidents_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleQuickAddStationaryTruck = () => {
    reportIncident({
      type: 'stationary_vehicle',
      title: 'Punctured Cargo Trailer Stalled in Blind Curve',
      category: 'Heavy Multi-Axle Truck',
      corridor: 'NH-16 Vijayawada - Guntur Corridor',
      chainage: 'KM 377+400 (Near ANU Flyover)',
      kmMarker: 377.4,
      lane: 'Right (Fast Lane)',
      status: 'active',
      severity: 'critical',
      source: 'AI V2X Camera #AP-09',
      coordinates: { lat: 16.378, lng: 80.529 },
      speedAdvisoryKm: 40,
      description: 'Operator logged breakdown: freight vehicle immobilized with transmission freeze in high-speed corridor.',
      hasVisualCapture: true,
    });
  };

  return (
    <div className="flex flex-col w-full bg-slate-950 text-slate-100 p-3.5 sm:p-4 md:p-6 pb-24 md:pb-6 space-y-5 md:space-y-6">
      {/* Control Room Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
              Andhra Pradesh State Highway Authority · Command & Control Center
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-400">
            NH-16 Pilot Corridor Intelligent Safety Management System · Early Warning Dispatch Desk
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleQuickAddStationaryTruck}
            className="py-2 px-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-red-950/40 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Simulate AI Hazard Detection</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Incident Log</span>
          </button>
        </div>
      </div>

      {/* 📊 KPI METRICS SUMMARY GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metric 1 */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>ACTIVE HIGHWAY HAZARDS</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono-numbers text-white">
              {activeHazardsCount}
            </span>
            <span className="text-xs font-semibold text-red-400">
              ({criticalHazardsCount} Critical)
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block">
            {dispatchedCount} Patrol units dispatched & en-route
          </span>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>AVG RESPONSE & CLEARANCE</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono-numbers text-white">
              14.2
            </span>
            <span className="text-xs text-slate-400">Minutes</span>
          </div>
          <span className="text-[11px] text-emerald-400 block font-medium">
            ↓ 41% faster than standard towing protocol
          </span>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>DRIVERS PROACTIVELY WARNED</span>
            <Radio className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono-numbers text-white">
              1,482
            </span>
            <span className="text-xs text-slate-400">Vehicles</span>
          </div>
          <span className="text-[11px] text-slate-500 block">
            Advance speed reduction advisory broadcasted
          </span>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>PATROL FLEET READINESS</span>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono-numbers text-white">
              {patrolUnits.filter((u) => u.status === 'available').length} / {patrolUnits.length}
            </span>
            <span className="text-xs text-emerald-400">Available</span>
          </div>
          <span className="text-[11px] text-slate-500 block">
            Covers KM 350 to KM 440 NH-16 Sector
          </span>
        </div>
      </div>

      {/* CENTRALIZED LIVE GIS MAP */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-wider text-slate-300 uppercase flex items-center gap-2">
            <span>Live GIS Corridor Telemetry Map</span>
            <span className="text-xs font-mono text-amber-400">· Interactive Vector Layer</span>
          </h2>
          <span className="text-xs text-slate-400">
            Click any hazard pin to view details or dispatch safety units
          </span>
        </div>

        <div className="h-[440px]">
          <GisMap
            onSelectIncident={(incident) => {
              setHighlightedIncidentId(incident.id);
            }}
            selectedIncidentId={highlightedIncidentId}
          />
        </div>
      </div>

      {/* TWO-COLUMN LOWER SECTION: INCIDENT MANAGEMENT TABLE & HIGH-RISK CORRIDORS */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Incident Management Table (3 Columns) */}
        <div className="xl:col-span-3 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Live Incident Management Queue ({filteredIncidents.length})
              </h3>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search chainage, vehicle..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Status Tabs */}
              <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                {(['all', 'active', 'dispatched', 'resolved'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusFilter(s)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold capitalize transition-colors ${
                      statusFilter === s
                        ? 'bg-slate-800 text-amber-400'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Card Feed (block md:hidden) */}
          <div className="block md:hidden space-y-3">
            {filteredIncidents.length === 0 ? (
              <div className="py-6 text-center text-slate-500 bg-slate-900/60 rounded-xl border border-slate-800 text-xs">
                No incidents matching filter.
              </div>
            ) : (
              filteredIncidents.map((incident) => {
                const isActive = incident.status === 'active';
                const isDispatched = incident.status === 'dispatched';
                const isResolved = incident.status === 'resolved';

                return (
                  <div
                    key={incident.id}
                    className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs text-white">
                            {incident.id}
                          </span>
                          <span
                            className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                              isActive
                                ? 'bg-red-950 text-red-400 border border-red-500/40'
                                : isDispatched
                                ? 'bg-amber-950 text-amber-400 border border-amber-500/40'
                                : 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                            }`}
                          >
                            {incident.status}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-100 mt-1">
                          {incident.title}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          {incident.category} · {incident.lane}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono text-xs font-bold text-amber-400 block">
                          {incident.chainage}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {incident.reportedAt}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/80 p-2 rounded-lg border border-slate-800/80">
                      <span>Advisory: <strong className="text-amber-400">≤ {incident.speedAdvisoryKm} km/h</strong></span>
                      <span>Verified: <strong className="text-emerald-400">{incident.confirmedCount} drivers</strong></span>
                    </div>

                    {/* Mobile Action Buttons */}
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                      {incident.hasVisualCapture && (
                        <button
                          type="button"
                          onClick={() => setSelectedIncidentForVision(incident)}
                          className="min-h-[40px] px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 active:scale-95"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>AI Cam</span>
                        </button>
                      )}

                      {incident.status !== 'resolved' && (
                        <button
                          type="button"
                          onClick={() => setSelectedIncidentForDispatch(incident)}
                          className="min-h-[40px] flex-1 py-1.5 px-3 rounded-lg bg-blue-600 active:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-transform"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>{isDispatched ? 'Reassign' : 'Dispatch Unit'}</span>
                        </button>
                      )}

                      {incident.status !== 'resolved' ? (
                        <button
                          type="button"
                          onClick={() => resolveIncident(incident.id)}
                          className="min-h-[40px] px-3.5 rounded-lg bg-emerald-600 active:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-transform"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Resolve</span>
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-400 font-semibold py-2">
                          Cleared
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Table Container (hidden md:block) */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Incident / Chainage</th>
                  <th className="py-3 px-3">Vehicle & Category</th>
                  <th className="py-3 px-3">Severity & Advisory</th>
                  <th className="py-3 px-3">Source & Verification</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredIncidents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No highway incidents matching current filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredIncidents.map((incident) => {
                    const isSelected = highlightedIncidentId === incident.id;
                    const isActive = incident.status === 'active';
                    const isDispatched = incident.status === 'dispatched';
                    const isResolved = incident.status === 'resolved';

                    return (
                      <tr
                        key={incident.id}
                        className={`hover:bg-slate-800/50 transition-colors ${
                          isSelected ? 'bg-amber-950/20' : ''
                        }`}
                      >
                        {/* Incident ID & Chainage */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-mono font-bold text-white">
                              {incident.id}
                            </span>
                            <span className="font-mono font-semibold text-amber-400 mt-0.5">
                              {incident.chainage}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">
                              {incident.lane}
                            </span>
                          </div>
                        </td>

                        {/* Title & Category */}
                        <td className="py-3.5 px-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-100">
                              {incident.title}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {incident.category}
                            </span>
                            <span className="text-[10px] text-slate-500 mt-0.5">
                              Reported {incident.reportedAt}
                            </span>
                          </div>
                        </td>

                        {/* Severity & Speed Advisory */}
                        <td className="py-3.5 px-3">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded w-fit ${
                                incident.severity === 'critical'
                                  ? 'bg-red-950 text-red-400 border border-red-500/40'
                                  : incident.severity === 'high'
                                  ? 'bg-amber-950 text-amber-400 border border-amber-500/40'
                                  : 'bg-blue-950 text-blue-300 border border-blue-500/40'
                              }`}
                            >
                              {incident.severity}
                            </span>
                            <span className="font-mono font-semibold text-slate-300 text-[11px]">
                              Advisory: ≤ {incident.speedAdvisoryKm} km/h
                            </span>
                          </div>
                        </td>

                        {/* Detection Source & Confirmations */}
                        <td className="py-3.5 px-3">
                          <div className="flex flex-col">
                            <span className="text-slate-300 font-medium">
                              {incident.source}
                            </span>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
                              <span className="text-emerald-400 font-bold">
                                {incident.confirmedCount} Verified
                              </span>
                              <span>·</span>
                              <span>{incident.dismissedCount} Cleared</span>
                            </div>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-3">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded w-fit ${
                                isActive
                                  ? 'bg-red-900/60 text-red-300 border border-red-500/50'
                                  : isDispatched
                                  ? 'bg-amber-900/60 text-amber-300 border border-amber-500/50'
                                  : 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/50'
                              }`}
                            >
                              {incident.status}
                            </span>
                            {incident.assignedUnit && (
                              <span className="text-[10px] text-blue-300 font-medium">
                                Unit: {incident.assignedUnit.name} (~{incident.assignedUnit.etaMinutes}m ETA)
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* AI Vision feed if available */}
                            {incident.hasVisualCapture && (
                              <button
                                type="button"
                                onClick={() => setSelectedIncidentForVision(incident)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                                title="View Live Edge AI Camera Feed"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Dispatch Unit Button */}
                            {incident.status !== 'resolved' && (
                              <button
                                type="button"
                                onClick={() => setSelectedIncidentForDispatch(incident)}
                                className="py-1 px-2.5 rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white font-semibold text-xs flex items-center gap-1 transition-colors"
                              >
                                <Navigation className="w-3 h-3" />
                                <span>{isDispatched ? 'Reassign' : 'Dispatch'}</span>
                              </button>
                            )}

                            {/* Resolve / Clear Button */}
                            {incident.status !== 'resolved' ? (
                              <button
                                type="button"
                                onClick={() => resolveIncident(incident.id)}
                                className="py-1 px-2.5 rounded-lg bg-emerald-700/80 hover:bg-emerald-600 text-white font-semibold text-xs flex items-center gap-1 transition-colors"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Resolve</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-emerald-400 font-semibold px-2 py-1">
                                Resolved
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar: High-Risk Pilot Segments & Patrol Fleet Status (1 Column) */}
        <div className="xl:col-span-1 space-y-4">
          {/* High-Risk Corridor Watchlist */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                High-Risk Corridor Segments
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              AI historical accident frequency index along NH-16 Andhra Pradesh stretch.
            </p>

            <div className="space-y-2.5">
              {highRiskSegments.map((segment) => (
                <div
                  key={segment.name}
                  className="p-3 rounded-lg bg-slate-950 border border-slate-800/90 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{segment.name.split(' (')[0]}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        segment.riskRating === 'Severe'
                          ? 'bg-red-950 text-red-400 border border-red-500/40'
                          : 'bg-amber-950 text-amber-400 border border-amber-500/40'
                      }`}
                    >
                      {segment.riskRating}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{segment.kmRange}</span>
                    <span className="font-mono text-slate-300">
                      {segment.historicalIncidents} Incidents YTD
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 italic">
                    Risk factor: {segment.primaryRisk}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Patrol Fleet Status */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Patrol Fleet Status
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">NHAI AP-16</span>
            </div>

            <div className="space-y-2">
              {patrolUnits.map((unit) => (
                <div
                  key={unit.id}
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-200">{unit.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      KM {unit.currentKm.toFixed(1)} · {unit.contactNumber}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      unit.status === 'available'
                        ? 'bg-emerald-950 text-emerald-400'
                        : 'bg-amber-950 text-amber-400 animate-pulse'
                    }`}
                  >
                    {unit.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dispatch Modal */}
      <DispatchModal
        isOpen={!!selectedIncidentForDispatch}
        incident={selectedIncidentForDispatch}
        onClose={() => setSelectedIncidentForDispatch(null)}
      />

      {/* AI Edge Vision Feed Modal */}
      <AiVisionModal
        isOpen={!!selectedIncidentForVision}
        incident={selectedIncidentForVision}
        onClose={() => setSelectedIncidentForVision(null)}
      />
    </div>
  );
};
