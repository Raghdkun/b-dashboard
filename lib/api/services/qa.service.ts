import axios from "axios";
import type {
  ApiQAAuditsResponse,
  QAAuditsResponse,
  QAAudit,
  ApiQAAudit,
  QAStore,
  ApiQAStore,
  QAUser,
  ApiQAUser,
} from "@/types/qa.types";

/* ────────────────────────────────────────────────────────────────────────── */
/*  Error Handling                                                          */
/* ────────────────────────────────────────────────────────────────────────── */

export type QAErrorCode =
  | "NOT_AUTHENTICATED"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "SERVER_ERROR"
  | "UNKNOWN";

export class QAError extends Error {
  readonly code: QAErrorCode;
  readonly retryable: boolean;
  readonly retryAfter?: number;

  constructor(message: string, code: QAErrorCode, retryAfter?: number) {
    super(message);
    this.name = "QAError";
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

function transformStore(raw: ApiQAStore): QAStore {
  return {
    id: raw.id,
    store: raw.store,
    group: raw.group,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

function transformUser(raw: ApiQAUser): QAUser {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

function transformAudit(raw: ApiQAAudit): QAAudit {
  return {
    id: raw.id,
    storeId: raw.store_id,
    userId: raw.user_id,
    date: raw.date,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    store: transformStore(raw.store),
    user: transformUser(raw.user),
  };
}

function transformResponse(raw: ApiQAAuditsResponse): QAAuditsResponse {
  return {
    audits: raw.data.data.map(transformAudit),
    pagination: {
      currentPage: raw.data.current_page,
      perPage: raw.data.per_page,
      total: raw.data.total,
      lastPage: raw.data.last_page,
      from: raw.data.from,
      to: raw.data.to,
    },
    hasNextPage: raw.data.next_page_url !== null,
    hasPrevPage: raw.data.prev_page_url !== null,
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

/* ────────────────────────────────────────────────────────────────────────── */
/*  Service                                                                 */
/* ────────────────────────────────────────────────────────────────────────── */

export const qaService = {
  /**
   * Fetch QA audits through the local API proxy.
   *
   * @param page   - Page number for pagination (default 1).
   * @param signal - Optional AbortSignal for cancellation.
   */
  async getAudits(
    page: number = 1,
    signal?: AbortSignal
  ): Promise<QAAuditsResponse> {
    const token = getToken();
    if (!token) {
      throw new QAError(
        "You must be logged in to view QA audits.",
        "NOT_AUTHENTICATED"
      );
    }

    const url = `/api/qa/audits`;

    try {
      const response = await axios.get<ApiQAAuditsResponse>(url, {
        params: { page },
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
          throw new QAError(
            serverMessage || "Authentication failed.",
            "UNAUTHORIZED"
          );
        }
        if (status === 403 || serverCode === "FORBIDDEN") {
          throw new QAError(
            serverMessage ||
              "You do not have permission to view QA audits.",
            "FORBIDDEN"
          );
        }
        if (status === 404 || serverCode === "NOT_FOUND") {
          throw new QAError(
            serverMessage || "No QA audits found.",
            "NOT_FOUND"
          );
        }
        if (status === 429 || serverCode === "RATE_LIMITED") {
          const retryAfter = err.response?.headers?.["retry-after"];
          throw new QAError(
            serverMessage || "Too many requests. Please wait and try again.",
            "RATE_LIMITED",
            retryAfter ? Number(retryAfter) : undefined
          );
        }
        if (serverCode === "TIMEOUT") {
          throw new QAError(
            serverMessage || "Request timed out. Please try again.",
            "TIMEOUT"
          );
        }
        if (!err.response || err.code === "ERR_NETWORK") {
          throw new QAError(
            "Unable to connect. Please check your internet connection.",
            "NETWORK_ERROR"
          );
        }
        if (err.code === "ECONNABORTED") {
          throw new QAError(
            "Request timed out. Please try again.",
            "TIMEOUT"
          );
        }

        throw new QAError(
          serverMessage || `Server error (${status}).`,
          "SERVER_ERROR"
        );
      }

      throw new QAError(
        err instanceof Error ? err.message : "An unexpected error occurred.",
        "UNKNOWN"
      );
    }
  },
};
