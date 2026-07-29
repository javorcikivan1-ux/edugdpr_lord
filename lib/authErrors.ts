export const translateAuthError = (error: unknown, fallback = 'Došlo k chybe. Skúste to prosím znova.') => {
  const message = String(
    typeof error === 'object' && error && 'message' in error
      ? (error as { message?: unknown }).message
      : error || ''
  );

  const normalized = message.toLowerCase();

  if (!message) return fallback;
  if (normalized.includes('invalid login credentials')) {
    return 'Nesprávny e-mail alebo heslo.';
  }
  if (normalized.includes('email not confirmed')) {
    return 'E-mail ešte nebol potvrdený. Skontrolujte si prosím svoju e-mailovú schránku.';
  }
  if (normalized.includes('too many requests') || normalized.includes('rate limit')) {
    return 'Príliš veľa pokusov. Skúste to prosím znova neskôr.';
  }
  if (normalized.includes('user already registered') || normalized.includes('already registered')) {
    return 'Používateľ s týmto e-mailom už existuje.';
  }
  if (normalized.includes('password should be') || normalized.includes('weak password')) {
    return 'Heslo je príliš slabé. Zvoľte prosím dlhšie a bezpečnejšie heslo.';
  }
  if (normalized.includes('signup is disabled')) {
    return 'Registrácia je momentálne vypnutá.';
  }
  if (normalized.includes('invalid email')) {
    return 'Zadajte platnú e-mailovú adresu.';
  }
  if (normalized.includes('otp') || normalized.includes('token') || normalized.includes('expired')) {
    return 'Odkaz alebo overovací kód je neplatný alebo expirovaný.';
  }
  if (normalized.includes('network') || normalized.includes('fetch')) {
    return 'Nepodarilo sa spojiť so serverom. Skontrolujte pripojenie a skúste to znova.';
  }

  return fallback;
};
