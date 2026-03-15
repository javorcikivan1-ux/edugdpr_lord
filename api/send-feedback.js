import { Resend } from "resend";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://godsuoxtwxnellluiowa.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { type, subject, message } = req.body;

  if (!type || !subject || !message) {
    return res.status(400).json({ error: "Chýbajúce povinné údaje" });
  }

  try {
    // Získanie auth tokenu z hlavičky
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "Chýbajúci autorizačný token" });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: "Neplatný autorizačný token" });
    }

    // Získanie detailov o používateľovi a firme
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('email, company_name, company_token')
      .eq('id', user.id)
      .single();

    if (employeeError || !employee) {
      return res.status(400).json({ error: "Nepodarilo sa získať údaje o používateľovi" });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Určenie typu podnetu pre email
    const typeText = type === 'bug' ? 'Nahlásenie chyby' : 'Návrh na vylepšenie';
    const typeColor = type === 'bug' ? '#dc2626' : '#16a34a';

    // Odoslanie emailu na sluzby@lordsbenison.eu
    const data = await resend.emails.send({
      from: "EduGDPR <noreply@edugdpr.sk>",
      to: "sluzby@lordsbenison.eu",
      subject: `${typeText}: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${typeText} - EduGDPR</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .logo {
              text-align: center;
              margin-bottom: 20px;
            }
            .logo img {
              max-width: 280px;
              height: auto;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding: 20px;
              background: linear-gradient(135deg, ${typeColor}15, ${typeColor}05);
              border-radius: 8px;
              border-left: 4px solid ${typeColor};
            }
            .header h1 {
              color: ${typeColor};
              font-size: 24px;
              margin-bottom: 8px;
              font-weight: 600;
            }
            .type-badge {
              display: inline-block;
              background: ${typeColor};
              color: white;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .user-info {
              background: #f8fafc;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #3b82f6;
            }
            .user-info h3 {
              margin: 0 0 15px 0;
              color: #1e3a8a;
              font-size: 16px;
            }
            .user-info p {
              margin: 5px 0;
              font-size: 14px;
            }
            .content {
              margin: 30px 0;
            }
            .content h3 {
              color: #1e3a8a;
              margin-bottom: 15px;
              font-size: 18px;
            }
            .message-box {
              background: #f8fafc;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #6b7280;
              margin: 20px 0;
            }
            .message-box p {
              margin: 0;
              white-space: pre-wrap;
              font-size: 15px;
              line-height: 1.6;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              color: #666;
              font-size: 14px;
            }
            .timestamp {
              color: #6b7280;
              font-size: 12px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <img src="https://www.edugdpr.sk/modree.png" alt="EduGDPR Logo">
            </div>
            
            <div class="header">
              <div class="type-badge">${typeText}</div>
              <h1>${subject}</h1>
            </div>
            
            <div class="user-info">
              <h3>📧 Informácie o odosielateľovi</h3>
              <p><strong>Email:</strong> ${employee.email}</p>
              <p><strong>Firma:</strong> ${employee.company_name || 'Neuvedená'}</p>
              <p><strong>Company Token:</strong> ${employee.company_token || 'Neuvedený'}</p>
              <p><strong>ID používateľa:</strong> ${user.id}</p>
            </div>
            
            <div class="content">
              <h3>📝 Správa od používateľa</h3>
              <div class="message-box">
                <p>${message}</p>
              </div>
            </div>
            
            <div class="timestamp">
              ⏰ Odoslané: ${new Date().toLocaleString('sk-SK', { 
                timeZone: 'Europe/Bratislava',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            
            <div class="footer">
              <p>EduGDPR | Platforma pre správu školení a certifikácií</p>
              <p style="font-size: 12px;">Tento email bol odoslaný automaticky z feedback formulára.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return res.status(200).json({ 
      success: true, 
      message: "Feedback odoslaný",
      data
    });

  } catch (error) {
    console.error('Send feedback error:', error);
    return res.status(500).json({
      error: error.message,
    });
  }
}
