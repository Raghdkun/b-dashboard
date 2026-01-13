/**
 * i18n Intelligence System - Translation Context
 *
 * Provides context for tracking where translations are used
 */

"use client";

import { createContext, useContext, useMemo } from "react";
import type { TranslationLocation, ComponentType } from "../types";

/**
 * Context value for translation tracking
 */
interface TranslationTrackingContext {
  /** Current route */
  route: string;

  /** Current component name */
  componentName: string;

  /** Component type */
  componentType: ComponentType;

  /** Widget ID if inside a widget */
  widgetId?: string;
}

const TranslationTrackingCtx = createContext<TranslationTrackingContext | null>(
  null
);

/**
 * Provider for translation tracking context
 */
export function TranslationTrackingProvider({
  children,
  route,
  componentName,
  componentType,
  widgetId,
}: {
  children: React.ReactNode;
  route: string;
  componentName: string;
  componentType: ComponentType;
  widgetId?: string;
}) {
  const value = useMemo(
    () => ({
      route,
      componentName,
      componentType,
      widgetId,
    }),
    [route, componentName, componentType, widgetId]
  );

  return (
    <TranslationTrackingCtx.Provider value={value}>
      {children}
    </TranslationTrackingCtx.Provider>
  );
}

/**
 * Hook to get current translation location
 */
export function useTranslationLocation(): TranslationLocation {
  const ctx = useContext(TranslationTrackingCtx);

  if (!ctx) {
    // Return default if not in provider
    return {
      route: typeof window !== "undefined" ? window.location.pathname : "/unknown",
      componentName: "Unknown",
      componentType: "other",
    };
  }

  return {
    route: ctx.route,
    componentName: ctx.componentName,
    componentType: ctx.componentType,
    widgetId: ctx.widgetId,
  };
}

/**
 * HOC to wrap a component with tracking context
 */
export function withTranslationTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string,
  componentType: ComponentType
) {
  const displayName =
    WrappedComponent.displayName || WrappedComponent.name || "Component";

  const ComponentWithTracking = (props: P) => {
    const route =
      typeof window !== "undefined" ? window.location.pathname : "/unknown";

    return (
      <TranslationTrackingProvider
        route={route}
        componentName={componentName}
        componentType={componentType}
      >
        <WrappedComponent {...props} />
      </TranslationTrackingProvider>
    );
  };

  ComponentWithTracking.displayName = `withTranslationTracking(${displayName})`;

  return ComponentWithTracking;
}

export { TranslationTrackingCtx };
