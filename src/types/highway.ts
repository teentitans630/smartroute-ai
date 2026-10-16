export type HazardType =
  | 'stationary_vehicle'
  | 'road_debris'
  | 'accident_collision'
  | 'oil_spill'
  | 'animal_stray'
  | 'road_work';

export type VehicleCategory =
  | 'Heavy Multi-Axle Truck'
  | 'Commercial Bus'
  | 'Stationary SUV / Car'
  | 'Tractor / Slow Moving'
  | 'Cargo / Container Debris'
  | 'Hazardous Material Tanker';

export type IncidentStatus = 'active' | 'dispatched' | 'resolved';

export type SeverityLevel = 'critical' | 'high' | 'moderate';

export type IncidentSource =
  | 'AI V2X Camera #AP-09'
  | 'Driver Crowd-Report'
  | 'Highway Patrol Delta-2'
  | 'IoT Road Sensor'
  | 'Toll Plaza Telemetry';

export interface PatrolUnit {
  id: string;
  name: string;
  type: 'patrol' | 'ambulance' | 'crane' | 'interceptor';
  currentKm: number;
  corridor: string;
  status: 'available' | 'en_route' | 'on_scene';
  etaMinutes?: number;
  assignedIncidentId?: string;
  contactNumber: string;
}

export interface HazardIncident {
  id: string;
  type: HazardType;
  title: string;
  category: VehicleCategory;
  corridor: string;
  chainage: string; // e.g. "KM 384+200"
  kmMarker: number;
  lane: 'Right (Fast Lane)' | 'Left (Slow Lane)' | 'Shoulder / Lay-by' | 'Median Border';
  status: IncidentStatus;
  severity: SeverityLevel;
  source: IncidentSource;
  reportedAt: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  confirmedCount: number;
  dismissedCount: number;
  speedAdvisoryKm: number;
  assignedUnit?: PatrolUnit;
  description: string;
  hasVisualCapture?: boolean;
}

export interface DriverState {
  currentSpeed: number;
  speedLimit: number;
  currentKm: number;
  isDriving: boolean;
  safeDrivingMode: boolean;
  audioMuted: boolean;
  heading: 'Northbound (To Vijayawada)' | 'Southbound (To Guntur)';
  fuelLevel: number;
  activeAlertDismissed: boolean;
}

export interface HighRiskSegment {
  name: string;
  kmRange: string;
  historicalIncidents: number;
  primaryRisk: string;
  riskRating: 'High Risk' | 'Severe' | 'Elevated';
}

export interface CorridorMilestone {
  name: string;
  kmMarker: number;
  type: 'city' | 'toll_plaza' | 'junction' | 'rest_stop';
}
