// Angel Photography Miami - DynamoDB Schema
// Tabla: angel-bookings

// Partition Key: id (String)

// Campos de la reserva:
{
  "id": "bk_xxxxxxxxxxxxx",        // ID único (bk_ + timestamp)
  
  // Cliente
  "clientName": "Juan Perez",
  "clientEmail": "juan@email.com",
  "clientPhone": "3051234567",
  
  // Sesión
  "serviceType": "kids",           // pregnant, newborn, kids, wedding, eventos, exclusivo
  "serviceTier": "gold",          // digital, silver, gold, platinum, diamond, premium
  "sessionDate": "2026-03-15",
  "sessionTime": "10:00",
  
  // Pagos
  "totalAmount": 680,             // Costo total del paquete
  "depositPaid": 100,             // Siempre $100
  "remainingPaid": 580,           // totalAmount - depositPaid
  "paymentStatus": "pending",     // pending, paid, partial
  
  // Estado
  "status": "pending",            // pending, confirmed, completed, cancelled, postponed
  
  // Costos de sesión (gastos reales)
  "sessionCost": 0,               // Gastos durante la sesión (equipment, travel, etc.)
  
  // Metadata
  "createdAt": "2026-03-04T12:00:00.000Z",
  "updatedAt": "2026-03-04T12:00:00.000Z",
  "stripeSessionId": null,        // ID de sesión de Stripe
  "notes": ""
}
