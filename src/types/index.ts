export interface Package {
  id: string;
  name: string;
  price: number;
  description?: string;
  photos?: number;
}

export interface SessionType {
  id: string;
  name: string;
  nameEs: string;
}

export interface PackagesData {
  sessionTypes: SessionType[];
  packages: Record<string, Package[]>;
}

export interface TimeSlot {
  time: string;
  status: 'available' | 'booked' | 'blocked';
}

export interface DayAvailability {
  status: 'available' | 'blocked' | 'full' | 'has_bookings';
  slots?: TimeSlot[];
}

export interface CalendarData {
  [date: string]: DayAvailability;
}

export interface FormData {
  packageType: string;
  deliveryType: string;
  packageTier: string;
  name: string;
  email: string;
  phone: string;
  clientAge: string;
  clientNotes: string;
  family2: boolean;
  family4: boolean;
  hairMakeup: boolean;
  outdoor: boolean;
  outdoorLocation: 'near' | 'far';
}

export interface AdditionalService {
  id: string;
  name: string;
  price?: number;
  priceNear?: number;
  priceFar?: number;
}

export interface BookingData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceType: string;
  deliveryType: string;
  serviceTier: string;
  sessionDate: string;
  sessionTime: string;
  clientAge: string | null;
  clientNotes: string | null;
  family2: boolean;
  family4: boolean;
  hairMakeup: boolean;
  outdoor: boolean;
  outdoorLocation: string | null;
  additionalServicesCost: number;
  totalAmount: number;
  depositPaid: number;
  remainingPaid: number;
  status: string;
  termsAccepted: {
    accepted: boolean;
    acceptedAt: string;
    ipAddress: string;
  } | null;
}

export type DayStatus = 'past' | 'blocked' | 'full' | 'has_bookings' | 'available';