export type StandardResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
};

export type PaginationParams = {
  page: number;
  limit: number;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedResult<T> = {
  items: T[];
  meta: PaginationMeta;
};

export type SelectOption = {
  label: string;
  value: string;
};
