import { fireEvent, render, screen } from "@testing-library/react-native";
import { DataTable, type Column } from "../DataTable";
import { Text } from "../../text/Text";

type TestRow = {
  id: string;
  name: string;
};

const columns: Column<TestRow>[] = [
  {
    key: "name",
    header: "Name",
    flex: 1,
    render: (row) => <Text>{row.name}</Text>,
  },
];

const rows: TestRow[] = [
  {
    id: "crew-1",
    name: "Ahmed Hassan",
  },
];

function renderTable({
  hasPreviousPage = true,
  hasNextPage = true,
}: {
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
} = {}) {
  const onPageChange = jest.fn();
  const onPageSizeChange = jest.fn();

  render(
    <DataTable<TestRow>
      title="Crew roster"
      data={rows}
      isLoading={false}
      error={null}
      onRetry={jest.fn()}
      columns={columns}
      getRowId={(row) => row.id}
      pagination={{
        meta: {
          page: 2,
          pageSize: 25,
          totalItems: 80,
          totalPages: 4,
          hasPreviousPage,
          hasNextPage,
        },
        onPageChange,
        onPageSizeChange,
      }}
    />,
  );

  return {
    onPageChange,
    onPageSizeChange,
  };
}

describe("DataTable pagination", () => {
  it("GIVEN a paginated table WHEN the user advances or changes page size SHOULD call pagination handlers", () => {
    const { onPageChange, onPageSizeChange } = renderTable();

    expect(screen.getByText("Showing 26-50 of 80")).toBeOnTheScreen();
    expect(screen.getByText("Page 2 of 4")).toBeOnTheScreen();

    fireEvent.press(screen.getByText("Next"));
    fireEvent.press(screen.getByText("Previous"));
    fireEvent.press(screen.getByText("50"));

    expect(onPageChange).toHaveBeenCalledWith(3);
    expect(onPageChange).toHaveBeenCalledWith(1);
    expect(onPageSizeChange).toHaveBeenCalledWith(50);
  });

  it("GIVEN a boundary page WHEN next is disabled SHOULD not request an unavailable page", () => {
    const { onPageChange } = renderTable({ hasNextPage: false });

    fireEvent.press(screen.getByText("Next"));

    expect(onPageChange).not.toHaveBeenCalledWith(3);
  });
});
