'use client';

import { FormData, PackagesData, Package } from '@/types';
import { DIGITAL_PACKAGES, SESSION_TYPES_ALLOW_DIGITAL, COLORS } from '@/lib/constants';

interface StepPackageInfoProps {
  formData: FormData;
  packagesData: PackagesData;
  showAgeField: boolean;
  showAdditionalServices: boolean;
  getAdditionalServicesCost: () => number;
  onFormChange: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function StepPackageInfo({
  formData,
  packagesData,
  showAgeField,
  showAdditionalServices,
  getAdditionalServicesCost,
  onFormChange,
  onBack,
  onContinue
}: StepPackageInfoProps) {
  const { packageType, deliveryType, packageTier, name, email, phone, clientAge, clientNotes, family2, family4, hairMakeup, outdoor, outdoorLocation } = formData;
  
  const canShowDigital = packageType && SESSION_TYPES_ALLOW_DIGITAL.includes(packageType as typeof SESSION_TYPES_ALLOW_DIGITAL[number]);
  const canShowPrint = packageType && (deliveryType === 'print' || !SESSION_TYPES_ALLOW_DIGITAL.includes(packageType as typeof SESSION_TYPES_ALLOW_DIGITAL[number]));
  
  const canContinue = packageType && deliveryType && packageTier && name && email && phone;

  return (
    <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
      <h3 style={{ color: '#333', marginBottom: '20px' }}>Tu Paquete</h3>
      
      <div style={{ marginBottom: '16px' }}>
        <label style={{ color: '#666', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Tipo de Sesión</label>
        <select value={packageType} onChange={(e) => onFormChange('packageType', e.target.value)}
          style={{ width: '100%', padding: '12px', background: '#fff', border: '1px solid #444', borderRadius: '8px', color: '#333', fontSize: '16px' }}>
          <option value="">Selecciona tipo de sesión...</option>
          {packagesData.sessionTypes.map((t) => (
            <option key={t.id} value={t.id}>{t.nameEs}</option>
          ))}
        </select>
      </div>

      {packageType && canShowDigital && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: '#666', fontSize: '14px', display: 'block', marginBottom: '8px' }}>¿Fotos Digitales o con Impresión?</label>
          <select value={deliveryType} onChange={(e) => onFormChange('deliveryType', e.target.value)}
            style={{ width: '100%', padding: '12px', background: '#fff', border: '1px solid #444', borderRadius: '8px', color: '#333', fontSize: '16px' }}>
            <option value="">Selecciona opción...</option>
            <option value="digital">Solo Digital</option>
            <option value="print">Con Impresión</option>
          </select>
        </div>
      )}

      {packageType && deliveryType === 'digital' && canShowDigital && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: '#666', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Selecciona el Paquete Digital</label>
          <select value={packageTier} onChange={(e) => onFormChange('packageTier', e.target.value)}
            style={{ width: '100%', padding: '14px', background: '#fff', border: '1px solid #444', borderRadius: '8px', color: '#333', fontSize: '18px', fontWeight: '600' }}>
            <option value="" style={{fontSize: '16px'}}>Selecciona un paquete...</option>
            {DIGITAL_PACKAGES.map((pkg) => (
              <option key={pkg.id} value={pkg.id} style={{fontSize: '18px', fontWeight: '600'}}>{pkg.name} — <span style={{color: COLORS.primary, fontSize: '20px'}}>${pkg.price}</span></option>
            ))}
          </select>
        </div>
      )}

      {packageType && (deliveryType === 'print' || !canShowDigital) && packagesData.packages[packageType] && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: '#666', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Selecciona el Paquete</label>
          <select value={packageTier} onChange={(e) => onFormChange('packageTier', e.target.value)}
            style={{ width: '100%', padding: '14px', background: '#fff', border: '1px solid #444', borderRadius: '8px', color: '#333', fontSize: '18px', fontWeight: '600' }}>
            <option value="" style={{fontSize: '16px'}}>Selecciona un paquete...</option>
            {packagesData.packages[packageType].map((tier) => (
              <option key={tier.id} value={tier.id} style={{fontSize: '18px', fontWeight: '600'}}>{tier.name} — <span style={{color: COLORS.primary, fontSize: '20px'}}>${tier.price}</span></option>
            ))}
          </select>
          {packagesData.packages[packageType]?.find((p) => p.id === packageTier)?.description && (
            <p style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
              Incluye: {packagesData.packages[packageType].find((p) => p.id === packageTier)?.description}
            </p>
          )}
        </div>
      )}

      <h3 style={{ color: '#333', marginTop: '24px', marginBottom: '20px' }}>Tus Datos</h3>
      
      <div style={{ marginBottom: '16px' }}>
        <label style={{ color: '#666', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Nombre Completo</label>
        <input type="text" value={name} onChange={(e) => onFormChange('name', e.target.value)}
          placeholder="Tu nombre" style={{ width: '100%', padding: '12px', background: '#fff', border: '1px solid #444', borderRadius: '8px', color: '#333', fontSize: '16px' }} />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ color: '#666', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Correo Electrónico</label>
        <input type="email" value={email} onChange={(e) => onFormChange('email', e.target.value)}
          placeholder="tu@email.com" style={{ width: '100%', padding: '12px', background: '#fff', border: '1px solid #444', borderRadius: '8px', color: '#333', fontSize: '16px' }} />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ color: '#666', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Teléfono</label>
        <input type="tel" value={phone} onChange={(e) => onFormChange('phone', e.target.value)}
          placeholder="(555) 123-4567" style={{ width: '100%', padding: '12px', background: '#fff', border: '1px solid #444', borderRadius: '8px', color: '#333', fontSize: '16px' }} />
      </div>

      {showAgeField && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: '#666', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Edad del nino/a</label>
          <input type="text" value={clientAge} onChange={(e) => onFormChange('clientAge', e.target.value)}
            placeholder="Ej: 6 meses" style={{ width: '100%', padding: '12px', background: '#fff', border: '1px solid #444', borderRadius: '8px', color: '#333', fontSize: '16px' }} />
        </div>
      )}

      {showAdditionalServices && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: COLORS.primary, fontSize: '14px', display: 'block', marginBottom: '12px' }}>Servicios Adicionales</label>
          
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" checked={family2} onChange={(e) => onFormChange('family2', e.target.checked)} style={{ accentColor: COLORS.primary }} />
              <span style={{ color: '#333', fontSize: '14px' }}>+2 Familiares</span>
              <span style={{ color: COLORS.primary, fontSize: '14px', marginLeft: 'auto' }}>+$50</span>
            </label>
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" checked={family4} onChange={(e) => onFormChange('family4', e.target.checked)} style={{ accentColor: COLORS.primary }} />
              <span style={{ color: '#333', fontSize: '14px' }}>+4 Familiares</span>
              <span style={{ color: COLORS.primary, fontSize: '14px', marginLeft: 'auto' }}>+$80</span>
            </label>
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" checked={hairMakeup} onChange={(e) => onFormChange('hairMakeup', e.target.checked)} style={{ accentColor: COLORS.primary }} />
              <span style={{ color: '#333', fontSize: '14px' }}>Peluqueria y Maquillaje</span>
              <span style={{ color: COLORS.primary, fontSize: '14px', marginLeft: 'auto' }}>+$90</span>
            </label>
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" checked={outdoor} onChange={(e) => onFormChange('outdoor', e.target.checked)} style={{ accentColor: COLORS.primary }} />
              <span style={{ color: '#333', fontSize: '14px' }}>Sesion Outdoor</span>
              <span style={{ color: COLORS.primary, fontSize: '14px', marginLeft: 'auto' }}>+${outdoorLocation === 'near' ? 100 : 200}</span>
            </label>
            {outdoor && (
              <div style={{ marginTop: '8px', marginLeft: '24px', display: 'flex', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input type="radio" name="outdoorLocation" checked={outdoorLocation === 'near'} onChange={() => onFormChange('outdoorLocation', 'near')} style={{ accentColor: COLORS.primary }} />
                  <span style={{ color: '#aaa', fontSize: '13px' }}>Cerca (Miami Beach/Coral Gables) - $100</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input type="radio" name="outdoorLocation" checked={outdoorLocation === 'far'} onChange={() => onFormChange('outdoorLocation', 'far')} style={{ accentColor: COLORS.primary }} />
                  <span style={{ color: '#aaa', fontSize: '13px' }}>Lejos - $200</span>
                </label>
              </div>
            )}
          </div>
          
          {getAdditionalServicesCost() > 0 && (
            <div style={{ paddingTop: '10px', borderTop: '1px solid #333', marginTop: '8px' }}>
              <span style={{ color: '#666', fontSize: '13px' }}>Total servicios: </span>
              <span style={{ color: COLORS.primary, fontWeight: '600' }}>${getAdditionalServicesCost()}</span>
            </div>
          )}
        </div>
      )}

      <div style={{ marginBottom: '16px' }}>
        <label style={{ color: '#666', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Notas adicionales (opcional)</label>
        <textarea value={clientNotes} onChange={(e) => onFormChange('clientNotes', e.target.value)}
          placeholder="Solicitud especial..." rows={2}
          style={{ width: '100%', padding: '12px', background: '#fff', border: '1px solid #444', borderRadius: '8px', color: '#333', fontSize: '14px', resize: 'vertical' }} />
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={onBack} style={{ flex: 1, padding: '14px', background: 'transparent', border: '1px solid #444', borderRadius: '12px', color: '#333', cursor: 'pointer', fontSize: '14px', minHeight: '48px' }}>← Volver</button>
        <button onClick={onContinue} disabled={!canContinue}
          style={{ flex: 2, padding: '14px', background: canContinue ? COLORS.primary : '#333',
            border: 'none', borderRadius: '12px', color: canContinue ? '#000' : '#666', fontSize: '14px', cursor: canContinue ? 'pointer' : 'not-allowed', minHeight: '48px' }}>
          Continuar
        </button>
      </div>
    </div>
  );
}