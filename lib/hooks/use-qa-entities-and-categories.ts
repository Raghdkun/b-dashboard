"use client";

import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { qaService, QAError } from "@/lib/api/services/qa.service";
import type {
  QAEntitiesAndCategories,
  QAEntityWithCategory,
  QAEntityListCategory,
} from "@/types/qa.types";

/* ────────────────────────────────────────────────────────────────────────── */
/*  useQAEntitiesAndCategories                                              */
/* ────────────────────────────────────────────────────────────────────────── */

interface UseQAEntitiesAndCategoriesReturn {
  entities: QAEntityWithCategory[];
  categories: QAEntityListCategory[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  errorCode: string | null;
  refetch: () => void;
  clearError: () => void;
}

function isCanceledError(err: unknown): boolean {
  if (axios.isCancel(err)) return true;
  if (err instanceof DOMException && err.name === "AbortError") return true;
  if (err instanceof Error && err.name === "CanceledError") return true;
  return false;
}

export function useQAEntitiesAndCategories(): UseQAEntitiesAndCategoriesReturn {
  const [data, setData] = useState<QAEntitiesAndCategories | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const fetchData = useCallback(
    async (signal?: AbortSignal, isRefresh = false) => {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      setErrorCode(null);

      try {
        const result = await qaService.getEntitiesAndCategories(signal);
        if (signal?.aborted) return;
        setData(result);
      } catch (err) {
        if (isCanceledError(err) || signal?.aborted) return;
        if (err instanceof QAError) {
          setError(err.message);
          setErrorCode(err.code);
        } else {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load entities and categories."
          );
          setErrorCode("UNKNOWN");
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData(undefined, true);
  }, [fetchData]);

  const clearError = useCallback(() => {
    setError(null);
    setErrorCode(null);
  }, []);

  return {
    entities: data?.entities ?? [],
    categories: data?.categories ?? [],
    isLoading,
    isRefreshing,
    error,
    errorCode,
    refetch,
    clearError,
  };
}
