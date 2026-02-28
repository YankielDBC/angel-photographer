# SPEC.md - Angel Photographer Website

## 1. Project Overview

**Project Name:** Angel Photographer - Booking Website
**Type:** Next.js Web Application with Admin Panel
**Core Functionality:** Photography studio booking system with payment processing and appointment management
**Target Users:** Potential clients browsing portfolio and booking sessions; Admin (Angel) managing appointments

---

## 2. Technical Architecture

### Stack
- **Frontend:** Next.js 14 (App Router) + TailwindCSS
- **Backend:** Next.js API Routes
- **Database:** SQLite with Prisma (simple, portable, no external DB needed for MVP)
- **Payments:** Stripe Checkout (test mode, $0.01)
- **Notifications:** Nodemailer (Gmail) for email alerts
- **Deployment:** Vercel + GitHub

### Key Features
1. Landing page con portfolio
2. Sistema de reservación (1 cliente/día)
3. Pago con Stripe ($0.01 test)
4. Panel admin para ver reservas
5. Notificaciones por email al admin

---

## 3. UI/UX Specification

### Color Palette
- **Primary:** #1a1a2e (Dark Navy)
- **Secondary:** #16213e (Deep Blue)
- **Accent:** #e94560 (Coral Red)
- **Text Light:** #f1f1f1
- **Text Muted:** #a0a0a0

### Typography
- **Headings:** "Playfair Display" (elegant, photography-appropriate)
- **Body:** "Inter" (clean, readable)

### Pages
1. **Home** - Hero, servicios, CTA
2. **Book** - Calendario, formulario cliente, pago
3. **Admin** - Login, dashboard reservas

---

## 4. Database Schema (Prisma)

```prisma
model Booking {
  id            String   @id @default(cuid())
  clientName    String
  clientEmail   String
  clientPhone   String
  date          DateTime @unique // 1 booking per day
  status        String   @default("pending") // pending, confirmed, paid
  stripeSessionId String?
  amount        Float    @default(0.01)
  createdAt     DateTime @default(now())
}

model Admin {
  id       String @id @default(cuid())
  email    String @unique
  password String // hashed
}
```

---

## 5. Execution Status

### Phase 1-4: ✅ COMPLETADO
- Landing page profesional con imágenes Unsplash
- Sistema de reservas con calendario visual
- Panel admin con estadísticas y gestión
- Diseño responsive para móvil
- Contrastes mejorados para legibilidad

### Pendiente
- Notificaciones WhatsApp (requiere API Twilio o similar)
- Deploy a Vercel
- Imágenes propias del photographer

---

## 6. Contact Info (Hardcoded)
- **Phone/WhatsApp:** +17863184596
- **Email:** angel@angelphotographer.com (to be confirmed)

---

## 7. Stripe Test Config
- **Price:** $0.01 (test mode)
- **Mode:** test (no real charges)
