import axios from "axios";
import type {
  ApiMaintenanceResponse,
  MaintenanceResponse,
  MaintenanceRequest,
  ApiMaintenanceRequest,
  MaintenanceStatus,
} from "@/types/maintenance.types";

/* ────────────────────────────────────────────────────────────────────────── */
/*  Error Handling                                                          */
/* ────────────────────────────────────────────────────────────────────────── */

export type MaintenanceErrorCode =
  | "NO_STORE"
  | "NOT_AUTHENTICATED"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "SERVER_ERROR"
  | "UNKNOWN";

export class MaintenanceError extends Error {
  readonly code: MaintenanceErrorCode;
  readonly retryable: boolean;
  readonly retryAfter?: number;

  constructor(
    message: string,
    code: MaintenanceErrorCode,
    retryAfter?: number
  ) {
    super(message);
    this.name = "MaintenanceError";
    this.code = code;
    this.retryAfter = retryAfter;
    this.retryable = ["TIMEOUT", "NETWORK_ERROR", "SERVER_ERROR"].includes(
      code
    );
  }
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Transform helpers                                                       */
/* ────────────────────────────────────────────────────────────────────────── */

function transformRequest(raw: ApiMaintenanceRequest): MaintenanceRequest {
  return {
    id: raw.id,
    entryNumber: raw.entry_number,
    status: raw.status as MaintenanceStatus,
    brokenItem: raw.broken_item,
    submittedAt: raw.submitted_at,
  };
}

function transformResponse(raw: ApiMaintenanceResponse): MaintenanceResponse {
  return {
    storeNumber: raw.store_number,
    storeName: raw.store_name,
    limit: raw.limit,
    count: raw.count,
    data: raw.data.map(transformRequest),
  };
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Auth helper                                                             */
/* ────────────────────────────────────────────────────────────────────────── */

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("auth-token");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

function getSelectedStoreId(): string | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("selected-store-storage");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed?.state?.selectedStore?.storeId ?? null;
  } catch {
    return null;
  }
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Service                                                                 */
/* ────────────────────────────────────────────────────────────────────────── */

const DEFAULT_LIMIT = 10;

export const maintenanceService = {
  /**
   * Fetch maintenance requests for a given store through the local API proxy.
   *
   * @param storeId - Store ID (e.g., "03795-00001"). If omitted, uses selected store.
   * @param limit   - Max number of maintenance requests to return (default 10).
   * @param signal  - Optional AbortSignal for cancellation.
   */
  async getRequests(
    storeId?: string,
    limit: number = DEFAULT_LIMIT,
    signal?: AbortSignal
  ): Promise<MaintenanceResponse> {
    // Resolve store ID
    const resolvedStoreId = storeId || getSelectedStoreId();
    if (!resolvedStoreId) {
      throw new MaintenanceError(
        "No store selected. Please select a store first.",
        "NO_STORE"
      );
    }

    // Resolve token
    const token = getToken();
    if (!token) {
      throw new MaintenanceError(
        "You must be logged in to view maintenance requests.",
        "NOT_AUTHENTICATED"
      );
    }

    const url = `/api/maintenance/${encodeURIComponent(resolvedStoreId)}`;

    try {
      const response = await axios.get<ApiMaintenanceResponse>(url, {
        params: { limit },
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        timeout: 15_000,
        signal,
      });

      return transformResponse(response.data);
    } catch (err) {
      if (axios.isCancel(err)) throw err;

      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const errorData = err.response?.data as
          | { error?: { code?: string; message?: string } }
          | undefined;
        const serverCode = errorData?.error?.code;
        const serverMessage = errorData?.error?.message;

        if (status === 401 || serverCode === "UNAUTHORIZED") {
          throw new MaintenanceError(
            serverMessage || "Authentication failed.",
            "UNAUTHORIZED"
          );
        }
        if (status === 403 || serverCode === "FORBIDDEN") {
          throw new MaintenanceError(
            serverMessage ||
              "You do not have permission to view maintenance requests for this store.",
            "FORBIDDEN"
          );
        }
        if (status === 404 || serverCode === "NOT_FOUND") {
          throw new MaintenanceError(
            serverMessage ||
              "No maintenance data found for this store.",
            "NOT_FOUND"
          );
        }
        if (status === 429 || serverCode === "RATE_LIMITED") {
          const retryAfter = err.response?.headers?.["retry-after"];
          throw new MaintenanceError(
            serverMessage || "Too many requests. Please wait and try again.",
            "RATE_LIMITED",
            retryAfter ? Number(retryAfter) : undefined
          );
        }
        if (serverCode === "TIMEOUT") {
          throw new MaintenanceError(
            serverMessage || "Request timed out. Please try again.",
            "TIMEOUT"
          );
        }
        if (!err.response || err.code === "ERR_NETWORK") {
          throw new MaintenanceError(
            "Unable to connect. Please check your internet connection.",
            "NETWORK_ERROR"
          );
        }
        if (err.code === "ECONNABORTED") {
          throw new MaintenanceError(
            "Request timed out. Please try again.",
            "TIMEOUT"
          );
        }

        throw new MaintenanceError(
          serverMessage || `Server error (${status}).`,
          "SERVER_ERROR"
        );
      }

      throw new MaintenanceError(
        err instanceof Error ? err.message : "An unexpected error occurred.",
        "UNKNOWN"
      );
    }
  },
};
