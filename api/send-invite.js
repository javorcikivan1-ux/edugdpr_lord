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
      subject: `Pozvánka do systému Complyo od spoločnosti ${companyName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Pozvánka do Complyo</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #1a202c;
              background: #f8fafc;
              padding: 40px 20px;
            }
            
            .email-wrapper {
              max-width: 600px;
              margin: 0 auto;
            }
            
            .header {
              text-align: center;
              margin-bottom: 40px;
            }
            
            .logo {
              margin-bottom: 20px;
            }
            
            .logo img {
              max-width: 180px;
              height: auto;
            }
            
            .title {
              color: #f97316;
              font-size: 32px;
              font-weight: 700;
              margin-bottom: 10px;
            }
            
            .title span {
              color: #1a202c;
            }
            
            .subtitle {
              color: #6b7280;
              font-size: 18px;
              font-weight: 400;
            }
            
            .content {
              background: white;
              padding: 40px;
              border-radius: 16px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
              margin-bottom: 30px;
            }
            
            .greeting {
              font-size: 18px;
              color: #2d3748;
              margin-bottom: 20px;
              font-weight: 600;
            }
            
            .message {
              color: #4a5568;
              margin-bottom: 30px;
              line-height: 1.7;
              font-size: 16px;
            }
            
            .company-info {
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
              padding: 30px;
              border-radius: 12px;
              border-left: 4px solid #f97316;
              margin-bottom: 30px;
            }
            
            .company-name {
              color: #1a202c;
              font-weight: 700;
              font-size: 20px;
              margin-bottom: 8px;
            }
            
            .platform {
              color: #6b7280;
              font-size: 16px;
            }
            
            .cta-section {
              text-align: center;
              margin-bottom: 30px;
            }
            
            .cta-text {
              color: #4a5568;
              margin-bottom: 20px;
              font-size: 16px;
            }
            
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
              color: white !important;
              padding: 18px 40px;
              text-decoration: none;
              border-radius: 12px;
              font-weight: 600;
              font-size: 16px;
              text-align: center;
              box-shadow: 0 4px 15px rgba(249, 115, 22, 0.2);
              transition: all 0.3s ease;
              border: none;
              cursor: pointer;
            }
            
            .cta-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(249, 115, 22, 0.3);
            }
            
            .fallback-link {
              text-align: center;
              margin-bottom: 30px;
            }
            
            .fallback-text {
              color: #6b7280;
              font-size: 14px;
              margin-bottom: 10px;
            }
            
            .link {
              color: #f97316;
              text-decoration: none;
              font-weight: 600;
              word-break: break-all;
            }
            
            .footer {
              text-align: center;
              color: #6b7280;
              font-size: 14px;
              margin-bottom: 20px;
            }
            
            .security-note {
              background: #fef3c7;
              padding: 20px;
              border-radius: 8px;
              border-left: 3px solid #f59e0b;
              font-size: 13px;
              color: #92400e;
              text-align: center;
            }
            
            @media (max-width: 600px) {
              body {
                padding: 20px 15px;
              }
              
              .content {
                padding: 30px;
              }
              
              .title {
                font-size: 28px;
              }
              
              .cta-button {
                padding: 15px 30px;
                font-size: 15px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="header">
              <h1 class="title"><span style="color: #1a202c;">Pozvánka do</span> <span style="color: #f97316; font-style: italic;">Complyo</span></h1>
              <p class="subtitle">www.edugdpr.sk</p>
            </div>
            
            <div class="content">
              <p class="greeting">Dobrý deň,</p>
              
              <p class="message">
                Váš zamestnávateľ <strong>${companyName}</strong> vás pozýva do systému Complyo - platformy na správu povinností podnikateľov v oblasti ochrany osobných údajov (GDPR).
              </p>
              
              <div class="company-info">
                <div class="company-name">${companyName}</div>
                <div class="platform">Platforma Complyo - Školenia a oboznamovanie</div>
              </div>
              
              <div class="cta-section">
                <p class="cta-text">Kliknutím na tlačidlo nižšie sa môžete zaregistrovať:</p>
                <a href="${inviteUrl}" class="cta-button">Prijať pozvánku a registrovať sa</a>
              </div>
              
              <div class="fallback-link">
                <p class="fallback-text">Ak tlačidlo nefunguje, skopírujte tento odkaz do vášho prehliadača:</p>
                <a href="${inviteUrl}" class="link">${inviteUrl}</a>
              </div>
            </div>
            
            <div class="footer">
              <p>Complyo | www.edugdpr.sk</p>
            </div>
            
            <div class="security-note">
              <strong>🔒 Bezpečnostná poznámka:</strong> Tento e-mail vám bol zaslaný vaším zamestnávateľom za účelom registrácie do platformy Complyo. Ak ste ho neočakávali, prosím, kontaktujte našu podporu na 0948 225 713 alebo na sluzby@lordsbenison.eu
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
