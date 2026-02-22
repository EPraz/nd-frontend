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
import { CertificateStatusPill } from "../../components";
import { useCertificatesById } from "../../hooks";

export default function CertificateViewScreen() {
  const router = useRouter();
  const { projectId, assetId, certificateId } = useLocalSearchParams<{
    projectId: string;
    assetId: string;
    certificateId: string;
  }>();

  const pid = String(projectId);
  const vid = String(assetId);
  const cid = String(certificateId);

  const { certificate, loading, error, refresh } = useCertificatesById(
    pid,
    vid,
    cid,
  );

  const goBack = () => router.back();
  const goEdit = () =>
    router.push(`/projects/${pid}/vessels/${vid}/certificates/${cid}/edit`);
  const goVessel = () => router.push(`/projects/${pid}/vessels/${vid}`);

  const handleDelete = () => {
    // TODO: confirm dialog + delete endpoint
  };

  if (loading) return <Loading fullScreen />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;
  if (!certificate)
    return <ErrorState message="Certificate not found." onRetry={refresh} />;

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
              Certificate - {certificate.name}
            </Text>
            <Text className="text-muted text-[14px]">
              View certificate details, compliance status and attachments.
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
                Certificate Details
              </CardTitle>
              <CertificateStatusPill status={certificate.status} />
            </CardHeaderRow>

            <CardContent className="px-6">
              <View className="gap-4">
                {/* Top row */}
                <View className="gap-2">
                  <Text className="text-textMain text-[22px] font-semibold">
                    {certificate.name}
                  </Text>

                  <View className="flex-row flex-wrap gap-2">
                    <MiniPill>
                      ID:{" "}
                      <Text className="text-textMain font-semibold">
                        {certificate.id}
                      </Text>
                    </MiniPill>

                    <Pressable
                      onPress={goVessel}
                      className="web:rounded-full web:hover:bg-accent/10"
                    >
                      <MiniPill>
                        Vessel:{" "}
                        <Text className="text-textMain font-semibold">
                          {certificate.assetName ?? certificate.assetId}
                        </Text>
                      </MiniPill>
                    </Pressable>
                  </View>
                </View>

                {/* Fields grid */}
                <View className="gap-4 web:flex-row">
                  <View className="flex-1 gap-4">
                    <FieldDisplay
                      label="Number"
                      value={certificate.number ?? "—"}
                    />
                    <FieldDisplay
                      label="Issuer"
                      value={certificate.issuer ?? "—"}
                    />
                    <FieldDisplay
                      label="Issue Date"
                      value={formatDate(certificate.issueDate)}
                    />
                  </View>

                  <View className="flex-1 gap-4">
                    <FieldDisplay
                      label="Expiry Date"
                      value={formatDate(certificate.expiryDate)}
                    />
                    <FieldDisplay
                      label="Status"
                      value={
                        <CertificateStatusPill status={certificate.status} />
                      }
                    />
                    <FieldDisplay
                      label="Created At"
                      value={formatDate(certificate.createdAt)}
                    />
                  </View>
                </View>

                {/* Notes placeholder */}
                <View className="rounded-[18px] border border-border bg-baseBg/40 p-4">
                  <Text className="text-[12px] text-muted">Notes (MVP)</Text>
                  <Text className="text-[13px] text-textMain mt-1">
                    — (add notes/description later)
                  </Text>
                </View>
              </View>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] shadow-sm shadow-black/10 web:shadow-black/30">
            <CardHeaderRow>
              <CardTitle className="text-[16px] text-textMain">
                Renewal / Activity (MVP)
              </CardTitle>
            </CardHeaderRow>
            <CardContent className="px-6">
              <Text className="text-muted text-[13px]">
                Placeholder: later you can show renewal history, related work
                orders, or audit events here.
              </Text>
            </CardContent>
          </Card>
        </View>

        {/* Right column */}
        <View className="w-full web:lg:w-[380px] gap-5">
          <Card className="rounded-[24px] shadow-sm shadow-black/10 web:shadow-black/30">
            <CardHeaderRow>
              <CardTitle className="text-[16px] text-textMain">
                Attachment Preview
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
                  PDF / Image Here
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
                Compliance Summary
              </CardTitle>
            </CardHeaderRow>
            <CardContent className="px-6">
              <View className="gap-4">
                <View className="rounded-[18px] border border-border bg-baseBg/40 p-4">
                  <Text className="text-muted text-[12px]">Risk</Text>
                  <Text className="text-textMain text-[26px] font-semibold">
                    {certificate.status === "EXPIRED"
                      ? "CRITICAL"
                      : certificate.status === "EXPIRING_SOON"
                        ? "ATTN"
                        : "OK"}
                  </Text>
                  <Text className="text-muted text-[12px] mt-1">
                    Based on status (MVP)
                  </Text>
                </View>

                <View className="gap-3">
                  <FieldDisplay
                    label="Next action"
                    value="Renew / Request docs (later)"
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
