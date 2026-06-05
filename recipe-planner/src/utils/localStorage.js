export const loadState = (key, fallback = null) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch { return fallback; }
};

export const saveState = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch (e) { console.error('localStorage save failed', e); }
};
