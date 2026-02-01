"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useStoreDetails } from "@/lib/hooks/use-stores";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Pencil,
  ArrowLeft,
  User,
} from "lucide-react";

export default function StoreDetailsPage() {
  const t = useTranslations("stores");
  const tCommon = useTranslations("common");
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "en";
  const storeId = params?.id as string;

  const { store, isLoading, fetchStore } = useStoreDetails(storeId);

  useEffect(() => {
    if (storeId) {
      fetchStore();
    }
  }, [storeId, fetchStore]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Building2 className="h-16 w-16 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">{t("noStores")}</p>
        <Button onClick={() => router.push(`/${locale}/dashboard/stores`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {tCommon("cancel")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={store.name}
        description={`ID: ${store.id}`}
      >
        <Button
          variant="outline"
          onClick={() => router.push(`/${locale}/dashboard/stores`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {tCommon("cancel")}
        </Button>
        <Button
          onClick={() =>
            router.push(`/${locale}/dashboard/stores/${store.id}/edit`)
          }
        >
          <Pencil className="h-4 w-4 mr-2" />
          {t("actions.edit")}
        </Button>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {t("form.basicInfo")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t("columns.name")}
              </span>
              <span className="font-medium">{store.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t("columns.status")}
              </span>
              <Badge variant={store.isActive ? "default" : "secondary"}>
                {store.isActive ? t("status.active") : t("status.inactive")}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t("columns.createdAt")}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {store.createdAt
                  ? new Date(store.createdAt).toLocaleDateString()
                  : "-"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              {t("form.contactInfo")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("form.address")}
                </p>
                <p className="font-medium">
                  {store.metadata?.address || "-"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("form.phone")}
                </p>
                <p className="font-medium">
                  {store.metadata?.phone || "-"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("form.email")}
                </p>
                <p className="font-medium">
                  {store.metadata?.email || "-"}
                </p>
              </div>
            </div>
            {store.metadata?.managerId && (
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Manager ID</p>
                  <p className="font-medium">{store.metadata.managerId}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
