import { Column, DataTable, TableLink, Text } from "@/src/components";
import { formatDate } from "@/src/helpers";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import type { FuelDto } from "../../contracts";
import { FuelEventPill, FuelTypePill } from "./fuel.ui";

type Props = {
  title: string;
  subtitleRight?: string;

  data: FuelDto[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;

  minWidth?: number;
  onRowPress?: (row: FuelDto) => void;

  showVesselColumn?: boolean;
  sortByDate?: boolean;
  groupByFuelType?: boolean;

  // ✅ selection support
  selectedRowId?: string | null;
};

export function FuelTable(props: Props) {
  const router = useRouter();
  const { projectId } = useLocalSearchParams();
  const pid = String(projectId);

  const rows = useMemo(() => {
    const arr = [...props.data];

    if (props.groupByFuelType) {
      arr.sort((a, b) => {
        const ft = a.fuelType.localeCompare(b.fuelType);
        if (ft !== 0) return ft;

        if (!props.sortByDate) return 0;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      return arr;
    }

    if (props.sortByDate) {
      arr.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
    }

    return arr;
  }, [props.data, props.sortByDate, props.groupByFuelType]);

  const columns = useMemo<Column<FuelDto>[]>(() => {
    const cols: Column<FuelDto>[] = [
      {
        key: "date",
        header: "Date",
        flex: 1,
        render: (r) => <Text>{formatDate(r.date)}</Text>,
      },
    ];

    if (props.showVesselColumn) {
      cols.push({
        key: "vessel",
        header: "Vessel",
        flex: 2,
        render: (r) => (
          <TableLink
            tooltip="Open vessel"
            onPress={() => router.push(`/projects/${pid}/vessels/${r.assetId}`)}
          >
            {r.asset?.name ?? r.assetId}
          </TableLink>
        ),
      });
    }

    cols.push(
      {
        key: "eventType",
        header: "Event",
        flex: 1,
        render: (r) => <FuelEventPill type={r.eventType} />,
      },
      {
        key: "fuelType",
        header: "Fuel",
        flex: 1,
        render: (r) => <FuelTypePill fuelType={r.fuelType} />,
      },
      {
        key: "quantity",
        header: "Quantity",
        flex: 1,
        render: (r) => (
          <Text>
            {r.quantity} {r.unit}
          </Text>
        ),
      },
      {
        key: "price",
        header: "Price",
        flex: 1,
        render: (r) => (
          <Text>{r.price ? `${r.price} ${r.currency ?? ""}` : "—"}</Text>
        ),
      },
      {
        key: "location",
        header: "Location",
        flex: 1,
        render: (r) => <Text>{r.location ?? "—"}</Text>,
      },
    );

    return cols;
  }, [router, pid, props.showVesselColumn]);

  return (
    <DataTable<FuelDto>
      title={props.title}
      subtitleRight={props.subtitleRight}
      data={rows}
      isLoading={props.isLoading}
      error={props.error}
      onRetry={props.onRetry}
      columns={columns}
      minWidth={props.minWidth ?? (props.showVesselColumn ? 1040 : 860)}
      getRowId={(r) => r.id}
      onRowPress={props.onRowPress}
      emptyText="No fuel events found."
      selectedRowId={props.selectedRowId ?? null}
    />
  );
}
