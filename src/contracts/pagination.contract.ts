export type PaginationMetaDto = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export type PaginatedResponseDto<Item> = {
  items: Item[];
  meta: PaginationMetaDto;
};

export type PaginationRequest = {
  page: number;
  pageSize: number;
};

export const DEFAULT_PAGE_SIZE = 10;

export type PaginationSearchValue = string | number | boolean | null | undefined;

export type DateWindowFilter =
  | "OVERDUE"
  | "NEXT_7"
  | "NEXT_30"
  | "NEXT_60"
  | "NEXT_90"
  | "LAST_7"
  | "LAST_30"
  | "LAST_90"
  | "THIS_YEAR";

export function buildPaginationQuery(params: Record<string, PaginationSearchValue>) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === "") continue;
    query.set(key, String(value));
  }

  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
}
