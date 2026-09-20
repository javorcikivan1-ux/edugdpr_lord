import { Resend } from "resend";

const contactAttempts = new Map();
const ipAttempts = new Map();
const duplicateMessages = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const MAX_IP_ATTEMPTS = 10;
const DUPLICATE_WINDOW_MS = 60 * 60 * 1000;
const MAX_BODY_BYTES = 12 * 1024;

const limits = {
  nazov: 120,
  ico: 20,
  email: 160,
  telefon: 40,
  oblast: 120,
  source: 40,
  message: 2500
};

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const trimToLimit = (value, limit) => String(value ?? '').trim().slice(0, limit);

const getClientKey = (req, email) => {
  const forwardedFor = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const ip = forwardedFor || req.socket?.remoteAddress || 'unknown';
  return `${ip}:${String(email || '').toLowerCase()}`;
};

const getClientIp = (req) => {
  const forwardedFor = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return forwardedFor || req.socket?.remoteAddress || 'unknown';
};

const isRateLimited = (key) => {
  const now = Date.now();
  const attempts = (contactAttempts.get(key) || []).filter((timestamp) => now - timestamp < WINDOW_MS);
  attempts.push(now);
  contactAttempts.set(key, attempts);
  return attempts.length > MAX_ATTEMPTS;
};

const exceedsLimit = (store, key, limit, windowMs) => {
  const now = Date.now();
  const attempts = (store.get(key) || []).filter((timestamp) => now - timestamp < windowMs);
  attempts.push(now);
  store.set(key, attempts);
  return attempts.length > limit;
};

const isAllowedOrigin = (req) => {
  const origin = String(req.headers.origin || '').trim();
  if (!origin) return false;

  try {
    const originUrl = new URL(origin);
    const requestHost = String(req.headers.host || '').split(':')[0].toLowerCase();
    const allowedHosts = new Set(['edugdpr.sk', 'www.edugdpr.sk', 'localhost', '127.0.0.1']);
    return originUrl.protocol === 'https:' && (allowedHosts.has(originUrl.hostname) || originUrl.hostname === requestHost)
      || originUrl.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(originUrl.hostname);
  } catch {
    return false;
  }
};

const messageFingerprint = (data) =>
  `${data.email.toLowerCase()}|${data.telefon.replace(/\s+/g, '')}|${data.message.toLowerCase().replace(/\s+/g, ' ')}`;

const json = (res, statusCode, payload) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.status(statusCode).json(payload);
};

const sendViaFormspree = async (data) => {
  const response = await fetch(process.env.FORMSPREE_CONTACT_URL || 'https://formspree.io/f/mrbkopok', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      nazov: data.nazov,
      ico: data.ico,
      email: data.email,
      telefon: data.telefon,
      oblast: data.oblast,
      source: data.source || 'kontakt',
      message: data.message
    })
  });

  if (!response.ok) {
    throw new Error(`Formspree fallback failed with ${response.status}`);
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed' });
  }

  const contentType = String(req.headers['content-type'] || '').toLowerCase();
  if (!contentType.startsWith('application/json')) {
    return json(res, 415, { error: 'Nepodporovaný formát požiadavky' });
  }

  const declaredLength = Number(req.headers['content-length'] || 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return json(res, 413, { error: 'Požiadavka je príliš veľká' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  } catch {
    return json(res, 400, { error: 'Neplatný formát požiadavky' });
  }

  if (body.website || body.companyWebsite || body.url) {
    return json(res, 200, { success: true });
  }

  const data = {
    nazov: trimToLimit(body.nazov, limits.nazov),
    ico: trimToLimit(body.ico, limits.ico),
    email: trimToLimit(body.email, limits.email),
    telefon: trimToLimit(body.telefon, limits.telefon),
    oblast: trimToLimit(body.oblast || body.zaujem || body.podnikatelska_cinnost, limits.oblast),
    source: trimToLimit(body.source, limits.source),
    message: trimToLimit(body.message, limits.message)
  };

  if (data.source === 'chatbox-bezplatna-konzultacia') {
    if (!isAllowedOrigin(req)) {
      return json(res, 403, { error: 'Požiadavka nepochádza z povolenej stránky' });
    }
    if (body.privacyAccepted !== true) {
      return json(res, 400, { error: 'Potvrďte, že ste sa oboznámili so Zásadami ochrany osobných údajov.' });
    }

    const formStartedAt = Number(body.formStartedAt);
    const fillDuration = Date.now() - formStartedAt;
    if (!Number.isFinite(formStartedAt) || fillDuration < 2500 || fillDuration > 2 * 60 * 60 * 1000) {
      return json(res, 400, { error: 'Formulár odošlite po jeho riadnom vyplnení.' });
    }
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const hasValidEmail = emailPattern.test(data.email);
  const hasContact = hasValidEmail || data.telefon;

  if (!hasContact) {
    return json(res, 400, { error: 'Neplatné alebo chýbajúce údaje formulára' });
  }

  if (!data.message || data.message.length < 5) {
    return json(res, 400, { error: 'Správa je príliš krátka' });
  }

  const clientIp = getClientIp(req);
  if (exceedsLimit(ipAttempts, clientIp, MAX_IP_ATTEMPTS, WINDOW_MS)) {
    return json(res, 429, { error: 'Príliš veľa odoslaní. Skúste to prosím neskôr.' });
  }

  const clientKey = getClientKey(req, data.email);
  if (isRateLimited(clientKey)) {
    return json(res, 429, { error: 'Príliš veľa odoslaní. Skúste to prosím neskôr.' });
  }

  const fingerprint = messageFingerprint(data);
  const lastDuplicate = duplicateMessages.get(fingerprint);
  if (lastDuplicate && Date.now() - lastDuplicate < DUPLICATE_WINDOW_MS) {
    return json(res, 429, { error: 'Táto správa už bola odoslaná.' });
  }
  duplicateMessages.set(fingerprint, Date.now());

  if (!process.env.RESEND_API_KEY) {
    try {
      await sendViaFormspree(data);
      return json(res, 200, { success: true });
    } catch (error) {
      console.error('Contact form fallback error:', error);
      return json(res, 500, { error: 'Nepodarilo sa odoslať formulár' });
    }
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const configuredRecipients = String(process.env.CONTACT_FORM_EMAIL || '')
      .split(',')
      .map((email) => email.trim())
      .filter(Boolean);
    const recipients = [...new Set([
      ...configuredRecipients,
      'javorcik.ivan1@gmail.com',
      'sluzby@lordsbenison.eu'
    ])];

    const emailPayload = {
      from: 'EduGDPR <noreply@edugdpr.sk>',
      to: recipients,
      subject: `Nový dopyt z edugdpr.sk - ${data.oblast || data.source || 'Kontakt'}`,
      html: `
        <!DOCTYPE html>
        <html lang="sk">
        <head>
          <meta charset="utf-8">
          <title>Nový dopyt z edugdpr.sk</title>
        </head>
        <body style="margin:0;padding:32px;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#0f172a;">
          <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;overflow:hidden;">
            <div style="padding:28px 32px;background:#002b4e;color:#ffffff;">
              <div style="font-size:13px;text-transform:uppercase;letter-spacing:.12em;color:#f7941d;font-weight:800;">EduGDPR</div>
              <h1 style="margin:10px 0 0;font-size:26px;line-height:1.25;">Nový nezáväzný dopyt</h1>
            </div>
            <div style="padding:32px;">
              <p><strong>Názov organizácie:</strong> ${escapeHtml(data.nazov)}</p>
              <p><strong>IČO:</strong> ${escapeHtml(data.ico)}</p>
              <p><strong>E-mail:</strong> ${escapeHtml(data.email)}</p>
              <p><strong>Telefón:</strong> ${escapeHtml(data.telefon)}</p>
              <p><strong>Zdroj formulára:</strong> ${escapeHtml(data.source || 'kontakt')}</p>
              <p><strong>Oblasť / záujem:</strong> ${escapeHtml(data.oblast || '-')}</p>
              <div style="margin-top:24px;padding:20px;background:#f8fafc;border-left:4px solid #f7941d;border-radius:10px;">
                <div style="font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#64748b;font-weight:800;margin-bottom:10px;">Správa</div>
                <div style="white-space:pre-wrap;line-height:1.6;">${escapeHtml(data.message || '-')}</div>
              </div>
              <p style="margin-top:24px;color:#64748b;font-size:13px;">Odoslané: ${new Date().toLocaleString('sk-SK', { timeZone: 'Europe/Bratislava' })}</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    if (hasValidEmail) {
      emailPayload.replyTo = data.email;
    }

    const result = await resend.emails.send(emailPayload);
    if (result?.error) {
      throw new Error(result.error.message || 'E-mailová služba odmietla správu');
    }

    return json(res, 200, { success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    try {
      await sendViaFormspree(data);
      return json(res, 200, { success: true });
    } catch (fallbackError) {
      console.error('Contact form fallback error:', fallbackError);
      return json(res, 500, { error: 'Nepodarilo sa odoslať formulár' });
    }
  }
}
