import { cn } from "@/src/lib/utils";
import type { ReactNode } from "react";
import { View } from "react-native";
import { Text } from "../text/Text";

export type WorkspacePageMetric = {
  label: string;
  value: string;
  helper: string;
  tone?: "neutral" | "ok" | "warn" | "accent";
};

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  badges?: ReactNode;
  actions?: ReactNode;
  metrics?: WorkspacePageMetric[];
};

function metricToneClasses(tone: WorkspacePageMetric["tone"]) {
  switch (tone) {
    case "ok":
      return "border-emerald-400/18 bg-emerald-400/6";
    case "warn":
      return "border-amber-300/18 bg-amber-300/6";
    case "accent":
      return "border-accent/20 bg-accent/8";
    default:
      return "border-shellLine bg-shellPanelSoft";
  }
}

export function WorkspacePageHeader({
  eyebrow,
  title,
  description,
  badges,
  actions,
  metrics,
}: Props) {
  return (
    <View className="gap-4">
      <View className="rounded-[22px] border border-shellLine bg-shellPanel p-5 web:backdrop-blur-md">
        <View className="gap-4 lg:flex-row lg:items-start lg:justify-between">
          <View className="min-w-0 flex-1 gap-3">
            {eyebrow ? (
              <Text className="text-[11px] font-semibold tracking-[0.32em] uppercase text-accent">
                {eyebrow}
              </Text>
            ) : null}

            <View className="min-w-0 gap-3">
              <View className="min-w-0 flex-row flex-wrap items-center gap-2">
                <Text className="min-w-0 shrink text-[32px] leading-[1.08] font-semibold tracking-tight text-textMain">
                  {title}
                </Text>
                {badges ? (
                  <View className="flex-row flex-wrap items-center gap-2">
                    {badges}
                  </View>
                ) : null}
              </View>

              {description ? (
                <Text className="max-w-[760px] text-[14px] leading-6 text-muted">
                  {description}
                </Text>
              ) : null}
            </View>
          </View>

          {actions ? (
            <View className="flex-row flex-wrap items-center gap-2 lg:max-w-[340px] lg:justify-end">
              {actions}
            </View>
          ) : null}
        </View>
      </View>

      {metrics?.length ? (
        <View className="flex-row flex-wrap gap-3">
          {metrics.map((metric) => (
            <View
              key={metric.label}
              className={cn(
                "min-w-[164px] flex-1 rounded-[18px] border px-4 py-4",
                metricToneClasses(metric.tone),
              )}
            >
              <Text className="text-[11px] font-semibold tracking-[0.28em] uppercase text-muted">
                {metric.label}
              </Text>
              <Text className="mt-4 text-[26px] leading-none font-semibold tracking-tight text-textMain">
                {metric.value}
              </Text>
              <Text className="mt-3 text-[13px] leading-5 text-muted">
                {metric.helper}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
