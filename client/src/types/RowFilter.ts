export interface RowFilter {
  filterType: RowFilterType;
  value: string;
}

export enum RowFilterType {
  includeNetwork = "includeNetwork",
  includeTag = "includeTag",
  byCategory = "byCategory",
  includeCoin = "includeCoin",
}
