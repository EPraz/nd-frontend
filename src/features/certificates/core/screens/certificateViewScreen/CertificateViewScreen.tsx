import { getBaseUrl } from "@/src/api/baseUrl";
import { Button } from "@/src/components/ui/button/Button";
import {
  Card,
  CardContent,
  CardHeaderRow,
  CardTitle,
} from "@/src/components/ui/card/Card";
import { DocumentPreview } from "@/src/components/ui/documentPreview/DocumentPreview";
import ErrorState from "@/src/components/ui/errorState/ErrorState";
import { FieldDisplay } from "@/src/components/ui/forms/FieldDisplay";
import Loading from "@/src/components/ui/loading/Loading";
import { ConfirmModal } from "@/src/components/ui/modal/ConfirmModal";
import { Text } from "@/src/components/ui/text/Text";
import { useSessionContext } from "@/src/context/SessionProvider";
import { useToast } from "@/src/context/ToastProvider";
import { formatDate } from "@/src/helpers";
import { canUser } from "@/src/security/rolePermissions";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Linking, Pressable, View } from "react-native";
import {
  CertificateStatusPill,
  RequirementStatusPill,
  WorkflowStatusPill,
} from "@/src/features/certificates/core/components/certificateTable/certificates.ui";
import { useCertificatesById } from "@/src/features/certificates/core/hooks/useCertificatesById";
import { useCertificateWorkflowActions } from "@/src/features/certificates/ingestion";

type DetailTagTone = "accent" | "info" | "ok" | "warn";

function detailTagClasses(tone: DetailTagTone) {
  switch (tone) {
    case "ok":
      return "border-emerald-400/25 bg-emerald-400/10 text-emerald-100";
    case "warn":
      return "border-amber-300/30 bg-amber-300/12 text-amber-100";
    case "info":
      return "border-sky-400/25 bg-sky-400/10 text-sky-100";
    case "accent":
    default:
      return "border-accent/35 bg-accent/14 text-accent";
  }
}

function DetailTag({
  label,
  tone,
}: {
  label: string;
  tone: DetailTagTone;
}) {
  return (
    <View
      className={[
        "rounded-full border px-3 py-1.5",
        detailTagClasses(tone),
      ].join(" ")}
    >
      <Text className="text-[11px] font-medium">{label}</Text>
    </View>
  );
}

export default function CertificateViewScreen() {
  const router = useRouter();
  const { show } = useToast();
  const { session } = useSessionContext();
  const { projectId, assetId, certificateId } = useLocalSearchParams<{
    projectId: string;
    assetId: string;
    certificateId: string;
  }>();

  const pid = String(projectId);
  const vid = String(assetId);
  const cid = String(certificateId);
  const canApproveCertificates = canUser(session, "CERTIFICATE_APPROVE");
  const canSoftDelete = canUser(session, "OPERATIONAL_SOFT_DELETE");

  const { certificate, loading, error, refresh } = useCertificatesById(
    pid,
    vid,
    cid,
  );
  const {
    approve,
    reject,
    removeAttachment,
    removeCertificate,
    loading: workflowLoading,
  } = useCertificateWorkflowActions(pid, vid, cid);

  const goBack = () => router.back();
  const goVessel = () => router.push(`/projects/${pid}/vessels/${vid}`);
  const listHref = `/projects/${pid}/vessels/${vid}/certificates`;

  const [selectedAttachmentId, setSelectedAttachmentId] = useState<string | null>(
    null,
  );
  const [isDeleteCertificateOpen, setIsDeleteCertificateOpen] = useState(false);
  const [attachmentPendingDelete, setAttachmentPendingDelete] = useState<{
    id: string;
    fileName: string;
  } | null>(null);

  const attachments = useMemo(() => certificate?.attachments ?? [], [certificate]);

  useEffect(() => {
    if (!certificate) return;

    if (certificate.attachments.length === 0) {
      setSelectedAttachmentId(null);
      return;
    }

    setSelectedAttachmentId((current) => {
      if (current && certificate.attachments.some((item) => item.id === current)) {
        return current;
      }

      return certificate.attachments[0]?.id ?? null;
    });
  }, [certificate]);

  const selectedAttachment = useMemo(
    () =>
      attachments.find((attachment) => attachment.id === selectedAttachmentId) ??
      attachments[0] ??
      null,
    [attachments, selectedAttachmentId],
  );

  async function openAttachment(url: string) {
    const absoluteUrl = url.startsWith("http") ? url : `${getBaseUrl()}${url}`;
    await Linking.openURL(absoluteUrl);
  }

  function toAbsoluteUrl(url: string) {
    return url.startsWith("http") ? url : `${getBaseUrl()}${url}`;
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

  async function onConfirmDeleteCertificate() {
    if (!certificate) return;

    try {
      await removeCertificate();
      setIsDeleteCertificateOpen(false);
      show("Certificate deleted", "success");
      router.replace(listHref);
    } catch {
      show("Failed to delete certificate", "error");
    }
  }

  async function onConfirmDeleteAttachment() {
    if (!attachmentPendingDelete) return;

    try {
      await removeAttachment(attachmentPendingDelete.id);
      setAttachmentPendingDelete(null);
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

  const approvalTagLabel = certificate.approvedByUserName
    ? `Approved by: ${certificate.approvedByUserName}`
    : "Approved by: Pending review";

  return (
    <>
      <View className="flex-1 p-4 web:p-6 gap-5">
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

              {canSoftDelete ? (
                <Button
                  variant="softDestructive"
                  size="pill"
                  onPress={() => setIsDeleteCertificateOpen(true)}
                  className="rounded-full"
                  rightIcon={
                    <Ionicons
                      name="trash-outline"
                      size={16}
                      className="text-destructive"
                    />
                  }
                >
                  Delete
                </Button>
              ) : null}

              {canApproveCertificates &&
              certificate.workflowStatus !== "APPROVED" &&
              certificate.workflowStatus !== "ARCHIVED" ? (
                <Button
                  variant="default"
                  size="pill"
                  onPress={onApprove}
                  loading={workflowLoading}
                  className="rounded-full"
                  rightIcon={
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={16}
                      className="text-textMain"
                    />
                  }
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
                      <DetailTag
                        label={`Code: ${certificate.certificateCode}`}
                        tone="accent"
                      />
                      <DetailTag
                        label={`Vessel: ${certificate.assetName}`}
                        tone="info"
                      />
                      <DetailTag
                        label={approvalTagLabel}
                        tone={certificate.approvedByUserName ? "ok" : "warn"}
                      />
                      <DetailTag
                        label={`Attachments: ${certificate.attachmentCount}`}
                        tone="info"
                      />
                    </View>
                  </View>

                  <View className="gap-4 web:flex-row">
                    <View className="flex-1 gap-4">
                      <FieldDisplay label="Number" value={certificate.number ?? "-"} />
                      <FieldDisplay label="Issuer" value={certificate.issuer ?? "-"} />
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
                          <WorkflowStatusPill status={certificate.workflowStatus} />
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

                  <View className="rounded-[18px] border border-shellLine bg-shellPanelSoft p-4">
                    <Text className="text-[12px] text-muted">Notes</Text>
                    <Text className="text-[13px] text-textMain mt-1">
                      {certificate.notes ?? "-"}
                    </Text>
                  </View>

                  <View className="rounded-[18px] border border-shellLine bg-shellPanelSoft p-4 gap-3">
                    <Text className="text-[12px] text-muted">Attachments</Text>
                    {attachments.length === 0 ? (
                      <Text className="text-[13px] text-textMain">
                        No files uploaded yet.
                      </Text>
                    ) : (
                      attachments.map((attachment) => (
                        <View
                          key={attachment.id}
                          className="rounded-[16px] border border-shellLine bg-shellPanelSoft p-3 gap-2"
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

                          <View className="flex-row flex-wrap gap-2">
                            <Button
                              variant={
                                selectedAttachment?.id === attachment.id
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onPress={() => setSelectedAttachmentId(attachment.id)}
                              className="rounded-full"
                            >
                              Preview
                            </Button>
                            <Button
                              variant="softAccent"
                              size="sm"
                              onPress={() => openAttachment(attachment.url)}
                              className="rounded-full"
                            >
                              Open original
                            </Button>
                            {canSoftDelete ? (
                              <Button
                                variant="softDestructive"
                                size="sm"
                                onPress={() =>
                                  setAttachmentPendingDelete({
                                    id: attachment.id,
                                    fileName: attachment.fileName,
                                  })
                                }
                                loading={workflowLoading}
                                className="rounded-full"
                              >
                                Delete file
                              </Button>
                            ) : null}
                          </View>
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
                  {canApproveCertificates &&
                  certificate.workflowStatus === "SUBMITTED" ? (
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

            <Card className="rounded-[24px] shadow-sm shadow-black/10 web:shadow-black/30">
              <CardHeaderRow>
                <CardTitle className="text-[16px] text-textMain">
                  Certificate Preview
                </CardTitle>
              </CardHeaderRow>
              <CardContent className="px-6">
                {selectedAttachment ? (
                  <View className="gap-4">
                    <View className="flex-row flex-wrap gap-2">
                      <DetailTag
                        label={selectedAttachment.fileName}
                        tone="accent"
                      />
                      <DetailTag
                        label={selectedAttachment.mimeType}
                        tone="info"
                      />
                      <DetailTag
                        label={`Version ${selectedAttachment.version}`}
                        tone="ok"
                      />
                    </View>

                    <DocumentPreview
                      attachmentUrl={toAbsoluteUrl(selectedAttachment.url)}
                      mimeType={selectedAttachment.mimeType}
                    />

                    <Button
                      variant="softAccent"
                      size="sm"
                      onPress={() => openAttachment(selectedAttachment.url)}
                      className="rounded-full self-start"
                    >
                      Open original
                    </Button>
                  </View>
                ) : (
                  <Text className="text-[13px] text-textMain">
                    Upload at least one file to preview the certificate here.
                  </Text>
                )}
              </CardContent>
            </Card>
          </View>
        </View>
      </View>

      <ConfirmModal
        visible={isDeleteCertificateOpen}
        title="Delete certificate"
        message={`Are you sure you want to delete ${certificate.certificateName}?`}
        confirmLabel="Delete certificate"
        cancelLabel="Keep certificate"
        variant="destructive"
        loading={workflowLoading}
        onCancel={() => setIsDeleteCertificateOpen(false)}
        onConfirm={onConfirmDeleteCertificate}
      />

      <ConfirmModal
        visible={Boolean(attachmentPendingDelete)}
        title="Delete file"
        message={
          attachmentPendingDelete
            ? `Are you sure you want to delete ${attachmentPendingDelete.fileName}?`
            : ""
        }
        confirmLabel="Delete file"
        cancelLabel="Keep file"
        variant="destructive"
        loading={workflowLoading}
        onCancel={() => setAttachmentPendingDelete(null)}
        onConfirm={onConfirmDeleteAttachment}
      />
    </>
  );
}

