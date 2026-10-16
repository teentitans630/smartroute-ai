import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  Truck,
  Car,
  Navigation,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Crosshair,
  RotateCcw,
  Layers,
  MapPin,
  Flame,
  Radio,
  Eye,
  ChevronRight,
  Compass,
} from 'lucide-react';
import { HazardIncident, PatrolUnit } from '../../types/highway';
import { NH16_MILESTONES } from '../../data/mockCorridorData';
import { useHighway } from '../../context/HighwayContext';

interface GisMapProps {
  onSelectIncident?: (incident: HazardIncident) => void;
  selectedIncidentId?: string | null;
  compact?: boolean;
  fullScreenMode?: boolean;
}

export const GisMap: React.FC<GisMapProps> = ({
  onSelectIncident,
  selectedIncidentId,
  compact = false,
  fullScreenMode = false,
}) => {
  const {
    hazards,
    patrolUnits,
    driverState,
    jumpToKm,
    resolveIncident,
  } = useHighway();

  const [zoomLevel, setZoomLevel] = useState<number>(compact ? 1.0 : fullScreenMode ? 1.3 : 1.15);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showPatrols, setShowPatrols] = useState<boolean>(true);
  const [showResolved, setShowResolved] = useState<boolean>(true);
  const [showHotspots, setShowHotspots] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'schematic' | 'night_satellite'>('schematic');
  const [selectedIncident, setSelectedIncident] = useState<HazardIncident | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(fullScreenMode);

  const containerRef = useRef<HTMLDivElement>(null);

  // Corridor range: KM 350 to KM 440 (90 km stretch)
  const minKm = 350;
  const maxKm = 440;
  const kmSpan = maxKm - minKm;

  // Convert kilometer to SVG coordinates along NH-16 coastal plain curve
  const getCoordinatesForKm = useCallback((km: number) => {
    const clampedKm = Math.max(minKm, Math.min(maxKm, km));
    const normalized = (clampedKm - minKm) / kmSpan; // 0 to 1

    // Highway curve formula: gentle S-curve across 1280px wide canvas
    const x = 90 + normalized * 1100;
    // S-curve waving gently between y=190 and y=290
    const y = 240 + Math.sin(normalized * Math.PI * 1.8) * 60;

    return { x, y };
  }, [kmSpan]);

  const driverCoords = getCoordinatesForKm(driverState.currentKm);

  // Center pan offset on specific kilometer marker
  const centerOnKm = useCallback((km: number) => {
    if (!containerRef.current) return;
    const { x, y } = getCoordinatesForKm(km);
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    // Calculate center offset
    const targetX = containerWidth / 2 - x * zoomLevel;
    const targetY = containerHeight / 2 - y * zoomLevel;

    setPanOffset({ x: targetX, y: targetY });
  }, [getCoordinatesForKm, zoomLevel]);

  // Center on driver automatically on mount
  useEffect(() => {
    centerOnKm(driverState.currentKm);
  }, []);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch drag handlers (Mobile swipe navigation)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - panOffset.x,
        y: e.touches[0].clientY - panOffset.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPanOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Mouse wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * -0.0012;
    setZoomLevel((prev) => Math.max(0.65, Math.min(2.5, prev + zoomDelta)));
  };

  // Generate smooth SVG path for NH-16 highway
  const points: { x: number; y: number }[] = [];
  for (let km = minKm; km <= maxKm; km += 2) {
    points.push(getCoordinatesForKm(km));
  }
  const pathData = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  return (
    <div
      className={`relative flex flex-col w-full h-full bg-slate-950 overflow-hidden select-none ${
        isExpanded ? 'fixed inset-0 z-50 rounded-none' : compact ? 'rounded-xl border border-slate-800' : 'flex-1 rounded-none border-0'
      }`}
    >
      {/* 🧭 Top Navigation Toolbar */}
      <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 bg-slate-900/95 border-b border-slate-800 backdrop-blur z-20 gap-2 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>NH-16 GIS LIVE RADAR</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            KM 350.0 — KM 440.0 (Vijayawada · Guntur Corridor)
          </span>
        </div>

        {/* Quick Sector Selector Bar (1-Click Jumps) */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => centerOnKm(driverState.currentKm)}
            className="px-2.5 py-1 rounded-lg bg-sky-950 text-sky-300 border border-sky-600/40 font-bold hover:bg-sky-900 transition-colors flex items-center gap-1"
          >
            <Crosshair className="w-3.5 h-3.5 text-sky-400" />
            <span>My Vehicle</span>
          </button>
          <button
            type="button"
            onClick={() => centerOnKm(350)}
            className="px-2 py-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            Vijayawada
          </button>
          <button
            type="button"
            onClick={() => centerOnKm(372)}
            className="px-2 py-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            Mangalagiri
          </button>
          <button
            type="button"
            onClick={() => centerOnKm(395)}
            className="px-2 py-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            Guntur
          </button>
          <button
            type="button"
            onClick={() => centerOnKm(422)}
            className="px-2 py-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            Chilakaluripet
          </button>
        </div>

        {/* View Controls & Fullscreen */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Schematic / Radar toggle */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('schematic')}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                viewMode === 'schematic' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              GIS
            </button>
            <button
              type="button"
              onClick={() => setViewMode('night_satellite')}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                viewMode === 'night_satellite' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Radar
            </button>
          </div>

          {/* Fullscreen Expand Button */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="min-h-[36px] min-w-[36px] p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors"
            title={isExpanded ? 'Exit Full Screen' : 'Expand Full Screen'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4 text-amber-400" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 🗺️ Main Draggable Interactive Map Viewport */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        className={`relative flex-1 w-full h-full overflow-hidden ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{
          background:
            viewMode === 'night_satellite'
              ? 'radial-gradient(circle at 50% 50%, #06152b 0%, #020617 100%)'
              : '#020617',
        }}
      >
        {/* SVG Canvas with Dynamic Transform */}
        <div
          className="absolute inset-0 transition-transform duration-75 origin-top-left pointer-events-none"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
          }}
        >
          <svg
            className="w-[1280px] h-[520px] block pointer-events-auto"
            viewBox="0 0 1280 520"
          >
            <defs>
              {/* Radar Alert Glow */}
              <radialGradient id="alertRippleGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#ef4444" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </radialGradient>

              {/* Forward Radar Scanning Cone */}
              <linearGradient id="forwardCone" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
              </linearGradient>

              {/* GIS Grid pattern */}
              <pattern id="gisPattern" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#1e293b" strokeWidth="0.6" strokeOpacity="0.45" />
              </pattern>
            </defs>

            {/* Background Grid */}
            <rect width="1280" height="520" fill="url(#gisPattern)" />

            {/* High-Risk Zones */}
            {showHotspots && (
              <g id="hotspots-layer">
                {(() => {
                  const p1 = getCoordinatesForKm(376);
                  const p2 = getCoordinatesForKm(388);
                  return (
                    <g>
                      <line
                        x1={p1.x}
                        y1={p1.y}
                        x2={p2.x}
                        y2={p2.y}
                        stroke="#f59e0b"
                        strokeWidth="36"
                        strokeOpacity="0.16"
                        strokeLinecap="round"
                      />
                      <text
                        x={(p1.x + p2.x) / 2}
                        y={p1.y - 34}
                        fill="#f59e0b"
                        fontSize="11"
                        fontWeight="700"
                        textAnchor="middle"
                      >
                        ⚠️ HIGH-RISK SECTOR (KM 376–388)
                      </text>
                    </g>
                  );
                })()}

                {(() => {
                  const p1 = getCoordinatesForKm(420);
                  const p2 = getCoordinatesForKm(435);
                  return (
                    <g>
                      <line
                        x1={p1.x}
                        y1={p1.y}
                        x2={p2.x}
                        y2={p2.y}
                        stroke="#ef4444"
                        strokeWidth="32"
                        strokeOpacity="0.14"
                        strokeLinecap="round"
                      />
                      <text
                        x={(p1.x + p2.x) / 2}
                        y={p2.y + 38}
                        fill="#ef4444"
                        fontSize="10"
                        fontWeight="700"
                        textAnchor="middle"
                      >
                        HIGH-SPEED MERGING CURVE (KM 420–435)
                      </text>
                    </g>
                  );
                })()}
              </g>
            )}

            {/* Highway Road Base (Black Asphalt Surface) */}
            <path
              d={pathData}
              fill="none"
              stroke="#0b1120"
              strokeWidth="28"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Highway Shoulders */}
            <path
              d={pathData}
              fill="none"
              stroke="#334155"
              strokeWidth="22"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Highway Lanes */}
            <path
              d={pathData}
              fill="none"
              stroke="#1e293b"
              strokeWidth="16"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Central Median Divider */}
            <path
              d={pathData}
              fill="none"
              stroke="#475569"
              strokeWidth="2.5"
              strokeDasharray="5 7"
              strokeLinecap="round"
            />

            {/* Milestones & Toll Plazas */}
            {NH16_MILESTONES.map((milestone) => {
              const { x, y } = getCoordinatesForKm(milestone.kmMarker);
              const isToll = milestone.type === 'toll_plaza';
              return (
                <g key={milestone.name} className="milestone-node">
                  <line
                    x1={x}
                    y1={y - 14}
                    x2={x}
                    y2={y + 14}
                    stroke={isToll ? '#38bdf8' : '#64748b'}
                    strokeWidth={isToll ? 3 : 1.5}
                  />
                  <circle
                    cx={x}
                    cy={y - 20}
                    r={isToll ? 5 : 3}
                    fill={isToll ? '#0284c7' : '#475569'}
                    stroke={isToll ? '#e0f2fe' : '#94a3b8'}
                    strokeWidth="1.5"
                  />
                  <text
                    x={x}
                    y={y - 28}
                    fill={isToll ? '#7dd3fc' : '#94a3b8'}
                    fontSize={isToll ? '11' : '9.5'}
                    fontWeight={isToll ? '800' : '600'}
                    textAnchor="middle"
                  >
                    {milestone.name.split(' (')[0]}
                  </text>
                  <text
                    x={x}
                    y={y + 26}
                    fill="#64748b"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    KM {milestone.kmMarker}
                  </text>
                </g>
              );
            })}

            {/* Patrol Fleet Units */}
            {showPatrols &&
              patrolUnits.map((unit) => {
                const { x, y } = getCoordinatesForKm(unit.currentKm);
                const isEnRoute = unit.status === 'en_route';
                return (
                  <g key={unit.id} className="patrol-node cursor-pointer">
                    <circle
                      cx={x}
                      cy={y + 7}
                      r="8"
                      fill="#1d4ed8"
                      stroke="#93c5fd"
                      strokeWidth="2"
                    />
                    <text
                      x={x}
                      y={y + 23}
                      fill="#93c5fd"
                      fontSize="9.5"
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      {unit.id}
                    </text>
                  </g>
                );
              })}

            {/* Driver Radar Projection Field */}
            {(() => {
              const aheadKm = driverState.currentKm + 2.5;
              const aheadCoords = getCoordinatesForKm(aheadKm);
              return (
                <g id="driver-radar-cone" opacity="0.9">
                  <path
                    d={`M ${driverCoords.x} ${driverCoords.y} L ${aheadCoords.x} ${aheadCoords.y - 22} L ${aheadCoords.x} ${aheadCoords.y + 22} Z`}
                    fill="url(#forwardCone)"
                  />
                  {(() => {
                    const warnKm = driverState.currentKm + 1.5;
                    const wCoord = getCoordinatesForKm(warnKm);
                    return (
                      <circle
                        cx={wCoord.x}
                        cy={wCoord.y}
                        r="22"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="1.2"
                        strokeDasharray="3 4"
                      />
                    );
                  })()}
                </g>
              );
            })()}

            {/* Driver Vehicle Position Pin */}
            <g id="driver-vehicle" className="transition-all duration-700 ease-out cursor-pointer" onClick={() => centerOnKm(driverState.currentKm)}>
              <circle
                cx={driverCoords.x}
                cy={driverCoords.y}
                r="11"
                fill="#0284c7"
                stroke="#ffffff"
                strokeWidth="2.5"
              />
              <path
                d={`M ${driverCoords.x - 3.5} ${driverCoords.y + 4} L ${driverCoords.x} ${driverCoords.y - 5} L ${driverCoords.x + 3.5} ${driverCoords.y + 4} Z`}
                fill="#ffffff"
              />
              <g transform={`translate(${driverCoords.x}, ${driverCoords.y - 20})`}>
                <rect
                  x="-42"
                  y="-16"
                  width="84"
                  height="18"
                  rx="5"
                  fill="#0369a1"
                  stroke="#38bdf8"
                  strokeWidth="1.2"
                />
                <text
                  x="0"
                  y="-4"
                  fill="#ffffff"
                  fontSize="9.5"
                  fontWeight="800"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  YOU · {driverState.currentSpeed} km/h
                </text>
              </g>
            </g>

            {/* Hazard Pins */}
            {hazards
              .filter((h) => showResolved || h.status !== 'resolved')
              .map((hazard) => {
                const { x, y } = getCoordinatesForKm(hazard.kmMarker);
                const isActive = hazard.status === 'active';
                const isDispatched = hazard.status === 'dispatched';
                const isResolved = hazard.status === 'resolved';
                const isSelected = selectedIncident?.id === hazard.id || selectedIncidentId === hazard.id;

                const pinColor = isActive
                  ? '#dc2626'
                  : isDispatched
                  ? '#d97706'
                  : '#10b981';

                const strokeGlow = isActive
                  ? '#fca5a5'
                  : isDispatched
                  ? '#fde68a'
                  : '#a7f3d0';

                return (
                  <g
                    key={hazard.id}
                    className="cursor-pointer transition-transform duration-150 hover:scale-125"
                    onClick={() => {
                      setSelectedIncident(hazard);
                      onSelectIncident?.(hazard);
                    }}
                  >
                    {isSelected && (
                      <circle
                        cx={x}
                        cy={y}
                        r="22"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="2.5"
                        strokeDasharray="4 4"
                      />
                    )}

                    <circle
                      cx={x}
                      cy={y}
                      r={isActive ? '11' : '8.5'}
                      fill={pinColor}
                      stroke={strokeGlow}
                      strokeWidth={isActive ? '3' : '2'}
                    />

                    <text
                      x={x}
                      y={y + 4}
                      fill="#ffffff"
                      fontSize={isActive ? '11' : '9.5'}
                      fontWeight="900"
                      textAnchor="middle"
                    >
                      {isActive ? '!' : isDispatched ? '⚡' : '✓'}
                    </text>

                    <g transform={`translate(${x}, ${y - (isActive ? 18 : 14)})`}>
                      <rect
                        x="-44"
                        y="-13"
                        width="88"
                        height="15"
                        rx="4"
                        fill={isActive ? '#7f1d1d' : isDispatched ? '#78350f' : '#064e3b'}
                        stroke={pinColor}
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="-3"
                        fill="#ffffff"
                        fontSize="8.5"
                        fontWeight="800"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {hazard.chainage}
                      </text>
                    </g>
                  </g>
                );
              })}
          </svg>
        </div>

        {/* 🧭 Floating Map Controls (Right Side) */}
        <div className="absolute right-3.5 bottom-16 sm:bottom-6 z-30 flex flex-col items-center gap-2 pointer-events-auto">
          {/* Recenter on Vehicle FAB Button */}
          <button
            type="button"
            onClick={() => centerOnKm(driverState.currentKm)}
            className="w-10 h-10 rounded-2xl bg-slate-900/90 border border-slate-700/80 hover:bg-slate-800 text-sky-400 flex items-center justify-center shadow-xl backdrop-blur-md active:scale-95 transition-transform"
            title="Recenter on My Vehicle"
            aria-label="Center on Vehicle"
          >
            <Crosshair className="w-5 h-5" />
          </button>

          {/* Zoom Controls */}
          <div className="flex flex-col bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
              className="min-h-[40px] min-w-[40px] p-2 text-slate-200 hover:text-white hover:bg-slate-800 flex items-center justify-center border-b border-slate-800 active:scale-95 transition-transform"
              title="Zoom In"
              aria-label="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(0.65, z - 0.2))}
              className="min-h-[40px] min-w-[40px] p-2 text-slate-200 hover:text-white hover:bg-slate-800 flex items-center justify-center border-b border-slate-800 active:scale-95 transition-transform"
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setZoomLevel(1.15);
                centerOnKm(driverState.currentKm);
              }}
              className="min-h-[36px] min-w-[40px] p-2 text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center text-[10px] font-bold"
              title="Reset Zoom"
            >
              1x
            </button>
          </div>
        </div>

        {/* 🚗 Live Telemetry Floating Pill (Top Left) */}
        <div className="absolute top-3 left-3 z-30 p-2.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-md text-xs pointer-events-auto space-y-1 max-w-[260px] sm:max-w-xs">
          <div className="flex items-center justify-between gap-3">
            <span className="font-extrabold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span>VEHICLE TELEMETRY</span>
            </span>
            <span className="font-mono text-amber-400 font-bold">
              {driverState.currentSpeed} km/h
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            KM {driverState.currentKm.toFixed(1)} · Heading Northbound
          </div>
        </div>

        {/* 🔍 Selected Incident Drawer (Bottom Center / Left) */}
        {selectedIncident && (
          <div className="absolute bottom-4 left-3 right-3 sm:right-auto sm:max-w-md z-40 p-4 rounded-2xl bg-slate-900/95 border-2 border-amber-500 shadow-2xl backdrop-blur-md text-xs pointer-events-auto animate-in slide-in-from-bottom-3 duration-200 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span
                  className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                    selectedIncident.status === 'active'
                      ? 'bg-red-950 text-red-400 border border-red-500/40'
                      : selectedIncident.status === 'dispatched'
                      ? 'bg-amber-950 text-amber-400 border border-amber-500/40'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                  }`}
                >
                  {selectedIncident.status} · {selectedIncident.severity}
                </span>
                <h4 className="text-sm font-bold text-white mt-1">
                  {selectedIncident.title}
                </h4>
                <p className="text-[11px] text-slate-400 font-mono">
                  {selectedIncident.chainage} · {selectedIncident.lane}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedIncident(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">{selectedIncident.description}</p>

            <div className="flex items-center justify-between text-[11px] text-slate-300 bg-slate-950/80 p-2 rounded-xl border border-slate-800">
              <span>Speed Advisory: <strong className="text-amber-400">≤ {selectedIncident.speedAdvisoryKm} km/h</strong></span>
              <span>Verified: <strong className="text-emerald-400">{selectedIncident.confirmedCount} drivers</strong></span>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  jumpToKm(selectedIncident.kmMarker - 1.5);
                  setSelectedIncident(null);
                }}
                className="min-h-[40px] flex-1 py-1.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-transform"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Simulate Approach (1.5km out)</span>
              </button>

              {selectedIncident.status !== 'resolved' && (
                <button
                  type="button"
                  onClick={() => {
                    resolveIncident(selectedIncident.id);
                    setSelectedIncident(null);
                  }}
                  className="min-h-[40px] px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-transform"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Safe</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 🏷️ Map Footer Quick Jumps (Mobile Friendly) */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-slate-900/90 border-t border-slate-800 text-[11px] text-slate-400 z-10 shrink-0 gap-2 overflow-x-auto">
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => centerOnKm(driverState.currentKm)}
            className="flex items-center gap-1 font-bold text-sky-400 hover:underline"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Recenter Vehicle</span>
          </button>
          <span>·</span>
          <span>Drag or Swipe anywhere to explore</span>
        </div>

        <div className="flex items-center gap-2 shrink-0 font-mono text-[10px]">
          <span>Zoom: {Math.round(zoomLevel * 100)}%</span>
        </div>
      </div>
    </div>
  );
};
