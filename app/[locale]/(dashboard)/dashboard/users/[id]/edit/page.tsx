"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { userService } from "@/lib/api/services/user.service";
import type { User } from "@/types/user.types";

// Form validation schema
const editUserSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().optional().or(z.literal("")),
  passwordConfirmation: z.string().optional().or(z.literal("")),
}).refine(
  (data) => {
    // If password is provided, confirm password must match
    if (data.password && data.password.length > 0) {
      return data.passwordConfirmation === data.password;
    }
    return true;
  },
  {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  }
);

type EditUserFormValues = z.infer<typeof editUserSchema>;

export default function EditUserPage() {
  const t = useTranslations("users");
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  // Fetch user data
  useEffect(() => {
    if (!userId) {
      setError("User ID is required");
      setIsLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log(`Fetching user data for editing - User ID: ${userId}`);
        
        const response = await userService.getUser(userId);
        console.log("User data fetched for editing:", response);
        
        setUser(response.data);
        
        // Set form values with current user data
        form.reset({
          name: response.data.name || "",
          email: response.data.email || "",
          password: "",
          passwordConfirmation: "",
        });
        console.log("Form initialized with user data:", response.data.name, response.data.email);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch user data";
        console.error("Error fetching user for edit:", errorMessage);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [userId, form]);

  const onSubmit = async (values: EditUserFormValues) => {
    if (!user) return;

    try {
      setIsSaving(true);
      setError(null);
      console.log("Submitting user edit form:", { name: values.name, email: values.email });
      
      const payload: any = {
        name: values.name,
        email: values.email,
      };

      // Only include password if provided
      if (values.password && values.password.length > 0) {
        payload.password = values.password;
        payload.passwordConfirmation = values.passwordConfirmation;
        console.log("Password change included in update");
      } else {
        console.log("No password change - updating basic info only");
      }

      const response = await userService.updateUser(user.id, payload);
      console.log("User updated successfully:", response);
      
      // Redirect back to user details page
      router.push(`/${params?.locale}/dashboard/users/${user.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update user";
      console.error("Error updating user:", errorMessage);
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title={t("edit.title")} description={t("edit.loading")} />
        <Card>
          <CardContent className="pt-6">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-muted rounded" />
              <div className="h-10 bg-muted rounded" />
              <div className="h-10 bg-muted rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <PageHeader title={t("edit.title")} description={t("edit.errorLoading")} />
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error || t("edit.notFound")}</p>
            <Button onClick={() => router.back()} className="mt-4">
              {t("edit.goBack")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title={t("edit.title")}
        description={`${t("edit.description")} ${user.name}`}
      />

      <div className="w-full">
        {/* Edit Form Section */}
        <Card>
          <CardHeader>
            <CardTitle>{t("edit.userInfo")}</CardTitle>
            <CardDescription>{t("edit.userInfoDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Full Name Field */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("edit.fullName")} *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("edit.fullNamePlaceholder")}
                          {...field}
                          disabled={isSaving}
                        />
                      </FormControl>
                      <FormDescription>{t("edit.fullNameDescription")}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("edit.emailAddress")} *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder={t("edit.emailAddressPlaceholder")}
                          {...field}
                          disabled={isSaving}
                        />
                      </FormControl>
                      <FormDescription>{t("edit.emailAddressDescription")}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("edit.password")}</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder={t("edit.passwordPlaceholder")}
                          {...field}
                          disabled={isSaving}
                        />
                      </FormControl>
                      <FormDescription>{t("edit.passwordDescription")}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Confirm Password Field */}
                <FormField
                  control={form.control}
                  name="passwordConfirmation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("edit.confirmPassword")}</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder={t("edit.confirmPasswordPlaceholder")}
                          {...field}
                          disabled={isSaving}
                        />
                      </FormControl>
                      <FormDescription>{t("edit.confirmPasswordDescription")}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Error Message */}
                {error && (
                  <div className="bg-destructive/10 border border-destructive text-destructive rounded-md p-3">
                    {error}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 md:flex-none"
                  >
                    {isSaving ? t("edit.saving") : t("edit.saveChanges")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSaving}
                    className="flex-1 md:flex-none"
                  >
                    {t("edit.cancel")}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
