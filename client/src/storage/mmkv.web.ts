type Listener = (key: string) => void;
const listeners = new Set<Listener>();

export const storage = {
  set: (key: string, value: string | boolean | number) => {
    localStorage.setItem(key, String(value));
    listeners.forEach(l => l(key));
  },
  getString: (key: string) => localStorage.getItem(key) || undefined,
  getBoolean: (key: string) => localStorage.getItem(key) === 'true',
  getNumber: (key: string) => {
    const val = localStorage.getItem(key);
    return val ? Number(val) : undefined;
  },
  delete: (key: string) => {
    localStorage.removeItem(key);
    listeners.forEach(l => l(key));
  },
  clearAll: () => localStorage.clear(),
  addOnValueChangedListener: (listener: Listener) => {
    listeners.add(listener);
    return { remove: () => listeners.delete(listener) };
  },
};

export const STORAGE_KEYS = {
  JWT_PAIR: 'jwt_pair',
};

export interface JwtPair {
  access: string;
  refresh: string;
}

export function getJwtPair(): JwtPair | null {
  const data = storage.getString(STORAGE_KEYS.JWT_PAIR);
  if (data) {
    try {
      return JSON.parse(data) as JwtPair;
    } catch {
      return null;
    }
  }
  return null;
}

export function setJwtPair(pair: JwtPair | null) {
  if (pair) {
    storage.set(STORAGE_KEYS.JWT_PAIR, JSON.stringify(pair));
  } else {
    storage.delete(STORAGE_KEYS.JWT_PAIR);
  }
}
