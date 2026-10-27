import nodemailer, { type Transporter } from 'nodemailer';
import { StoredLead } from './leadStorage';
import { normalizeGuatemalaPhone } from '../validators/leadSchema';

/**
 * Obtiene la configuración SMTP desde variables de entorno con fallbacks para Hostinger
 */
export function getSmtpConfig() {
  const host = process.env.HOSTINGER_SMTP_HOST || 'smtp.hostinger.com';
  const port = parseInt(process.env.HOSTINGER_SMTP_PORT || '465', 10);
  const secure = process.env.HOSTINGER_SMTP_SECURE !== 'false'; // true por defecto para 465
  const user = process.env.HOSTINGER_SMTP_USER || '';
  const pass = process.env.HOSTINGER_SMTP_PASS || '';
  const fromName = process.env.SMTP_FROM_NAME || 'Ideas & Colores Cotizaciones';
  const toEmail = process.env.SMTP_NOTIFICATION_EMAIL || process.env.HOSTINGER_SMTP_USER || 'gerencia@ideasycoloresgt.com';

  const isConfigured = Boolean(user && pass);

  return {
    host,
    port,
    secure,
    user,
    pass,
    fromName,
    toEmail,
    isConfigured,
  };
}

/**
 * Crea el transporter reutilizable de Nodemailer
 */
let cachedTransporter: Transporter | null = null;

export function getTransporter(): Transporter | null {
  const config = getSmtpConfig();
  if (!config.isConfigured) {
    return null;
  }

  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      tls: {
        rejectUnauthorized: true,
      },
    });
  }

  return cachedTransporter;
}

/**
 * Verifica la conectividad SMTP con el servidor de Hostinger
 */
export async function verifySmtpConnection(): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) return false;
  try {
    await transporter.verify();
    return true;
  } catch (err) {
    console.error('[SMTP Verification Error]', err);
    return false;
  }
}

/**
 * Envía el correo de notificación HTML para una cotización nueva
 */
export async function sendLeadNotificationEmail(lead: StoredLead): Promise<{ sent: boolean; messageId?: string; reason?: string }> {
  const config = getSmtpConfig();
  const transporter = getTransporter();

  if (!transporter || !config.isConfigured) {
    console.warn(`[SMTP Warning] Credenciales SMTP no configuradas. Correo para [${lead.leadId}] no enviado.`);
    return { sent: false, reason: 'SMTP credentials not configured in environment' };
  }

  const phoneInfo = normalizeGuatemalaPhone(lead.data.telefono);
  const clientWhatsappDigits = phoneInfo.valid ? phoneInfo.digits : lead.data.telefono.replace(/[^0-9]/g, '');
  const replyWhatsappMessage = encodeURIComponent(
    `Hola ${lead.data.nombre}, te saluda la Gerencia Técnica de Ideas & Colores respecto a tu cotización [${lead.leadId}] para ${lead.data.servicio}. Con gusto coordinamos la visita técnica.`
  );
  const replyWhatsappLink = `https://wa.me/${clientWhatsappDigits}?text=${replyWhatsappMessage}`;

  const priorityColor = lead.priority === 'HIGH' ? '#DC2626' : '#2563EB';
  const priorityBg = lead.priority === 'HIGH' ? '#FEF2F2' : '#EFF6FF';
  const priorityBorder = lead.priority === 'HIGH' ? '#F87171' : '#93C5FD';
  const priorityLabel = lead.priority === 'HIGH' ? '🔥 ALTA PRIORIDAD (Comercial / Gran Escala)' : '✅ ESTÁNDAR';

  const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva Cotización [${lead.leadId}]</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0F172A;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F1F5F9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color: #0F172A; padding: 24px 32px; text-align: left;">
              <span style="display: inline-block; padding: 4px 10px; border-radius: 9999px; background-color: #1E293B; color: #38BDF8; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">
                IDEAS & COLORES MULTI-SERVICIOS
              </span>
              <h1 style="color: #FFFFFF; font-size: 20px; font-weight: 800; margin: 12px 0 4px 0; letter-spacing: -0.02em;">
                🎨 Nueva Cotización Registrada
              </h1>
              <p style="color: #94A3B8; font-size: 13px; margin: 0;">
                Código de Seguimiento: <strong style="color: #F8FAFC; font-family: monospace;">[${lead.leadId}]</strong>
              </p>
            </td>
          </tr>

          <!-- Priority Alert -->
          <tr>
            <td style="padding: 20px 32px 10px 32px;">
              <div style="background-color: ${priorityBg}; border: 1px solid ${priorityBorder}; border-radius: 10px; padding: 12px 16px; display: inline-block; width: 100%; box-sizing: border-box;">
                <span style="color: ${priorityColor}; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.03em;">
                  ${priorityLabel}
                </span>
                <span style="float: right; color: #64748B; font-size: 12px;">
                  ${lead.timestampGT}
                </span>
              </div>
            </td>
          </tr>

          <!-- Lead Details Table -->
          <tr>
            <td style="padding: 10px 32px 24px 32px;">
              <table width="100%" cellspacing="0" cellpadding="8" style="border-collapse: collapse; font-size: 14px;">
                <tr style="border-bottom: 1px solid #F1F5F9;">
                  <td style="color: #64748B; font-weight: 600; width: 38%;">Cliente:</td>
                  <td style="color: #0F172A; font-weight: 700;">${lead.data.nombre}</td>
                </tr>
                <tr style="border-bottom: 1px solid #F1F5F9;">
                  <td style="color: #64748B; font-weight: 600;">Teléfono / WhatsApp:</td>
                  <td style="color: #0F172A; font-weight: 700;">
                    <a href="tel:${lead.data.telefono}" style="color: #0284C7; text-decoration: none;">${phoneInfo.valid ? phoneInfo.normalized : lead.data.telefono}</a>
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #F1F5F9;">
                  <td style="color: #64748B; font-weight: 600;">Correo Electrónico:</td>
                  <td style="color: #0F172A;">
                    ${lead.data.email ? `<a href="mailto:${lead.data.email}" style="color: #0284C7; text-decoration: none;">${lead.data.email}</a>` : '<span style="color: #94A3B8;">No especificado</span>'}
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #F1F5F9;">
                  <td style="color: #64748B; font-weight: 600;">Servicio Solicitado:</td>
                  <td style="color: #0F172A; font-weight: 700;">${lead.data.servicio}</td>
                </tr>
                <tr style="border-bottom: 1px solid #F1F5F9;">
                  <td style="color: #64748B; font-weight: 600;">Ubicación del Proyecto:</td>
                  <td style="color: #0F172A; font-weight: 600;">${lead.data.ubicacion}</td>
                </tr>
                <tr style="border-bottom: 1px solid #F1F5F9;">
                  <td style="color: #64748B; font-weight: 600;">Área Estimada:</td>
                  <td style="color: #0F172A;">
                    ${lead.data.metrosCuadrados ? `<strong>${lead.data.metrosCuadrados} m²</strong>` : '<span style="color: #94A3B8;">Por determinar en visita</span>'}
                  </td>
                </tr>
                <tr>
                  <td style="color: #64748B; font-weight: 600; vertical-align: top;">Descripción / Mensaje:</td>
                  <td style="color: #334155; line-height: 1.5;">
                    ${lead.data.mensaje ? lead.data.mensaje : '<em style="color: #94A3B8;">Sin mensaje adicional</em>'}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Direct WhatsApp Response Button -->
          <tr>
            <td style="padding: 0 32px 28px 32px; text-align: center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="background-color: #10B981; border-radius: 12px;">
                    <a href="${replyWhatsappLink}" target="_blank" rel="noopener noreferrer" style="display: block; padding: 14px 24px; color: #FFFFFF; font-size: 14px; font-weight: 700; text-decoration: none; letter-spacing: 0.02em;">
                      📲 Responder al Cliente vía WhatsApp (1 Clic)
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #94A3B8; font-size: 11px; margin-top: 10px;">
                Incluye automáticamente el saludo oficial y el código de seguimiento [${lead.leadId}].
              </p>
            </td>
          </tr>

          <!-- Technical Footer -->
          <tr>
            <td style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 16px 32px; font-size: 11px; color: #64748B; text-align: center;">
              IP de Origen: ${lead.ip} • Hostinger Titan Mailbox Security • Sistema Ideas & Colores
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  try {
    const info = await transporter.sendMail({
      from: `"${config.fromName}" <${config.user}>`,
      to: config.toEmail,
      replyTo: lead.data.email || undefined,
      subject: `🎨 Nueva Cotización [${lead.leadId}] - ${lead.data.servicio} (${lead.data.ubicacion})`,
      html: htmlContent,
    });

    return { sent: true, messageId: info.messageId };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`[SMTP Send Error] Falló el envío de correo para [${lead.leadId}]:`, errorMsg);
    return { sent: false, reason: errorMsg };
  }
}
