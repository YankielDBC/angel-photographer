const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env' });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

const serviceNames = {
  newborn: 'Newborn',
  kids: 'Ninos',
  pregnant: 'Maternidad',
  wedding: 'Boda',
  eventos: 'Eventos',
  exclusivo: 'Exclusivo'
};

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTime(timeStr) {
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
}

// Booking de prueba con todos los campos
const booking = {
  id: 'bk_test123',
  clientName: 'Yankiel',
  clientEmail: 'yankieldbc@gmail.com',
  clientPhone: '+1 786-318-4596',
  serviceType: 'kids',
  serviceTier: 'silver',
  sessionDate: '2026-03-15',
  sessionTime: '10:00',
  totalAmount: 250,
  depositPaid: 100,
  remainingPaid: 150,
  clientAge: '3 anos',
  clientNotes: 'El nino es muy timido, favor ser paciente',
  family2: true,
  family4: false,
  hairMakeup: true,
  additionalServicesCost: 140
};

const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reserva Confirmada</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:60px 20px;">
        
        <!-- Logo / Brand -->
        <table cellpadding="0" cellspacing="0" style="margin-bottom:50px;">
          <tr>
            <td style="text-align:center;">
              <p style="margin:0;color:#c9a962;font-size:11px;font-weight:600;letter-spacing:4px;text-transform:uppercase;">Miami</p>
              <p style="margin:8px 0 0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:2px;">ANGEL</p>
              <p style="margin:0;color:#666666;font-size:11px;letter-spacing:6px;text-transform:uppercase;">Photography</p>
            </td>
          </tr>
        </table>

        <!-- Main Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#141414;border-radius:24px;overflow:hidden;">
          <!-- Success Bar -->
          <tr>
            <td style="background:#c9a962;padding:30px;text-align:center;">
              <span style="display:inline-block;font-size:36px;color:#0a0a0a;">&#10003;</span>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding:40px 35px;">
              <h1 style="margin:0 0 8px;color:#ffffff;font-size:24px;font-weight:600;text-align:center;">Reserva Confirmada</h1>
              <p style="margin:0 0 30px;color:#888888;font-size:15px;text-align:center;">Felicidades, <span style="color:#ffffff;">${booking.clientName}</span></p>
              
              <!-- Details Grid -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:16px;margin-bottom:25px;">
                <tr>
                  <td style="padding:20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #252525;">
                          <p style="margin:0;color:#666666;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Fecha</p>
                          <p style="margin:4px 0 0;color:#ffffff;font-size:15px;font-weight:500;">${formatDate(booking.sessionDate)}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #252525;">
                          <p style="margin:0;color:#666666;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Hora</p>
                          <p style="margin:4px 0 0;color:#ffffff;font-size:15px;font-weight:500;">${formatTime(booking.sessionTime)}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #252525;">
                          <p style="margin:0;color:#666666;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Tipo</p>
                          <p style="margin:4px 0 0;color:#ffffff;font-size:15px;font-weight:500;">${serviceNames[booking.serviceType] || booking.serviceType}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #252525;">
                          <p style="margin:0;color:#666666;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Paquete</p>
                          <p style="margin:4px 0 0;color:#c9a962;font-size:15px;font-weight:600;text-transform:capitalize;">${booking.serviceTier}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #252525;">
                          <p style="margin:0;color:#666666;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Telefono</p>
                          <p style="margin:4px 0 0;color:#ffffff;font-size:15px;font-weight:500;">${booking.clientPhone}</p>
                        </td>
                      </tr>
                      ${booking.clientAge ? `
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #252525;">
                          <p style="margin:0;color:#666666;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Edad del nino/a</p>
                          <p style="margin:4px 0 0;color:#ffffff;font-size:15px;font-weight:500;">${booking.clientAge}</p>
                        </td>
                      </tr>
                      ` : ''}
                      ${booking.clientNotes ? `
                      <tr>
                        <td style="padding:12px 0;">
                          <p style="margin:0;color:#666666;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Notas</p>
                          <p style="margin:4px 0 0;color:#aaaaaa;font-size:13px;">${booking.clientNotes}</p>
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Servicios Adicionales -->
              ${(booking.family2 || booking.family4 || booking.hairMakeup) ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:16px;margin-bottom:25px;overflow:hidden;">
                <tr>
                  <td style="padding:20px 25px;">
                    <p style="margin:0 0 15px;color:#c9a962;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Servicios Adicionales</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      ${booking.family2 ? `
                      <tr><td style="padding:8px 0;border-bottom:1px solid #252525;"><span style="color:#aaaaaa;font-size:13px;">+2 Familiares</span><span style="color:#ffffff;font-size:13px;float:right;">$50</span></td></tr>
                      ` : ''}
                      ${booking.family4 ? `
                      <tr><td style="padding:8px 0;border-bottom:1px solid #252525;"><span style="color:#aaaaaa;font-size:13px;">+4 Familiares</span><span style="color:#ffffff;font-size:13px;float:right;">$80</span></td></tr>
                      ` : ''}
                      ${booking.hairMakeup ? `
                      <tr><td style="padding:8px 0;"><span style="color:#aaaaaa;font-size:13px;">Peluqueria y Maquillaje</span><span style="color:#ffffff;font-size:13px;float:right;">$90</span></td></tr>
                      ` : ''}
                      ${booking.additionalServicesCost ? `
                      <tr><td style="padding-top:12px;border-top:1px solid #333333;"><span style="color:#c9a962;font-size:13px;font-weight:600;">Total Servicios</span><span style="color:#c9a962;font-size:13px;font-weight:600;float:right;">$${booking.additionalServicesCost}.00</span></td></tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>
              ` : ''}
              
              <!-- Payment Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:16px;margin-bottom:25px;overflow:hidden;">
                <tr>
                  <td style="padding:20px 25px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <p style="margin:0;color:#666666;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Total</p>
                          <p style="margin:4px 0 0;color:#ffffff;font-size:20px;font-weight:600;">$${booking.totalAmount}.00</p>
                        </td>
                        <td style="text-align:right;padding-left:20px;border-left:1px solid #252525;">
                          <p style="margin:0;color:#c9a962;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Deposito</p>
                          <p style="margin:4px 0 0;color:#c9a962;font-size:18px;font-weight:600;">-$100</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="background:#c9a962;padding:18px 25px;text-align:center;">
                    <p style="margin:0;color:#0a0a0a;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Resto a Pagar</p>
                    <p style="margin:4px 0 0;color:#0a0a0a;font-size:28px;font-weight:700;">$${booking.totalAmount - 100}.00</p>
                  </td>
                </tr>
              </table>
              
              <!-- Notice -->
              <p style="margin:0 0 30px;color:#555555;font-size:13px;text-align:center;line-height:1.5;">El deposito de $100 no es reembolsable.<br>El saldo restante se paga el dia de la sesion.</p>
              
              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:30px;">
                <tr>
                  <td align="center">
                    <a href="https://wa.me/17863184596" style="display:inline-block;padding:14px 32px;background:#c9a962;color:#0a0a0a;text-decoration:none;font-size:14px;font-weight:600;border-radius:50px;">Contactanos por WhatsApp</a>
                  </td>
                </tr>
              </table>
              
              <!-- Social -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #252525;padding-top:25px;">
                <tr>
                  <td align="center">
                    <p style="margin:0 0 12px;color:#555555;font-size:12px;">Siguenos @angelphotographymiami</p>
                    <a href="https://instagram.com/angelphotographymiami" style="display:inline-block;margin:0 8px;color:#888888;font-size:13px;text-decoration:none;">Instagram</a>
                    <span style="color:#444444;">|</span>
                    <a href="https://facebook.com/angelphotographymiami" style="display:inline-block;margin:0 8px;color:#888888;font-size:13px;text-decoration:none;">Facebook</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- Footer -->
        <table cellpadding="0" cellspacing="0" style="margin-top:40px;">
          <tr>
            <td align="center">
              <p style="margin:0;color:#555555;font-size:12px;">Angel Photography Miami</p>
              <p style="margin:8px 0 0;color:#444444;font-size:11px;">Miami, Florida | hello@angelphotographymiami.com</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const mailOptions = {
  from: '"Angel Photography Miami" <angelphotollc@gmail.com>',
  to: 'yankieldbc@gmail.com',
  subject: `Reserva Confirmada - ${formatDate(booking.sessionDate)}`,
  html,
};

transporter.sendMail(mailOptions, (err, info) => {
  if (err) {
    console.log('Error:', err);
  } else {
    console.log('Email enviado!');
  }
});
