import { getBaseUrl } from "@/src/api/baseUrl";
import {
  Button,
  Card,
  CardContent,
  CardHeaderRow,
  CardTitle,
  ErrorState,
  FieldDisplay,
  Loading,
  MiniPill,
  Text,
} from "@/src/components";
import { useToast } from "@/src/context";
import { formatDate } from "@/src/helpers";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Linking, Pressable, View } from "react-native";
import {
  CertificateStatusPill,
  RequirementStatusPill,
  WorkflowStatusPill,
} from "../../components/certificateTable/certificates.ui";
import {
  useCertificateWorkflowActions,
  useCertificatesById,
} from "../../hooks";

export default function CertificateViewScreen() {
  const router = useRouter();
  const { show } = useToast();
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
  const {
    approve,
    reject,
    removeAttachment,
    loading: workflowLoading,
  } = useCertificateWorkflowActions(pid, vid, cid);

  const goBack = () => router.back();
  const goEdit = () =>
    router.push(`/projects/${pid}/vessels/${vid}/certificates/${cid}/edit`);
  const goVessel = () => router.push(`/projects/${pid}/vessels/${vid}`);

  async function openAttachment(url: string) {
    const absoluteUrl = url.startsWith("http") ? url : `${getBaseUrl()}${url}`;
    await Linking.openURL(absoluteUrl);
  }

  async function onApprove() {
    try {
      await approve();
      show("Certificate approved", "success");
      refresh();
    } catch {
      show("Failed to approve certificate", "error");
    }
  }

  async function onReject() {
    try {
      await reject();
      show("Certificate sent back for correction", "success");
      refresh();
    } catch {
      show("Failed to reject certificate", "error");
    }
  }

  async function onDeleteAttachment(attachmentId: string) {
    try {
      await removeAttachment(attachmentId);
      show("Attachment deleted", "success");
      refresh();
    } catch {
      show("Failed to delete attachment", "error");
    }
  }

  if (loading) return <Loading fullScreen />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;
  if (!certificate)
    return <ErrorState message="Certificate not found." onRetry={refresh} />;

  return (
    <View className="flex-1 bg-baseBg p-4 web:p-6 gap-5">
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
              Certificate - {certificate.certificateName}
            </Text>
            <Text className="text-muted text-[14px]">
              Review the metadata, attached evidence, and approval state for
              this vessel certificate.
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
              Edit metadata
            </Button>

            {certificate.workflowStatus !== "APPROVED" &&
            certificate.workflowStatus !== "ARCHIVED" ? (
              <Button
                variant="outline"
                size="lg"
                onPress={onApprove}
                loading={workflowLoading}
                className="rounded-full"
              >
                Approve
              </Button>
            ) : null}
          </View>
        </View>
      </View>

      <View className="gap-5 web:lg:flex-row">
        <View className="flex-1 gap-5">
          <Card className="rounded-[24px] shadow-sm shadow-black/10 web:shadow-black/30">
            <CardHeaderRow>
              <CardTitle className="text-[16px] text-textMain">
                Certificate Details
              </CardTitle>
              <View className="flex-row gap-2 flex-wrap">
                <CertificateStatusPill status={certificate.status} />
                <WorkflowStatusPill status={certificate.workflowStatus} />
              </View>
            </CardHeaderRow>

            <CardContent className="px-6">
              <View className="gap-4">
                <View className="gap-2">
                  <Text className="text-textMain text-[22px] font-semibold">
                    {certificate.certificateName}
                  </Text>

                  <View className="flex-row flex-wrap gap-2">
                    <MiniPill>{`Code: ${certificate.certificateCode}`}</MiniPill>
                    <MiniPill>{`Vessel: ${certificate.assetName}`}</MiniPill>
                    <MiniPill>
                      {`Approved by: ${certificate.approvedByUserName ?? "Pending review"}`}
                    </MiniPill>
                    <MiniPill>{`Attachments: ${certificate.attachmentCount}`}</MiniPill>
                  </View>
                </View>

                <View className="gap-4 web:flex-row">
                  <View className="flex-1 gap-4">
                    <FieldDisplay
                      label="Number"
                      value={certificate.number ?? "-"}
                    />
                    <FieldDisplay
                      label="Issuer"
                      value={certificate.issuer ?? "-"}
                    />
                    <FieldDisplay
                      label="Issue Date"
                      value={formatDate(certificate.issueDate)}
                    />
                    <FieldDisplay
                      label="Expiry Date"
                      value={formatDate(certificate.expiryDate)}
                    />
                  </View>

                  <View className="flex-1 gap-4">
                    <FieldDisplay
                      label="Requirement"
                      value={
                        <RequirementStatusPill
                          status={certificate.requirementStatus ?? null}
                        />
                      }
                    />
                    <FieldDisplay
                      label="Workflow"
                      value={
                        <WorkflowStatusPill
                          status={certificate.workflowStatus}
                        />
                      }
                    />
                    <FieldDisplay
                      label="Approved At"
                      value={formatDate(certificate.approvedAt)}
                    />
                    <FieldDisplay
                      label="Updated At"
                      value={formatDate(certificate.updatedAt)}
                    />
                  </View>
                </View>

                <View className="rounded-[18px] border border-border bg-baseBg/40 p-4">
                  <Text className="text-[12px] text-muted">Notes</Text>
                  <Text className="text-[13px] text-textMain mt-1">
                    {certificate.notes ?? "-"}
                  </Text>
                </View>

                <View className="rounded-[18px] border border-border bg-baseBg/40 p-4 gap-3">
                  <Text className="text-[12px] text-muted">Attachments</Text>
                  {certificate.attachments.length === 0 ? (
                    <Text className="text-[13px] text-textMain">
                      No files uploaded yet.
                    </Text>
                  ) : (
                    certificate.attachments.map((attachment) => (
                      <View
                        key={attachment.id}
                        className="rounded-[16px] border border-border bg-baseBg/30 p-3 gap-2"
                      >
                        <Text className="text-textMain font-semibold text-[13px]">
                          {attachment.fileName}
                        </Text>
                        <Text className="text-muted text-[12px]">
                          {attachment.mimeType} - version {attachment.version}
                        </Text>
                        <Text className="text-muted text-[12px]">
                          Uploaded {formatDate(attachment.uploadedAt)}
                        </Text>
                        <Button
                          variant="softAccent"
                          size="sm"
                          onPress={() => openAttachment(attachment.url)}
                          className="rounded-full self-start"
                        >
                          Open file
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onPress={() => onDeleteAttachment(attachment.id)}
                          loading={workflowLoading}
                          className="rounded-full self-start"
                        >
                          Delete file
                        </Button>
                      </View>
                    ))
                  )}
                </View>
              </View>
            </CardContent>
          </Card>
        </View>

        <View className="w-full web:lg:w-[380px] gap-5">
          <Card className="rounded-[24px] shadow-sm shadow-black/10 web:shadow-black/30">
            <CardHeaderRow>
              <CardTitle className="text-[16px] text-textMain">
                Compliance Summary
              </CardTitle>
            </CardHeaderRow>
            <CardContent className="px-6">
              <View className="gap-4">
                <FieldDisplay
                  label="Vessel"
                  value={
                    <Pressable onPress={goVessel}>
                      <Text className="text-accent font-semibold">
                        {certificate.assetName}
                      </Text>
                    </Pressable>
                  }
                />
                <FieldDisplay
                  label="Risk"
                  value={
                    certificate.status === "EXPIRED"
                      ? "CRITICAL"
                      : certificate.status === "EXPIRING_SOON"
                        ? "ATTN"
                      : "OK"
                  }
                />
                <FieldDisplay
                  label="Approved By"
                  value={certificate.approvedByUserName ?? "-"}
                />
                <FieldDisplay
                  label="Next step"
                  value={
                    certificate.workflowStatus === "APPROVED"
                      ? "Certificate approved"
                      : certificate.workflowStatus === "REJECTED"
                        ? "Correct metadata, then approve again"
                        : certificate.workflowStatus === "ARCHIVED"
                          ? "Historical record only"
                          : "Review metadata and approve"
                  }
                />
                {certificate.workflowStatus === "SUBMITTED" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={onReject}
                    loading={workflowLoading}
                    className="rounded-full self-start"
                  >
                    Send back
                  </Button>
                ) : null}
              </View>
            </CardContent>
          </Card>
        </View>
      </View>
    </View>
  );
}
