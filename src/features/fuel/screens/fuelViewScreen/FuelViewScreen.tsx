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
import { fuelDisplayTitle } from "../../helpers";
import { useFuelById } from "../../hooks/useFuelById";

// (Opcional) pill simple para enums sin crear componente aparte
function TypePill({ label }: { label: string }) {
  return (
    <View className="rounded-full border border-border bg-baseBg/35 px-3 py-1">
      <Text className="text-textMain text-[12px] font-semibold">{label}</Text>
    </View>
  );
}

export default function FuelViewScreen() {
  const router = useRouter();

  const { projectId, assetId, fuelId } = useLocalSearchParams<{
    projectId: string;
    assetId: string;
    fuelId: string;
  }>();

  const pid = String(projectId);
  const vid = String(assetId);
  const fid = String(fuelId);

  const { fuel, loading, error, refresh } = useFuelById(pid, vid, fid);

  const goBack = () => router.back();
  const goVessel = () => router.push(`/projects/${pid}/vessels/${vid}`);
  const goEdit = () =>
    router.push(`/projects/${pid}/vessels/${vid}/fuel/${fid}/edit`);

  const handleDelete = () => {
    // TODO: confirm dialog + delete endpoint
  };

  if (loading) return <Loading fullScreen />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;
  if (!fuel)
    return <ErrorState message="Fuel log not found." onRetry={refresh} />;

  const vesselName = fuel.asset.name ?? fuel.assetId;

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
              Fuel Log - {fuelDisplayTitle(fuel)}
            </Text>
            <Text className="text-muted text-[14px]">
              View fuel event details, quantities, and metadata.
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

      {/* Main layout: web 2 cols */}
      <View className="gap-5 web:lg:flex-row">
        {/* Left column */}
        <View className="flex-1 gap-5">
          <Card className="rounded-[24px] shadow-sm shadow-black/10 web:shadow-black/30">
            <CardHeaderRow>
              <CardTitle className="text-[16px] text-textMain">
                Fuel Details
              </CardTitle>

              {/* Right side header pills */}
              <View className="flex-row items-center gap-2">
                <TypePill label={fuel.eventType} />
                <TypePill label={fuel.fuelType} />
                <TypePill label={fuel.unit} />
              </View>
            </CardHeaderRow>

            <CardContent className="px-6">
              <View className="gap-4">
                {/* Header */}
                <View className="gap-2">
                  <Text className="text-textMain text-[22px] font-semibold">
                    {fuel.eventType} · {fuel.quantity} {fuel.unit}
                  </Text>

                  <View className="flex-row flex-wrap gap-2">
                    <MiniPill>
                      ID:{" "}
                      <Text className="text-textMain font-semibold">
                        {fuel.id}
                      </Text>
                    </MiniPill>

                    <Pressable
                      onPress={goVessel}
                      className="web:rounded-full web:hover:bg-accent/10"
                    >
                      <MiniPill>
                        Vessel:{" "}
                        <Text className="text-textMain font-semibold">
                          {vesselName}
                        </Text>
                      </MiniPill>
                    </Pressable>

                    <MiniPill>
                      Date:{" "}
                      <Text className="text-textMain font-semibold">
                        {formatDate(fuel.date)}
                      </Text>
                    </MiniPill>
                  </View>
                </View>

                {/* Fields grid */}
                <View className="gap-4 web:flex-row">
                  <View className="flex-1 gap-4">
                    <FieldDisplay label="Date" value={formatDate(fuel.date)} />
                    <FieldDisplay
                      label="Event Type"
                      value={<TypePill label={fuel.eventType} />}
                    />
                    <FieldDisplay
                      label="Fuel Type"
                      value={<TypePill label={fuel.fuelType} />}
                    />
                    <FieldDisplay
                      label="Location"
                      value={fuel.location ?? "—"}
                    />
                  </View>

                  <View className="flex-1 gap-4">
                    <FieldDisplay
                      label="Quantity"
                      value={`${fuel.quantity} ${fuel.unit}`}
                    />
                    <FieldDisplay label="Unit" value={fuel.unit} />
                    <FieldDisplay label="Price" value={fuel.price ?? "—"} />
                    <FieldDisplay
                      label="Currency"
                      value={fuel.currency ?? "—"}
                    />
                  </View>
                </View>

                {/* Notes */}
                <View className="rounded-[18px] border border-border bg-baseBg/40 p-4">
                  <Text className="text-[12px] text-muted">Note</Text>
                  <Text className="text-[13px] text-textMain mt-1">
                    {fuel.note?.trim() ? fuel.note : "—"}
                  </Text>
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
              <Text className="text-muted text-[13px]">
                Placeholder: later you can compute consumption trends, bunker
                history, and cost per period here.
              </Text>
            </CardContent>
          </Card>
        </View>

        {/* Right column */}
        <View className="w-full web:lg:w-[380px] gap-5">
          <Card className="rounded-[24px] shadow-sm shadow-black/10 web:shadow-black/30">
            <CardHeaderRow>
              <CardTitle className="text-[16px] text-textMain">
                Evidence / Attachments (MVP)
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
                  Receipt / BDN (later)
                </Text>
                <Text className="text-muted text-[12px] mt-1">
                  Upload later
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
                Metadata
              </CardTitle>
            </CardHeaderRow>

            <CardContent className="px-6">
              <View className="gap-3">
                <FieldDisplay label="Asset ID" value={fuel.assetId} mono />
                <FieldDisplay
                  label="Created At"
                  value={formatDate(fuel.createdAt)}
                />
              </View>
            </CardContent>
          </Card>
        </View>
      </View>
    </View>
  );
}
