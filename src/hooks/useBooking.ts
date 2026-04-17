'use client';

import { useState, useCallback } from 'react';
import { FormData, CalendarData, PackagesData, DayStatus } from '@/types';
import { DIGITAL_PACKAGES, ADDITIONAL_SERVICES, SESSION_TYPES_ALLOW_DIGITAL, DEPOSIT_AMOUNT } from '@/lib/constants';

const initialFormData: FormData = {
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
};

export function useBooking() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [packagesData, setPackagesData] = useState<PackagesData>({ sessionTypes: [], packages: {} });
  const [calendarData, setCalendarData] = useState<CalendarData>({});
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const updateFormData = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setCurrentStep(1);
    setSelectedDate(null);
    setSelectedTime(null);
    setTermsAccepted(false);
  }, []);

  const showAgeField = SESSION_TYPES_ALLOW_DIGITAL.includes(formData.packageType as typeof SESSION_TYPES_ALLOW_DIGITAL[number]);
  const showAdditionalServices = SESSION_TYPES_ALLOW_DIGITAL.includes(formData.packageType as typeof SESSION_TYPES_ALLOW_DIGITAL[number]);

  const getAdditionalServicesCost = useCallback(() => {
    let cost = 0;
    if (formData.family2) cost += 50;
    if (formData.family4) cost += 80;
    if (formData.hairMakeup) cost += 90;
    if (formData.outdoor) {
      cost += formData.outdoorLocation === 'near' ? 100 : 200;
    }
    return cost;
  }, [formData.family2, formData.family4, formData.hairMakeup, formData.outdoor, formData.outdoorLocation]);

  const canShowDigital = formData.packageType && SESSION_TYPES_ALLOW_DIGITAL.includes(formData.packageType as typeof SESSION_TYPES_ALLOW_DIGITAL[number]);
  const canShowPrint = formData.packageType && (formData.deliveryType === 'print' || !SESSION_TYPES_ALLOW_DIGITAL.includes(formData.packageType as typeof SESSION_TYPES_ALLOW_DIGITAL[number]));

  const getSelectedTierPrice = useCallback(() => {
    if (!formData.packageType || !formData.packageTier) return 0;
    
    if (formData.deliveryType === 'digital') {
      const tier = DIGITAL_PACKAGES.find((t) => t.id === formData.packageTier);
      return tier?.price || 0;
    }
    
    const tiers = packagesData.packages[formData.packageType];
    if (!tiers) return 0;
    const tier = tiers.find((t) => t.id === formData.packageTier);
    return tier?.price || 0;
  }, [formData.packageType, formData.packageTier, formData.deliveryType, packagesData.packages]);

  const getTotalPrice = useCallback(() => {
    return getSelectedTierPrice() + getAdditionalServicesCost();
  }, [getSelectedTierPrice, getAdditionalServicesCost]);

  const getRemainingAmount = useCallback(() => {
    return Math.max(0, getTotalPrice() - DEPOSIT_AMOUNT);
  }, [getTotalPrice]);

  const getDayStatus = useCallback((day: number): DayStatus => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dateObj = new Date(currentYear, currentMonth, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateObj < today) return 'past';
    
    const dayData = calendarData[dateStr];
    if (dayData?.status === 'blocked') return 'blocked';
    if (dayData?.status === 'full') return 'full';
    if (dayData?.status === 'has_bookings') return 'has_bookings';
    return 'available';
  }, [currentMonth, currentYear, calendarData]);

  const canProceedToStep2 = selectedDate && selectedTime;
  const canProceedToStep3 = formData.packageType && formData.deliveryType && formData.packageTier && formData.name && formData.email && formData.phone;

  return {
    formData,
    setFormData,
    currentStep,
    setCurrentStep,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    termsAccepted,
    setTermsAccepted,
    packagesData,
    setPackagesData,
    calendarData,
    setCalendarData,
    currentMonth,
    setCurrentMonth,
    currentYear,
    setCurrentYear,
    updateFormData,
    resetForm,
    showAgeField,
    showAdditionalServices,
    getAdditionalServicesCost,
    canShowDigital,
    canShowPrint,
    getSelectedTierPrice,
    getTotalPrice,
    getRemainingAmount,
    getDayStatus,
    canProceedToStep2,
    canProceedToStep3
  };
}