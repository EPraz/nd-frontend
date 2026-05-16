import {
  DataTable,
  type Column,
  type DataTableProps,
} from "@/src/components/ui/table/DataTable";
import { TableActionIcon } from "@/src/components/ui/table/TableActionIcon";
import { TableLink } from "@/src/components/ui/table/TableLink";
import { RegistryTablePill } from "@/src/components/ui/table/RegistryTablePill";
import { Text } from "@/src/components/ui/text/Text";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { View } from "react-native";
import {
  documentKindLabel,
  sourceReferenceLabel,
  type CertificateRequirementDto,
} from "@/src/features/certificates/shared";
import {
  DocumentStatePill,
  DocumentKindPill,
  ExpiryRequirementPill,
  RequirementStatusPill,
} from "@/src/features/certificates/core/components/certificateTable/certificates.ui";

type Props = {
  title: string;
  subtitleRight?: string;
  headerActions?: React.ReactNode;
  toolbarContent?: React.ReactNode;
  data: CertificateRequirementDto[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onUpload: (row: CertificateRequirementDto) => void;
  canUpload?: boolean;
  returnTo?: "vessel-certificates";
  pagination?: DataTableProps<CertificateRequirementDto>["pagination"];
};

export function CertificateRequirementsTable(props: Props) {
  const router = useRouter();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const {
    title,
    subtitleRight,
    headerActions,
    toolbarContent,
    data,
    isLoading,
    error,
    onRetry,
    onUpload,
    canUpload = true,
    returnTo,
    pagination,
  } = props;

  const rows = useMemo(() => {
    return [...data].sort((left, right) => {
      if (left.status !== right.status) {
        const rank = {
          MISSING: 0,
          EXPIRED: 1,
          UNDER_REVIEW: 2,
          PROVIDED: 3,
          EXEMPT: 4,
          REQUIRED: 5,
        } as const;

        return rank[left.status] - rank[right.status];
      }

      if (left.assetName !== right.assetName) {
        return left.assetName.localeCompare(right.assetName);
      }

      return left.certificateName.localeCompare(right.certificateName);
    });
  }, [data]);

  const columns = useMemo<Column<CertificateRequirementDto>[]>(() => {
    return [
      {
        key: "certificate",
        header: "Requirement",
        flex: 2,
        render: (row) => (
          <View className="gap-2">
            <ViewText
              primary={row.certificateName}
              secondary={`${row.certificateCode} - ${sourceReferenceLabel({
                convention: row.certificateConvention,
                sourceReference: row.certificateSourceReference,
                variantFlag: row.certificateVariantFlag,
              })}`}
            />
            <View className="flex-row flex-wrap gap-1.5">
              <DocumentKindPill kind={row.certificateDocumentKind} />
              <ExpiryRequirementPill
                requiresExpiry={row.certificateRequiresExpiry}
              />
              {row.certificateParentTypeName ? (
                <RegistryTablePill
                  label={`Child of ${row.certificateParentTypeCode}`}
                  tone="info"
                />
              ) : null}
            </View>
          </View>
        ),
      },
      {
        key: "vessel",
        header: "Vessel",
        flex: 1.6,
        render: (row) => (
          <TableLink
            tooltip="Open vessel details"
            onPress={() => router.push(`/projects/${projectId}/vessels/${row.assetId}`)}
          >
            {row.assetName}
          </TableLink>
        ),
      },
      {
        key: "status",
        header: "Compliance",
        flex: 1,
        render: (row) => <RequirementStatusPill status={row.status} />,
      },
      {
        key: "kind",
        header: "Document",
        flex: 1,
        render: (row) => (
          <ViewText
            primary={documentKindLabel(row.certificateDocumentKind)}
            secondary={
              row.certificateRequiresExpiry
                ? "Expiry required"
                : "No expiry required"
            }
          />
        ),
      },
      {
        key: "structured",
        header: "Document State",
        flex: 1,
        render: (row) => {
          if (row.pendingIngestionId) {
            return <DocumentStatePill state="CANDIDATE" />;
          }
          if (!row.hasStructuredCertificate) {
            return <DocumentStatePill state="MISSING" />;
          }
          if (row.structuredCertificateBlockingReason) {
            return (
              <View className="min-w-0 gap-1.5">
                <DocumentStatePill state="PARENT_BLOCKED" />
                <Text
                  className="text-[11px] leading-[15px] text-muted"
                  numberOfLines={2}
                >
                  {row.structuredCertificateBlockingReason}
                </Text>
              </View>
            );
          }
          if (row.structuredCertificateWorkflowStatus === "APPROVED") {
            return <DocumentStatePill state="APPROVED" />;
          }
          if (row.structuredCertificateWorkflowStatus === "SUBMITTED") {
            return <DocumentStatePill state="SUBMITTED" />;
          }
          if (row.structuredCertificateWorkflowStatus === "REJECTED") {
            return (
              <View className="min-w-0 gap-1.5">
                <DocumentStatePill state="REJECTED" />
                <Text
                  className="text-[11px] leading-[15px] text-muted"
                  numberOfLines={2}
                >
                  {row.structuredCertificateRejectionReason
                    ? `Correction: ${row.structuredCertificateRejectionReason}`
                    : "Correction needed"}
                </Text>
              </View>
            );
          }
          if (row.structuredCertificateWorkflowStatus === "ARCHIVED") {
            return <DocumentStatePill state="ARCHIVED" />;
          }
          if (row.structuredCertificateWorkflowStatus === "DRAFT") {
            return <DocumentStatePill state="DRAFT" />;
          }
          return <DocumentStatePill state="MISSING" />;
        },
      },
      {
        key: "action",
        header: "Action",
        flex: 1.6,
        render: (row) => (
          <View className="flex-row items-center flex-wrap gap-2">
            {row.pendingIngestionId ? (
              <TableActionIcon
                icon="sparkles-outline"
                tooltip="Review uploaded document"
                onPress={() =>
                  router.push({
                    pathname: "/projects/[projectId]/certificates/review",
                    params: {
                      projectId,
                      assetId: row.assetId,
                      ingestionId: row.pendingIngestionId,
                      ...(returnTo ? { returnTo } : {}),
                    },
                  })
                }
              />
            ) : row.structuredCertificateId ? (
              <TableActionIcon
                icon="document-text-outline"
                tooltip="Open document record"
                onPress={() =>
                  router.push(
                    `/projects/${projectId}/vessels/${row.assetId}/certificates/${row.structuredCertificateId}`,
                  )
                }
              />
            ) : null}

            {canUpload && !row.pendingIngestionId ? (
              <TableActionIcon
                icon="cloud-upload-outline"
                tone="accent"
                tooltip="Upload document evidence"
                onPress={() => onUpload(row)}
              />
            ) : null}
          </View>
        ),
      },
    ];
  }, [canUpload, onUpload, projectId, returnTo, router]);

  return (
    <DataTable<CertificateRequirementDto>
      title={title}
      subtitleRight={subtitleRight}
      headerActions={headerActions}
      toolbarContent={toolbarContent}
      data={rows}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      columns={columns}
      minWidth={1120}
      getRowId={(row) => row.id}
      emptyText="No certificate requirements found."
      pagination={pagination}
    />
  );
}

function ViewText(props: { primary: string; secondary: string }) {
  return (
    <>
      <Text className="text-textMain font-semibold">{props.primary}</Text>
      <Text className="text-[11px] text-muted mt-1">{props.secondary}</Text>
    </>
  );
}


