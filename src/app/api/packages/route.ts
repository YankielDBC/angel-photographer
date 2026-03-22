import { NextResponse } from 'next/server'

// Paquetes definidos en el backend - una sola fuente de verdad
// Nota: Paquetes digitales están en el frontend (digitalPackages)
const PACKAGES = {
  newborn: [
    { id: 'silver', name: 'Silver', price: 400, description: '10 fotos 5x7, 1 ampliación 16x20, USB, 2 set, 2 vestuarios' },
    { id: 'gold', name: 'Gold', price: 680, description: '18 fotos, Book 8x10, 1 ampliación 24x36, USB, 3 set, 3 vestuarios' },
    { id: 'platinum', name: 'Platinum', price: 850, description: '25 fotos 8x10, Canvas 30x40, USB, 3 set, 3 vestuarios' },
    { id: 'diamond', name: 'Diamond', price: 1390, description: '40 fotos, Book 12x10, 2 locaciones, Full session USB' }
  ],
  pregnant: [
    { id: 'silver', name: 'Silver', price: 400 },
    { id: 'gold', name: 'Gold', price: 680 },
    { id: 'platinum', name: 'Platinum', price: 850 },
    { id: 'diamond', name: 'Diamond', price: 1390 }
  ],
  kids: [
    { id: 'silver', name: 'Silver', price: 400 },
    { id: 'gold', name: 'Gold', price: 680 },
    { id: 'platinum', name: 'Platinum', price: 850 },
    { id: 'diamond', name: 'Diamond', price: 1390 }
  ],
  wedding: [
    { id: 'silver', name: 'Silver', price: 600 },
    { id: 'gold', name: 'Gold', price: 1050 },
    { id: 'platinum', name: 'Platinum', price: 1550 },
    { id: 'premium', name: 'Premium', price: 2500 }
  ],
  eventos: [
    { id: 'silver', name: 'Silver', price: 600 },
    { id: 'gold', name: 'Gold', price: 1050 },
    { id: 'platinum', name: 'Platinum', price: 1550 },
    { id: 'premium', name: 'Premium', price: 2500 }
  ],
  quinces: [
    { id: 'silver', name: 'Silver', price: 600 },
    { id: 'gold', name: 'Gold', price: 1050 },
    { id: 'platinum', name: 'Platinum', price: 1550 },
    { id: 'premium', name: 'Premium', price: 2500 }
  ],
  exclusivo: [
    { id: 'silver', name: 'Silver', price: 600 },
    { id: 'gold', name: 'Gold', price: 1250 },
    { id: 'platinum', name: 'Platinum', price: 1950 }
  ]
}

// Tipos de sesión disponibles
const SESSION_TYPES = [
  { id: 'pregnant', name: 'Pregnant Session', nameEs: 'Sesión de Maternidad' },
  { id: 'newborn', name: 'Newborn Session', nameEs: 'Sesión Newborn' },
  { id: 'kids', name: 'Kids Session', nameEs: 'Sesión de Niños' },
  { id: 'wedding', name: 'Wedding Session', nameEs: 'Sesión de Bodas' },
  { id: 'quinces', name: 'Quinceañeras Session', nameEs: 'Sesión de Quinceañeras' },
  { id: 'eventos', name: 'Eventos Session', nameEs: 'Sesión de Eventos' },
  { id: 'exclusivo', name: 'Exclusivo Session', nameEs: 'Sesión Exclusiva' }
]

export async function GET() {
  return NextResponse.json({
    sessionTypes: SESSION_TYPES,
    packages: PACKAGES
  })
}
