import { Column, DataTable, TableLink, Text } from "@/src/components";
import type { AssetDto } from "@/src/contracts/assets.contract";
import { useRouter } from "expo-router";
import { useMemo } from "react";

export type VesselRow = AssetDto;

type Props = {
  title: string;
  subtitleRight?: string;
  data: VesselRow[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  minWidth?: number;
  onRowPress?: (row: VesselRow) => void;
  sortByName?: boolean;
  projectId: string;
  selectedRowId?: string | null;
};

function vesselIdentifier(a: AssetDto) {
  if (!a.vessel) return "—";
  if (a.vessel.identifierType === "IMO") return a.vessel.imo ?? "—";
  return a.vessel.licenseNumber ?? "—";
}

function vesselIdentifierLabel(a: AssetDto) {
  if (!a.vessel) return "ID";
  return a.vessel.identifierType;
}

export function VesselsTable(props: Props) {
  const router = useRouter();

  const rows = useMemo(() => {
    if (!props.sortByName) return props.data;
    const arr = [...props.data];
    arr.sort((a, b) => a.name.localeCompare(b.name));
    return arr;
  }, [props.data, props.sortByName]);

  const columns = useMemo<Column<VesselRow>[]>(() => {
    const cols: Column<VesselRow>[] = [
      {
        key: "name",
        header: "Vessel",
        flex: 2,
        render: (r) => (
          <TableLink
            tooltip="Open vessel page"
            onPress={() =>
              router.push(`/projects/${props.projectId}/vessels/${r.id}`)
            }
          >
            {r.name}
          </TableLink>
        ),
      },
      {
        key: "identifier",
        header: "Identifier",
        flex: 2,
        render: (r) => (
          <Text>
            {vesselIdentifierLabel(r)}: {vesselIdentifier(r)}
          </Text>
        ),
      },
      {
        key: "flag",
        header: "Flag",
        flex: 1,
        render: (r) => <Text>{r.vessel?.flag ?? "—"}</Text>,
      },
      {
        key: "status",
        header: "Status",
        flex: 1,
        render: (r) => <Text>{r.status}</Text>,
      },
    ];

    return cols;
  }, [router, props.projectId]);

  return (
    <DataTable<VesselRow>
      title={props.title}
      subtitleRight={props.subtitleRight}
      data={rows}
      isLoading={props.isLoading}
      error={props.error}
      onRetry={props.onRetry}
      columns={columns}
      minWidth={props.minWidth ?? 920}
      getRowId={(r) => r.id}
      onRowPress={props.onRowPress}
      emptyText="No vessels found."
      selectedRowId={props.selectedRowId ?? null}
    />
  );
}
