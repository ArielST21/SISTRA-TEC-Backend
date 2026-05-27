const nodemailer = require('nodemailer');
const env = require('../../config/env');

let transporterCache = null;

function obtenerTransporter() {
  if (transporterCache) return transporterCache;

  if (!env.smtp.user || !env.smtp.password) {
    throw new Error('SMTP_USER y SMTP_PASSWORD son obligatorios para enviar correos');
  }

  transporterCache = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.password,
    },
  });

  return transporterCache;
}

function plantillaCodigoReset({ nombre, codigo, minutos }) {
  const asunto = `Tu código de recuperación SISTRA-TEC: ${codigo}`;
  const texto = `Hola ${nombre || ''},\n\n` +
    `Recibimos una solicitud para restablecer tu contraseña en SISTRA-TEC.\n\n` +
    `Tu código de verificación es: ${codigo}\n\n` +
    `Este código expira en ${minutos} minutos. Si no solicitaste este cambio, ignora este correo.\n\n` +
    `— Equipo SISTRA-TEC`;

  const digitos = String(codigo).split('').map((d) => `
    <span style="display:inline-block; width:44px; height:56px; line-height:56px;
                 margin:0 4px; font-size:28px; font-weight:700; color:#00D4FF;
                 background:#1A1D23; border:1px solid rgba(0,212,255,0.35);
                 border-radius:8px; text-align:center;
                 font-family:'Courier New', monospace;">${d}</span>
  `).join('');

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperación de contraseña</title>
</head>
<body style="margin:0; padding:0; background:#04080E; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#04080E; padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background:#1A1D23; border-radius:16px; overflow:hidden; border:1px solid rgba(0,212,255,0.15);">

          <tr>
            <td style="padding:32px 40px 8px 40px; text-align:center; background:linear-gradient(180deg,#04080E 0%,#1A1D23 100%); border-bottom:1px solid rgba(0,212,255,0.15);">
              <div style="display:inline-block; padding:8px 20px; background:rgba(0,212,255,0.08); border:1px solid rgba(0,212,255,0.3); border-radius:24px; margin-bottom:16px;">
                <span style="color:#00D4FF; font-size:12px; letter-spacing:2px; font-weight:600;">SISTRA-TEC</span>
              </div>
              <h1 style="margin:0 0 8px 0; color:#FFFFFF; font-size:24px; font-weight:600;">
                Recuperación de contraseña
              </h1>
              <p style="margin:0; color:#8B92A0; font-size:14px;">Sistema de Trazabilidad de Donaciones</p>
            </td>
          </tr>

          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 16px 0; color:#FFFFFF; font-size:16px;">
                Hola${nombre ? ` <strong style="color:#00D4FF;">${nombre}</strong>` : ''},
              </p>
              <p style="margin:0 0 24px 0; color:#B4B9C4; font-size:15px; line-height:1.6;">
                Recibimos una solicitud para restablecer tu contraseña.
                Usa el siguiente código en la aplicación para continuar:
              </p>

              <div style="text-align:center; margin:32px 0; padding:24px 16px; background:#04080E; border-radius:12px; border:1px solid rgba(0,212,255,0.2);">
                <p style="margin:0 0 16px 0; color:#8B92A0; font-size:11px; letter-spacing:2px; text-transform:uppercase;">
                  Código de verificación
                </p>
                <div>${digitos}</div>
              </div>

              <div style="background:rgba(0,212,255,0.06); border-left:3px solid #00D4FF; padding:16px 20px; border-radius:4px; margin:24px 0;">
                <p style="margin:0; color:#B4B9C4; font-size:14px; line-height:1.5;">
                  <strong style="color:#00D4FF;">Importante:</strong> este código expira en
                  <strong style="color:#FFFFFF;">${minutos} minutos</strong>.
                  Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 40px; background:#04080E; border-top:1px solid rgba(0,212,255,0.1); text-align:center;">
              <p style="margin:0 0 4px 0; color:#8B92A0; font-size:12px;">
                Este es un mensaje automático, no respondas a este correo.
              </p>
              <p style="margin:0; color:#5B6170; font-size:11px;">
                © SISTRA-TEC — Tecnológico de Costa Rica
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  return { asunto, texto, html };
}

async function enviarCodigoReset({ destinatario, nombre, codigo, minutos }) {
  const { asunto, texto, html } = plantillaCodigoReset({ nombre, codigo, minutos });
  const transporter = obtenerTransporter();
  await transporter.sendMail({
    from: env.smtp.from,
    to: destinatario,
    subject: asunto,
    text: texto,
    html,
  });
}

module.exports = { enviarCodigoReset };
