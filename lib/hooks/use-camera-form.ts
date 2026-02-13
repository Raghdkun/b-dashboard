"use client";

import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { qaService, QAError } from "@/lib/api/services/qa.service";
import { storeService } from "@/lib/api/services/store.service";
import type {
  QAEntityWithCategory,
  QAEntityListCategory,
  CameraFormEntityEntry,
} from "@/types/qa.types";
import type { Store } from "@/types/store.types";

/* ────────────────────────────────────────────────────────────────────────── */
/*  Cancel / abort helper                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

function isCanceledError(err: unknown): boolean {
  if (axios.isCancel(err)) return true;
  if (err instanceof DOMException && err.name === "AbortError") return true;
  if (err instanceof Error && err.name === "CanceledError") return true;
  return false;
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  useStoresForCameraForm — fetch stores from auth API                     */
/* ────────────────────────────────────────────────────────────────────────── */

interface UseStoresForCameraFormReturn {
  stores: Store[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useStoresForCameraForm(): UseStoresForCameraFormReturn {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStores = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch all stores (large page size to get all)
      const result = await storeService.getStores({ perPage: 500 });
      setStores(result.data);
    } catch (err) {
      if (isCanceledError(err)) return;
      setError(
        err instanceof Error ? err.message : "Failed to load stores."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  return { stores, isLoading, error, refetch: fetchStores };
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  useEntitiesForCameraForm — fetch entities grouped by categories         */
/* ────────────────────────────────────────────────────────────────────────── */

interface UseEntitiesForCameraFormReturn {
  entities: QAEntityWithCategory[];
  categories: QAEntityListCategory[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useEntitiesForCameraForm(): UseEntitiesForCameraFormReturn {
  const [entities, setEntities] = useState<QAEntityWithCategory[]>([]);
  const [categories, setCategories] = useState<QAEntityListCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEntities = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await qaService.getEntitiesAndCategories(signal);
      if (signal?.aborted) return;
      setEntities(result.entities);
      setCategories(result.categories);
    } catch (err) {
      if (isCanceledError(err) || signal?.aborted) return;
      if (err instanceof QAError) {
        setError(err.message);
      } else {
        setError(
          err instanceof Error ? err.message : "Failed to load entities."
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
    fetchEntities(controller.signal);
    return () => controller.abort();
  }, [fetchEntities]);

  const refetch = useCallback(() => {
    fetchEntities();
  }, [fetchEntities]);

  return { entities, categories, isLoading, error, refetch };
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  useCreateCameraForm — submit camera form                                */
/* ────────────────────────────────────────────────────────────────────────── */

interface UseCreateCameraFormReturn {
  submitCameraForm: (
    storeId: number,
    date: string,
    entities: CameraFormEntityEntry[]
  ) => Promise<boolean>;
  isSubmitting: boolean;
  error: string | null;
  clearError: () => void;
}

export function useCreateCameraForm(): UseCreateCameraFormReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const submitCameraForm = useCallback(
    async (
      storeId: number,
      date: string,
      entities: CameraFormEntityEntry[]
    ): Promise<boolean> => {
      setIsSubmitting(true);
      setError(null);

      try {
        await qaService.createCameraForm(storeId, date, entities);
        return true;
      } catch (err) {
        if (isCanceledError(err)) return false;
        if (err instanceof QAError) {
          setError(err.message);
        } else {
          setError(
            err instanceof Error
              ? err.message
              : "An unexpected error occurred."
          );
        }
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  return { submitCameraForm, isSubmitting, error, clearError };
}
