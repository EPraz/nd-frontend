import type { PaginationMetaDto } from "@/src/contracts/pagination.contract";
import React from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
} from "react-native";
import { Text, TextClassContext } from "../text/Text";

export type Column<Row> = {
  key: string;
  header: string;
  flex: number;
  render: (row: Row) => React.ReactNode;
};

export type DataTableProps<Row> = {
  title: string;
  subtitleRight?: string;
  headerActions?: React.ReactNode;
  toolbarContent?: React.ReactNode;

  data: Row[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;

  columns: Column<Row>[];
  minWidth?: number;

  getRowId: (row: Row) => string;
  onRowPress?: (row: Row) => void;

  selectedRowId?: string | null;

  emptyText?: string;
  pagination?: {
    meta: PaginationMetaDto;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
    pageSizeOptions?: number[];
  };
};

export function DataTable<Row>(props: DataTableProps<Row>) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <View className="flex gap-4 rounded-[22px] border border-shellLine bg-shellPanel p-5 web:backdrop-blur-md">
      <View className="gap-3">
        <View className="gap-1">
          <Text className="text-[18px] leading-[130%] font-semibold text-textMain">
            {props.title}
          </Text>

          {props.subtitleRight ? (
            <Text className="text-[11px] text-muted">
              {props.subtitleRight}
            </Text>
          ) : null}
        </View>

        {props.headerActions ? (
          <View className="flex-row flex-wrap items-center justify-end gap-2">
            {props.headerActions}
          </View>
        ) : null}
      </View>

      {props.toolbarContent ? <View>{props.toolbarContent}</View> : null}

      <View className="overflow-hidden rounded-[18px] border border-shellLine bg-shellPanelSoft/75">
        <View className="flex-1">
          {props.isLoading ? (
            isMobile ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ minWidth: props.minWidth ?? 860 }}>
                  <TableLoadingState columns={props.columns} />
                </View>
              </ScrollView>
            ) : (
              <TableLoadingState columns={props.columns} />
            )
          ) : props.error ? (
            <View className="gap-3 px-5 py-5">
              <Text className="text-sm text-destructive">{props.error}</Text>

              <Pressable
                onPress={props.onRetry}
                className="self-start rounded-full border border-accent/25 bg-accent/10 px-4 py-2"
              >
                <Text className="font-semibold text-accent">Retry</Text>
              </Pressable>
            </View>
          ) : props.data.length === 0 ? (
            <View className="px-5 py-5">
              <Text className="text-sm text-muted">
                {props.emptyText ?? "No data found."}
              </Text>
            </View>
          ) : isMobile ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ minWidth: props.minWidth ?? 860 }}>
                <TableList {...props} />
              </View>
            </ScrollView>
          ) : (
            <TableList {...props} />
          )}
        </View>
      </View>

      {props.pagination && !props.isLoading && !props.error ? (
        <TablePaginationControls
          meta={props.pagination.meta}
          onPageChange={props.pagination.onPageChange}
          onPageSizeChange={props.pagination.onPageSizeChange}
          pageSizeOptions={props.pagination.pageSizeOptions}
        />
      ) : null}
    </View>
  );
}

function TableLoadingState<Row>(props: { columns: Column<Row>[] }) {
  return (
    <View>
      <Header columns={props.columns} />
      {Array.from({ length: 4 }).map((_, rowIndex) => (
        <View
          key={rowIndex}
          className="flex-row items-center w-full min-h-[68px] border-b border-shellLine"
        >
          {props.columns.map((column, columnIndex) => (
            <View
              key={column.key}
              className="px-4 py-3"
              style={{ flex: column.flex }}
            >
              <View
                className="rounded-full bg-shellLine"
                style={{
                  width: columnIndex === 0 ? "68%" : "46%",
                  height: columnIndex === 0 ? 14 : 11,
                  opacity: columnIndex === 0 ? 0.64 : 0.42,
                }}
              />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

export function TablePaginationControls({
  meta,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
}: {
  meta: PaginationMetaDto;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
}) {
  const start = meta.totalItems === 0 ? 0 : (meta.page - 1) * meta.pageSize + 1;
  const end = Math.min(meta.totalItems, meta.page * meta.pageSize);

  return (
    <View className="flex-row flex-wrap items-center justify-between gap-3 border-t border-shellLine pt-4">
      <Text className="text-[12px] text-muted">
        Showing {start}-{end} of {meta.totalItems}
      </Text>

      <View className="flex-row flex-wrap items-center gap-2">
        {onPageSizeChange ? (
          <View className="flex-row items-center gap-1">
            {pageSizeOptions.map((option) => {
              const active = option === meta.pageSize;

              return (
                <Pressable
                  key={option}
                  onPress={() => onPageSizeChange(option)}
                  className={[
                    "rounded-full border px-3 py-2",
                    active
                      ? "border-accent/45 bg-accent/15"
                      : "border-shellLine bg-shellPanelSoft",
                  ].join(" ")}
                >
                  <Text
                    className={[
                      "text-[12px] font-semibold",
                      active ? "text-accent" : "text-muted",
                    ].join(" ")}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <View className="flex-row items-center gap-2">
          <PaginationButton
            label="Previous"
            disabled={!meta.hasPreviousPage}
            onPress={() => onPageChange(meta.page - 1)}
          />
          <Text className="text-[12px] font-semibold text-textMain">
            Page {meta.page} of {meta.totalPages}
          </Text>
          <PaginationButton
            label="Next"
            disabled={!meta.hasNextPage}
            onPress={() => onPageChange(meta.page + 1)}
          />
        </View>
      </View>
    </View>
  );
}

function PaginationButton({
  label,
  disabled,
  onPress,
}: {
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      className={[
        "rounded-full border px-4 py-2",
        disabled
          ? "border-shellLine bg-shellPanelSoft opacity-50"
          : "border-accent/35 bg-accent/10 web:hover:bg-accent/15",
      ].join(" ")}
    >
      <Text
        className={[
          "text-[12px] font-semibold",
          disabled ? "text-muted" : "text-accent",
        ].join(" ")}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function TableList<Row>(props: DataTableProps<Row>) {
  return (
    <FlatList
      data={props.data}
      keyExtractor={(row) => props.getRowId(row)}
      ListHeaderComponent={<Header columns={props.columns} />}
      stickyHeaderIndices={[0]}
      renderItem={({ item, index }) => (
        <RowItem
          row={item}
          rowId={props.getRowId(item)}
          index={index}
          columns={props.columns}
          onRowPress={props.onRowPress}
          selected={props.selectedRowId === props.getRowId(item)}
        />
      )}
      contentContainerStyle={{ flexGrow: 1 }}
    />
  );
}

function Header<Row>(props: { columns: Column<Row>[] }) {
  return (
    <TextClassContext.Provider value="text-muted text-[11px] tracking-[0.24em] uppercase">
      <View className="flex-row items-center w-full h-[48px] border-b border-shellLine bg-shellChromeSoft/75">
        {props.columns.map((c) => (
          <Text key={c.key} className="px-4 py-2" style={{ flex: c.flex }}>
            {c.header}
          </Text>
        ))}
      </View>
    </TextClassContext.Provider>
  );
}

type PressState = { pressed: boolean } & { hovered?: boolean };

function RowItem<Row>(props: {
  row: Row;
  rowId: string;
  index: number;
  columns: Column<Row>[];
  onRowPress?: (row: Row) => void;
  selected: boolean;
}) {
  const clickable = Boolean(props.onRowPress);

  const zebraBg =
    props.index % 2 === 0 ? "bg-transparent" : "bg-shellPanelSoft/30";

  const renderRow = (state?: PressState) => {
    const hovered = Boolean(state?.hovered);
    const pressed = Boolean(state?.pressed);

    const active = hovered || props.selected;

    const textClass = active
      ? "text-textMain text-[12px]"
      : "text-muted text-[12px]";

    return (
      <TextClassContext.Provider value={textClass}>
        <View
          className={[
            "relative flex-row items-center w-full min-h-[68px] border-b border-shellLine transition-colors",
            zebraBg,
            hovered ? "bg-shellCardHover/90" : "",
            hovered ? "web:z-[300]" : "web:z-[1]",
            pressed ? "opacity-95" : "",
            props.selected
              ? "bg-accent/12 border-l-2 border-accent"
              : "border-l-2 border-transparent",
          ].join(" ")}
        >
          {props.columns.map((c) => (
            <View key={c.key} className="px-4 py-3" style={{ flex: c.flex }}>
              {c.render(props.row)}
            </View>
          ))}

          {props.selected ? (
            <View
              className="absolute inset-0 border border-accent/25"
              style={{ pointerEvents: "none" }}
            />
          ) : null}
        </View>
      </TextClassContext.Provider>
    );
  };

  if (!clickable) return renderRow();

  return (
    <Pressable
      onPress={() => props.onRowPress?.(props.row)}
      className="web:cursor-pointer"
    >
      {(state) => renderRow(state as PressState)}
    </Pressable>
  );
}
