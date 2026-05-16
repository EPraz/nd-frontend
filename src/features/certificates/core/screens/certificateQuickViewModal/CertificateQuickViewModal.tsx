import {
  QuickViewFooterActions,
  QuickViewHeaderActions,
  QuickViewLeadSection,
  QuickViewMediaPanel,
  QuickViewModalFrame,
  QuickViewSummaryBadge,
  Text,
} from "@/src/components";
import {
  RegistrySummaryStrip,
  type RegistrySummaryItem,
} from "@/src/components/ui/registryWorkspace";
import { formatDate, humanizeTechnicalLabel } from "@/src/helpers";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { View } from "react-native";
import {
  parentCertificateBlockingReason,
  parentCertificateStatusSummary,
  requirementStatusTone,
  type CertificateDto,
  type CertificateStatus,
  type CertificateWorkflowStatus,
} from "../../../shared";

type Props = {
  certificate: CertificateDto;
  projectId: string;
  onClose: () => void;
};

function daysUntil(iso: string | null) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  const now = new Date();
  const ms = date.getTime() - now.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function certificateTone(
  status: CertificateStatus,
): "ok" | "warn" | "danger" | "info" {
  switch (status) {
    case "VALID":
      return "ok";
    case "EXPIRING_SOON":
      return "warn";
    case "EXPIRED":
      return "danger";
    case "PENDING":
    default:
      return "info";
  }
}

function workflowTone(
  status: CertificateWorkflowStatus,
): "info" | "accent" | "ok" | "danger" | "neutral" {
  switch (status) {
    case "APPROVED":
      return "ok";
    case "REJECTED":
      return "danger";
    case "SUBMITTED":
      return "accent";
    case "ARCHIVED":
      return "neutral";
    case "DRAFT":
    default:
      return "info";
  }
}

export default function CertificateQuickViewModal({
  certificate,
  projectId,
  onClose,
}: Props) {
  const router = useRouter();
  const parentBlockingReason = parentCertificateBlockingReason(certificate);
  const parentStatusSummary = parentCertificateStatusSummary(certificate);

  const expiryMeta = (() => {
    const days = daysUntil(certificate.expiryDate);
    if (days === null) return "-";
    if (days < 0) return `${Math.abs(days)} day(s) overdue`;
    return `${days} day(s) remaining`;
  })();

  const profileSummaryItems: RegistrySummaryItem[] = [
    {
      label: "Document code",
      value: certificate.certificateCode,
      helper: "Registry key",
      tone: "info",
    },
    {
      label: "Number",
      value: certificate.number ?? "-",
      helper: "Issued reference",
      tone: "accent",
    },
    {
      label: "Issuer",
      value: certificate.issuer ?? "-",
      helper: "Issuing authority",
      tone: "warn",
    },
    {
      label: "Vessel",
      value: certificate.assetName,
      helper: "Assigned asset",
      tone: "ok",
    },
  ];

  const validitySummaryItems: RegistrySummaryItem[] = [
    {
      label: "Issue date",
      value: formatDate(certificate.issueDate),
      helper: "Original issuance",
      tone: "info",
    },
    {
      label: "Expiry date",
      value: formatDate(certificate.expiryDate),
      helper: "Current deadline",
      tone: certificate.status === "EXPIRED" ? "danger" : "warn",
    },
    {
      label: "Expiry window",
      value: expiryMeta,
      helper: "Remaining validity",
      tone: certificate.status === "VALID" ? "ok" : certificateTone(certificate.status),
    },
  ];

  const workflowSummaryItems: RegistrySummaryItem[] = [
    {
      label: "Status",
      value: humanizeTechnicalLabel(certificate.status),
      helper: "Document state",
      tone: certificateTone(certificate.status),
    },
    {
      label: "Workflow",
      value: humanizeTechnicalLabel(certificate.workflowStatus),
      helper: "Approval lane",
      tone: workflowTone(certificate.workflowStatus),
    },
    {
      label: "Requirement",
      value: certificate.requirementStatus
        ? humanizeTechnicalLabel(certificate.requirementStatus)
        : "N/A",
      helper: "Requirement linkage",
      tone: requirementStatusTone(certificate.requirementStatus),
    },
    ...(parentBlockingReason
      ? [
          {
            label: "Parent",
            value: "Blocked",
            helper: parentBlockingReason,
            tone: "danger" as const,
          },
        ]
      : parentStatusSummary
        ? [
            {
              label: "Parent",
              value: parentStatusSummary,
              helper: "Principal document",
              tone: "info" as const,
            },
          ]
        : []),
  ];

  const handleOpenVesselCertificates = () => {
    onClose();
    router.push(`/projects/${projectId}/vessels/${certificate.assetId}/certificates`);
  };

  const handleOpenVessel = () => {
    onClose();
    router.push(`/projects/${projectId}/vessels/${certificate.assetId}`);
  };

  return (
    <QuickViewModalFrame
      portalName={certificate.certificateName}
      open
      onClose={onClose}
      title="Document record"
      subtitle="Validity, workflow, and requirement snapshot for the active document."
      headerActions={
        <QuickViewHeaderActions onClose={onClose} />
      }
      footer={
        <QuickViewFooterActions
          onClose={onClose}
          actions={[
            {
              label: "Open Vessel",
              onPress: handleOpenVessel,
              variant: "softAccent",
            },
            {
              label: "Open Vessel Certificates",
              onPress: handleOpenVesselCertificates,
            },
          ]}
        />
      }
      scroll
      maxWidth={860}
    >
      <View className="gap-2.5">
        <QuickViewLeadSection
          asideWidth={280}
          main={
            <>
              <View className="gap-1.5">
                <View className="gap-1">
                  <Text className="text-[24px] font-semibold text-textMain">
                    {certificate.certificateName}
                  </Text>
                  <Text className="text-[12px] text-muted">
                    {certificate.certificateCode} | {certificate.assetName} |{" "}
                    {formatDate(certificate.expiryDate)}
                  </Text>
                </View>

                <View className="flex-row flex-wrap items-center gap-1.5">
                  <QuickViewSummaryBadge
                    label={`Status: ${humanizeTechnicalLabel(certificate.status)}`}
                    tone={certificateTone(certificate.status)}
                  />
                  <QuickViewSummaryBadge
                    label={`Workflow: ${humanizeTechnicalLabel(certificate.workflowStatus)}`}
                    tone={workflowTone(certificate.workflowStatus)}
                  />
                  <QuickViewSummaryBadge
                    label={`Requirement: ${
                      certificate.requirementStatus
                        ? humanizeTechnicalLabel(certificate.requirementStatus)
                        : "N/A"
                    }`}
                    tone={requirementStatusTone(certificate.requirementStatus)}
                  />
                  {parentBlockingReason ? (
                    <QuickViewSummaryBadge
                      label="Parent: Blocked"
                      tone="danger"
                    />
                  ) : null}
                </View>
              </View>

              <Text className="max-w-[620px] text-[12px] leading-[16px] text-muted">
                Use this quick view to confirm validity, workflow, and
                requirement alignment before opening the full vessel
                certificates workspace.
              </Text>
            </>
          }
          aside={
            <QuickViewMediaPanel className="h-[128px] justify-center px-4">
              <View className="flex-row items-center gap-3">
                <View className="rounded-full border border-shellLine bg-shellPanel px-3 py-3">
                  <Ionicons
                    name="document-text-outline"
                    size={30}
                    className="text-textMain"
                  />
                </View>

                <View className="min-w-0 flex-1 gap-0.5">
                  <Text className="text-[15px] font-semibold text-textMain">
                    {certificate.attachmentCount > 0
                      ? `${certificate.attachmentCount} attachment(s)`
                      : "No attachments yet"}
                  </Text>
                  <Text className="text-[11px] leading-[15px] text-muted">
                    {certificate.attachmentCount > 0
                      ? "Structured record linked to uploaded evidence."
                      : "Upload supporting files from edit mode to populate this panel."}
                  </Text>
                </View>
              </View>
            </QuickViewMediaPanel>
          }
        />

        <View className="mt-4 gap-1.5">
          <Text className="text-[14px] font-semibold text-textMain">
            Profile at a glance
          </Text>
          <RegistrySummaryStrip
            items={profileSummaryItems}
            size="compact"
            columns={4}
          />
        </View>
      </View>

          <View className="mt-1 flex-col gap-3 md:flex-row">
        <View className="flex-1 gap-1.5">
          <Text className="text-[14px] font-semibold text-textMain">
            Validity Snapshot
          </Text>
          <RegistrySummaryStrip
            items={validitySummaryItems}
            size="compact"
            columns={3}
          />
        </View>

        <View className="flex-1 gap-1.5">
          <Text className="text-[14px] font-semibold text-textMain">
            Workflow Snapshot
          </Text>
          <RegistrySummaryStrip
            items={workflowSummaryItems}
            size="compact"
            columns={parentBlockingReason || parentStatusSummary ? 4 : 3}
          />
        </View>
      </View>
    </QuickViewModalFrame>
  );
}
