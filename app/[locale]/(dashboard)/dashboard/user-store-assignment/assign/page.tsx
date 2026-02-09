"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  Check,
  X,
  Loader2,
  Store as StoreIcon,
  User as UserIcon,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { userService } from "@/lib/api/services/user.service";
import { storeService } from "@/lib/api/services/store.service";
import { roleService } from "@/lib/api/services/role.service";
import { assignmentService } from "@/lib/api/services/assignment.service";
import { toast } from "sonner";
import type { User } from "@/types/user.types";
import type { Store } from "@/types/store.types";
import type { RoleWithStats } from "@/types/role.types";

export default function AssignStorePage() {
  const t = useTranslations("userStoreAssignment.assign");
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isRtl = locale === "ar";

  // Data state
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [roles, setRoles] = useState<RoleWithStats[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);

  // Selection state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleWithStats | null>(null);
  const [selectedStoreIds, setSelectedStoreIds] = useState<Set<string>>(
    new Set()
  );

  // Search state
  const [userSearch, setUserSearch] = useState("");
  const [roleSearch, setRoleSearch] = useState("");
  const [storeSearch, setStoreSearch] = useState("");

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  // Fetch data
  const fetchUsers = useCallback(async (search?: string) => {
    setIsLoadingUsers(true);
    try {
      const response = await userService.getUsers({ search, pageSize: 100 });
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  const fetchStores = useCallback(async (search?: string) => {
    setIsLoadingStores(true);
    try {
      const response = await storeService.getStores({
        search,
        perPage: 100,
      });
      setStores(response.data);
    } catch (error) {
      console.error("Failed to fetch stores:", error);
    } finally {
      setIsLoadingStores(false);
    }
  }, []);

  const fetchRoles = useCallback(async (search?: string) => {
    setIsLoadingRoles(true);
    try {
      const response = await roleService.getRoles({ search, perPage: 100 });
      setRoles(response.data);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    } finally {
      setIsLoadingRoles(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchStores();
    fetchRoles();
  }, [fetchUsers, fetchStores, fetchRoles]);

  // Filtered lists
  const filteredUsers = useMemo(() => {
    if (!userSearch) return users;
    const q = userSearch.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [users, userSearch]);

  const filteredRoles = useMemo(() => {
    if (!roleSearch) return roles;
    const q = roleSearch.toLowerCase();
    return roles.filter((r) => r.name.toLowerCase().includes(q));
  }, [roles, roleSearch]);

  const filteredStores = useMemo(() => {
    if (!storeSearch) return stores;
    const q = storeSearch.toLowerCase();
    return stores.filter((s) => s.name.toLowerCase().includes(q));
  }, [stores, storeSearch]);

  // Store toggle
  const toggleStore = (storeId: string) => {
    setSelectedStoreIds((prev) => {
      const next = new Set(prev);
      if (next.has(storeId)) {
        next.delete(storeId);
      } else {
        next.add(storeId);
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, stores: "" }));
  };

  const removeStore = (storeId: string) => {
    setSelectedStoreIds((prev) => {
      const next = new Set(prev);
      next.delete(storeId);
      return next;
    });
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!selectedUser) {
      newErrors.user = t("validation.userRequired");
    }
    if (!selectedRole) {
      newErrors.role = t("validation.roleRequired");
    }
    if (selectedStoreIds.size === 0) {
      newErrors.stores = t("validation.storeRequired");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit assignment
  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const storeIds = Array.from(selectedStoreIds);

      // Assign each store one by one using the endpoint
      for (const storeId of storeIds) {
        await assignmentService.createAssignment({
          userId: selectedUser!.id,
          roleId: selectedRole!.id,
          storeId: storeId,
          metadata: {},
          isActive: true,
        });
      }

      toast.success(t("success"));
      router.push(`/${locale}/dashboard/user-store-assignment`);
    } catch (error) {
      console.error("Failed to assign store:", error);
      toast.error(t("error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedStoreObjects = stores.filter((s) =>
    selectedStoreIds.has(s.id)
  );

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")}>
        <Button
          variant="outline"
          onClick={() =>
            router.push(`/${locale}/dashboard/user-store-assignment`)
          }
        >
          <BackIcon className="me-2 h-4 w-4" />
          {isRtl ? "رجوع" : "Back"}
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Step 1: Select User */}
        <Card
          className={cn(
            "transition-all",
            selectedUser && "border-primary/50"
          )}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <UserIcon className="h-4 w-4" />
              {t("selectUser")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search className="absolute start-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t("selectUserPlaceholder")}
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="ps-8"
              />
            </div>

            {errors.user && (
              <p className="text-sm text-destructive">{errors.user}</p>
            )}

            <div className="max-h-[300px] space-y-1 overflow-y-auto">
              {isLoadingUsers ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))
              ) : filteredUsers.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  {t("noUsersFound")}
                </p>
              ) : (
                filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => {
                      setSelectedUser(user);
                      setErrors((prev) => ({ ...prev, user: "" }));
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md p-2 text-start transition-colors",
                      selectedUser?.id === user.id
                        ? "bg-primary/10 ring-1 ring-primary/30"
                        : "hover:bg-muted"
                    )}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || undefined} />
                      <AvatarFallback className="text-xs">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <div className="truncate text-sm font-medium">
                        {user.name}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                    {selectedUser?.id === user.id && (
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                    )}
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Select Role */}
        <Card
          className={cn(
            "transition-all",
            selectedRole && "border-primary/50"
          )}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4" />
              {t("selectRole")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search className="absolute start-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t("selectRolePlaceholder")}
                value={roleSearch}
                onChange={(e) => setRoleSearch(e.target.value)}
                className="ps-8"
              />
            </div>

            {errors.role && (
              <p className="text-sm text-destructive">{errors.role}</p>
            )}

            <div className="max-h-[300px] space-y-1 overflow-y-auto">
              {isLoadingRoles ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))
              ) : filteredRoles.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  {t("noRolesFound")}
                </p>
              ) : (
                filteredRoles.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => {
                      setSelectedRole(role);
                      setErrors((prev) => ({ ...prev, role: "" }));
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md p-2 text-start transition-colors",
                      selectedRole?.id === role.id
                        ? "bg-primary/10 ring-1 ring-primary/30"
                        : "hover:bg-muted"
                    )}
                  >
                    <ShieldCheck
                      className={cn(
                        "h-4 w-4 shrink-0",
                        selectedRole?.id === role.id
                          ? "text-primary"
                          : "text-muted-foreground"
                      )}
                    />
                    <div className="flex-1 overflow-hidden">
                      <div className="truncate text-sm font-medium capitalize">
                        {role.name}
                      </div>
                      {role.description && (
                        <div className="truncate text-xs text-muted-foreground">
                          {role.description}
                        </div>
                      )}
                    </div>
                    {selectedRole?.id === role.id && (
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                    )}
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Select Stores */}
        <Card
          className={cn(
            "transition-all",
            selectedStoreIds.size > 0 && "border-primary/50"
          )}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <StoreIcon className="h-4 w-4" />
              {t("selectStores")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search className="absolute start-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t("selectStoresPlaceholder")}
                value={storeSearch}
                onChange={(e) => setStoreSearch(e.target.value)}
                className="ps-8"
              />
            </div>

            {errors.stores && (
              <p className="text-sm text-destructive">{errors.stores}</p>
            )}

            <div className="max-h-[300px] space-y-1 overflow-y-auto">
              {isLoadingStores ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))
              ) : filteredStores.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  {t("noStoresFound")}
                </p>
              ) : (
                filteredStores.map((store) => (
                  <Label
                    key={store.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-md p-2 transition-colors",
                      selectedStoreIds.has(store.id)
                        ? "bg-primary/10 ring-1 ring-primary/30"
                        : "hover:bg-muted"
                    )}
                  >
                    <Checkbox
                      checked={selectedStoreIds.has(store.id)}
                      onCheckedChange={() => toggleStore(store.id)}
                    />
                    <div className="flex-1 overflow-hidden">
                      <div className="truncate text-sm font-medium">
                        {store.name}
                      </div>
                    </div>
                  </Label>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Stores Summary */}
      {selectedStoreObjects.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {t("selectedStores")} ({selectedStoreObjects.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedStoreObjects.map((store) => (
                <Badge
                  key={store.id}
                  variant="secondary"
                  className="flex items-center gap-1 pe-1"
                >
                  {store.name}
                  <button
                    type="button"
                    onClick={() => removeStore(store.id)}
                    className="ms-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit */}
      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="min-w-[160px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
              {t("submitting")}
            </>
          ) : (
            t("submit")
          )}
        </Button>
      </div>
    </div>
  );
}
