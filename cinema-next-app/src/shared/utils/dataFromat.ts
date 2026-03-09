export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

export const formatAgeLimit = (age: number): string => {
  return `${age}+`;
};

export const isTruthy = <T>(value: T | undefined | null | false): value is T => {
  return value !== undefined && value !== null && value !== false;
};
