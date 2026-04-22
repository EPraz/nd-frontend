export function toDateOnly(value?: string | null): string {
  return value ? value.slice(0, 10) : "";
}
