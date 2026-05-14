import { MiniPill } from "@/src/components/ui/miniPill/MiniPill";
import { Text } from "@/src/components/ui/text/Text";
import { cn } from "@/src/lib/utils";

type RegistryTablePillTone =
  | "ok"
  | "warn"
  | "info"
  | "danger"
  | "accent"
  | "neutral";

function pillToneClasses(tone: RegistryTablePillTone) {
  switch (tone) {
    case "ok":
      return {
        surface: "border-success/35 bg-success/12",
        text: "text-success",
      };
    case "warn":
      return {
        surface: "border-warning/35 bg-warning/12",
        text: "text-warning",
      };
    case "danger":
      return {
        surface: "border-destructive/35 bg-destructive/12",
        text: "text-destructive",
      };
    case "accent":
      return {
        surface: "border-accent/30 bg-accent/12",
        text: "text-accent",
      };
    case "neutral":
      return {
        surface: "border-shellLine bg-shellPanelSoft",
        text: "text-muted",
      };
    case "info":
    default:
      return {
        surface: "border-info/30 bg-info/12",
        text: "text-info",
      };
  }
}

export function RegistryTablePill({
  label,
  tone,
}: {
  label: string;
  tone: RegistryTablePillTone;
}) {
  const ui = pillToneClasses(tone);

  return (
    <MiniPill
      className={cn("self-start rounded-full border px-2.5 py-1", ui.surface)}
    >
      <Text className={cn("text-[10px] font-semibold", ui.text)}>{label}</Text>
    </MiniPill>
  );
}
