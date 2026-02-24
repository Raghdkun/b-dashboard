"use client";

import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { qaService, QAError } from "@/lib/api/services/qa.service";
import type { QAEntity, CreateQAEntityPayload, QAEntityListCategory } from "@/types/qa.types";

/* ────────────────────────────────────────────────────────────────────────── */
/*  useQAEntityCategories — fetch categories from GET /entities             */
/* ────────────────────────────────────────────────────────────────────────── */

interface UseQAEntityCategoriesReturn {
  categories: QAEntityListCategory[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

function isCanceledError(err: unknown): boolean {
  if (axios.isCancel(err)) return true;
  if (err instanceof DOMException && err.name === "AbortError") return true;
  if (err instanceof Error && err.name === "CanceledError") return true;
  return false;
}

export function useQAEntityCategories(): UseQAEntityCategoriesReturn {
  const [categories, setCategories] = useState<QAEntityListCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await qaService.getEntities(signal);
      if (signal?.aborted) return;
      setCategories(result);
    } catch (err) {
      if (isCanceledError(err) || signal?.aborted) return;
      if (err instanceof QAError) {
        setError(err.message);
      } else {
        setError(
          err instanceof Error ? err.message : "Failed to load categories."
        );
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchCategories(controller.signal);
    return () => controller.abort();
  }, [fetchCategories]);

  const refetch = useCallback(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, isLoading, error, refetch };
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  useCreateQAEntity — create entity                                       */
/* ────────────────────────────────────────────────────────────────────────── */

interface UseCreateQAEntityReturn {
  createEntity: (payload: CreateQAEntityPayload) => Promise<QAEntity | null>;
  isCreating: boolean;
  error: string | null;
  clearError: () => void;
}

export function useCreateQAEntity(): UseCreateQAEntityReturn {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const createEntity = useCallback(
    async (payload: CreateQAEntityPayload): Promise<QAEntity | null> => {
      setIsCreating(true);
      setError(null);

      try {
        const result = await qaService.createEntity(payload);
        return result;
      } catch (err) {
        if (err instanceof QAError) {
          setError(err.message);
        } else {
          setError(
            err instanceof Error
              ? err.message
              : "An unexpected error occurred."
          );
        }
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    []
  );

  return { createEntity, isCreating, error, clearError };
}
