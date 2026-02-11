/* ────────────────────────────────────────────────────────────────────────── */
/*  Maintenance Request Types                                               */
/* ────────────────────────────────────────────────────────────────────────── */

export type MaintenanceStatus = "done" | "in_progress" | "pending" | "canceled" | "cancelled";

export interface MaintenanceRequest {
  id: number;
  entryNumber: number;
  status: MaintenanceStatus;
  brokenItem: string;
  submittedAt: string;
}

/* ── Pagination ────────────────────────────────────────────────────────── */

export interface PaginationInfo {
  currentPage: number;
  perPage: number;
  total: number;
  lastPage: number;
  from: number;
  to: number;
}

export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface MaintenanceResponse {
  storeNumber: string;
  storeName: string;
  pagination?: PaginationInfo;
  links?: PaginationLinks;
  /** Present when the response uses limit-based (non-paginated) format */
  limit?: number;
  count?: number;
  data: MaintenanceRequest[];
}

/* ── Raw API shape (snake_case) ────────────────────────────────────────── */

export interface ApiMaintenanceRequest {
  id: number;
  entry_number: number;
  status: string;
  broken_item: string;
  submitted_at: string;
}

export interface ApiPaginationInfo {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
}

export interface ApiPaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface ApiMaintenanceResponse {
  store_number: string;
  store_name: string;
  pagination?: ApiPaginationInfo;
  links?: ApiPaginationLinks;
  /** Present when the response uses limit-based (non-paginated) format */
  limit?: number;
  count?: number;
  data: ApiMaintenanceRequest[];
}

export interface MaintenanceErrorState {
  message: string;
  code: string;
  retryable: boolean;
}

export interface GetMaintenanceParams {
  storeId: string;
  page?: number;
}
