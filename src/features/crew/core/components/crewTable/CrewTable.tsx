import {
  DataTable,
  RegistryTableTextStack,
  type Column,
} from "@/src/components/ui/table";
import { TableLink } from "@/src/components/ui/table/TableLink";
import { Text } from "@/src/components/ui/text/Text";
import { useLocalSearchParams, useRouter } from "expo-router";
import { type ReactNode, useMemo } from "react";
import type { CrewDto } from "../../contracts";
import { CrewMedicalPill, CrewStatusPill } from "./crew.ui";

type Props = {
  title: string;
  subtitleRight?: string;
  headerActions?: ReactNode;
  data: CrewDto[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  minWidth?: number;
  onRowPress?: (row: CrewDto) => void;
  showVesselColumn?: boolean;
  sortBy?: "ACTIVE_FIRST" | "NAME_ASC" | "NAME_DESC";
  selectedRowId?: string | null;
};

export function CrewTable(props: Props) {
  const router = useRouter();
  const { projectId } = useLocalSearchParams();
  const pid = String(projectId);

  const rows = useMemo(() => {
    const arr = [...props.data];

    const compareByName = (a: CrewDto, b: CrewDto) =>
      a.fullName.localeCompare(b.fullName);

    switch (props.sortBy ?? "ACTIVE_FIRST") {
      case "NAME_ASC":
        arr.sort(compareByName);
        break;
      case "NAME_DESC":
        arr.sort((a, b) => compareByName(b, a));
        break;
      default:
        arr.sort((a, b) => {
          if (a.status !== b.status) return a.status === "ACTIVE" ? -1 : 1;
          return compareByName(a, b);
        });
        break;
    }

    return arr;
  }, [props.data, props.sortBy]);

  const columns = useMemo<Column<CrewDto>[]>(() => {
    const cols: Column<CrewDto>[] = [
      {
        key: "name",
        header: "Crew Member",
        flex: 2,
        render: (row) => (
          <RegistryTableTextStack
            primary={row.fullName}
            secondary={row.nationality ?? "Crew member"}
          />
        ),
      },
    ];

    if (props.showVesselColumn) {
      cols.push({
        key: "vessel",
        header: "Vessel",
        flex: 2,
        render: (row) => (
          <TableLink
            tooltip="Open vessel"
            onPress={() =>
              router.push(`/projects/${pid}/vessels/${row.assetId}`)
            }
          >
            {row.assetName ?? row.assetId}
          </TableLink>
        ),
      });
    }

    cols.push(
      {
        key: "rank",
        header: "Rank",
        flex: 1.5,
        render: (row) => <Text>{row.rank ?? "-"}</Text>,
      },
      {
        key: "department",
        header: "Department",
        flex: 1,
        render: (row) => <Text>{row.department ?? "-"}</Text>,
      },
      {
        key: "status",
        header: "Status",
        flex: 1,
        render: (row) => (
          <CrewStatusPill
            status={row.status}
            inactiveReason={row.inactiveReason}
          />
        ),
      },
      {
        key: "medical",
        header: "Medical",
        flex: 1,
        render: (row) => <CrewMedicalPill valid={row.medicalCertificateValid} />,
      },
    );

    return cols;
  }, [router, pid, props.showVesselColumn]);

  return (
    <DataTable<CrewDto>
      title={props.title}
      subtitleRight={props.subtitleRight}
      headerActions={props.headerActions}
      data={rows}
      isLoading={props.isLoading}
      error={props.error}
      onRetry={props.onRetry}
      columns={columns}
      minWidth={props.minWidth ?? (props.showVesselColumn ? 1080 : 900)}
      getRowId={(row) => row.id}
      onRowPress={props.onRowPress}
      emptyText="No crew members found."
      selectedRowId={props.selectedRowId ?? null}
    />
  );
}
