const STORAGE_KEY = 'cyna_saas_durations';

export const getAllSaaSDurations = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
};

export const saveSaaSDuration = (productId: string, duration: string) => {
  if (typeof window === 'undefined') return;
  const durations = getAllSaaSDurations();
  durations[productId] = duration;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(durations));
};

export const removeSaaSDuration = (productId: string) => {
  if (typeof window === 'undefined') return;
  const durations = getAllSaaSDurations();
  if (durations[productId]) {
    delete durations[productId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(durations));
  }
};
