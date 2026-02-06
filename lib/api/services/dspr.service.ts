import axios from "axios";
import type { DsprResponse } from "@/types/dspr.types";

/**
 * Read the Bearer token from Zustand's persisted auth-token key in localStorage.
 * The key stores JSON like: { "state": { "token": "..." }, "version": 0 }
 */
function getToken(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("auth-token");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

/**
 * Read the selected store id from Zustand's persisted selected-store-storage key.
 * The key stores JSON like: { "state": { "selectedStore": { "id": "...", ... } }, "version": 0 }
 */
function getSelectedStoreId(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("selected-store-storage");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.selectedStore?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * Format a Date object to YYYY-MM-DD
 */
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Get yesterday's date string (YYYY-MM-DD)
 */
function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatDate(d);
}

/**
 * DSPR Service — fetches Daily Store Performance Report
 * Routes through the local /api/dspr proxy to avoid CORS / CSP issues.
 */
export const dsprService = {
  /**
   * Fetch DSPR data for a given store and date.
   * Defaults to the selected store and yesterday.
   */
  getReport: async (
    storeId?: string,
    date?: string
  ): Promise<DsprResponse> => {
    const resolvedStore = storeId || getSelectedStoreId();
    const resolvedDate = date || getYesterday();

    if (!resolvedStore) {
      throw new Error("No store selected. Please select a store first.");
    }

    const token = getToken();
    if (!token) {
      throw new Error("Not authenticated. Please log in again.");
    }

    // Use the local proxy instead of calling the external API directly
    const url = `/api/dspr?storeId=${encodeURIComponent(resolvedStore)}&date=${encodeURIComponent(resolvedDate)}`;

    console.log("📊 DSPR: Fetching report", { storeId: resolvedStore, date: resolvedDate });

    const { data } = await axios.get<DsprResponse>(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      timeout: 30000,
    });

    console.log("✅ DSPR: Report received", {
      store: data.filtering?.store,
      date: data.filtering?.date,
      weeklyTotal: data.sales
        ? Object.values(data.sales.this_week_by_day).reduce((s, v) => s + v, 0).toFixed(2)
        : "N/A",
    });

    return data;
  },
};
