import { DataTable, type Column } from "@/src/components/ui/table/DataTable";
import { TableActionIcon } from "@/src/components/ui/table/TableActionIcon";
import { TableLink } from "@/src/components/ui/table/TableLink";
import { Text } from "@/src/components/ui/text/Text";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { View } from "react-native";
import type { CertificateRequirementDto } from "@/src/features/certificates/shared";
import {
  DocumentStatePill,
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
          <ViewText
            primary={row.certificateName}
            secondary={`${row.certificateCode}${row.notes ? " - rule active" : ""}`}
          />
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
          if (row.structuredCertificateWorkflowStatus === "APPROVED") {
            return <DocumentStatePill state="APPROVED" />;
          }
          if (row.structuredCertificateWorkflowStatus === "SUBMITTED") {
            return <DocumentStatePill state="SUBMITTED" />;
          }
          if (row.structuredCertificateWorkflowStatus === "REJECTED") {
            return <DocumentStatePill state="REJECTED" />;
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
                    },
                  })
                }
              />
            ) : row.structuredCertificateId ? (
              <TableActionIcon
                icon="document-text-outline"
                tooltip="Open certificate record"
                onPress={() =>
                  router.push(
                    `/projects/${projectId}/vessels/${row.assetId}/certificates/${row.structuredCertificateId}`,
                  )
                }
              />
            ) : null}

            <TableActionIcon
              icon="cloud-upload-outline"
              tone="accent"
              tooltip="Upload certificate document"
              onPress={() => onUpload(row)}
            />
          </View>
        ),
      },
    ];
  }, [onUpload, projectId, router]);

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
      minWidth={980}
      getRowId={(row) => row.id}
      emptyText="No certificate requirements found."
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


