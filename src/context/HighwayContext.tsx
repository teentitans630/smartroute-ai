import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  HazardIncident,
  PatrolUnit,
  DriverState,
  HighRiskSegment,
} from '../types/highway';
import {
  INITIAL_HAZARDS,
  INITIAL_PATROL_UNITS,
  HIGH_RISK_SEGMENTS,
} from '../data/mockCorridorData';
import { soundAlert } from '../services/audioAlert';

interface NotificationToast {
  id: string;
  title: string;
  message: string;
  type: 'emergency' | 'dispatch' | 'resolved' | 'info';
  timestamp: string;
}

interface HighwayContextType {
  hazards: HazardIncident[];
  patrolUnits: PatrolUnit[];
  driverState: DriverState;
  highRiskSegments: HighRiskSegment[];
  activeProximityAlert: {
    hazard: HazardIncident;
    distanceKm: number;
    urgency: 'critical' | 'warning' | 'advisory';
  } | null;
  passingConfirmationPrompt: HazardIncident | null;
  notifications: NotificationToast[];
  // Actions
  setSpeed: (speed: number) => void;
  toggleDriving: () => void;
  toggleSafeDrivingMode: () => void;
  toggleAudioMute: () => void;
  jumpToKm: (km: number) => void;
  dismissCurrentAlert: () => void;
  reportIncident: (incident: Omit<HazardIncident, 'id' | 'reportedAt' | 'confirmedCount' | 'dismissedCount'>) => HazardIncident;
  dispatchUnit: (incidentId: string, unitId: string) => void;
  resolveIncident: (incidentId: string) => void;
  confirmHazardPresence: (incidentId: string, isStillPresent: boolean) => void;
  dismissToast: (id: string) => void;
}

const HighwayContext = createContext<HighwayContextType | undefined>(undefined);

export const HighwayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hazards, setHazards] = useState<HazardIncident[]>(INITIAL_HAZARDS);
  const [patrolUnits, setPatrolUnits] = useState<PatrolUnit[]>(INITIAL_PATROL_UNITS);
  const [highRiskSegments] = useState<HighRiskSegment[]>(HIGH_RISK_SEGMENTS);
  const [notifications, setNotifications] = useState<NotificationToast[]>([]);

  // Driver HUD State
  const [driverState, setDriverState] = useState<DriverState>({
    currentSpeed: 86,
    speedLimit: 100,
    currentKm: 382.4, // 1.8 km before KM 384.2 critical truck hazard!
    isDriving: true,
    safeDrivingMode: false,
    audioMuted: false,
    heading: 'Northbound (To Vijayawada)',
    fuelLevel: 78,
    activeAlertDismissed: false,
  });

  // Track which hazards have already sounded voice warning to avoid repetitive spam
  const voiceAlertsTriggered = useRef<Set<string>>(new Set());
  const confirmedPromptAnswered = useRef<Set<string>>(new Set());

  // Add toast helper
  const addToast = useCallback((toast: Omit<NotificationToast, 'id' | 'timestamp'>) => {
    const newToast: NotificationToast = {
      ...toast,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setNotifications((prev) => [newToast, ...prev.slice(0, 4)]);
  }, []);

  const dismissToast = (id: string) => {
    setNotifications((prev) => prev.filter((t) => t.id !== id));
  };

  // Continuous Highway Driving Physics Simulation Loop (Realistic Sample Speed Variation)
  useEffect(() => {
    if (!driverState.isDriving) return;

    const interval = setInterval(() => {
      setDriverState((prev) => {
        // Find if approaching any unresolved hazard within 1.8 km
        const activeAhead = hazards.find(
          (h) => h.status !== 'resolved' && (h.kmMarker - prev.currentKm) > 0.05 && (h.kmMarker - prev.currentKm) <= 1.8
        );

        let targetSpeed = 86;
        if (activeAhead) {
          const dist = activeAhead.kmMarker - prev.currentKm;
          // Dynamically decelerate as the vehicle approaches the stationary hazard
          if (dist <= 0.7) {
            targetSpeed = activeAhead.speedAdvisoryKm;
          } else {
            targetSpeed = activeAhead.speedAdvisoryKm + (dist - 0.7) * 45;
          }
        } else {
          // Natural cruising speed variation (oscillates smoothly between 82 and 89 km/h)
          const time = Date.now() / 2400;
          const naturalVariation = Math.sin(time) * 3 + Math.cos(time * 0.7) * 1.5;
          targetSpeed = 85.5 + naturalVariation;
        }

        // Smooth physical acceleration / deceleration easing
        const delta = (targetSpeed - prev.currentSpeed) * 0.45;
        let newSpeed = Math.round(prev.currentSpeed + delta);
        if (newSpeed < 25) newSpeed = 25;

        // Speed calculation in km per second
        const kmIncrement = (newSpeed / 3600) * 1.5;
        let nextKm = prev.currentKm + kmIncrement;

        // Loop corridor between KM 370 and KM 435 for continuous demo
        if (nextKm > 435) {
          nextKm = 372.0;
        }

        return {
          ...prev,
          currentSpeed: newSpeed,
          currentKm: Math.round(nextKm * 100) / 100,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [driverState.isDriving, hazards]);

  // Compute Upcoming Proactive Hazards & Proximity
  const upcomingHazards = hazards
    .filter((h) => h.status !== 'resolved')
    .map((h) => ({
      hazard: h,
      distanceKm: Math.round((h.kmMarker - driverState.currentKm) * 10) / 10,
    }))
    .filter((item) => item.distanceKm >= -0.2 && item.distanceKm <= 3.5)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const nearestAhead = upcomingHazards.find((item) => item.distanceKm > 0.05);

  let activeProximityAlert = null;
  if (nearestAhead && !driverState.activeAlertDismissed) {
    const d = nearestAhead.distanceKm;
    const urgency: 'critical' | 'warning' | 'advisory' =
      d <= 1.5 ? 'critical' : d <= 2.5 ? 'warning' : 'advisory';

    activeProximityAlert = {
      hazard: nearestAhead.hazard,
      distanceKm: d,
      urgency,
    };
  }

  // Passing confirmation prompt (when driver is between -0.1km and +0.3km of an active/dispatched hazard)
  const passingHazardItem = upcomingHazards.find(
    (item) => item.distanceKm >= -0.1 && item.distanceKm <= 0.4
  );
  const passingConfirmationPrompt =
    passingHazardItem && !confirmedPromptAnswered.current.has(passingHazardItem.hazard.id)
      ? passingHazardItem.hazard
      : null;

  // Sound Warning Trigger (at 1.6km and 0.9km threshold)
  useEffect(() => {
    if (!activeProximityAlert) return;

    const hazardId = activeProximityAlert.hazard.id;
    const dist = activeProximityAlert.distanceKm;

    if (dist <= 1.6 && !voiceAlertsTriggered.current.has(hazardId)) {
      voiceAlertsTriggered.current.add(hazardId);
      const spokenMsg = `Attention: ${activeProximityAlert.hazard.title} ${dist} kilometers ahead on NH-16. Please slow down to ${activeProximityAlert.hazard.speedAdvisoryKm} kilometers per hour immediately.`;

      soundAlert.triggerFullWarning(
        `⚠️ Stationary hazard ${dist} km ahead`,
        spokenMsg,
        driverState.audioMuted
      );

      addToast({
        title: 'Advance Warning Issued to Driver HUD',
        message: `${activeProximityAlert.hazard.title} detected at ${activeProximityAlert.hazard.chainage}`,
        type: 'emergency',
      });
    }
  }, [activeProximityAlert, driverState.audioMuted, addToast]);

  // Actions
  const setSpeed = (speed: number) => {
    setDriverState((prev) => ({
      ...prev,
      currentSpeed: Math.max(0, Math.min(140, Math.round(speed))),
    }));
  };

  const toggleDriving = () => {
    setDriverState((prev) => ({
      ...prev,
      isDriving: !prev.isDriving,
    }));
  };

  const toggleSafeDrivingMode = () => {
    setDriverState((prev) => ({
      ...prev,
      safeDrivingMode: !prev.safeDrivingMode,
    }));
  };

  const toggleAudioMute = () => {
    setDriverState((prev) => ({
      ...prev,
      audioMuted: !prev.audioMuted,
    }));
  };

  const jumpToKm = (km: number) => {
    // Reset voice alert for target hazard so user can hear the trigger immediately
    voiceAlertsTriggered.current.clear();
    setDriverState((prev) => ({
      ...prev,
      currentKm: Math.round(km * 10) / 10,
      activeAlertDismissed: false,
    }));
  };

  const dismissCurrentAlert = () => {
    setDriverState((prev) => ({
      ...prev,
      activeAlertDismissed: true,
    }));
  };

  const reportIncident = (
    data: Omit<HazardIncident, 'id' | 'reportedAt' | 'confirmedCount' | 'dismissedCount'>
  ): HazardIncident => {
    const newId = `HAZ-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newIncident: HazardIncident = {
      ...data,
      id: newId,
      reportedAt: 'Just now',
      confirmedCount: 1,
      dismissedCount: 0,
    };

    setHazards((prev) => [newIncident, ...prev]);

    // Play tone acknowledging report
    soundAlert.playEmergencyChime();

    addToast({
      title: 'New Hazard Broadcasted to NHAI Control Room',
      message: `${newIncident.category} at ${newIncident.chainage}. Early warning broadcast activated for oncoming traffic.`,
      type: 'emergency',
    });

    return newIncident;
  };

  const dispatchUnit = (incidentId: string, unitId: string) => {
    const unit = patrolUnits.find((u) => u.id === unitId);
    if (!unit) return;

    // Calculate approximate travel time based on km difference
    const incident = hazards.find((h) => h.id === incidentId);
    const distance = incident ? Math.abs(incident.kmMarker - unit.currentKm) : 5;
    const calculatedEta = Math.max(3, Math.round((distance / 60) * 60)); // at 60 km/h

    const updatedUnit: PatrolUnit = {
      ...unit,
      status: 'en_route',
      assignedIncidentId: incidentId,
      etaMinutes: calculatedEta,
    };

    setPatrolUnits((prev) =>
      prev.map((u) => (u.id === unitId ? updatedUnit : u))
    );

    setHazards((prev) =>
      prev.map((h) =>
        h.id === incidentId
          ? {
              ...h,
              status: 'dispatched',
              assignedUnit: updatedUnit,
            }
          : h
      )
    );

    addToast({
      title: `${unit.name} Dispatched`,
      message: `En-route to ${incident?.chainage || 'incident'}. Estimated ETA: ${calculatedEta} mins.`,
      type: 'dispatch',
    });
  };

  const resolveIncident = (incidentId: string) => {
    setHazards((prev) =>
      prev.map((h) => {
        if (h.id === incidentId) {
          return {
            ...h,
            status: 'resolved',
            speedAdvisoryKm: 80,
          };
        }
        return h;
      })
    );

    // Free any assigned patrol unit
    setPatrolUnits((prev) =>
      prev.map((u) =>
        u.assignedIncidentId === incidentId
          ? { ...u, status: 'available', assignedIncidentId: undefined, etaMinutes: undefined }
          : u
      )
    );

    addToast({
      title: 'Corridor Cleared & Verified',
      message: `Hazard ${incidentId} marked Resolved. Speed advisory lifted on highway segment.`,
      type: 'resolved',
    });
  };

  const confirmHazardPresence = (incidentId: string, isStillPresent: boolean) => {
    confirmedPromptAnswered.current.add(incidentId);

    setHazards((prev) =>
      prev.map((h) => {
        if (h.id === incidentId) {
          const newConfirmed = isStillPresent ? h.confirmedCount + 1 : h.confirmedCount;
          const newDismissed = !isStillPresent ? h.dismissedCount + 1 : h.dismissedCount;

          // If multiple drivers flag it cleared, resolve automatically
          if (!isStillPresent && newDismissed >= 2) {
            return {
              ...h,
              confirmedCount: newConfirmed,
              dismissedCount: newDismissed,
              status: 'resolved',
            };
          }

          return {
            ...h,
            confirmedCount: newConfirmed,
            dismissedCount: newDismissed,
          };
        }
        return h;
      })
    );

    addToast({
      title: isStillPresent ? 'Hazard Presence Confirmed' : 'Cleared Notice Received',
      message: isStillPresent
        ? 'Thank you! Crowdsourced validation helps keep highway drivers alert.'
        : 'Thank you! Highway safety desk notified to verify lane clearance.',
      type: 'info',
    });
  };

  return (
    <HighwayContext.Provider
      value={{
        hazards,
        patrolUnits,
        driverState,
        highRiskSegments,
        activeProximityAlert,
        passingConfirmationPrompt,
        notifications,
        setSpeed,
        toggleDriving,
        toggleSafeDrivingMode,
        toggleAudioMute,
        jumpToKm,
        dismissCurrentAlert,
        reportIncident,
        dispatchUnit,
        resolveIncident,
        confirmHazardPresence,
        dismissToast,
      }}
    >
      {children}
    </HighwayContext.Provider>
  );
};

export const useHighway = () => {
  const context = useContext(HighwayContext);
  if (!context) {
    throw new Error('useHighway must be used within a HighwayProvider');
  }
  return context;
};
