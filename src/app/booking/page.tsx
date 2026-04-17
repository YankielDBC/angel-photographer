'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CanvasBackground } from '@/components/ui/Canvas';
import { WhatsAppFloat } from '@/components/ui/WhatsAppFloat';
import { StepDateTime, StepPackageInfo, StepConfirm } from '@/components/booking';
import { FormData, CalendarData, PackagesData } from '@/types';
import { DEPOSIT_AMOUNT } from '@/lib/constants';

export default function BookingPage() {
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const [calendarData, setCalendarData] = useState<CalendarData>({});
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  const [packagesData, setPackagesData] = useState<PackagesData>({ sessionTypes: [], packages: {} });
  
  const [formData, setFormData] = useState<FormData>({
    packageType: '',
    deliveryType: '',
    packageTier: '',
    name: '',
    email: '',
    phone: '',
    clientAge: '',
    clientNotes: '',
    family2: false,
    family4: false,
    hairMakeup: false,
    outdoor: false,
    outdoorLocation: 'near'
  });

  const showAgeField = ['newborn', 'kids'].includes(formData.packageType);
  const showAdditionalServices = ['newborn', 'kids', 'pregnant'].includes(formData.packageType);

  const getAdditionalServicesCost = () => {
    let cost = 0;
    if (formData.family2) cost += 50;
    if (formData.family4) cost += 80;
    if (formData.hairMakeup) cost += 90;
    if (formData.outdoor) {
      cost += formData.outdoorLocation === 'near' ? 100 : 200;
    }
    return cost;
  };

  useEffect(() => {
    loadCalendarData();
    loadPackages();
  }, [currentMonth, currentYear]);

  async function loadCalendarData() {
    const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    try {
      const res = await fetch(`/api/calendar?month=${monthStr}`);
      const data = await res.json();
      setCalendarData(data.availability || {});
    } catch (e) {
      console.error('Failed to load calendar:', e);
      setCalendarData({});
    }
  }

  async function loadPackages() {
    try {
      const res = await fetch('/api/packages');
      const data = await res.json();
      setPackagesData(data);
    } catch (e) {
      console.error('Failed to load packages:', e);
    }
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time: string) => {
    if (!selectedDate) return;
    const dayData = calendarData[selectedDate];
    const slot = dayData?.slots?.find((s) => s.time === time);
    if (slot?.status === 'booked' || slot?.status === 'blocked') return;
    setSelectedTime(time);
  };

  const handleMonthChange = (month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
  };

  const handleFormChange = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    if (key === 'packageType') {
      setFormData(prev => ({ ...prev, [key]: value, deliveryType: '', packageTier: '' }));
    } else {
      setFormData(prev => ({ ...prev, [key]: value }));
    }
  };

  const getSelectedTierPrice = () => {
    if (!formData.packageType || !formData.packageTier) return 0;
    
    if (formData.deliveryType === 'digital') {
      const tiers = [
        { id: 'digital-6', price: 190 },
        { id: 'digital-12', price: 290 },
        { id: 'digital-18', price: 360 },
        { id: 'digital-35', price: 550 }
      ];
      const tier = tiers.find((t) => t.id === formData.packageTier);
      return tier?.price || 0;
    }
    
    const tiers = packagesData.packages[formData.packageType];
    if (!tiers) return 0;
    const tier = tiers.find((t) => t.id === formData.packageTier);
    return tier?.price || 0;
  };

  const handleSubmit = async () => {
    const price = getSelectedTierPrice() + getAdditionalServicesCost();
    const bookingData = {
      clientName: formData.name,
      clientEmail: formData.email,
      clientPhone: formData.phone,
      serviceType: formData.packageType,
      deliveryType: formData.deliveryType,
      serviceTier: formData.packageTier,
      sessionDate: selectedDate,
      sessionTime: selectedTime,
      clientAge: formData.clientAge || null,
      clientNotes: formData.clientNotes || null,
      family2: formData.family2,
      family4: formData.family4,
      hairMakeup: formData.hairMakeup,
      outdoor: formData.outdoor,
      outdoorLocation: formData.outdoor ? formData.outdoorLocation : null,
      additionalServicesCost: getAdditionalServicesCost(),
      totalAmount: price,
      depositPaid: DEPOSIT_AMOUNT,
      remainingPaid: price - DEPOSIT_AMOUNT,
      status: 'pending',
      termsAccepted: termsAccepted ? {
        accepted: true,
        acceptedAt: new Date().toISOString(),
        ipAddress: 'web'
      } : null
    };

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || 'Error al crear reserva');
      }
      
      if (!result.id) {
        throw new Error('No se recibió ID de reserva');
      }

      const checkoutRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          bookingId: result.id, 
          amount: DEPOSIT_AMOUNT
        })
      });
      const checkoutData = await checkoutRes.json();

      if (!checkoutRes.ok) {
        console.error('Stripe checkout failed:', checkoutData.error);
        alert('Reserva creada, pero el pago no está disponible ahora. Te contactaremos pronto.');
        router.push('/success?booking_id=' + result.id);
        return;
      }

      if (checkoutData.url) {
        window.location.href = checkoutData.url;
      } else {
        window.location.href = '/success?booking_id=' + result.id;
      }
    } catch (e) {
      console.error('Booking failed:', e);
      alert('Error al procesar la reserva. Intenta de nuevo.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <CanvasBackground />
      
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <header style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '28px', color: '#c9a962', marginBottom: '8px' }}>Angel Photography Miami</h1>
          <h2 style={{ fontSize: '22px', color: '#333', marginBottom: '4px' }}>Reserva tu Sesión</h2>
          <p style={{ color: '#666' }}>Elige fecha y hora para tu sesión de fotos</p>
        </header>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px', gap: '8px' }}>
          {[1, 2, 3].map(step => (
            <div key={step} style={{
              width: '12px', height: '12px', borderRadius: '50%',
              background: currentStep >= step ? '#c9a962' : '#333',
              transition: 'background 0.3s'
            }} />
          ))}
        </div>

        {currentStep === 1 && (
          <StepDateTime
            currentMonth={currentMonth}
            currentYear={currentYear}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            calendarData={calendarData}
            onDateSelect={handleDateSelect}
            onTimeSelect={handleTimeSelect}
            onMonthChange={handleMonthChange}
            onContinue={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 2 && (
          <StepPackageInfo
            formData={formData}
            packagesData={packagesData}
            showAgeField={showAgeField}
            showAdditionalServices={showAdditionalServices}
            getAdditionalServicesCost={getAdditionalServicesCost}
            onFormChange={handleFormChange}
            onBack={() => setCurrentStep(1)}
            onContinue={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 3 && (
          <StepConfirm
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            formData={formData}
            getSelectedTierPrice={getSelectedTierPrice}
            getAdditionalServicesCost={getAdditionalServicesCost}
            termsAccepted={termsAccepted}
            onTermsChange={setTermsAccepted}
            onBack={() => setCurrentStep(2)}
            onSubmit={handleSubmit}
          />
        )}
      </div>

      <WhatsAppFloat />
    </div>
  );
}