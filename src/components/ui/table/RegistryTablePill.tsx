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
        surface: "border-emerald-400/25 bg-emerald-400/10",
        text: "text-emerald-100",
      };
    case "warn":
      return {
        surface: "border-amber-300/25 bg-amber-300/10",
        text: "text-amber-100",
      };
    case "danger":
      return {
        surface: "border-rose-400/25 bg-rose-400/10",
        text: "text-rose-100",
      };
    case "accent":
      return {
        surface: "border-accent/30 bg-accent/12",
        text: "text-accent",
      };
    case "neutral":
      return {
        surface: "border-slate-300/15 bg-slate-300/8",
        text: "text-slate-200",
      };
    case "info":
    default:
      return {
        surface: "border-shellLine bg-shellPanelSoft",
        text: "text-muted",
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
