import { Text } from "../../ui";

export type SpecItem = {
  label: string;
  value: string;
  kind?: "text" | "status";
  statusTone?: "ok" | "warn" | "fail";
};

export function toneDot(t?: SpecItem["statusTone"]) {
  switch (t) {
    case "ok":
      return "bg-success";
    case "warn":
      return "bg-warning";
    case "fail":
      return "bg-destructive";
    default:
      return "bg-success";
  }
}

export function toneText(t?: SpecItem["statusTone"]) {
  switch (t) {
    case "ok":
      return "text-success";
    case "warn":
      return "text-warning";
    case "fail":
      return "text-destructive";
    default:
      return "text-success";
  }
}

export function Bullet() {
  return <Text className="text-[12px] text-muted">•</Text>;
}

export function toWebUri(source: any) {
  if (typeof source === "string") return source;
  if (source?.uri) return source.uri;
  return "";
}
