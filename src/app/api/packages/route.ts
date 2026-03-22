import { NextResponse } from 'next/server'

// Paquetes definidos en el backend - una sola fuente de verdad
// Nota: Paquetes digitales están en el frontend (digitalPackages)
const PACKAGES = {
  newborn: [
    { id: 'basic', name: 'Basic - 5 fotos', price: 400 },
    { id: 'standard', name: 'Standard - 10 fotos', price: 550 },
    { id: 'premium', name: 'Premium - 15 fotos', price: 750 }
  ],
  pregnant: [
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
    { id: 'silver', name: 'Silver - 30 fotos', price: 600 },
    { id: 'gold', name: 'Gold - 30 fotos', price: 1050 },
    { id: 'platinum', name: 'Platinum - 50 fotos', price: 1550 },
    { id: 'premium', name: 'Premium - 50 fotos', price: 2500 }
  ],
  eventos: [
    { id: 'silver', name: 'Silver - 30 fotos', price: 600 },
    { id: 'gold', name: 'Gold - 30 fotos', price: 1050 },
    { id: 'platinum', name: 'Platinum - 50 fotos', price: 1550 },
    { id: 'premium', name: 'Premium - 50 fotos', price: 2500 }
  ],
  quinces: [
    { id: 'silver', name: 'Silver - 30 fotos', price: 600 },
    { id: 'gold', name: 'Gold - 30 fotos', price: 1050 },
    { id: 'platinum', name: 'Platinum - 50 fotos', price: 1550 },
    { id: 'premium', name: 'Premium - 50 fotos', price: 2500 }
  ],
  exclusivo: [
    { id: 'silver', name: 'Silver - 10 fotos', price: 600 },
    { id: 'gold', name: 'Gold - 20 fotos', price: 1250 },
    { id: 'platinum', name: 'Platinum - 30 fotos', price: 1950 }
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
