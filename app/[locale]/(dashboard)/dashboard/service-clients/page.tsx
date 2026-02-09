"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ServiceClientsTable,
  CreateServiceClientDialog,
  TokenDisplayDialog,
  RotateTokenDialog,
} from "@/components/service-clients";
import { useServiceClients, useCreateServiceClient, useRotateToken } from "@/lib/hooks/use-service-clients";
import type { ServiceClient } from "@/types/service-client.types";

export default function ServiceClientsPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [rotateDialogOpen, setRotateDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ServiceClient | null>(null);

  const { clients, isLoading, error } = useServiceClients();
  const { token: createdToken, isTokenDialogOpen: showCreatedToken, closeTokenDialog: closeCreatedTokenDialog } = useCreateServiceClient();
  const { token: rotatedToken, isTokenDialogOpen: showRotatedToken, closeTokenDialog: closeRotatedTokenDialog } = useRotateToken();

  const handleRotateToken = (client: ServiceClient) => {
    setSelectedClient(client);
    setRotateDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Service Client Management</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Manage API service clients and their tokens.
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Create Client
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Service Clients</CardTitle>
          <CardDescription>
            Service clients provide API access for external applications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ServiceClientsTable
            clients={clients}
            isLoading={isLoading}
            onRotateToken={handleRotateToken}
          />
        </CardContent>
      </Card>

      <CreateServiceClientDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <RotateTokenDialog
        open={rotateDialogOpen}
        onOpenChange={setRotateDialogOpen}
        clientId={selectedClient?.id || null}
        clientName={selectedClient?.name}
      />

      <TokenDisplayDialog
        open={showCreatedToken}
        onOpenChange={closeCreatedTokenDialog}
        token={createdToken}
        title="Service Client Created"
        description="Your new service client has been created. Copy the token below - it won't be shown again."
      />

      <TokenDisplayDialog
        open={showRotatedToken}
        onOpenChange={closeRotatedTokenDialog}
        token={rotatedToken}
        title="Token Rotated"
        description="The token has been rotated. Copy the new token below - it won't be shown again."
      />
    </div>
  );
}
