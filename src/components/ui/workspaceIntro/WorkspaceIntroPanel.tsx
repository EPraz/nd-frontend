import { cn } from "@/src/lib/utils";
import type { ReactNode } from "react";
import { View } from "react-native";
import { Text } from "../text/Text";

type WorkspaceIntroMetricTone = "neutral" | "ok" | "warn" | "fail";

type WorkspaceIntroMetric = {
  label: string;
  value: string;
  helper?: string;
  tone?: WorkspaceIntroMetricTone;
};

type WorkspaceIntroPanelProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  metrics?: WorkspaceIntroMetric[];
  aside?: ReactNode;
};

function toneClass(tone: WorkspaceIntroMetricTone = "neutral") {
  if (tone === "ok") {
    return {
      border: "border-success/35",
      badge: "bg-success/12",
      text: "text-success",
    };
  }
  if (tone === "warn") {
    return {
      border: "border-warning/35",
      badge: "bg-warning/12",
      text: "text-warning",
    };
  }
  if (tone === "fail") {
    return {
      border: "border-destructive/35",
      badge: "bg-destructive/12",
      text: "text-destructive",
    };
  }
  return {
    border: "border-shellLine",
    badge: "bg-shellPanelSoft",
    text: "text-textMain",
  };
}

export function WorkspaceIntroPanel({
  eyebrow,
  title,
  description,
  actions,
  metrics = [],
  aside,
}: WorkspaceIntroPanelProps) {
  const hasRail = Boolean(actions || aside);

  return (
    <View className="max-w-full overflow-hidden rounded-[26px] border border-shellLine bg-shellPanel p-5 web:p-6 web:backdrop-blur-md">
      <View className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-shellBadge" />
      <View className="absolute bottom-0 left-10 h-24 w-24 rounded-full bg-shellGlass" />

      <View className="min-w-0 gap-5 lg:flex-row lg:items-start">
        <View className="min-w-0 flex-1 gap-5">
          <View className="min-w-0 gap-3">
            <View className="self-start rounded-full border border-shellBadgeBorder bg-shellBadge px-3 py-1">
              <Text className="text-[11px] font-semibold uppercase tracking-[0.22em] text-shellHighlight">
                {eyebrow}
              </Text>
            </View>

            <View className="min-w-0 gap-2">
          <Text className="max-w-full text-[34px] font-semibold leading-[40px] tracking-tight text-textMain md:text-[40px] md:leading-[44px]">
                {title}
              </Text>
          <Text className="max-w-[720px] text-[14px] leading-6 text-muted md:text-[15px]">
                {description}
              </Text>
            </View>
          </View>

          {metrics.length > 0 ? (
            <View className="flex-row flex-wrap gap-3">
              {metrics.map((metric) => {
                const tone = toneClass(metric.tone);

                return (
                  <View
                    key={metric.label}
                    className={cn(
                      "min-w-[148px] basis-[160px] flex-1 rounded-[18px] border bg-shellPanelSoft p-4",
                      tone.border,
                    )}
                  >
                    <Text className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                      {metric.label}
                    </Text>
                    <Text
                      className={cn(
                        "mt-3 text-[28px] font-semibold leading-none",
                        tone.text,
                      )}
                    >
                      {metric.value}
                    </Text>
                    {metric.helper ? (
                      <Text className="mt-2 text-[12px] leading-5 text-muted">
                        {metric.helper}
                      </Text>
                    ) : null}
                  </View>
                );
              })}
            </View>
          ) : null}
        </View>

        {hasRail ? (
          <View
            className={cn(
              "gap-3",
              aside ? "lg:w-[288px]" : "lg:w-auto lg:self-start",
            )}
          >
            {actions ? (
              <View className="flex-row flex-wrap items-center justify-start gap-2 lg:justify-end">
                {actions}
              </View>
            ) : null}

            {aside ? (
              <View className="rounded-[20px] border border-shellLine bg-shellChromeSoft p-4 web:backdrop-blur-md">
                {aside}
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}
