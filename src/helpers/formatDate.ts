export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

export function isIsoDateOnly(value: string): boolean {
  // YYYY-MM-DD (simple). Luego metemos DatePicker.
  return /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
}
