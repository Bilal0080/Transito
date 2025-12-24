
export enum VehicleType {
  BIKE = 'BIKE',
  RICKSHAW = 'RICKSHAW',
  COROLLA = 'COROLLA',
  COROLLA_CROSS = 'COROLLA_CROSS',
  REVO = 'REVO',
  FORTUNER = 'FORTUNER',
  HIACE = 'HIACE',
  COASTER = 'COASTER'
}

export enum DriverStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  BUSY = 'BUSY'
}

export interface Driver {
  id: string;
  name: string;
  status: DriverStatus;
  vehicleType: VehicleType;
  rating: number;
  avatar: string;
  x: number; // For SVG map visualization (0-400)
  y: number; // For SVG map visualization (0-400)
}

export interface VehicleInfo {
  id: VehicleType;
  name: string;
  capacity: number;
  baseFare: number;
  perKm: number;
  icon: string;
  description: string;
}

export interface PromoCode {
  code: string;
  discountPercent: number;
  description: string;
}

export interface BookingState {
  pickup: string;
  dropoff: string;
  passengers: number;
  vehicle: VehicleType | null;
  estimatedPrice: number | null;
  appliedPromo: PromoCode | null;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'wallet';
  provider: string;
  lastFour?: string;
  isDefault: boolean;
}

export interface HistoryItem {
  id: string;
  vehicleType: VehicleType;
  pickup: string;
  dropoff: string;
  price: number;
  timestamp: number;
  status: 'completed' | 'cancelled';
  cancellationReason?: string;
  rating?: number;
  feedback?: string;
}

export enum AppState {
  SEARCHING = 'SEARCHING',
  BOOKING = 'BOOKING',
  ACTIVE_RIDE = 'ACTIVE_RIDE',
  HISTORY = 'HISTORY'
}
