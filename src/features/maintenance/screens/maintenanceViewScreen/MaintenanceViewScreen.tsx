import {
  Button,
  Card,
  CardContent,
  CardHeaderRow,
  CardTitle,
  ErrorState,
  FieldDisplay,
  Loading,
  Text,
} from "@/src/components";
import { formatDate, MiniPill } from "@/src/helpers";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, View } from "react-native";

import {
  MaintenancePriorityPill,
  MaintenanceStatusPill,
} from "../../components";
import { useMaintenanceById } from "../../hooks";

export default function MaintenanceViewScreen() {
  const router = useRouter();

  const { projectId, assetId, maintenanceId } = useLocalSearchParams<{
    projectId: string;
    assetId: string;
    maintenanceId: string;
  }>();

  const pid = String(projectId);
  const vid = String(assetId);
  const mid = String(maintenanceId);

  const { maintenance, loading, error, refresh } = useMaintenanceById(
    pid,
    vid,
    mid,
  );

  const goBack = () => router.back();
  const goVessel = () => router.push(`/projects/${pid}/vessels/${vid}`);
  const goEdit = () =>
    router.push(`/projects/${pid}/vessels/${vid}/maintenance/${mid}/edit`);

  const handleDelete = () => {
    // TODO: confirm dialog + delete endpoint
  };

  if (loading) return <Loading fullScreen />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;
  if (!maintenance)
    return (
      <ErrorState message="Maintenance task not found." onRetry={refresh} />
    );

  const isOverdue = maintenance.dueDate
    ? new Date(maintenance.dueDate).getTime() < Date.now()
    : false;

  return (
    <View className="flex-1 bg-baseBg p-4 web:p-6 gap-5">
      {/* Top bar */}
      <View className="gap-3">
        <Pressable
          onPress={goBack}
          className="self-start flex-row items-center gap-2"
        >
          <Ionicons name="chevron-back" size={16} className="text-accent" />
          <Text className="text-accent font-semibold">Back</Text>
        </Pressable>

        <View className="flex-row items-start justify-between gap-4">
          <View className="gap-1 flex-1">
            <Text className="text-textMain text-[34px] font-semibold leading-[110%]">
              Maintenance - {maintenance.title}
            </Text>
            <Text className="text-muted text-[14px]">
              View task details, priority and operational status.
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <Button
              variant="icon"
              size="iconLg"
              onPress={refresh}
              leftIcon={
                <Ionicons name="refresh" size={18} className="text-textMain" />
              }
              accessibilityLabel="Refresh"
            />

            <Button
              variant="destructive"
              size="lg"
              onPress={handleDelete}
              className="rounded-full"
              disabled
              rightIcon={
                <Ionicons
                  name="trash-outline"
                  size={16}
                  className="text-textMain"
                />
              }
            >
              Delete
            </Button>

            <Button
              variant="default"
              size="lg"
              onPress={goEdit}
              className="rounded-full"
              rightIcon={
                <Ionicons
                  name="create-outline"
                  size={16}
                  className="text-textMain"
                />
              }
            >
              Edit
            </Button>
          </View>
        </View>
      </View>

      {/* Main layout */}
      <View className="gap-5 web:lg:flex-row">
        {/* Left column */}
        <View className="flex-1 gap-5">
          <Card className="rounded-[24px] shadow-sm shadow-black/10 web:shadow-black/30">
            <CardHeaderRow>
              <CardTitle className="text-[16px] text-textMain">
                Maintenance Details
              </CardTitle>

              <View className="flex-row items-center gap-2">
                <MaintenancePriorityPill priority={maintenance.priority} />
                <MaintenanceStatusPill status={maintenance.status} />
              </View>
            </CardHeaderRow>

            <CardContent className="px-6">
              <View className="gap-4">
                {/* Header */}
                <View className="gap-2">
                  <Text className="text-textMain text-[22px] font-semibold">
                    {maintenance.title}
                  </Text>

                  <View className="flex-row flex-wrap gap-2">
                    <MiniPill>
                      ID:{" "}
                      <Text className="text-textMain font-semibold">
                        {maintenance.id}
                      </Text>
                    </MiniPill>

                    <Pressable
                      onPress={goVessel}
                      className="web:rounded-full web:hover:bg-accent/10"
                    >
                      <MiniPill>
                        Vessel:{" "}
                        <Text className="text-textMain font-semibold">
                          {maintenance.asset.name ?? maintenance.assetId}
                        </Text>
                      </MiniPill>
                    </Pressable>

                    {maintenance.dueDate ? (
                      <MiniPill>
                        Due:{" "}
                        <Text
                          className={[
                            "font-semibold",
                            isOverdue && maintenance.status !== "DONE"
                              ? "text-destructive"
                              : "text-textMain",
                          ].join(" ")}
                        >
                          {formatDate(maintenance.dueDate)}
                        </Text>
                      </MiniPill>
                    ) : (
                      <MiniPill>
                        Due:{" "}
                        <Text className="text-textMain font-semibold">—</Text>
                      </MiniPill>
                    )}
                  </View>
                </View>

                {/* Fields grid */}
                <View className="gap-4 web:flex-row">
                  <View className="flex-1 gap-4">
                    <FieldDisplay
                      label="Description"
                      value={maintenance.description ?? "—"}
                    />
                    <FieldDisplay
                      label="Due Date"
                      value={formatDate(maintenance.dueDate)}
                    />
                    <FieldDisplay
                      label="Priority"
                      value={
                        <MaintenancePriorityPill
                          priority={maintenance.priority}
                        />
                      }
                    />
                  </View>

                  <View className="flex-1 gap-4">
                    <FieldDisplay
                      label="Vessel ID"
                      value={maintenance.assetId}
                      mono
                    />
                    <FieldDisplay
                      label="Created At"
                      value={formatDate(maintenance.createdAt)}
                    />
                    <FieldDisplay
                      label="Status"
                      value={
                        <MaintenanceStatusPill status={maintenance.status} />
                      }
                    />
                  </View>
                </View>

                {/* Notes placeholder */}
                <View className="rounded-[18px] border border-border bg-baseBg/40 p-4">
                  <Text className="text-[12px] text-muted">Notes (MVP)</Text>
                  <Text className="text-[13px] text-textMain mt-1">
                    — (add checklists, attachments, and work logs later)
                  </Text>
                </View>
              </View>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] shadow-sm shadow-black/10 web:shadow-black/30">
            <CardHeaderRow>
              <CardTitle className="text-[16px] text-textMain">
                Work Log / Activity (MVP)
              </CardTitle>
            </CardHeaderRow>
            <CardContent className="px-6">
              <Text className="text-muted text-[13px]">
                Placeholder: later show comments, status changes, assigned crew,
                or audit events here.
              </Text>
            </CardContent>
          </Card>
        </View>

        {/* Right column */}
        <View className="w-full web:lg:w-[380px] gap-5">
          <Card className="rounded-[24px] shadow-sm shadow-black/10 web:shadow-black/30">
            <CardHeaderRow>
              <CardTitle className="text-[16px] text-textMain">
                Attachments (MVP)
              </CardTitle>
              <Button
                variant="icon"
                size="iconLg"
                onPress={() => {}}
                disabled
                leftIcon={
                  <Ionicons name="add" size={18} className="text-textMain" />
                }
                accessibilityLabel="Upload"
              />
            </CardHeaderRow>

            <CardContent className="px-6">
              <View className="h-[260px] rounded-[18px] border border-border bg-baseBg/40 items-center justify-center">
                <Text className="text-textMain text-[18px] font-semibold">
                  Work Order / Photo / PDF
                </Text>
                <Text className="text-muted text-[12px] mt-1">
                  (upload later)
                </Text>
              </View>

              <View className="mt-3 flex-row gap-2">
                <View className="h-16 w-16 rounded-[14px] border border-border bg-baseBg/40 items-center justify-center">
                  <Text className="text-muted text-[11px]">Thumb</Text>
                </View>
                <View className="h-16 w-16 rounded-[14px] border border-border bg-baseBg/40 items-center justify-center">
                  <Text className="text-muted text-[11px]">Thumb</Text>
                </View>
                <View className="h-16 w-16 rounded-[14px] border border-dashed border-border bg-baseBg/40 items-center justify-center">
                  <Ionicons name="add" size={18} className="text-accent" />
                </View>
              </View>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] shadow-sm shadow-black/10 web:shadow-black/30">
            <CardHeaderRow>
              <CardTitle className="text-[16px] text-textMain">
                Operational Summary (MVP)
              </CardTitle>
            </CardHeaderRow>

            <CardContent className="px-6">
              <View className="gap-4">
                <View className="rounded-[18px] border border-border bg-baseBg/40 p-4">
                  <Text className="text-muted text-[12px]">Risk</Text>
                  <Text className="text-textMain text-[26px] font-semibold">
                    {maintenance.status === "DONE"
                      ? "OK"
                      : isOverdue
                        ? "CRITICAL"
                        : maintenance.priority === "HIGH"
                          ? "ATTN"
                          : "OK"}
                  </Text>
                  <Text className="text-muted text-[12px] mt-1">
                    Based on due date / priority (MVP)
                  </Text>
                </View>

                <View className="gap-3">
                  <FieldDisplay
                    label="Next action"
                    value={
                      maintenance.status === "DONE"
                        ? "No action (completed)"
                        : isOverdue
                          ? "Schedule immediately"
                          : "Plan & assign (later)"
                    }
                  />
                  <FieldDisplay label="Owner" value="—" />
                </View>
              </View>
            </CardContent>
          </Card>
        </View>
      </View>
    </View>
  );
}
