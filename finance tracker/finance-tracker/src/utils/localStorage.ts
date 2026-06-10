import { AppState } from '../types';

const STORAGE_KEY = 'finflow_state';

export const saveState = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
};

export const loadState = (): AppState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AppState) : null;
  } catch (e) {
    console.error('Failed to load state:', e);
    return null;
  }
};

export const clearState = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
