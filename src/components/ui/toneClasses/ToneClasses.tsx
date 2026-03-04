export type Tone = "ok" | "warn" | "fail" | "info";

export function toneClasses(tone: Tone) {
  switch (tone) {
    case "fail":
      return {
        chip: "bg-destructive/12 border border-destructive/30",
        text: "text-destructive",
        dot: "bg-destructive",
        iconBg: "bg-destructive/18 border border-destructive/25",
      };
    case "warn":
      return {
        chip: "bg-warning/12 border border-warning/30",
        text: "text-warning",
        dot: "bg-warning",
        iconBg: "bg-warning/18 border border-warning/25",
      };
    case "info":
      return {
        chip: "bg-info/12 border border-info/30",
        text: "text-info",
        dot: "bg-info",
        iconBg: "bg-info/18 border border-info/25",
      };
    default:
      return {
        chip: "bg-success/12 border border-success/30",
        text: "text-success",
        dot: "bg-success",
        iconBg: "bg-success/18 border border-success/25",
      };
  }
}
