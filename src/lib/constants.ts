import { AdditionalService, Package } from '@/types';

export const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
] as const;

export const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] as const;

export const TIME_SLOTS = ['9:30', '11:30', '14:00', '16:00', '18:00'] as const;

export const DIGITAL_PACKAGES: Package[] = [
  { id: 'digital-6', name: '6 Fotos Digitales', price: 190, photos: 6 },
  { id: 'digital-12', name: '12 Fotos Digitales', price: 290, photos: 12 },
  { id: 'digital-18', name: '18 Fotos Digitales', price: 360, photos: 18 },
  { id: 'digital-35', name: '35 Fotos Digitales', price: 550, photos: 35 }
];

export const ADDITIONAL_SERVICES: AdditionalService[] = [
  { id: 'family2', name: '+2 Familiares', price: 50 },
  { id: 'family4', name: '+4 Familiares', price: 80 },
  { id: 'hairMakeup', name: 'Peluqueria y Maquillaje', price: 90 },
  { id: 'outdoor', name: 'Sesion Outdoor', priceNear: 100, priceFar: 200 }
];

export const SESSION_TYPES_ALLOW_DIGITAL = ['newborn', 'kids', 'pregnant'] as const;

export const DEPOSIT_AMOUNT = 100;

export const COLORS = {
  primary: '#c9a962',
  secondary: '#333',
  muted: '#666',
  lightBg: '#f5f5f5',
  disabled: '#e0e0e0',
  error: '#d0d0d0',
  full: '#f5d5d5',
  hasBookings: '#f5f0d5'
} as const;