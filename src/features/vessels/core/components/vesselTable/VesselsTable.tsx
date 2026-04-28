import {
  DataTable,
  type Column,
  type DataTableProps,
} from "@/src/components/ui/table/DataTable";
import { RegistryTablePill } from "@/src/components/ui/table/RegistryTablePill";
import { TableActionIcon } from "@/src/components/ui/table/TableActionIcon";
import { TableLink } from "@/src/components/ui/table/TableLink";
import { Text } from "@/src/components/ui/text/Text";
import type { AssetDto } from "@/src/contracts/assets.contract";
import { humanizeTechnicalLabel } from "@/src/helpers";
import { useRouter } from "expo-router";
import { useMemo, type ReactNode } from "react";

export type VesselRow = AssetDto;

type Props = {
  title: string;
  subtitleRight?: string;
  headerActions?: ReactNode;
  toolbarContent?: ReactNode;
  data: VesselRow[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  minWidth?: number;
  onRowPress?: (row: VesselRow) => void;
  sortBy?: "NAME_ASC" | "NAME_DESC";
  projectId: string;
  selectedRowId?: string | null;
  pagination?: DataTableProps<VesselRow>["pagination"];
};

function vesselIdentifier(asset: AssetDto) {
  if (!asset.vessel) return "—";
  if (asset.vessel.identifierType === "IMO") return asset.vessel.imo ?? "—";
  return asset.vessel.licenseNumber ?? "—";
}

function vesselIdentifierLabel(asset: AssetDto) {
  if (!asset.vessel) return "ID";
  return asset.vessel.identifierType;
}

function profileTone(asset: AssetDto): "ok" | "warn" {
  if (!asset.vessel) return "warn";
  if (!asset.vessel.flag) return "warn";
  return "ok";
}

function profileCopy(asset: AssetDto) {
  if (!asset.vessel) return "Profile needed";
  if (!asset.vessel.flag) return "Missing flag";
  return "Ready";
}

function statusTone(status: string): "ok" | "warn" | "info" {
  const normalized = status.toLowerCase();
  if (["active", "ready"].includes(normalized)) return "ok";
  if (["paused", "on_hold", "blocked"].includes(normalized)) return "warn";
  return "info";
}

function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: "ok" | "warn" | "info";
}) {
  return <RegistryTablePill label={label} tone={tone} />;
}

export function VesselsTable(props: Props) {
  const router = useRouter();

  const rows = useMemo(() => {
    if (!props.sortBy) return props.data;
    const arr = [...props.data];
    arr.sort((a, b) =>
      props.sortBy === "NAME_DESC"
        ? b.name.localeCompare(a.name)
        : a.name.localeCompare(b.name),
    );
    return arr;
  }, [props.data, props.sortBy]);

  const columns = useMemo<Column<VesselRow>[]>(() => {
    const cols: Column<VesselRow>[] = [
      {
        key: "name",
        header: "Vessel",
        flex: 2.2,
        render: (row) => (
          <>
            <TableLink
              tooltip="Open vessel page"
              onPress={() =>
                router.push(`/projects/${props.projectId}/vessels/${row.id}`)
              }
            >
              {row.name}
            </TableLink>
            <Text className="mt-1 text-[11px] text-muted">
              {row.vessel?.vesselType ?? "Vessel profile"}
            </Text>
          </>
        ),
      },
      {
        key: "registry",
        header: "Registry",
        flex: 1.9,
        render: (row) => (
          <>
            <Text className="text-textMain">
              {vesselIdentifierLabel(row)}: {vesselIdentifier(row)}
            </Text>
            <Text className="mt-1 text-[11px] text-muted">
              Flag: {row.vessel?.flag ?? "Not set"}
            </Text>
          </>
        ),
      },
      {
        key: "profile",
        header: "Profile",
        flex: 1.15,
        render: (row) => (
          <StatusPill label={profileCopy(row)} tone={profileTone(row)} />
        ),
      },
      {
        key: "status",
        header: "Status",
        flex: 1,
        render: (row) => (
          <StatusPill
            label={humanizeTechnicalLabel(row.status)}
            tone={statusTone(row.status)}
          />
        ),
      },
      {
        key: "action",
        header: "Open",
        flex: 0.75,
        render: (row) => (
          <TableActionIcon
            icon="open-outline"
            tooltip="Open vessel page"
            tone="accent"
            onPress={() =>
              router.push(`/projects/${props.projectId}/vessels/${row.id}`)
            }
          />
        ),
      },
    ];

    return cols;
  }, [props.projectId, router]);

  return (
    <DataTable<VesselRow>
      title={props.title}
      subtitleRight={props.subtitleRight}
      headerActions={props.headerActions}
      toolbarContent={props.toolbarContent}
      data={rows}
      isLoading={props.isLoading}
      error={props.error}
      onRetry={props.onRetry}
      columns={columns}
      minWidth={props.minWidth ?? 980}
      getRowId={(row) => row.id}
      onRowPress={props.onRowPress}
      emptyText="No vessels found."
      selectedRowId={props.selectedRowId ?? null}
      pagination={props.pagination}
    />
  );
}
