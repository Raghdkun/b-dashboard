/* ────────────────────────────────────────────────────────────────────────── */
/*  Maintenance Request Types                                               */
/* ────────────────────────────────────────────────────────────────────────── */

export type MaintenanceStatus = "done" | "in_progress" | "pending" | "cancelled";

export interface MaintenanceRequest {
  id: number;
  entryNumber: number;
  status: MaintenanceStatus;
  brokenItem: string;
  submittedAt: string;
}

export interface MaintenanceResponse {
  storeNumber: string;
  storeName: string;
  limit: number;
  count: number;
  data: MaintenanceRequest[];
}

/** Raw API shape (snake_case) */
export interface ApiMaintenanceRequest {
  id: number;
  entry_number: number;
  status: string;
  broken_item: string;
  submitted_at: string;
}

export interface ApiMaintenanceResponse {
  store_number: string;
  store_name: string;
  limit: number;
  count: number;
  data: ApiMaintenanceRequest[];
}

export interface MaintenanceErrorState {
  message: string;
  code: string;
  retryable: boolean;
}

export interface GetMaintenanceParams {
  storeId: string;
  limit?: number;
}
