import { useDashboardScope } from "@/src/context";
import { useVesselsListData } from "@/src/hooks";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { ModuleFrame } from "../../dashboard/ModuleFrame";
import { Text } from "../../ui";

type Status = "CRITICAL" | "WARNING" | "OK";

function toneStyles(status: Status) {
  switch (status) {
    case "CRITICAL":
      return {
        chip: "bg-destructive/10 border border-destructive/30",
        chipText: "text-destructive",
        metaText: "text-destructive",
        dot: "bg-destructive",
      };
    case "WARNING":
      return {
        chip: "bg-warning/10 border border-warning/30",
        chipText: "text-warning",
        metaText: "text-warning",
        dot: "bg-warning",
      };
    default:
      return {
        chip: "bg-success/10 border border-success/30",
        chipText: "text-success",
        metaText: "text-muted",
        dot: "bg-success",
      };
  }
}

function statusLabel(status: Status) {
  if (status === "CRITICAL") return "CRITICAL";
  if (status === "WARNING") return "WARNING";
  return "OK";
}

export default function VesselsListModule() {
  const { projectId } = useDashboardScope();
  const { data, isLoading, error, refetch } = useVesselsListData();
  const router = useRouter();

  return (
    <ModuleFrame isLoading={isLoading} error={error} onRetry={refetch}>
      <View className="">
        {data.map((row) => {
          const t = toneStyles(row.status);

          return (
            <Pressable
              key={row.assetId}
              onPress={() =>
                router.push({
                  pathname: "/projects/[projectId]/vessels/[assetId]",
                  params: { projectId, assetId: row.assetId },
                })
              }
              className="flex-row items-center justify-between rounded-lg border border-border bg-surface px-3 py-3"
            >
              {/* Left */}
              <View className="flex-1 pr-3">
                <Text
                  className="text-sm font-semibold text-textMain"
                  numberOfLines={1}
                >
                  {row.assetName}
                </Text>

                <Text className="text-xs text-muted mt-0.5" numberOfLines={1}>
                  {row.totalCertificates} certs • {row.crewActive} crew active
                </Text>
              </View>

              {/* Right */}
              <View className="items-end gap-2">
                {/* Status chip */}
                <View
                  className={[
                    "flex-row items-center gap-2 rounded-full px-2.5 py-1",
                    t.chip,
                  ].join(" ")}
                >
                  <View className={["h-2 w-2 rounded-full", t.dot].join(" ")} />
                  <Text
                    className={["text-[11px] font-semibold", t.chipText].join(
                      " ",
                    )}
                  >
                    {statusLabel(row.status)}
                  </Text>
                </View>

                {/* Expired meta */}
                <View className="flex-row items-center gap-1">
                  {/* evita white hardcodeado */}
                  {/* <Ionicons name="time-outline" size={14} color="white" /> */}

                  <Ionicons name="time-outline" size={14} color="white" />
                  <Text
                    className={["text-xs font-semibold", t.metaText].join(" ")}
                  >
                    {row.expired} expired
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ModuleFrame>
  );
}
