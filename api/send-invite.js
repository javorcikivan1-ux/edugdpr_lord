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
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #1a202c;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
            }
            
            .email-container {
              max-width: 500px;
              width: 100%;
              background: white;
              border-radius: 16px;
              box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1);
              overflow: hidden;
              animation: slideIn 0.5s ease-out;
            }
            
            @keyframes slideIn {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            .header {
              background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
              padding: 40px 30px;
              text-align: center;
              position: relative;
            }
            
            .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url('https://www.edugdpr.sk/pattern.png') repeat;
              opacity: 0.1;
              pointer-events: none;
            }
            
            .logo {
              margin-bottom: 20px;
            }
            
            .logo img {
              max-width: 200px;
              height: auto;
              filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
            }
            
            .title {
              color: white;
              font-size: 24px;
              font-weight: 700;
              margin-bottom: 8px;
              text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }
            
            .content {
              padding: 40px;
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
            }
            
            .company-info {
              background: #f8fafc;
              padding: 25px;
              border-radius: 12px;
              border-left: 4px solid #4F46E5;
              margin-bottom: 30px;
            }
            
            .company-name {
              color: #1a202c;
              font-weight: 700;
              font-size: 18px;
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
            
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
              color: white !important;
              padding: 18px 40px;
              text-decoration: none;
              border-radius: 12px;
              font-weight: 600;
              font-size: 16px;
              text-align: center;
              box-shadow: 0 4px 15px rgba(79, 70, 229, 0.2);
              transition: all 0.3s ease;
              border: none;
              cursor: pointer;
            }
            
            .cta-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(79, 70, 229, 0.3);
            }
            
            .footer {
              background: #f8fafc;
              padding: 30px 40px;
              text-align: center;
              border-top: 1px solid #e5e7eb;
            }
            
            .footer-text {
              color: #6b7280;
              font-size: 14px;
              margin-bottom: 15px;
            }
            
            .security-note {
              background: #fef3c7;
              padding: 20px;
              border-radius: 8px;
              border-left: 3px solid #f59e0b;
              font-size: 13px;
              color: #92400e;
            }
            
            .link {
              color: #4F46E5;
              text-decoration: none;
              font-weight: 600;
            }
            
            @media (max-width: 600px) {
              body {
                padding: 10px;
              }
              
              .email-container {
                border-radius: 12px;
              }
              
              .header {
                padding: 30px 20px;
              }
              
              .content {
                padding: 30px;
              }
              
              .cta-button {
                padding: 15px 30px;
                font-size: 15px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <div class="logo">
                <img src="https://www.edugdpr.sk/logo-white.png" alt="EduGDPR Logo">
              </div>
              <h1 class="title">Pozvánka do EduGDPR</h1>
            </div>
            
            <div class="content">
              <p class="greeting">Dobrý deň ${employeeName ? ', ' + employeeName : ''},</p>
              
              <p class="message">
                Spoločnosť <strong>${companyName}</strong> vás pozýva do systému EduGDPR na správu školenia a certifikácií. 
                Platforma poskytuje komplexné riešenia pre školenie zamestnancov v oblasti ochrany osobných údajov a správu dokumentov.
              </p>
              
              <div class="company-info">
                <div class="company-name">${companyName}</div>
                <div class="platform">Platforma: EduGDPR - Školenie a certifikácie</div>
              </div>
              
              <div class="cta-section">
                <p>Kliknutím na tlačidlo nižšie sa môžete zaregistrovať a pripojiť k tímu vašej spoločnosti:</p>
                <a href="${inviteUrl}" class="cta-button">Prijať pozvánku a registrovať sa</a>
              </div>
              
              <p style="text-align: center; color: #6b7280; font-size: 14px;">
                Ak tlačidlo nefunguje, skopírujte tento odkaz do vášho prehliadača:<br>
                <a href="${inviteUrl}" style="color: #4F46E5; word-break: break-all;">${inviteUrl}</a>
              </p>
            </div>
            
            <div class="footer">
              <div class="footer-text">
                EduGDPR | Platforma pre správu školenia a certifikácie
              </div>
              <div class="security-note">
                <strong>🔒 Bezpečnostná poznámka:</strong> Tento email bol odoslaný automaticky zabezpečeného systému. 
                Ak ste ho neočakávali, prosím kontaktujte našu podporu.
              </div>
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
