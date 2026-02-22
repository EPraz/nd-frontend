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
import { MiniPill } from "@/src/helpers";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { CrewStatusPill } from "../../components";
import { useCrewById } from "../../hooks";

export default function CrewViewScreen() {
  const router = useRouter();

  const { projectId, assetId, crewId } = useLocalSearchParams<{
    projectId: string;
    assetId: string;
    crewId: string;
  }>();

  const pid = String(projectId);
  const vid = String(assetId);
  const cid = String(crewId);

  const { crew, loading, error, refresh } = useCrewById(pid, vid, cid);

  const goBack = () => router.back();
  const goVessel = () => router.push(`/projects/${pid}/vessels/${vid}`);

  const goEdit = () =>
    router.push(`/projects/${pid}/vessels/${vid}/crew/${cid}/edit`);

  const handleDelete = () => {
    // TODO: confirm dialog + delete endpoint
  };

  if (loading) return <Loading fullScreen />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;
  if (!crew)
    return <ErrorState message="Crew member not found." onRetry={refresh} />;

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
              Crew Member - {crew.fullName}
            </Text>
            <Text className="text-muted text-[14px]">
              View crew profile, status and vessel assignment.
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
                Crew Details
              </CardTitle>
              <CrewStatusPill status={crew.status} />
            </CardHeaderRow>

            <CardContent className="px-6">
              <View className="gap-4">
                {/* Header */}
                <View className="gap-2">
                  <Text className="text-textMain text-[22px] font-semibold">
                    {crew.fullName}
                  </Text>

                  <View className="flex-row flex-wrap gap-2">
                    <MiniPill>
                      ID:{" "}
                      <Text className="text-textMain font-semibold">
                        {crew.id}
                      </Text>
                    </MiniPill>

                    <Pressable
                      onPress={goVessel}
                      className="web:rounded-full web:hover:bg-accent/10"
                    >
                      <MiniPill>
                        Vessel:{" "}
                        <Text className="text-textMain font-semibold">
                          {crew.assetName ?? crew.assetId}
                        </Text>
                      </MiniPill>
                    </Pressable>

                    <MiniPill>
                      Status:{" "}
                      <Text className="text-textMain font-semibold">
                        {crew.status}
                      </Text>
                    </MiniPill>
                  </View>
                </View>

                {/* Fields grid */}
                <View className="gap-4 web:flex-row">
                  <View className="flex-1 gap-4">
                    <FieldDisplay label="Rank" value={crew.rank ?? "—"} />
                    <FieldDisplay
                      label="Nationality"
                      value={crew.nationality ?? "—"}
                    />
                    <FieldDisplay
                      label="Document ID"
                      value={crew.documentId ?? "—"}
                    />
                  </View>

                  <View className="flex-1 gap-4">
                    <FieldDisplay label="Vessel ID" value={crew.assetId} mono />
                    <FieldDisplay
                      label="Created At"
                      value={crew.createdAt ? crew.createdAt.slice(0, 10) : "—"}
                    />
                    <FieldDisplay
                      label="Status"
                      value={<CrewStatusPill status={crew.status} />}
                    />
                  </View>
                </View>

                {/* Notes placeholder */}
                <View className="rounded-[18px] border border-border bg-baseBg/40 p-4">
                  <Text className="text-[12px] text-muted">Notes (MVP)</Text>
                  <Text className="text-[13px] text-textMain mt-1">
                    — (add notes/credentials later)
                  </Text>
                </View>
              </View>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] shadow-sm shadow-black/10 web:shadow-black/30">
            <CardHeaderRow>
              <CardTitle className="text-[16px] text-textMain">
                Assignment / Activity (MVP)
              </CardTitle>
            </CardHeaderRow>
            <CardContent className="px-6">
              <Text className="text-muted text-[13px]">
                Placeholder: later you can show assignments, shifts,
                certificates, or audit events here.
              </Text>
            </CardContent>
          </Card>
        </View>

        {/* Right column */}
        <View className="w-full web:lg:w-[380px] gap-5">
          <Card className="rounded-[24px] shadow-sm shadow-black/10 web:shadow-black/30">
            <CardHeaderRow>
              <CardTitle className="text-[16px] text-textMain">
                Documents (MVP)
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
                  Passport / ID / Docs
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
                  <Text className="text-muted text-[12px]">Availability</Text>
                  <Text className="text-textMain text-[26px] font-semibold">
                    {crew.status === "ACTIVE" ? "AVAILABLE" : "INACTIVE"}
                  </Text>
                  <Text className="text-muted text-[12px] mt-1">
                    Based on status (MVP)
                  </Text>
                </View>

                <View className="gap-3">
                  <FieldDisplay
                    label="Next action"
                    value="Verify documents (later)"
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
