import type { AuditEventDto } from "@/src/contracts/audit.contract";
import { cn } from "@/src/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { View } from "react-native";
import { Button } from "@/src/components/ui/button/Button";
import { Card } from "@/src/components/ui/card/Card";
import { MiniPill } from "@/src/components/ui/miniPill/MiniPill";
import { Text } from "@/src/components/ui/text/Text";
import {
  auditModuleLabel,
  auditToneClasses,
  filterVisibleAuditEvents,
  formatAuditTimestamp,
} from "./recentActivity.shared";

type Props = {
  title: string;
  description: string;
  events: AuditEventDto[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void | Promise<void>;
  isModuleEnabled?: (moduleKey: string) => boolean;
  maxItems?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
};

export function RecentActivityPanel({
  title,
  description,
  events,
  isLoading,
  error,
  onRetry,
  isModuleEnabled,
  maxItems = 6,
  emptyTitle = "No recent activity yet",
  emptyDescription = "New changes across enabled modules will appear here as the team works.",
  className,
}: Props) {
  const visibleEvents = useMemo(
    () => filterVisibleAuditEvents(events, isModuleEnabled).slice(0, maxItems),
    [events, isModuleEnabled, maxItems],
  );

  return (
    <Card className={cn("gap-0 overflow-hidden p-0", className)}>
      <View className="gap-1 border-b border-shellLine px-4 py-4">
        <Text className="text-[15px] font-semibold text-textMain">{title}</Text>
        <Text className="text-[12px] leading-[18px] text-muted">
          {description}
        </Text>
      </View>

      <View className="px-4 py-4">
        {isLoading ? (
          <CenteredState
            icon="time-outline"
            title="Loading activity..."
            description="Fetching the latest operational changes."
          />
        ) : error ? (
          <View className="gap-3 rounded-[18px] border border-shellLine bg-shellPanelSoft p-4">
            <Text className="text-[13px] text-destructive">{error}</Text>
            <Button variant="outline" size="sm" onPress={onRetry}>
              Retry
            </Button>
          </View>
        ) : visibleEvents.length === 0 ? (
          <CenteredState
            icon="checkmark-circle-outline"
            title={emptyTitle}
            description={emptyDescription}
          />
        ) : (
          <View className="relative gap-0">
            {visibleEvents.map((event, index) => {
              const tone = auditToneClasses(event.action);
              const metadataLine = [event.actorUserName ?? "System", event.assetName]
                .filter(Boolean)
                .join(" | ");
              const showConnector = index < visibleEvents.length - 1;

              return (
                <View
                  key={event.id}
                  className="relative pl-8"
                >
                  <View
                    className={cn(
                      "absolute left-[7px] top-[10px] h-4 w-4 items-center justify-center rounded-full border border-shellLine bg-shellPanel",
                    )}
                  >
                    <View className={cn("h-2.5 w-2.5 rounded-full", tone.dot)} />
                  </View>

                  {showConnector ? (
                    <View className="absolute bottom-0 left-[14px] top-[28px] w-px bg-shellLine" />
                  ) : null}

                  <View className={cn("gap-2", showConnector ? "pb-4" : "")}>
                    <View className="flex-row flex-wrap items-start justify-between gap-3">
                      <MiniPill
                        className={cn(tone.chip, "rounded-full px-2.5 py-1")}
                      >
                        <View className="flex-row items-center gap-2">
                          <View className={cn("h-2 w-2 rounded-full", tone.dot)} />
                          <Text
                            className={cn("text-[10px] font-semibold", tone.text)}
                          >
                            {auditModuleLabel(event.moduleKey)}
                          </Text>
                        </View>
                      </MiniPill>

                      <Text className="text-[11px] text-muted">
                        {formatAuditTimestamp(event.createdAt)}
                      </Text>
                    </View>

                    <View className="gap-1.5">
                      <Text className="text-[13px] font-semibold leading-[19px] text-textMain">
                        {event.summary}
                      </Text>
                      {metadataLine ? (
                        <Text className="text-[12px] leading-[18px] text-muted">
                          {metadataLine}
                        </Text>
                      ) : null}
                      {event.entityLabel ? (
                        <Text className="text-[12px] leading-[18px] text-muted">
                          Subject: {event.entityLabel}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </Card>
  );
}

function CenteredState(props: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}) {
  return (
    <View className="items-center justify-center gap-3 rounded-[18px] border border-shellLine bg-shellPanelSoft px-4 py-8">
      <View className="h-10 w-10 items-center justify-center rounded-full border border-shellLine bg-shellGlass">
        <Ionicons name={props.icon} size={20} className="text-textMain" />
      </View>
      <View className="max-w-[360px] gap-1">
        <Text className="text-center text-sm font-semibold text-textMain">
          {props.title}
        </Text>
        <Text className="text-center text-xs leading-5 text-muted">
          {props.description}
        </Text>
      </View>
    </View>
  );
}
