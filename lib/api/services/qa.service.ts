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
  ApiQACategoryCreateResponse,
  QACategory,
  CreateQACategoryPayload,
  ApiQAEntityCreateResponse,
  QAEntity,
  CreateQAEntityPayload,
  ApiQAEntitiesListResponse,
  QAEntityListCategory,
  QAEntitiesAndCategories,
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

  /**
   * Fetch QA entities (and categories) through the local API proxy.
   */
  async getEntities(signal?: AbortSignal): Promise<QAEntityListCategory[]> {
    const full = await this.getEntitiesAndCategories(signal);
    return full.categories;
  },

  /**
   * Fetch both QA entities and categories through the local API proxy.
   */
  async getEntitiesAndCategories(signal?: AbortSignal): Promise<QAEntitiesAndCategories> {
    const token = getToken();
    if (!token) {
      throw new QAError(
        "You must be logged in to view QA entities.",
        "NOT_AUTHENTICATED"
      );
    }

    const url = `/api/qa/entities`;

    try {
      const response = await axios.get<ApiQAEntitiesListResponse>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        timeout: 15_000,
        signal,
      });

      const categoriesMap = new Map<number, string>();
      for (const cat of response.data.data.categories ?? []) {
        categoriesMap.set(cat.id, cat.label);
      }

      const entities = (response.data.data.entities ?? []).map((e) => ({
        id: e.id,
        entityLabel: e.entity_label,
        categoryId: e.category_id,
        dateRangeType: e.date_range_type,
        reportType: e.report_type,
        sortOrder: e.sort_order,
        active: e.active,
        createdAt: e.created_at,
        updatedAt: e.updated_at,
        categoryLabel: e.category?.label ?? categoriesMap.get(e.category_id),
      }));

      const categories = (response.data.data.categories ?? []).map((cat) => ({
        id: cat.id,
        label: cat.label,
        sortOrder: cat.sort_order,
        entitiesCount: cat.entities_count ?? 0,
        createdAt: cat.created_at,
        updatedAt: cat.updated_at,
      }));

      return { entities, categories };
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
            serverMessage || "You do not have permission to view entities.",
            "FORBIDDEN"
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

  /**
   * Create a new QA category through the local API proxy.
   */
  async createCategory(payload: CreateQACategoryPayload): Promise<QACategory> {
    const token = getToken();
    if (!token) {
      throw new QAError(
        "You must be logged in to create QA categories.",
        "NOT_AUTHENTICATED"
      );
    }

    const url = `/api/qa/categories`;

    try {
      const response = await axios.post<ApiQACategoryCreateResponse>(url, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        timeout: 15_000,
      });

      const raw = response.data.data;
      return {
        id: raw.id,
        label: raw.label,
        sortOrder: raw.sort_order,
        createdAt: raw.created_at,
        updatedAt: raw.updated_at,
      };
    } catch (err) {
      if (axios.isCancel(err)) throw err;

      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const errorData = err.response?.data as
          | { error?: { code?: string; message?: string; details?: Record<string, unknown> } }
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
            serverMessage || "You do not have permission to create categories.",
            "FORBIDDEN"
          );
        }
        if (status === 422 || serverCode === "VALIDATION_ERROR") {
          throw new QAError(
            serverMessage || "Validation failed. Please check your input.",
            "SERVER_ERROR"
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

  /**
   * Create a new QA entity through the local API proxy.
   */
  async createEntity(payload: CreateQAEntityPayload): Promise<QAEntity> {
    const token = getToken();
    if (!token) {
      throw new QAError(
        "You must be logged in to create QA entities.",
        "NOT_AUTHENTICATED"
      );
    }

    const url = `/api/qa/entities`;

    try {
      const response = await axios.post<ApiQAEntityCreateResponse>(url, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        timeout: 15_000,
      });

      const raw = response.data.data;
      return {
        id: raw.id,
        entityLabel: raw.entity_label,
        categoryId: raw.category_id,
        dateRangeType: raw.date_range_type,
        reportType: raw.report_type,
        sortOrder: raw.sort_order,
        active: raw.active,
        createdAt: raw.created_at,
        updatedAt: raw.updated_at,
      };
    } catch (err) {
      if (axios.isCancel(err)) throw err;

      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const errorData = err.response?.data as
          | { error?: { code?: string; message?: string; details?: Record<string, unknown> } }
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
            serverMessage || "You do not have permission to create entities.",
            "FORBIDDEN"
          );
        }
        if (status === 422 || serverCode === "VALIDATION_ERROR") {
          throw new QAError(
            serverMessage || "Validation failed. Please check your input.",
            "SERVER_ERROR"
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
