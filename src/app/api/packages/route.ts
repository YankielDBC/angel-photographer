import { NextResponse } from 'next/server'

// Paquetes definidos en el backend - una sola fuente de verdad
// Nota: Paquetes digitales están en el frontend (digitalPackages)
const PACKAGES = {
  pregnant: [
    { id: 'silver', name: 'Silver - 10 fotos', price: 400 },
    { id: 'gold', name: 'Gold - 18 fotos', price: 680 },
    { id: 'platinum', name: 'Platinum - 25 fotos', price: 850 },
    { id: 'diamond', name: 'Diamond - 40 fotos', price: 1390 }
  ],
  newborn: [
    { id: 'silver', name: 'Silver - 10 fotos', price: 400 },
    { id: 'gold', name: 'Gold - 18 fotos', price: 680 },
    { id: 'platinum', name: 'Platinum - 25 fotos', price: 850 },
    { id: 'diamond', name: 'Diamond - 40 fotos', price: 1390 }
  ],
  kids: [
    { id: 'silver', name: 'Silver - 10 fotos', price: 400 },
    { id: 'gold', name: 'Gold - 18 fotos', price: 680 },
    { id: 'platinum', name: 'Platinum - 25 fotos', price: 850 },
    { id: 'diamond', name: 'Diamond - 40 fotos', price: 1390 }
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
  { id: 'wedding', name: 'Wedding Session', nameEs: 'Sesión de Boda' },
  { id: 'eventos', name: 'Eventos Session', nameEs: 'Sesión de Eventos' },
  { id: 'exclusivo', name: 'Exclusivo Session', nameEs: 'Sesión Exclusiva' }
]

export async function GET() {
  return NextResponse.json({
    sessionTypes: SESSION_TYPES,
    packages: PACKAGES
  })
}
