export function isPositiveDecimal(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  return /^\d+(\.\d+)?$/.test(v);
}
