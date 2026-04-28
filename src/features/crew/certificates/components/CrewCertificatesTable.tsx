import {
  Column,
  DataTable,
  TableActionIcon,
  Text,
  type DataTableProps,
} from "@/src/components";
import {
  CertificateStatusPill,
  WorkflowStatusPill,
} from "@/src/features/certificates/core";
import { formatDate } from "@/src/helpers";
import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { View } from "react-native";
import type { CrewCertificateDto } from "../contracts";

type Props = {
  projectId: string;
  title: string;
  subtitleRight?: string;
  data: CrewCertificateDto[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  headerActions?: ReactNode;
  pagination?: DataTableProps<CrewCertificateDto>["pagination"];
};

export function CrewCertificatesTable({
  projectId,
  title,
  subtitleRight,
  data,
  isLoading,
  error,
  onRetry,
  headerActions,
  pagination,
}: Props) {
  const router = useRouter();

  const columns = useMemo<Column<CrewCertificateDto>[]>(() => {
    return [
      {
        key: "certificate",
        header: "Certificate",
        flex: 1.8,
        render: (row) => (
          <ViewText
            primary={row.certificateName}
            secondary={`${row.certificateCode}${row.number ? ` · ${row.number}` : ""}`}
          />
        ),
      },
      {
        key: "status",
        header: "Status",
        flex: 1.1,
        render: (row) => (
          <View className="gap-2">
            <CertificateStatusPill status={row.status} />
            <WorkflowStatusPill status={row.workflowStatus} />
          </View>
        ),
      },
      {
        key: "expiry",
        header: "Expiry",
        flex: 1,
        render: (row) => <Text>{formatDate(row.expiryDate)}</Text>,
      },
      {
        key: "attachments",
        header: "Attachments",
        flex: 0.8,
        render: (row) => <Text>{String(row.attachmentCount)}</Text>,
      },
      {
        key: "action",
        header: "Action",
        flex: 1.2,
        render: (row) => (
          <TableActionIcon
            icon="document-text-outline"
            tooltip="Open certificate"
            onPress={() =>
              router.push(
                `/projects/${projectId}/vessels/${row.assetId}/crew/${row.crewMemberId}/certificates/${row.id}`,
              )
            }
          />
        ),
      },
    ];
  }, [projectId, router]);

  return (
    <DataTable<CrewCertificateDto>
      title={title}
      subtitleRight={subtitleRight}
      headerActions={headerActions}
      data={data}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      columns={columns}
      minWidth={920}
      getRowId={(row) => row.id}
      emptyText="No crew certificates uploaded yet."
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
