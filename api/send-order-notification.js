import { Resend } from "resend";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://godsuoxtwxnellluiowa.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const formatCurrency = (value) =>
  new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR' }).format(Number(value || 0));

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "Chýbajúci autorizačný token" });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: "Neplatný autorizačný token" });
    }

    const { order } = req.body;
    if (!order) {
      return res.status(400).json({ error: "Chýbajúce údaje objednávky" });
    }

    const quantity = Number(order.quantity || 0);
    const standardQuantity = Number(order.standard_quantity || 0);
    const premiumQuantity = Number(order.premium_quantity || 0);
    const expertQuantity = Number(order.expert_quantity || 0);
    const estimatedPrice = Number(order.estimated_price || 0);

    if (quantity <= 0 || estimatedPrice < 0) {
      return res.status(400).json({ error: "Neplatné údaje objednávky" });
    }

    const { data: employee } = await supabase
      .from('employees')
      .select('email, full_name, company_name, company_token')
      .eq('id', user.id)
      .maybeSingle();

    const companyName = order.invoice_company_name || employee?.company_name || user.user_metadata?.company_name || user.email;
    const replyTo = order.invoice_email || employee?.email || user.email;
    const recipient = process.env.ORDER_NOTIFICATION_EMAIL || 'javorcik.ivan1@gmail.com';

    const resend = new Resend(process.env.RESEND_API_KEY);
    const sent = await resend.emails.send({
      from: "EduGDPR <noreply@edugdpr.sk>",
      to: recipient,
      replyTo,
      subject: `Nová objednávka licencií - ${companyName} - ${formatCurrency(estimatedPrice)}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nová objednávka licencií</title>
        </head>
        <body style="margin:0;padding:32px;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#0f172a;">
          <div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;">
            <div style="padding:28px 32px;background:#0f172a;color:#ffffff;">
              <div style="font-size:13px;text-transform:uppercase;letter-spacing:.12em;color:#f97316;font-weight:800;">EduGDPR</div>
              <h1 style="margin:10px 0 0;font-size:26px;line-height:1.25;">Nová objednávka licencií</h1>
            </div>

            <div style="padding:32px;">
              <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#334155;">
                Firma <strong>${escapeHtml(companyName)}</strong> vytvorila novú objednávku licencií.
              </p>

              <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:14px;padding:22px;margin-bottom:24px;">
                <div style="font-size:12px;text-transform:uppercase;letter-spacing:.1em;color:#9a3412;font-weight:800;margin-bottom:8px;">Suma objednávky</div>
                <div style="font-size:32px;font-weight:900;color:#ea580c;">${formatCurrency(estimatedPrice)}</div>
              </div>

              <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
                <tr>
                  <td style="padding:10px 0;color:#64748b;">Licencie spolu</td>
                  <td style="padding:10px 0;text-align:right;font-weight:800;">${quantity}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;color:#64748b;">Standard</td>
                  <td style="padding:10px 0;text-align:right;font-weight:800;">${standardQuantity}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;color:#64748b;">Premium</td>
                  <td style="padding:10px 0;text-align:right;font-weight:800;">${premiumQuantity}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;color:#64748b;">Expert</td>
                  <td style="padding:10px 0;text-align:right;font-weight:800;">${expertQuantity}</td>
                </tr>
              </table>

              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:22px;margin-bottom:24px;">
                <div style="font-size:14px;font-weight:900;margin-bottom:14px;">Fakturačné údaje</div>
                <p style="margin:6px 0;"><strong>Firma:</strong> ${escapeHtml(order.invoice_company_name || companyName)}</p>
                <p style="margin:6px 0;"><strong>IČO:</strong> ${escapeHtml(order.invoice_ico)}</p>
                <p style="margin:6px 0;"><strong>DIČ:</strong> ${escapeHtml(order.invoice_dic || '-')}</p>
                <p style="margin:6px 0;"><strong>IČ DPH:</strong> ${escapeHtml(order.invoice_icdph || '-')}</p>
                <p style="margin:6px 0;"><strong>Adresa:</strong> ${escapeHtml(order.invoice_address)}</p>
                <p style="margin:6px 0;"><strong>E-mail:</strong> ${escapeHtml(order.invoice_email || replyTo)}</p>
              </div>

              <div style="background:#f1f5f9;border-radius:14px;padding:18px;color:#475569;font-size:14px;line-height:1.6;">
                <p style="margin:0;"><strong>Používateľ:</strong> ${escapeHtml(employee?.full_name || user.email)}</p>
                <p style="margin:4px 0 0;"><strong>Login e-mail:</strong> ${escapeHtml(user.email)}</p>
                <p style="margin:4px 0 0;"><strong>Company token:</strong> ${escapeHtml(employee?.company_token || user.user_metadata?.company_token || '-')}</p>
                <p style="margin:4px 0 0;"><strong>Čas:</strong> ${new Date().toLocaleString('sk-SK', { timeZone: 'Europe/Bratislava' })}</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return res.status(200).json({ success: true, data: sent });
  } catch (error) {
    console.error('Send order notification error:', error);
    return res.status(500).json({ error: error.message || "Nepodarilo sa odoslať notifikáciu" });
  }
}
