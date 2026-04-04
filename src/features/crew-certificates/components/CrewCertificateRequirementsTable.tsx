import { Column, DataTable, TableActionIcon, Text } from "@/src/components";
import { RequirementStatusPill } from "@/src/features/certificates/components";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { View } from "react-native";
import type { CrewCertificateRequirementDto } from "../contracts";

type Props = {
  projectId: string;
  title: string;
  subtitleRight?: string;
  data: CrewCertificateRequirementDto[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onUpload: (row: CrewCertificateRequirementDto) => void;
};

export function CrewCertificateRequirementsTable({
  projectId,
  title,
  subtitleRight,
  data,
  isLoading,
  error,
  onRetry,
  onUpload,
}: Props) {
  const router = useRouter();

  const rows = useMemo(() => {
    const rankOrder = {
      MISSING: 0,
      EXPIRED: 1,
      UNDER_REVIEW: 2,
      PROVIDED: 3,
      EXEMPT: 4,
      REQUIRED: 5,
    } as const;

    return [...data].sort((left, right) => {
      if (left.status !== right.status) {
        return rankOrder[left.status] - rankOrder[right.status];
      }
      if (left.crewMemberName !== right.crewMemberName) {
        return left.crewMemberName.localeCompare(right.crewMemberName);
      }
      return left.certificateName.localeCompare(right.certificateName);
    });
  }, [data]);

  const columns = useMemo<Column<CrewCertificateRequirementDto>[]>(() => {
    return [
      {
        key: "crew",
        header: "Crew Member",
        flex: 1.6,
        render: (row) => (
          <ViewText
            primary={row.crewMemberName}
            secondary={`${row.crewRank ?? "Rank pending"} · ${row.assetName}`}
          />
        ),
      },
      {
        key: "certificate",
        header: "Requirement",
        flex: 1.8,
        render: (row) => (
          <ViewText
            primary={row.certificateName}
            secondary={row.certificateCode}
          />
        ),
      },
      {
        key: "status",
        header: "Compliance",
        flex: 1,
        render: (row) => <RequirementStatusPill status={row.status} />,
      },
      {
        key: "documentState",
        header: "Document State",
        flex: 1.2,
        render: (row) => {
          if (row.pendingIngestionId) return <Text>Candidate awaiting review</Text>;
          if (!row.hasStructuredCertificate) return <Text>Missing</Text>;
          if (row.structuredCertificateWorkflowStatus === "APPROVED") {
            return <Text>Approved record on file</Text>;
          }
          if (row.structuredCertificateWorkflowStatus === "SUBMITTED") {
            return <Text>Submitted for approval</Text>;
          }
          if (row.structuredCertificateWorkflowStatus === "REJECTED") {
            return <Text>Sent back for correction</Text>;
          }
          if (row.structuredCertificateWorkflowStatus === "ARCHIVED") {
            return <Text>Historical record on file</Text>;
          }
          if (row.structuredCertificateWorkflowStatus === "DRAFT") {
            return <Text>Draft record on file</Text>;
          }
          return <Text>Missing</Text>;
        },
      },
      {
        key: "action",
        header: "Action",
        flex: 1.4,
        render: (row) => (
          <View className="flex-row items-center flex-wrap gap-2">
            <TableActionIcon
              icon="person-outline"
              tooltip="Open crew profile"
              onPress={() =>
                router.push(
                  `/projects/${projectId}/vessels/${row.assetId}/crew/${row.crewMemberId}`,
                )
              }
            />

            {row.pendingIngestionId ? (
              <TableActionIcon
                icon="sparkles-outline"
                tooltip="Review uploaded document"
                onPress={() =>
                  router.push({
                    pathname: "/projects/[projectId]/crew-certificates/review",
                    params: {
                      projectId,
                      assetId: row.assetId,
                      crewId: row.crewMemberId,
                      ingestionId: row.pendingIngestionId,
                    },
                  })
                }
              />
            ) : row.structuredCertificateId ? (
              <TableActionIcon
                icon="document-text-outline"
                tooltip="Open certificate"
                onPress={() =>
                  router.push(
                    `/projects/${projectId}/vessels/${row.assetId}/crew/${row.crewMemberId}/certificates/${row.structuredCertificateId}`,
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
    <DataTable<CrewCertificateRequirementDto>
      title={title}
      subtitleRight={subtitleRight}
      data={rows}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      columns={columns}
      minWidth={1080}
      getRowId={(row) => row.id}
      emptyText="No crew certificate requirements found."
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
