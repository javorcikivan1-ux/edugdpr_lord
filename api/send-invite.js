import { Resend } from "resend";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://godsuoxtwxnellluiowa.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, companyName, companyToken, employeeName } = req.body;

  if (!email || !companyName || !companyToken) {
    return res.status(400).json({ error: "Chýbajúce povinné údaje" });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    // Najprv uložíme pozvánku do databázy
    const { data: invitation, error: inviteError } = await supabase
      .from('invitations')
      .upsert({
        email: email.toLowerCase().trim(),
        employee_name: employeeName || null,
        company_token: companyToken,
        company_name: companyName,
        status: 'PENDING',
        invited_by: null, // TODO: Získať z auth tokenu
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 dní
      }, {
        onConflict: 'email,company_token',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (inviteError) {
      console.error('Error saving invitation:', inviteError);
      return res.status(500).json({ error: 'Failed to save invitation: ' + inviteError.message });
    }

    const inviteUrl = `https://www.edugdpr.sk/?action=join&companyToken=${companyToken}`;
    
    const data = await resend.emails.send({
      from: "EduGDPR <noreply@edugdpr.sk>",
      to: email,
      subject: `Pozvánka do systému EduGDPR od spoločnosti ${companyName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Pozvánka do EduGDPR</title>
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
              margin-bottom: 15px;
            }
            .logo img {
              max-width: 280px;
              height: auto;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .header h1 {
              color: #1e3a8a;
              font-size: 28px;
              margin-bottom: 10px;
              font-weight: 600;
            }
            .content {
              margin-bottom: 30px;
            }
            .content p {
              margin-bottom: 20px;
              font-size: 16px;
            }
            .cta-button {
              display: inline-block;
              background: #1e3a8a;
              color: white !important;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              text-align: center;
              margin: 20px 0;
            }
            .cta-button:hover {
              background: #172554;
              color: white !important;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              color: #666;
              font-size: 14px;
            }
            .company-info {
              background: #f8fafc;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #2563eb;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <img src="https://www.edugdpr.sk/modree.png" alt="EduGDPR Logo" style="margin-bottom: 10px;">
            </div>
            
            <div class="header">
              <h1>Pozvánka do systému EduGDPR</h1>
            </div>
            
            <div class="content">
              <p>Dobrý deň${employeeName ? ', ' + employeeName : ''},</p>
              
              <p>Spoločnosť <strong>${companyName}</strong> vás pozýva do systému EduGDPR na správu školení a certifikácií.</p>
              
              <div class="company-info">
                <p><strong>Od spoločnosti:</strong> ${companyName}</p>
                <p><strong>Platforma:</strong> EduGDPR - Školenia a certifikácie</p>
              </div>
              
              <p>Kliknutím na tlačidlo nižšie sa môžete zaregistrovať a pripojiť k tímu vašej spoločnosti:</p>
              
              <div style="text-align: center;">
                <a href="${inviteUrl}" class="cta-button">Prijať pozvánku a registrovať sa</a>
              </div>
              
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                Ak tlačidlo nefunguje, skopírujte tento odkaz do vášho prehliadača:<br>
                <a href="${inviteUrl}" style="color: #2563eb; word-break: break-all;">${inviteUrl}</a>
              </p>
              
              <p style="font-size: 14px; color: #666;">
                Táto pozvánka je platná 30 dní. Ak ste nepožiadali o registráciu, tento email môžete ignorovať.
              </p>
            </div>
            
            <div class="footer">
              <p>EduGDPR | Platforma pre správu školení a certifikácií</p>
              <p style="font-size: 12px;">Tento email bol odoslaný automaticky. Prosím neodpovedajte naň.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return res.status(200).json({ 
      success: true, 
      message: "Pozvánka odoslaná",
      data,
      invitation // Vrátime aj uloženú pozvánku
    });

  } catch (error) {
    console.error('Send invite error:', error);
    return res.status(500).json({
      error: error.message,
    });
  }
}
