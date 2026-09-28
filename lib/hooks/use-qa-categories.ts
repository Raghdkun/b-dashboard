"use client";

import { useState, useCallback } from "react";
import { qaService, QAError } from "@/lib/api/services/qa.service";
import type { QACategory, CreateQACategoryPayload } from "@/types/qa.types";

interface UseCreateQACategoryReturn {
  createCategory: (payload: CreateQACategoryPayload) => Promise<QACategory | null>;
  isCreating: boolean;
  error: string | null;
  clearError: () => void;
}

export function useCreateQACategory(): UseCreateQACategoryReturn {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const createCategory = useCallback(
    async (payload: CreateQACategoryPayload): Promise<QACategory | null> => {
      setIsCreating(true);
      setError(null);

      try {
        const result = await qaService.createCategory(payload);
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

  return { createCategory, isCreating, error, clearError };
}
