import {
  Column,
  DataTable,
  RegistryTableTextStack,
  TableActionIcon,
} from "@/src/components/ui/table";
import {
  DocumentStatePill,
  RequirementStatusPill,
} from "@/src/features/certificates/core";
import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { View } from "react-native";
import type { CrewCertificateRequirementDto } from "../contracts";
import type { CrewCertificateSortOption } from "./crewCertificatesProject.constants";

type Props = {
  projectId: string;
  title: string;
  subtitleRight?: string;
  headerActions?: ReactNode;
  data: CrewCertificateRequirementDto[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onUpload: (row: CrewCertificateRequirementDto) => void;
  canUpload?: boolean;
  sortBy?: CrewCertificateSortOption;
};

export function CrewCertificateRequirementsTable({
  projectId,
  title,
  subtitleRight,
  headerActions,
  data,
  isLoading,
  error,
  onRetry,
  onUpload,
  canUpload = true,
  sortBy = "PRIORITY",
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
      if (sortBy === "CREW_ASC") {
        if (left.crewMemberName !== right.crewMemberName) {
          return left.crewMemberName.localeCompare(right.crewMemberName);
        }
        return left.certificateName.localeCompare(right.certificateName);
      }

      if (sortBy === "CREW_DESC") {
        if (left.crewMemberName !== right.crewMemberName) {
          return right.crewMemberName.localeCompare(left.crewMemberName);
        }
        return left.certificateName.localeCompare(right.certificateName);
      }

      if (sortBy === "CERT_ASC") {
        if (left.certificateName !== right.certificateName) {
          return left.certificateName.localeCompare(right.certificateName);
        }
        return left.crewMemberName.localeCompare(right.crewMemberName);
      }

      if (left.status !== right.status) {
        return rankOrder[left.status] - rankOrder[right.status];
      }
      if (left.crewMemberName !== right.crewMemberName) {
        return left.crewMemberName.localeCompare(right.crewMemberName);
      }
      return left.certificateName.localeCompare(right.certificateName);
    });
  }, [data, sortBy]);

  const columns = useMemo<Column<CrewCertificateRequirementDto>[]>(() => {
    return [
      {
        key: "crew",
        header: "Crew Member",
        flex: 1.6,
        render: (row) => (
          <RegistryTableTextStack
            primary={row.crewMemberName}
            secondary={`${row.crewRank ?? "Rank pending"} | ${row.assetName}`}
          />
        ),
      },
      {
        key: "certificate",
        header: "Requirement",
        flex: 1.8,
        render: (row) => (
          <RegistryTableTextStack
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
        key: "open",
        header: "Open",
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
                    pathname: "/projects/[projectId]/crew/certificates/review",
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

            {canUpload ? (
              <TableActionIcon
                icon="cloud-upload-outline"
                tone="accent"
                tooltip="Upload certificate document"
                onPress={() => onUpload(row)}
              />
            ) : null}
          </View>
        ),
      },
    ];
  }, [canUpload, onUpload, projectId, router]);

  return (
    <DataTable<CrewCertificateRequirementDto>
      title={title}
      subtitleRight={subtitleRight}
      headerActions={headerActions}
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
