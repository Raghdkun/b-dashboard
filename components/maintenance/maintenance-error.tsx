"use client";

import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ShieldAlert,
  WifiOff,
  Clock,
  RefreshCw,
  XCircle,
} from "lucide-react";

interface MaintenanceErrorProps {
  error: {
    message: string;
    code: string;
    retryable: boolean;
  };
  onRetry: () => void;
  onClearError: () => void;
}

const errorIcons: Record<string, typeof AlertTriangle> = {
  NO_STORE: AlertTriangle,
  NOT_AUTHENTICATED: ShieldAlert,
  UNAUTHORIZED: ShieldAlert,
  FORBIDDEN: ShieldAlert,
  NETWORK_ERROR: WifiOff,
  TIMEOUT: Clock,
};

export function MaintenanceErrorCard({
  error,
  onRetry,
  onClearError,
}: MaintenanceErrorProps) {
  const t = useTranslations("maintenance");
  const Icon = errorIcons[error.code] ?? XCircle;

  return (
    <Card className="border-destructive/50">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <Icon className="h-6 w-6 text-destructive" />
        </div>
        <CardTitle className="text-destructive">
          {t("error.title")}
        </CardTitle>
        <CardDescription>{error.message}</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center gap-2">
        {error.retryable && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="me-2 h-4 w-4" />
            {t("error.retry")}
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onClearError}>
          {t("error.dismiss")}
        </Button>
      </CardContent>
    </Card>
  );
}
