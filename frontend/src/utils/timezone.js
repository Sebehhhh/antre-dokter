// Utility functions for WITA timezone (UTC+8)

export const getWitaTime = () => {
  const now = new Date();
  return new Date(now.getTime() + (8 * 60 * 60 * 1000));
};

export const getWitaDateString = () => {
  return getWitaTime().toISOString().split('T')[0];
};

export const getWitaDate = () => {
  const witaTime = getWitaTime();
  return new Date(witaTime.getFullYear(), witaTime.getMonth(), witaTime.getDate());
};

export const formatWitaDate = (date, options = {}) => {
  const witaTime = new Date(date.getTime() + (8 * 60 * 60 * 1000));
  return witaTime.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  });
};

export const addDaysToWitaDate = (days) => {
  const witaTime = getWitaTime();
  witaTime.setDate(witaTime.getDate() + days);
  return witaTime.toISOString().split('T')[0];
};