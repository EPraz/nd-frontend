const UPPERCASE_LABELS = new Set([
  "HFO",
  "HSFO",
  "IMO",
  "LNG",
  "MGO",
  "MMSI",
  "MT",
  "VLSFO",
]);

export function humanizeTechnicalLabel(value: string | null | undefined) {
  if (!value) return "-";

  const normalized = value
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

  if (!normalized) return "-";

  return normalized
    .split(" ")
    .map((chunk) => {
      const token = chunk.trim();
      const upper = token.toUpperCase();

      if (!token) return "";
      if (UPPERCASE_LABELS.has(upper)) return upper;
      if (/^\d+$/.test(token)) return token;

      return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
    })
    .join(" ");
}
