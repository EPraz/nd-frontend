import {
  DataTable,
  RegistryTableTextStack,
  type Column,
} from "@/src/components/ui/table";
import { type ReactNode, useMemo } from "react";
import { View } from "react-native";
import type { CrewBulkUploadSessionSummaryDto } from "../contracts/crewBulkUpload.contract";
import {
  describeSessionOutcome,
  describeSessionTrace,
  formatSessionTimestamp,
} from "./crewBulkUploadWorkspace.helpers";
import {
  CrewBulkUploadIssuePill,
  CrewBulkUploadStatusPill,
} from "./crewBulkUpload.ui";

type Props = {
  title: string;
  subtitleRight?: string;
  headerActions?: ReactNode;
  data: CrewBulkUploadSessionSummaryDto[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onRowPress: (row: CrewBulkUploadSessionSummaryDto) => void;
};

export function CrewBulkUploadSessionsTable({
  title,
  subtitleRight,
  headerActions,
  data,
  isLoading,
  error,
  onRetry,
  onRowPress,
}: Props) {
  const rows = useMemo(
    () =>
      [...data].sort(
        (left, right) =>
          new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
      ),
    [data],
  );

  const columns = useMemo<Column<CrewBulkUploadSessionSummaryDto>[]>(() => {
    return [
      {
        key: "workbook",
        header: "Workbook",
        flex: 2.1,
        render: (row) => (
          <RegistryTableTextStack
            primary={row.sourceFileName}
            secondary={`Revision ${row.revisionNumber}`}
          />
        ),
      },
      {
        key: "vessel",
        header: "Default Vessel",
        flex: 1.4,
        render: (row) => (
          <RegistryTableTextStack
            primary={row.defaultAssetName ?? "Not pinned"}
            secondary="used when workbook lacks IMO/license"
          />
        ),
      },
      {
        key: "status",
        header: "Status",
        flex: 1.2,
        render: (row) => <CrewBulkUploadStatusPill status={row.status} />,
      },
      {
        key: "queue",
        header: "Queue",
        flex: 1.8,
        render: (row) => (
          <View className="gap-2">
            <RegistryTableTextStack
              primary={`${row.crewRows} crew | ${row.certificateRows} cert`}
              secondary="rows parsed from workbook"
            />
            <View className="flex-row flex-wrap gap-2">
              <CrewBulkUploadIssuePill
                label="critical"
                count={row.criticalCount}
                tone="danger"
              />
              <CrewBulkUploadIssuePill
                label="warning"
                count={row.warningCount}
                tone="warn"
              />
            </View>
          </View>
        ),
      },
      {
        key: "outcome",
        header: "Outcome",
        flex: 2.1,
        render: (row) => (
          <RegistryTableTextStack
            primary={describeSessionOutcome(row)}
            secondary={describeSessionTrace(row)}
          />
        ),
      },
      {
        key: "updated",
        header: "Updated",
        flex: 1.1,
        render: (row) => (
          <RegistryTableTextStack
            primary={formatSessionTimestamp(row.updatedAt)}
            secondary={row.status === "COMMITTED" ? "latest applied state" : "latest session activity"}
          />
        ),
      },
    ];
  }, []);

  return (
    <DataTable<CrewBulkUploadSessionSummaryDto>
      title={title}
      subtitleRight={subtitleRight}
      headerActions={headerActions}
      data={rows}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      columns={columns}
      minWidth={1220}
      getRowId={(row) => row.id}
      onRowPress={onRowPress}
      emptyText="No bulk sessions yet."
    />
  );
}
