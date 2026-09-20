import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Loader2, Phone, Send, X } from 'lucide-react';

type FormState = {
  email: string;
  telefon: string;
  message: string;
  website: string;
  privacyAccepted: boolean;
};

const EMPTY_FORM: FormState = { email: '', telefon: '', message: '', website: '', privacyAccepted: false };

const ConsultationChatbox: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCookieBannerVisible, setIsCookieBannerVisible] = useState(true);
  const [isRevealDelayElapsed, setIsRevealDelayElapsed] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);
  const formStartedAtRef = useRef(Date.now());

  useEffect(() => {
    const revealTimer = window.setTimeout(() => setIsRevealDelayElapsed(true), 4000);
    return () => window.clearTimeout(revealTimer);
  }, []);

  useEffect(() => {
    const syncInitialState = () => {
      setIsCookieBannerVisible(localStorage.getItem('cookie-consent') !== 'true');
    };
    const handleCookieBannerVisibility = (event: Event) => {
      const visible = Boolean((event as CustomEvent<{ visible: boolean }>).detail?.visible);
      setIsCookieBannerVisible(visible);
      if (visible) setIsOpen(false);
    };
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'cookie-consent') syncInitialState();
    };

    syncInitialState();
    window.addEventListener('cookie-banner-visibility', handleCookieBannerVisibility);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('cookie-banner-visibility', handleCookieBannerVisibility);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    formStartedAtRef.current = Date.now();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    window.setTimeout(() => panelRef.current?.querySelector<HTMLElement>('input')?.focus(), 50);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (status === 'error') {
      setStatus('idle');
      setError('');
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus('sending');
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          telefon: form.telefon,
          message: form.message,
          website: form.website,
          privacyAccepted: form.privacyAccepted,
          formStartedAt: formStartedAtRef.current,
          source: 'chatbox-bezplatna-konzultacia',
          oblast: 'Bezplatná konzultácia'
        })
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Správu sa nepodarilo odoslať.');

      setStatus('success');
      setForm(EMPTY_FORM);
    } catch (submitError) {
      setStatus('error');
      setError(submitError instanceof Error ? submitError.message : 'Správu sa nepodarilo odoslať.');
    }
  };

  if (isCookieBannerVisible || !isRevealDelayElapsed) return null;

  return (
    <div className="consultation-chatbox-reveal fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[10000] flex flex-col items-end font-sans">
      {isOpen && (
        <div
          id="consultation-chatbox"
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-labelledby="consultation-chat-title"
          className="mb-3 w-[calc(100vw-2rem)] max-w-[342px] overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_22px_60px_rgba(0,35,64,0.24)]"
        >
          <div className="relative bg-[#002b4e] px-4 py-3.5 text-white">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Zavrieť konzultáciu"
              className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full text-white/75 transition hover:bg-white/10 hover:text-white"
            >
              <X size={17} />
            </button>
            <div className="flex items-center gap-3 pr-10">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#f7941d] shadow-lg shadow-orange-950/20">
                <Phone size={19} strokeWidth={2.2} />
              </span>
              <div>
                <h2 id="consultation-chat-title" className="text-base font-extrabold leading-tight">Bezplatná konzultácia</h2>
                <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-white/75">
                  <span className="h-2 w-2 rounded-full bg-slate-400 ring-2 ring-white/15" />
                  Aktuálne sme offline
                </div>
              </div>
            </div>
          </div>

          {status === 'success' ? (
            <div className="px-6 py-9 text-center">
              <CheckCircle2 className="mx-auto text-emerald-500" size={46} />
              <h3 className="mt-4 text-lg font-extrabold text-[#002b4e]">Správa bola odoslaná</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">Ďakujeme. Ozveme sa vám čo najskôr.</p>
              <button
                type="button"
                onClick={() => setStatus('idle')}
                className="mt-6 text-sm font-bold text-[#e97f08] hover:text-[#c96700]"
              >
                Poslať ďalšiu správu
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-2.5 p-3.5">
              <p className="text-[13px] leading-[1.35rem] text-slate-600">
                Nechajte nám správu a kontaktné údaje. Ozveme sa vám hneď, ako to bude možné.
              </p>

              <div className="absolute -left-[9999px]" aria-hidden="true">
                <label htmlFor="consultation-website">Webová stránka</label>
                <input
                  id="consultation-website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.website}
                  onChange={(e) => updateField('website', e.target.value)}
                />
              </div>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-slate-700">E-mail</span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="vas@email.sk"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#f7941d] focus:bg-white focus:ring-4 focus:ring-orange-100"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-slate-700">Telefónne číslo</span>
                <input
                  type="tel"
                  required
                  autoComplete="tel"
                  value={form.telefon}
                  onChange={(e) => updateField('telefon', e.target.value)}
                  placeholder="+421 900 000 000"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#f7941d] focus:bg-white focus:ring-4 focus:ring-orange-100"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-slate-700">Ako vám môžeme pomôcť?</span>
                <textarea
                  required
                  rows={2}
                  maxLength={2500}
                  value={form.message}
                  onChange={(e) => updateField('message', e.target.value)}
                  placeholder="Napíšte nám svoju otázku..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#f7941d] focus:bg-white focus:ring-4 focus:ring-orange-100"
                />
              </label>

              <label className="flex cursor-pointer items-start gap-2.5 rounded-xl bg-slate-50 px-3 py-2">
                <input
                  type="checkbox"
                  required
                  checked={form.privacyAccepted}
                  onChange={(e) => updateField('privacyAccepted', e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#f7941d]"
                />
                <span className="text-[11px] leading-4 text-slate-600">
                  Oboznámil/a som sa so{' '}
                  <a
                    href="/gdpr"
                    className="font-bold text-[#e97f08] underline decoration-orange-300 underline-offset-2 hover:text-[#c96700]"
                  >
                    Zásadami ochrany osobných údajov
                  </a>
                </span>
              </label>

              {status === 'error' && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#f7941d] px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-orange-200 transition hover:bg-[#e9830a] disabled:cursor-not-allowed disabled:opacity-65"
              >
                {status === 'sending' ? <Loader2 className="animate-spin" size={18} /> : <Send size={17} />}
                {status === 'sending' ? 'Odosielam…' : 'Odoslať správu'}
              </button>
            </form>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls="consultation-chatbox"
        className="group flex items-center gap-3 rounded-full bg-[#002b4e] p-2.5 pr-5 text-white shadow-[0_12px_35px_rgba(0,43,78,0.3)] transition hover:-translate-y-0.5 hover:bg-[#003b69] focus:outline-none"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f7941d] shadow-md transition group-hover:scale-105">
          {isOpen ? <X size={22} /> : <Phone size={21} strokeWidth={2.3} />}
        </span>
        <span className="text-left leading-tight">
          <span className="block text-[11px] font-semibold text-white/65">Potrebujete poradiť?</span>
          <span className="block text-sm font-extrabold">Bezplatná konzultácia</span>
        </span>
      </button>
    </div>
  );
};

export default ConsultationChatbox;
