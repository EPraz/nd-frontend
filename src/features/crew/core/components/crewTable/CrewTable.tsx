import {
  DataTable,
  type DataTableProps,
  RegistryTableTextStack,
  TableActionMenu,
  type TableActionMenuItem,
  type Column,
} from "@/src/components/ui/table";
import { TableLink } from "@/src/components/ui/table/TableLink";
import { Text } from "@/src/components/ui/text/Text";
import { formatDate } from "@/src/helpers";
import { useRouter } from "expo-router";
import { type ReactNode, useMemo } from "react";
import { View } from "react-native";
import type { CrewDepartment, CrewDto } from "../../contracts";
import { CrewMedicalPill, CrewStatusPill } from "./crew.ui";

type Props = {
  projectId: string;
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
  pagination?: DataTableProps<CrewDto>["pagination"];
};

function humanizeDepartment(value: CrewDepartment | null): string {
  if (!value) return "Department not set";

  return value
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function nextChangeDetails(crew: CrewDto): {
  primary: string;
  secondary: string;
} {
  if (crew.expectedDateOfDisembarkation) {
    return {
      primary: formatDate(crew.expectedDateOfDisembarkation),
      secondary: "Expected disembarkation",
    };
  }

  if (crew.nextVacationDate) {
    return {
      primary: formatDate(crew.nextVacationDate),
      secondary: "Next vacation",
    };
  }

  return {
    primary: "Not set",
    secondary: "Rotation not planned",
  };
}

export function CrewTable(props: Props) {
  const router = useRouter();
  const pid = props.projectId;

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
          <View className="gap-1">
            <View className="self-start">
              <TableLink
                tooltip="Open crew profile"
                onPress={() =>
                  router.push(
                    `/projects/${pid}/vessels/${row.assetId}/crew/${row.id}`,
                  )
                }
              >
                {row.fullName}
              </TableLink>
            </View>
            <Text className="text-[12px] text-muted">
              {row.nationality ?? "Crew member"}
            </Text>
          </View>
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
        key: "assignment",
        header: "Rank / Department",
        flex: 1.8,
        render: (row) => (
          <RegistryTableTextStack
            primary={row.rank ?? "Rank not set"}
            secondary={humanizeDepartment(row.department)}
          />
        ),
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
        render: (row) => (
          <CrewMedicalPill valid={row.medicalCertificateValid} />
        ),
      },
      {
        key: "nextChange",
        header: "Next Change",
        flex: 1.35,
        render: (row) => {
          const change = nextChangeDetails(row);

          return (
            <RegistryTableTextStack
              primary={change.primary}
              secondary={change.secondary}
            />
          );
        },
      },
      {
        key: "actions",
        header: "",
        flex: 0.38,
        render: (row) => {
          const actions: TableActionMenuItem[] = [
            {
              label: "Open profile",
              icon: "person-outline",
              onPress: () =>
                router.push(
                  `/projects/${pid}/vessels/${row.assetId}/crew/${row.id}`,
                ),
            },
            {
              label: "Edit crew",
              icon: "create-outline",
              onPress: () =>
                router.push(
                  `/projects/${pid}/vessels/${row.assetId}/crew/${row.id}/edit`,
                ),
            },
            {
              label: "Certificates",
              icon: "ribbon-outline",
              onPress: () =>
                router.push(
                  `/projects/${pid}/vessels/${row.assetId}/crew/${row.id}/certificates`,
                ),
            },
          ];

          if (props.showVesselColumn) {
            actions.push({
              label: "Open vessel",
              icon: "open-outline",
              onPress: () =>
                router.push(`/projects/${pid}/vessels/${row.assetId}`),
              tone: "accent",
            });
          }

          return <TableActionMenu items={actions} />;
        },
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
      minWidth={props.minWidth ?? (props.showVesselColumn ? 1110 : 930)}
      getRowId={(row) => row.id}
      onRowPress={props.onRowPress}
      emptyText="No crew members found."
      selectedRowId={props.selectedRowId ?? null}
      pagination={props.pagination}
    />
  );
}
