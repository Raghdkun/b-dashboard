"use client";

import { useCallback, useEffect, useState } from "react";
import {
  maintenanceService,
  MaintenanceError,
} from "@/lib/api/services/maintenance.service";
import type { MaintenanceRequestDetail } from "@/types/maintenance.types";

interface UseMaintenanceRequestDetailReturn {
  detail: MaintenanceRequestDetail | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

function isCanceledError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "CanceledError" || error.name === "AbortError")
  );
}

export function useMaintenanceRequestDetail(
  requestId: number | null
): UseMaintenanceRequestDetailReturn {
  const [detail, setDetail] = useState<MaintenanceRequestDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async (id: number, signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await maintenanceService.getRequestById(id, signal);
      if (signal?.aborted) return;
      setDetail(result);
    } catch (err) {
      if (isCanceledError(err) || signal?.aborted) return;
      if (err instanceof MaintenanceError) {
        setError(err.message);
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load maintenance request details."
        );
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (requestId == null) {
      setDetail(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    fetchDetail(requestId, controller.signal);

    return () => controller.abort();
  }, [requestId, fetchDetail]);

  const refetch = useCallback(() => {
    if (requestId != null) {
      fetchDetail(requestId);
    }
  }, [requestId, fetchDetail]);

  return { detail, isLoading, error, refetch };
}
