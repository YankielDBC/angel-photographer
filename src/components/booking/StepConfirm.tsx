'use client';

import { FormData } from '@/types';
import { COLORS, DEPOSIT_AMOUNT } from '@/lib/constants';

interface StepConfirmProps {
  selectedDate: string | null;
  selectedTime: string | null;
  formData: FormData;
  getSelectedTierPrice: () => number;
  getAdditionalServicesCost: () => number;
  termsAccepted: boolean;
  onTermsChange: (accepted: boolean) => void;
  onBack: () => void;
  onSubmit: () => void;
}

function formatTime(time: string): string {
  const [h, m] = time.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
}

export function StepConfirm({
  selectedDate,
  selectedTime,
  formData,
  getSelectedTierPrice,
  getAdditionalServicesCost,
  termsAccepted,
  onTermsChange,
  onBack,
  onSubmit
}: StepConfirmProps) {
  const { packageTier, clientAge, clientNotes, family2, family4, hairMakeup, outdoor, outdoorLocation } = formData;
  
  const totalPrice = getSelectedTierPrice();
  const additionalCost = getAdditionalServicesCost();
  const remainingAmount = totalPrice + additionalCost - DEPOSIT_AMOUNT;
  const canSubmit = termsAccepted;

  return (
    <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
      <h3 style={{ color: '#333', marginBottom: '20px' }}>Resumen de Reserva</h3>
      
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ color: '#666' }}>Fecha</span>
          <span style={{ color: '#333' }}>{selectedDate}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ color: '#666' }}>Hora</span>
          <span style={{ color: '#333' }}>{selectedTime ? formatTime(selectedTime) : '-'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ color: '#666' }}>Paquete</span>
          <span style={{ color: '#333' }}>{packageTier}</span>
        </div>
        
        {clientAge && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#666' }}>Edad del nino/a</span>
            <span style={{ color: '#333' }}>{clientAge}</span>
          </div>
        )}

        {(family2 || family4 || hairMakeup || outdoor) && (
          <div style={{ marginTop: '12px', padding: '12px', background: '#f5f5f5', borderRadius: '8px' }}>
            <div style={{ color: COLORS.primary, fontSize: '13px', marginBottom: '8px' }}>Servicios adicionales:</div>
            {family2 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#aaa', fontSize: '13px' }}>+2 Familiares</span>
                <span style={{ color: '#333', fontSize: '13px' }}>$50</span>
              </div>
            )}
            {family4 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#aaa', fontSize: '13px' }}>+4 Familiares</span>
                <span style={{ color: '#333', fontSize: '13px' }}>$80</span>
              </div>
            )}
            {hairMakeup && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#aaa', fontSize: '13px' }}>Peluqueria y Maquillaje</span>
                <span style={{ color: '#333', fontSize: '13px' }}>$90</span>
              </div>
            )}
            {outdoor && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#aaa', fontSize: '13px' }}>Outdoor ({outdoorLocation === 'near' ? 'Cerca' : 'Lejos'})</span>
                <span style={{ color: '#333', fontSize: '13px' }}>${outdoorLocation === 'near' ? 100 : 200}</span>
              </div>
            )}
          </div>
        )}

        {clientNotes && (
          <div style={{ marginTop: '12px', padding: '12px', background: '#f5f5f5', borderRadius: '8px' }}>
            <div style={{ color: COLORS.primary, fontSize: '13px', marginBottom: '4px' }}>Notas:</div>
            <div style={{ color: '#aaa', fontSize: '13px' }}>{clientNotes}</div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #444' }}>
          <span style={{ color: '#666' }}>Total Paquete</span>
          <span style={{ color: '#333' }}>${totalPrice}</span>
        </div>
        {additionalCost > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
            <span style={{ color: '#666' }}>Servicios adicionales</span>
            <span style={{ color: COLORS.primary }}>+${additionalCost}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
          <span style={{ color: '#666' }}>Deposito (se descuenta)</span>
          <span style={{ color: COLORS.primary }}>-$100</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '16px', borderTop: `1px solid ${COLORS.primary}`, fontWeight: '700' }}>
          <span style={{ color: '#333', fontSize: '20px' }}>Restante a pagar</span>
          <span style={{ color: COLORS.primary, fontSize: '28px', fontWeight: '800' }}>${remainingAmount}</span>
        </div>
      </div>

      <div style={{ marginBottom: '20px', padding: '20px', background: 'linear-gradient(135deg, #c9a962 0%, #a88b4a 100%)', borderRadius: '12px', textAlign: 'center' }}>
        <p style={{ margin: 0, color: '#333', fontSize: '22px', fontWeight: '800' }}>Ahora solo pagaras <span style={{fontSize: '28px'}}>$100</span></p>
        <p style={{ margin: '10px 0 0', color: '#333', fontSize: '15px' }}>El resto se paga el dia de la sesion</p>
      </div>

      <div style={{ marginBottom: '20px', padding: '16px', background: '#f5f5f5', borderRadius: '12px' }}>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
          <input type="checkbox" checked={termsAccepted} onChange={(e) => onTermsChange(e.target.checked)}
            style={{ width: '20px', height: '20px', marginTop: '2px', accentColor: COLORS.primary }} />
          <span style={{ color: '#aaa', fontSize: '13px', lineHeight: '1.5' }}>
            Acepto los <a href="/terminos.html" target="_blank" style={{ color: COLORS.primary }}>Términos y Condiciones</a> y la <a href="/privacidad.html" target="_blank" style={{ color: COLORS.primary }}>Política de Privacidad</a>. Confirmo que la información proporcionada es correcta.
          </span>
        </label>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={onBack} style={{ flex: 1, padding: '14px', background: 'transparent', border: '1px solid #444', borderRadius: '12px', color: '#333', cursor: 'pointer', fontSize: '14px', minHeight: '48px' }}>← Volver</button>
        <button onClick={onSubmit} disabled={!canSubmit}
          style={{ flex: 2, padding: '14px', background: canSubmit ? COLORS.primary : '#333', border: 'none', borderRadius: '12px', color: canSubmit ? '#000' : '#666', fontSize: '14px', fontWeight: '600', cursor: canSubmit ? 'pointer' : 'not-allowed', minHeight: '48px' }}>
          Confirmar y pagar
        </button>
      </div>
    </div>
  );
}