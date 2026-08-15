import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV();

export const STORAGE_KEYS = {
  JWT_PAIR: 'jwt_pair',
  USER_PROFILE: 'user_profile',
  RECENT_MEAL_PLAN: 'recent_meal_plan',
};

export const getJwtPair = () => {
  const data = storage.getString(STORAGE_KEYS.JWT_PAIR);
  return data ? JSON.parse(data) : null;
};

export const setJwtPair = (pair: { access: string; refresh: string } | null) => {
  if (pair) {
    storage.set(STORAGE_KEYS.JWT_PAIR, JSON.stringify(pair));
  } else {
    storage.delete(STORAGE_KEYS.JWT_PAIR);
  }
};

export const getUserProfile = () => {
  const data = storage.getString(STORAGE_KEYS.USER_PROFILE);
  return data ? JSON.parse(data) : null;
};

export const setUserProfile = (profile: any) => {
  if (profile) {
    storage.set(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } else {
    storage.delete(STORAGE_KEYS.USER_PROFILE);
  }
};

export const getRecentMealPlan = () => {
  const data = storage.getString(STORAGE_KEYS.RECENT_MEAL_PLAN);
  return data ? JSON.parse(data) : null;
};

export const setRecentMealPlan = (plan: any) => {
  if (plan) {
    storage.set(STORAGE_KEYS.RECENT_MEAL_PLAN, JSON.stringify(plan));
  } else {
    storage.delete(STORAGE_KEYS.RECENT_MEAL_PLAN);
  }
};
