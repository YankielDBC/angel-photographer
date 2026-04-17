'use client';

import { CalendarData } from '@/types';
import { MONTHS, WEEKDAYS, TIME_SLOTS, COLORS } from '@/lib/constants';
import { DayStatus } from '@/types';

interface StepDateTimeProps {
  currentMonth: number;
  currentYear: number;
  selectedDate: string | null;
  selectedTime: string | null;
  calendarData: CalendarData;
  onDateSelect: (date: string) => void;
  onTimeSelect: (time: string) => void;
  onMonthChange: (month: number, year: number) => void;
  onContinue: () => void;
}

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(month: number, year: number): number {
  return new Date(year, month, 1).getDay();
}

function getDayStatus(day: number, month: number, year: number, data: CalendarData): DayStatus {
  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const dateObj = new Date(year, month, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (dateObj < today) return 'past';
  
  const dayData = data[dateStr];
  if (dayData?.status === 'blocked') return 'blocked';
  if (dayData?.status === 'full') return 'full';
  if (dayData?.status === 'has_bookings') return 'has_bookings';
  return 'available';
}

function formatTime(time: string): string {
  const [h, m] = time.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
}

export function StepDateTime({
  currentMonth,
  currentYear,
  selectedDate,
  selectedTime,
  calendarData,
  onDateSelect,
  onTimeSelect,
  onMonthChange,
  onContinue
}: StepDateTimeProps) {
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      onMonthChange(11, currentYear - 1);
    } else {
      onMonthChange(currentMonth - 1, currentYear);
    }
  };
  
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      onMonthChange(0, currentYear + 1);
    } else {
      onMonthChange(currentMonth + 1, currentYear);
    }
  };

  const handleDateClick = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onDateSelect(dateStr);
  };

  const renderDayCell = (day: number) => {
    const status = getDayStatus(day, currentMonth, currentYear, calendarData);
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isSelected = selectedDate === dateStr;
    const isDisabled = status === 'past' || status === 'blocked';
    
    let bg = 'transparent';
    let borderColor = '#333';
    if (isSelected) { bg = COLORS.primary; borderColor = COLORS.primary; }
    else if (status === 'past') bg = COLORS.disabled;
    else if (status === 'blocked') bg = '#d0d0d0';
    else if (status === 'full') bg = COLORS.full;
    else if (status === 'has_bookings') bg = COLORS.hasBookings;
    else bg = COLORS.lightBg;
    
    return { bg, borderColor, isDisabled };
  };

  return (
    <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
      <h3 style={{ color: '#333', marginBottom: '20px' }}>Selecciona la Fecha</h3>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={handlePrevMonth} style={{ background: 'none', border: '1px solid #ddd', color: '#333', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>←</button>
        <span style={{ color: '#333', fontSize: '18px' }}>{MONTHS[currentMonth]} {currentYear}</span>
        <button onClick={handleNextMonth} style={{ background: 'none', border: '1px solid #ddd', color: '#333', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>→</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
        {WEEKDAYS.map(day => (
          <div key={day} style={{ textAlign: 'center', color: '#666', fontSize: '12px', padding: '8px 0' }}>{day}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {Array(firstDay).fill(null).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array(daysInMonth).fill(null).map((_, i) => {
          const day = i + 1;
          const { bg, borderColor, isDisabled } = renderDayCell(day);
          
          return (
            <button key={day} onClick={() => !isDisabled && handleDateClick(day)} disabled={isDisabled}
              style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: bg, border: `1px solid ${borderColor}`, borderRadius: '8px', color: isDisabled ? '#999' : '#333',
                cursor: isDisabled ? 'not-allowed' : 'pointer', fontSize: '14px' }}>
              {day}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div style={{ marginTop: '24px' }}>
          <h4 style={{ color: '#333', marginBottom: '12px' }}>Selecciona la Hora</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {TIME_SLOTS.map(time => {
              const dayData = calendarData[selectedDate];
              const slot = dayData?.slots?.find((s) => s.time === time);
              const isBooked = slot?.status === 'booked' || slot?.status === 'blocked';
              const isSelected = selectedTime === time;
              
              return (
                <button key={time} onClick={() => !isBooked && onTimeSelect(time)} disabled={isBooked}
                  style={{ padding: '14px 12px', minHeight: '48px', background: isSelected ? COLORS.primary : isBooked ? '#e0e0e0' : '#f5f5f5',
                    border: `1px solid ${isSelected ? COLORS.primary : '#ddd'}`, borderRadius: '8px', color: isBooked ? '#999' : '#333',
                    cursor: isBooked ? 'not-allowed' : 'pointer', fontSize: '14px', width: '100%' }}>
                  {formatTime(time)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button onClick={onContinue} disabled={!selectedDate || !selectedTime}
        style={{ width: '100%', marginTop: '24px', padding: '16px', background: selectedDate && selectedTime ? COLORS.primary : '#333',
          border: 'none', borderRadius: '12px', color: selectedDate && selectedTime ? '#000' : '#666',
          fontSize: '14px', fontWeight: '600', cursor: selectedDate && selectedTime ? 'pointer' : 'not-allowed', minHeight: '48px' }}>
        Continuar
      </button>
    </div>
  );
}