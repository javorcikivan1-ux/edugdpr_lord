export type DemoRole = 'company_admin' | 'employee';

const KEY_DEMO_MODE = 'demo-mode';
const KEY_DEMO_ROLE = 'demo-role';
export const DEMO_MODE_EVENT = 'demo-mode-changed';

const safeLocalStorageGet = (key: string) => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeLocalStorageSet = (key: string, value: string) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore
  }
};

const safeLocalStorageRemove = (key: string) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
};

export const isDemoMode = () => safeLocalStorageGet(KEY_DEMO_MODE) === 'true';

export const getDemoRole = (): DemoRole => {
  const v = safeLocalStorageGet(KEY_DEMO_ROLE);
  return v === 'employee' ? 'employee' : 'company_admin';
};

export const setDemoRole = (role: DemoRole) => {
  safeLocalStorageSet(KEY_DEMO_ROLE, role);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(DEMO_MODE_EVENT));
  }
};

export const enableDemoMode = (role: DemoRole = 'company_admin') => {
  safeLocalStorageSet(KEY_DEMO_MODE, 'true');
  safeLocalStorageSet(KEY_DEMO_ROLE, role);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(DEMO_MODE_EVENT));
  }
};

export const disableDemoMode = () => {
  safeLocalStorageRemove(KEY_DEMO_MODE);
  safeLocalStorageRemove(KEY_DEMO_ROLE);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(DEMO_MODE_EVENT));
  }
};

