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

  data: Row[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;

  columns: Column<Row>[];
  minWidth?: number;

  getRowId: (row: Row) => string;
  onRowPress?: (row: Row) => void;

  // ✅ NUEVO: selección
  selectedRowId?: string | null;

  emptyText?: string;
};

export function DataTable<Row>(props: DataTableProps<Row>) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <View className="flex p-5 gap-5 rounded-[20px] bg-surface border border-border">
      <View className="flex-row items-center justify-between gap-10">
        <Text className="text-[20px] leading-[130%] font-semibold text-textMain">
          {props.title}
        </Text>

        {props.subtitleRight ? (
          <Text className="text-[12px] text-muted">{props.subtitleRight}</Text>
        ) : null}
      </View>

      <View className="flex-1">
        {props.isLoading ? (
          <Text className="text-sm text-muted">Loading…</Text>
        ) : props.error ? (
          <View className="gap-3 p-4 rounded-xl bg-muted/20 border border-border">
            <Text className="text-sm text-destructive">{props.error}</Text>

            <Pressable
              onPress={props.onRetry}
              className="self-start rounded-full px-4 py-2 bg-accent/10 border border-accent/25"
            >
              <Text className="text-accent font-semibold">Retry</Text>
            </Pressable>
          </View>
        ) : props.data.length === 0 ? (
          <View className="p-4 rounded-xl bg-muted/20 border border-border">
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
    <TextClassContext.Provider value="text-muted text-[12px] tracking-wide uppercase">
      <View className="flex-row items-center w-full h-[48px] rounded-tr-2xl rounded-tl-2xl bg-baseBg border-b border-border">
        {props.columns.map((c) => (
          <Text key={c.key} className="px-3 py-2" style={{ flex: c.flex }}>
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

  const zebraBg = props.index % 2 === 0 ? "bg-baseBg/60" : "bg-surface/20";

  const renderRow = (state?: PressState) => {
    const hovered = Boolean(state?.hovered);
    const pressed = Boolean(state?.pressed);

    const active = hovered || props.selected;

    // ✅ color base para TODO texto dentro del row
    const textClass = active
      ? "text-textMain text-[12px]"
      : "text-muted text-[12px]";

    return (
      <TextClassContext.Provider value={textClass}>
        <View
          className={[
            "flex-row items-center w-full h-[65px] border-b border-border transition-colors",
            zebraBg,
            hovered ? "bg-accent/40" : "",
            pressed ? "opacity-95" : "",
            props.selected
              ? "bg-accent/12 border-l-2 border-accent"
              : "border-l-2 border-transparent",
          ].join(" ")}
        >
          {props.columns.map((c) => (
            <View key={c.key} className="p-3" style={{ flex: c.flex }}>
              {c.render(props.row)}
            </View>
          ))}

          {props.selected ? (
            <View
              pointerEvents="none"
              className="absolute inset-0 border border-accent/25"
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
