import { createMMKV } from 'react-native-mmkv';

// Global MMKV instance for fast, synchronous storage
export const storage = createMMKV();

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
    storage.remove(STORAGE_KEYS.JWT_PAIR);
  }
}
