import { getBaseUrl } from "@/src/api/baseUrl";
import {
  Button,
  ConfirmModal,
  DocumentPreview,
  ErrorState,
  FieldDisplay,
  Loading,
  MiniPill,
  Text,
} from "@/src/components";
import {
  RegistryHeaderActionButton,
  RegistrySummaryStrip,
  RegistryWorkspaceHeader,
  RegistryWorkspaceSection,
  type RegistrySummaryItem,
} from "@/src/components/ui/registryWorkspace";
import { useSessionContext } from "@/src/context/SessionProvider";
import { useToast } from "@/src/context/ToastProvider";
import {
  CertificateStatusPill,
  RequirementStatusPill,
  WorkflowStatusPill,
} from "@/src/features/certificates/core";
import { formatDate } from "@/src/helpers";
import { canUser } from "@/src/security/rolePermissions";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Linking, Pressable, View } from "react-native";
import { useEffect, useMemo, useState } from "react";
import {
  useCrewCertificatesById,
  useCrewCertificateWorkflowActions,
} from "../../hooks";

function getCertificateTone(status: string): RegistrySummaryItem["tone"] {
  if (status === "EXPIRED") return "danger";
  if (status === "EXPIRING_SOON") return "warn";
  return "ok";
}

function getWorkflowTone(status: string): RegistrySummaryItem["tone"] {
  if (status === "REJECTED") return "danger";
  if (status === "SUBMITTED") return "warn";
  if (status === "APPROVED") return "ok";
  return "neutral";
}

export default function CrewCertificateViewScreen() {
  const router = useRouter();
  const { show } = useToast();
  const { session } = useSessionContext();
  const { projectId, assetId, crewId, certificateId } = useLocalSearchParams<{
    projectId: string;
    assetId: string;
    crewId: string;
    certificateId: string;
  }>();

  const pid = String(projectId);
  const aid = String(assetId);
  const cid = String(crewId);
  const certId = String(certificateId);
  const canApproveCertificates = canUser(session, "CERTIFICATE_APPROVE");
  const canSoftDelete = canUser(session, "OPERATIONAL_SOFT_DELETE");
  const canUploadDocuments = canUser(session, "DOCUMENT_UPLOAD");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState<{
    id: string;
    fileName: string;
  } | null>(null);
  const [selectedAttachmentId, setSelectedAttachmentId] = useState<string | null>(
    null,
  );

  const { certificate, loading, error, refresh } = useCrewCertificatesById(
    pid,
    aid,
    cid,
    certId,
  );
  const {
    approveCertificate,
    rejectCertificate,
    deleteAttachment,
    deleteCertificate,
    loading: workflowLoading,
  } = useCrewCertificateWorkflowActions(pid, aid, cid, certId);

  const attachments = useMemo(() => certificate?.attachments ?? [], [certificate]);
  const summaryItems = useMemo<RegistrySummaryItem[]>(() => {
    if (!certificate) return [];

    return [
      {
        label: "Certificate",
        value: certificate.status,
        helper: certificate.expiryDate
          ? `expires ${formatDate(certificate.expiryDate)}`
          : "expiry not set",
        tone: getCertificateTone(certificate.status),
      },
      {
        label: "Workflow",
        value: certificate.workflowStatus,
        helper:
          certificate.workflowStatus === "APPROVED"
            ? "ready for compliance reads"
            : "still needs workflow attention",
        tone: getWorkflowTone(certificate.workflowStatus),
      },
      {
        label: "Attachments",
        value: String(certificate.attachmentCount),
        helper: certificate.attachmentCount === 1 ? "file attached" : "files attached",
        tone: certificate.attachmentCount > 0 ? "accent" : "neutral",
      },
      {
        label: "Requirement",
        value: certificate.requirementStatus ?? "Extra",
        helper: certificate.requirementStatus
          ? "linked to structured requirement"
          : "outside the active requirement set",
        tone: certificate.requirementStatus ? "info" : "neutral",
      },
    ];
  }, [certificate]);

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

  function goCrewCertificates() {
    router.push(`/projects/${pid}/vessels/${aid}/crew/${cid}/certificates`);
  }

  function goCrew() {
    router.push(`/projects/${pid}/vessels/${aid}/crew/${cid}`);
  }

  async function openAttachment(url: string) {
    const absoluteUrl = url.startsWith("http") ? url : `${getBaseUrl()}${url}`;
    await Linking.openURL(absoluteUrl);
  }

  function toAbsoluteUrl(url: string) {
    return url.startsWith("http") ? url : `${getBaseUrl()}${url}`;
  }

  async function onApprove() {
    try {
      await approveCertificate();
      show("Crew certificate approved", "success");
      refresh();
    } catch {
      show("Failed to approve crew certificate", "error");
    }
  }

  async function onReject() {
    try {
      await rejectCertificate();
      show("Crew certificate sent back for correction", "success");
      refresh();
    } catch {
      show("Failed to reject crew certificate", "error");
    }
  }

  async function onDeleteAttachment(attachmentId: string) {
    try {
      await deleteAttachment(attachmentId);
      setAttachmentToDelete(null);
      show("Attachment deleted", "success");
      refresh();
    } catch {
      show("Failed to delete attachment", "error");
    }
  }

  async function onDeleteCertificate() {
    try {
      await deleteCertificate();
      setIsDeleteOpen(false);
      show("Crew certificate deleted", "success");
      router.replace(`/projects/${pid}/vessels/${aid}/crew/${cid}/certificates`);
    } catch {
      show("Failed to delete crew certificate", "error");
    }
  }

  if (loading) return <Loading fullScreen />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;
  if (!certificate) {
    return <ErrorState message="Crew certificate not found." onRetry={refresh} />;
  }

  return (
    <View className="gap-5 p-4 web:p-6">
      <View className="gap-4">
        <RegistryWorkspaceHeader
          title="Certificate Record"
          eyebrow="Crew certificates lane"
          subtitle={`Review metadata, uploaded evidence, and workflow state for ${certificate.certificateName} under ${certificate.crewMemberName}.`}
          actions={
            <>
              <RegistryHeaderActionButton
                variant="soft"
                iconName="chevron-back-outline"
                iconSide="left"
                onPress={goCrewCertificates}
              >
                Certificates
              </RegistryHeaderActionButton>

              <RegistryHeaderActionButton
                variant="soft"
                iconName="refresh-outline"
                onPress={refresh}
              >
                Refresh
              </RegistryHeaderActionButton>

              {canUploadDocuments ? (
                <RegistryHeaderActionButton
                  variant="outline"
                  onPress={() =>
                    router.push({
                      pathname: "/projects/[projectId]/crew/certificates/upload",
                      params: {
                        projectId: pid,
                        assetId: aid,
                        crewId: cid,
                        certificateTypeId: certificate.certificateTypeId,
                      },
                    })
                  }
                >
                  Upload new version
                </RegistryHeaderActionButton>
              ) : null}

              {canApproveCertificates &&
              certificate.workflowStatus !== "APPROVED" &&
              certificate.workflowStatus !== "ARCHIVED" ? (
                <RegistryHeaderActionButton
                  variant="default"
                  onPress={onApprove}
                  loading={workflowLoading}
                >
                  Approve
                </RegistryHeaderActionButton>
              ) : null}

              {canSoftDelete ? (
                <Button
                  variant="softDestructive"
                  size="pillSm"
                  onPress={() => setIsDeleteOpen(true)}
                  loading={workflowLoading}
                  className="rounded-full"
                  rightIcon={
                    <Ionicons
                      name="trash-outline"
                      size={15}
                      className="text-destructive"
                    />
                  }
                >
                  Delete
                </Button>
              ) : null}
            </>
          }
        />

        <RegistrySummaryStrip items={summaryItems} />
      </View>

      <View className="gap-5 web:xl:flex-row web:xl:items-start">
        <View className="flex-1 gap-5">
          <RegistryWorkspaceSection
            title="Certificate details"
            subtitle="Core certificate metadata, requirement linkage, and approval trace for this record."
            actions={
              <View className="flex-row flex-wrap gap-2">
                <CertificateStatusPill status={certificate.status} />
                <WorkflowStatusPill status={certificate.workflowStatus} />
              </View>
            }
          >
            <View className="gap-4">
              <View className="gap-2">
                <Text className="text-textMain text-[22px] font-semibold">
                  {certificate.certificateName}
                </Text>

                <View className="flex-row flex-wrap gap-2">
                  <MiniPill>{`Code: ${certificate.certificateCode}`}</MiniPill>
                  <MiniPill>{`Crew: ${certificate.crewMemberName}`}</MiniPill>
                  <MiniPill>{`Vessel: ${certificate.assetName}`}</MiniPill>
                  <MiniPill>
                    {`Approved by: ${certificate.approvedByUserName ?? "Pending review"}`}
                  </MiniPill>
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
                    value={<WorkflowStatusPill status={certificate.workflowStatus} />}
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
                <Text className="mt-1 text-[13px] text-textMain">
                  {certificate.notes ?? "-"}
                </Text>
              </View>
            </View>
          </RegistryWorkspaceSection>

          <RegistryWorkspaceSection
            title="Attachments"
            subtitle="Choose the current file for preview, open the original asset, or remove obsolete evidence."
          >
            {certificate.attachments.length === 0 ? (
              <Text className="text-[13px] text-textMain">
                No files uploaded yet.
              </Text>
            ) : (
              <View className="gap-3">
                {certificate.attachments.map((attachment) => (
                  <View
                    key={attachment.id}
                    className="gap-2 rounded-[16px] border border-shellLine bg-shellPanelSoft p-3"
                  >
                    <Text className="text-[13px] font-semibold text-textMain">
                      {attachment.fileName}
                    </Text>
                    <Text className="text-[12px] text-muted">
                      {attachment.mimeType} | version {attachment.version}
                    </Text>
                    <Text className="text-[12px] text-muted">
                      Uploaded {formatDate(attachment.uploadedAt)}
                    </Text>

                    <View className="flex-row flex-wrap gap-2">
                      <Button
                        variant={
                          selectedAttachment?.id === attachment.id
                            ? "default"
                            : "outline"
                        }
                        size="pillXs"
                        onPress={() => setSelectedAttachmentId(attachment.id)}
                        className="rounded-full"
                      >
                        Preview
                      </Button>

                      <Button
                        variant="softAccent"
                        size="pillXs"
                        onPress={() => openAttachment(attachment.url)}
                        className="rounded-full"
                      >
                        Open file
                      </Button>

                      {canSoftDelete ? (
                        <Button
                          variant="softDestructive"
                          size="pillXs"
                          onPress={() =>
                            setAttachmentToDelete({
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
                ))}
              </View>
            )}
          </RegistryWorkspaceSection>
        </View>

        <View className="w-full gap-5 web:xl:w-[380px]">
          <RegistryWorkspaceSection
            title="Compliance summary"
            subtitle="Quick read of where this certificate sits in the crew compliance flow."
          >
            <View className="gap-4">
              <FieldDisplay
                label="Crew Member"
                value={
                  <Pressable onPress={goCrew}>
                    <Text className="font-semibold text-accent">
                      {certificate.crewMemberName}
                    </Text>
                  </Pressable>
                }
              />
              <FieldDisplay label="Rank" value={certificate.crewRank ?? "-"} />
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
                  size="pillXs"
                  onPress={onReject}
                  loading={workflowLoading}
                  className="self-start rounded-full"
                >
                  Send back
                </Button>
              ) : null}
            </View>
          </RegistryWorkspaceSection>

          <RegistryWorkspaceSection
            title="Certificate preview"
            subtitle="Preview the currently selected attachment without leaving this lane."
          >
            {selectedAttachment ? (
              <View className="gap-4">
                <View className="flex-row flex-wrap gap-2">
                  <MiniPill>{selectedAttachment.fileName}</MiniPill>
                  <MiniPill>{selectedAttachment.mimeType}</MiniPill>
                  <MiniPill>{`Version ${selectedAttachment.version}`}</MiniPill>
                </View>

                <DocumentPreview
                  attachmentUrl={toAbsoluteUrl(selectedAttachment.url)}
                  mimeType={selectedAttachment.mimeType}
                />

                <Button
                  variant="softAccent"
                  size="pillXs"
                  onPress={() => openAttachment(selectedAttachment.url)}
                  className="self-start rounded-full"
                >
                  Open original
                </Button>
              </View>
            ) : (
              <Text className="text-[13px] text-textMain">
                Upload at least one file to preview the certificate here.
              </Text>
            )}
          </RegistryWorkspaceSection>
        </View>
      </View>

      <ConfirmModal
        visible={isDeleteOpen}
        title="Delete crew certificate"
        message={`Are you sure you want to delete ${certificate.certificateName}?`}
        confirmLabel="Delete certificate"
        cancelLabel="Keep certificate"
        variant="destructive"
        loading={workflowLoading}
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={onDeleteCertificate}
      />

      <ConfirmModal
        visible={Boolean(attachmentToDelete)}
        title="Delete file"
        message={`Are you sure you want to delete ${attachmentToDelete?.fileName ?? "this file"}?`}
        confirmLabel="Delete file"
        cancelLabel="Keep file"
        variant="destructive"
        loading={workflowLoading}
        onCancel={() => setAttachmentToDelete(null)}
        onConfirm={() =>
          attachmentToDelete
            ? onDeleteAttachment(attachmentToDelete.id)
            : undefined
        }
      />
    </View>
  );
}
