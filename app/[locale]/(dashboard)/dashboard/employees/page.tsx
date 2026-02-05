"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Store } from "@/types/store.types";

interface Employee {
  id: string;
  name: string;
  store: string;
  dateOfBirth: string;
  status: "active" | "inactive";
  attributes: string;
  details: string;
  createdAt: string;
}

export default function EmployeesPage() {
  const t = useTranslations("employees");
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [employees] = useState<Employee[]>([]);

  useEffect(() => {
    const savedStore = localStorage.getItem("selectedStore");
    if (savedStore) {
      try {
        const storeData = JSON.parse(savedStore) as Store;
        setSelectedStore(storeData);
      } catch {
        localStorage.removeItem("selectedStore");
      }
    }
  }, []);

  const storeName = selectedStore?.name || t("noStoreSelected");

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />

      <div className="text-sm text-muted-foreground">
        {t("storeLabel")}: <span className="font-medium text-foreground">{storeName}</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("columns.employee")}</TableHead>
                  <TableHead>{t("columns.store")}</TableHead>
                  <TableHead>{t("columns.dateOfBirth")}</TableHead>
                  <TableHead>{t("columns.status")}</TableHead>
                  <TableHead>{t("columns.attributes")}</TableHead>
                  <TableHead>{t("columns.details")}</TableHead>
                  <TableHead>{t("columns.created")}</TableHead>
                  <TableHead>{t("columns.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">
                      {t("empty")}
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.store}</TableCell>
                      <TableCell>{employee.dateOfBirth}</TableCell>
                      <TableCell>
                        {employee.status === "active" ? t("status.active") : t("status.inactive")}
                      </TableCell>
                      <TableCell>{employee.attributes}</TableCell>
                      <TableCell>{employee.details}</TableCell>
                      <TableCell>{employee.createdAt}</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
