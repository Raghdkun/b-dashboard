"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useSelectedStoreStore } from "@/lib/store/selected-store.store";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
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
  const { selectedStore } = useSelectedStoreStore();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch employees when store changes
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!selectedStore?.id) {
        console.log("⚠️ Employees: No store selected");
        setEmployees([]);
        return;
      }

      console.log("📥 Employees: Fetching employees for store:", selectedStore.name);
      setIsLoading(true);
      try {
        // TODO: Fetch employees from API for the selected store
        // Example: const response = await employeeService.getEmployees(selectedStore.id);
        // For now, set empty array as placeholder
        setEmployees([]);
        console.log("✅ Employees: Fetch completed for store:", selectedStore.name);
      } catch (error) {
        console.error("❌ Employees: Failed to fetch employees:", error);
        setEmployees([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, [selectedStore?.id]);

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
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
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
                      {!selectedStore ? t("noStoreSelected") : t("empty")}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
