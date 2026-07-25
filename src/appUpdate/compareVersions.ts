export const isBelowMinimumVersion = (installed: string, minimum: string): boolean => {
  const a = installed.split('.').map(Number);
  const b = minimum.split('.').map(Number);

  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0);
    if (diff !== 0) return diff < 0;
  }

  return false;
};
