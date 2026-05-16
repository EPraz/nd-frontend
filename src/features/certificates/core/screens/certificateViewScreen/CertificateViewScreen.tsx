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
import { DateField } from "@/src/components/ui/forms/DateField";
import { FieldDisplay } from "@/src/components/ui/forms/FieldDisplay";
import { Field } from "@/src/components/ui/forms/Field";
import Loading from "@/src/components/ui/loading/Loading";
import { ConfirmModal } from "@/src/components/ui/modal/ConfirmModal";
import { Text } from "@/src/components/ui/text/Text";
import { useSessionContext } from "@/src/context/SessionProvider";
import { useToast } from "@/src/context/ToastProvider";
import { formatDate, isIsoDateOnly } from "@/src/helpers";
import { canUser } from "@/src/security/rolePermissions";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Linking, Modal, Pressable, View } from "react-native";
import { useForm } from "react-hook-form";
import {
  CertificateStatusPill,
  DocumentKindPill,
  ExpiryRequirementPill,
  RequirementStatusPill,
  WorkflowStatusPill,
} from "@/src/features/certificates/core/components/certificateTable/certificates.ui";
import { useCertificatesById } from "@/src/features/certificates/core/hooks/useCertificatesById";
import { useCertificateWorkflowActions } from "@/src/features/certificates/ingestion";
import {
  certificateActionErrorMessage,
  documentKindLabel,
  expiryDisplay,
  certificateMetadataFormFromCertificate,
  type CertificateMetadataFormValues,
  parentCertificateBlockingReason,
  parentCertificateStatusSummary,
  sourceReferenceLabel,
  toUpdateCertificateInput,
} from "@/src/features/certificates/shared";

type DetailTagTone = "accent" | "info" | "ok" | "warn";

const pendingReplacementMessage =
  "Review or cancel the pending replacement evidence before resubmitting this document record.";
const pendingReplacementDeleteMessage =
  "Review or cancel the pending replacement evidence before deleting this document record.";

function detailTagClasses(tone: DetailTagTone) {
  switch (tone) {
    case "ok":
      return "border-success/35 bg-success/12 text-success";
    case "warn":
      return "border-warning/35 bg-warning/12 text-warning";
    case "info":
      return "border-info/35 bg-info/12 text-info";
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
  const canUpdateOperationalRecords = canUser(session, "OPERATIONAL_WRITE");
  const canUploadDocuments = canUser(session, "DOCUMENT_UPLOAD");
  const canSoftDelete = canUser(session, "OPERATIONAL_SOFT_DELETE");

  const { certificate, loading, error, refresh } = useCertificatesById(
    pid,
    vid,
    cid,
  );
  const {
    approve,
    reject,
    saveMetadata,
    resubmit,
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
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionReasonError, setRejectionReasonError] = useState<string | null>(null);
  const [correctionError, setCorrectionError] = useState<string | null>(null);
  const [attachmentPendingDelete, setAttachmentPendingDelete] = useState<{
    id: string;
    fileName: string;
  } | null>(null);
  const { handleSubmit, reset, setValue, watch } =
    useForm<CertificateMetadataFormValues>({
      defaultValues: {
        number: "",
        issuer: "",
        issueDate: "",
        expiryDate: "",
        notes: "",
      },
    });
  const correctionValues = watch();

  const attachments = useMemo(() => certificate?.attachments ?? [], [certificate]);

  useEffect(() => {
    if (!certificate) return;
    reset(certificateMetadataFormFromCertificate(certificate));

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
  }, [certificate, reset]);

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
    } catch (error) {
      show(
        certificateActionErrorMessage(error, "Failed to approve certificate"),
        "error",
      );
    }
  }

  async function onConfirmReject() {
    const reason = rejectionReason.trim();
    if (!reason) {
      setRejectionReasonError("Add a correction note before sending this back.");
      return;
    }

    try {
      await reject({ reason });
      setIsRejectModalOpen(false);
      setRejectionReason("");
      setRejectionReasonError(null);
      show("Certificate sent back for correction", "success");
      refresh();
    } catch (error) {
      show(
        certificateActionErrorMessage(error, "Failed to reject certificate"),
        "error",
      );
    }
  }

  async function onSaveAndResubmit(values: CertificateMetadataFormValues) {
    if (!certificate) return;
    setCorrectionError(null);

    if (certificate.pendingReplacementIngestionId) {
      setCorrectionError(pendingReplacementMessage);
      return;
    }

    if (values.issueDate.trim() && !isIsoDateOnly(values.issueDate)) {
      setCorrectionError("Issue date is invalid. Use YYYY-MM-DD.");
      return;
    }

    if (values.expiryDate.trim() && !isIsoDateOnly(values.expiryDate)) {
      setCorrectionError("Expiry date is invalid. Use YYYY-MM-DD.");
      return;
    }

    if (certificate.certificateRequiresExpiry && !values.expiryDate.trim()) {
      setCorrectionError("Expiry date is required before resubmitting this document.");
      return;
    }

    if (attachments.length === 0) {
      setCorrectionError("Upload document evidence before resubmitting this document.");
      return;
    }

    try {
      await saveMetadata(toUpdateCertificateInput(values));
      await resubmit();
      show("Certificate resubmitted for review", "success");
      refresh();
    } catch (error) {
      show(
        certificateActionErrorMessage(error, "Failed to resubmit certificate"),
        "error",
      );
    }
  }

  async function onConfirmDeleteCertificate() {
    if (!certificate) return;

    try {
      await removeCertificate();
      setIsDeleteCertificateOpen(false);
      show("Certificate deleted", "success");
      router.replace(listHref);
    } catch (error) {
      show(
        certificateActionErrorMessage(error, "Failed to delete certificate"),
        "error",
      );
    }
  }

  async function onConfirmDeleteAttachment() {
    if (!attachmentPendingDelete) return;

    try {
      await removeAttachment(attachmentPendingDelete.id);
      setAttachmentPendingDelete(null);
      show("Attachment deleted", "success");
      refresh();
    } catch (error) {
      show(
        certificateActionErrorMessage(error, "Failed to delete attachment"),
        "error",
      );
    }
  }

  function openReplacementUpload() {
    router.push({
      pathname: "/projects/[projectId]/certificates/upload",
      params: {
        projectId: pid,
        assetId: vid,
        returnTo: "vessel-certificates",
        replacementCertificateId: cid,
        correctionMode: "replace-evidence",
      },
    });
  }

  function openPendingReplacementReview() {
    if (!certificate?.pendingReplacementIngestionId) return;

    router.push({
      pathname: "/projects/[projectId]/certificates/review",
      params: {
        projectId: pid,
        assetId: vid,
        ingestionId: certificate.pendingReplacementIngestionId,
        returnTo: "vessel-certificates",
        replacementCertificateId: cid,
        correctionMode: "replace-evidence",
      },
    });
  }

  if (loading) return <Loading fullScreen />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;
  if (!certificate)
    return <ErrorState message="Certificate not found." onRetry={refresh} />;

  const approvalTagLabel = certificate.approvedByUserName
    ? `Approved by: ${certificate.approvedByUserName}`
    : "Approved by: Pending review";
  const parentStatusSummary = parentCertificateStatusSummary(certificate);
  const parentBlockingReason = parentCertificateBlockingReason(certificate);
  const lastEvidenceProtected =
    (certificate.workflowStatus === "SUBMITTED" ||
      certificate.workflowStatus === "APPROVED") &&
    attachments.length <= 1;
  const hasPendingReplacementEvidence = Boolean(
    certificate.pendingReplacementIngestionId,
  );

  return (
    <>
      <View className="min-w-0 flex-1 gap-5 p-4 web:p-6">
        <View className="gap-3">
          <Pressable
            onPress={goBack}
            className="self-start flex-row items-center gap-2"
          >
            <Ionicons name="chevron-back" size={16} className="text-accent" />
            <Text className="text-accent font-semibold">Back</Text>
          </Pressable>

          <View className="gap-4 lg:flex-row lg:items-start lg:justify-between">
            <View className="min-w-0 flex-1 gap-1">
              <Text className="text-[30px] font-semibold leading-[110%] text-textMain lg:text-[34px]">
                Document - {certificate.certificateName}
              </Text>
              <Text className="text-muted text-[14px]">
                Review metadata, evidence, parent links, and approval state for
                this vessel document.
              </Text>
            </View>

            <View className="w-full min-w-0 flex-row flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
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
                  disabled={hasPendingReplacementEvidence || workflowLoading}
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
              certificate.workflowStatus === "SUBMITTED" ? (
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

        <View className="gap-5 lg:flex-row">
          <View className="flex-1 gap-5">
            <Card className="rounded-[24px] shadow-sm shadow-black/10 web:shadow-black/30">
              <CardHeaderRow>
                <CardTitle className="text-[16px] text-textMain">
                  Document details
                </CardTitle>
                <View className="flex-row gap-2 flex-wrap">
                  <DocumentKindPill kind={certificate.certificateDocumentKind} />
                  <ExpiryRequirementPill
                    requiresExpiry={certificate.certificateRequiresExpiry}
                  />
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
                        label={documentKindLabel(
                          certificate.certificateDocumentKind,
                        )}
                        tone="info"
                      />
                      <DetailTag
                        label={`Vessel: ${certificate.assetName}`}
                        tone="info"
                      />
                      {certificate.parentCertificateName ? (
                        <DetailTag
                          label={`Child of: ${certificate.parentCertificateName}`}
                          tone="info"
                        />
                      ) : null}
                      {certificate.childCertificateCount > 0 ? (
                        <DetailTag
                          label={`${certificate.childCertificateCount} linked child documents`}
                          tone="info"
                        />
                      ) : null}
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

                  <View className="gap-4 md:flex-row">
                    <View className="flex-1 gap-4">
                      <FieldDisplay label="Number" value={certificate.number ?? "-"} />
                      <FieldDisplay label="Issuer" value={certificate.issuer ?? "-"} />
                      <FieldDisplay
                        label="Document kind"
                        value={documentKindLabel(
                          certificate.certificateDocumentKind,
                        )}
                      />
                      <FieldDisplay
                        label="Issue Date"
                        value={formatDate(certificate.issueDate)}
                      />
                      <FieldDisplay
                        label="Expiry Date"
                        value={expiryDisplay(
                          certificate.expiryDate,
                          certificate.certificateRequiresExpiry,
                          formatDate,
                        )}
                      />
                    </View>

                    <View className="flex-1 gap-4">
                      <FieldDisplay
                        label="Source"
                        value={sourceReferenceLabel({
                          convention: certificate.certificateConvention,
                          sourceReference: certificate.certificateSourceReference,
                          variantFlag: certificate.certificateVariantFlag,
                        })}
                      />
                      <FieldDisplay
                        label="Parent certificate"
                        value={
                          certificate.parentCertificateName
                            ? (
                              <View className="gap-1">
                                <Text className="text-[13px] text-textMain">
                                  {certificate.parentCertificateName}
                                  {certificate.parentCertificateNumber
                                    ? ` - ${certificate.parentCertificateNumber}`
                                    : ""}
                                </Text>
                                {parentStatusSummary ? (
                                  <Text className="text-[12px] text-muted">
                                    {parentStatusSummary}
                                  </Text>
                                ) : null}
                                {parentBlockingReason ? (
                                  <Text className="text-[12px] leading-[18px] text-destructive">
                                    {parentBlockingReason}
                                  </Text>
                                ) : null}
                              </View>
                            )
                            : parentBlockingReason
                              ? (
                                <View className="gap-1">
                                  {certificate.certificateParentTypeName ? (
                                    <Text className="text-[13px] text-textMain">
                                      Expected: {certificate.certificateParentTypeName}
                                    </Text>
                                  ) : null}
                                  <Text className="text-[12px] leading-[18px] text-destructive">
                                    {parentBlockingReason}
                                  </Text>
                                </View>
                              )
                            : certificate.certificateParentTypeName
                              ? `Expected: ${certificate.certificateParentTypeName}`
                              : "-"
                        }
                      />
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
                        label="Linked child documents"
                        value={String(certificate.childCertificateCount)}
                      />
                      <FieldDisplay label="Updated At" value={formatDate(certificate.updatedAt)} />
                    </View>
                  </View>

                  <View className="rounded-[18px] border border-shellLine bg-shellPanelSoft p-4">
                    <Text className="text-[12px] text-muted">Notes</Text>
                    <Text className="text-[13px] text-textMain mt-1">
                      {certificate.notes ?? "-"}
                    </Text>
                  </View>

                  {certificate.workflowStatus === "REJECTED" ? (
                    <View className="rounded-[20px] border border-warning/35 bg-warning/12 p-4 gap-4">
                      <View className="gap-1">
                        <Text className="text-[13px] font-semibold text-textMain">
                          Correction required
                        </Text>
                        <Text className="text-[12px] leading-[18px] text-muted">
                          {certificate.rejectionReason ??
                            "This document was sent back for correction."}
                        </Text>
                      </View>

                      {hasPendingReplacementEvidence ? (
                        <View className="rounded-[16px] border border-info/35 bg-info/12 p-3 gap-2">
                          <Text className="text-[12px] font-semibold text-textMain">
                            Replacement evidence pending
                          </Text>
                          <Text className="text-[12px] leading-[18px] text-muted">
                            {pendingReplacementMessage}
                          </Text>
                          <Text className="text-[12px] leading-[18px] text-muted">
                            {pendingReplacementDeleteMessage}
                          </Text>
                          <Button
                            variant="outline"
                            size="sm"
                            onPress={openPendingReplacementReview}
                            disabled={workflowLoading}
                            className="self-start rounded-full"
                          >
                            Review replacement evidence
                          </Button>
                        </View>
                      ) : null}

                      {canUpdateOperationalRecords ? (
                        <View className="gap-4">
                          <View className="gap-4 md:flex-row">
                            <View className="flex-1">
                              <Field
                                label="Number"
                                placeholder="Document number"
                                value={correctionValues.number}
                                onChangeText={(value) => setValue("number", value)}
                                editable={!workflowLoading}
                                surfaceTone="raised"
                              />
                            </View>
                            <View className="flex-1">
                              <Field
                                label="Issuer"
                                placeholder="Issuing authority"
                                value={correctionValues.issuer}
                                onChangeText={(value) => setValue("issuer", value)}
                                editable={!workflowLoading}
                                surfaceTone="raised"
                              />
                            </View>
                          </View>

                          <View className="gap-4 md:flex-row">
                            <View className="flex-1">
                              <DateField
                                label="Issue Date"
                                placeholder="Select issue date"
                                value={correctionValues.issueDate}
                                onChange={(value) => setValue("issueDate", value)}
                                disabled={workflowLoading}
                                surfaceTone="raised"
                              />
                            </View>
                            <View className="flex-1">
                              <DateField
                                label={
                                  certificate.certificateRequiresExpiry
                                    ? "Expiry Date"
                                    : "Expiry Date (optional)"
                                }
                                placeholder={
                                  certificate.certificateRequiresExpiry
                                    ? "Select expiry date"
                                    : "Leave blank when not required"
                                }
                                value={correctionValues.expiryDate}
                                onChange={(value) => setValue("expiryDate", value)}
                                disabled={workflowLoading}
                                surfaceTone="raised"
                              />
                            </View>
                          </View>

                          <Field
                            label="Notes"
                            placeholder="Optional operational notes"
                            value={correctionValues.notes}
                            onChangeText={(value) => setValue("notes", value)}
                            editable={!workflowLoading}
                            multiline
                            surfaceTone="raised"
                          />

                          {correctionError ? (
                            <Text className="text-[12px] leading-[18px] text-destructive">
                              {correctionError}
                            </Text>
                          ) : null}

                          <View className="flex-row flex-wrap gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              onPress={handleSubmit(onSaveAndResubmit)}
                              loading={workflowLoading}
                              disabled={hasPendingReplacementEvidence}
                              className="rounded-full"
                            >
                              Save and resubmit
                            </Button>

                            {canUploadDocuments ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onPress={openReplacementUpload}
                                disabled={workflowLoading}
                                className="rounded-full"
                              >
                                Upload new evidence
                              </Button>
                            ) : null}
                          </View>
                        </View>
                      ) : (
                        <Text className="text-[12px] leading-[18px] text-muted">
                          Your role can view this correction note, but cannot
                          edit and resubmit the document record.
                        </Text>
                      )}
                    </View>
                  ) : null}

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
                            {canSoftDelete && !lastEvidenceProtected ? (
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

          <View className="w-full gap-5 lg:w-[380px]">
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
                        ? "Document approved"
                        : certificate.workflowStatus === "REJECTED"
                          ? canUpdateOperationalRecords
                            ? "Correct metadata, then resubmit for review"
                            : "Needs correction before review"
                          : certificate.workflowStatus === "ARCHIVED"
                            ? "Historical record only"
                            : certificate.workflowStatus === "SUBMITTED"
                              ? "Review metadata and approve or send back"
                              : "Draft fallback outside the active approval lane"
                    }
                  />
                  {canApproveCertificates &&
                  certificate.workflowStatus === "SUBMITTED" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onPress={() => {
                        setRejectionReason(certificate.rejectionReason ?? "");
                        setRejectionReasonError(null);
                        setIsRejectModalOpen(true);
                      }}
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
                  Source document preview
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

      <Modal
        visible={isRejectModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsRejectModalOpen(false)}
      >
        <View className="flex-1 items-center justify-center px-4">
          <Pressable
            className="absolute inset-0 bg-black/45"
            onPress={() => setIsRejectModalOpen(false)}
          />

          <Card className="w-full max-w-[560px] overflow-hidden rounded-[28px] p-0">
            <CardHeaderRow className="border-b border-shellLine px-6 pt-6 pb-4">
              <CardTitle className="text-[18px] text-textMain">
                Send back for correction
              </CardTitle>
            </CardHeaderRow>

            <CardContent className="px-6 py-6 gap-5">
              <Text className="text-[14px] leading-[22px] text-muted">
                Add the correction note the operator should see before this
                document can be resubmitted for review.
              </Text>

              <Field
                label="Correction note"
                placeholder="Explain what must be corrected"
                value={rejectionReason}
                onChangeText={(value) => {
                  setRejectionReason(value);
                  setRejectionReasonError(null);
                }}
                editable={!workflowLoading}
                multiline
                error={rejectionReasonError}
              />

              <View className="flex-row justify-end gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full"
                  onPress={() => setIsRejectModalOpen(false)}
                  disabled={workflowLoading}
                >
                  Cancel
                </Button>

                <Button
                  variant="default"
                  size="lg"
                  className="rounded-full"
                  onPress={onConfirmReject}
                  loading={workflowLoading}
                >
                  Send back
                </Button>
              </View>
            </CardContent>
          </Card>
        </View>
      </Modal>

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

