"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  MoreHorizontal,
  RefreshCw,
  Trash2,
  Power,
  PowerOff,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { ServiceClient } from "@/types/service-client.types";
import {
  useDeleteServiceClient,
  useToggleServiceClientStatus,
} from "@/lib/hooks/use-service-clients";

interface ServiceClientsTableProps {
  clients: ServiceClient[];
  isLoading?: boolean;
  onRotateToken: (client: ServiceClient) => void;
}

export function ServiceClientsTable({
  clients,
  isLoading,
  onRotateToken,
}: ServiceClientsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<ServiceClient | null>(null);
  
  const { isDeleting, deleteClient } = useDeleteServiceClient();
  const { isToggling, toggleStatus } = useToggleServiceClientStatus();

  const handleDelete = async () => {
    if (clientToDelete) {
      try {
        await deleteClient(clientToDelete.id);
        setDeleteDialogOpen(false);
        setClientToDelete(null);
      } catch {
        // Error handled in store
      }
    }
  };

  const handleToggleStatus = async (client: ServiceClient) => {
    try {
      await toggleStatus(client.id);
    } catch {
      // Error handled in store
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No service clients found. Create one to get started.
      </div>
    );
  }

  return (
    <>
      {/* Desktop table view */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="hidden lg:table-cell">Last Used</TableHead>
              <TableHead className="hidden lg:table-cell">Use Count</TableHead>
              <TableHead className="hidden xl:table-cell">Created</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">
                  {client.name}
                  {client.notes && (
                    <p className="text-xs text-muted-foreground truncate max-w-50">
                      {client.notes}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={client.isActive ? "default" : "secondary"}>
                    {client.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {client.expiresAt
                    ? format(new Date(client.expiresAt), "MMM d, yyyy")
                    : "Never"}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {client.lastUsedAt
                    ? format(new Date(client.lastUsedAt), "MMM d, yyyy HH:mm")
                    : "Never"}
                </TableCell>
                <TableCell className="hidden lg:table-cell">{client.useCount}</TableCell>
                <TableCell className="hidden xl:table-cell">
                  {format(new Date(client.createdAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onRotateToken(client)}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Rotate Token
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleToggleStatus(client)}
                        disabled={isToggling}
                      >
                        {client.isActive ? (
                          <>
                            <PowerOff className="mr-2 h-4 w-4" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Power className="mr-2 h-4 w-4" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          setClientToDelete(client);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile card view */}
      <div className="grid gap-3 md:hidden">
        {clients.map((client) => (
          <div
            key={client.id}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">{client.name}</p>
                <Badge
                  variant={client.isActive ? "default" : "secondary"}
                  className="shrink-0"
                >
                  {client.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Expires: {client.expiresAt ? format(new Date(client.expiresAt), "MMM d, yyyy") : "Never"}
              </p>
              {client.notes && (
                <p className="text-xs text-muted-foreground truncate">
                  {client.notes}
                </p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onRotateToken(client)}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Rotate Token
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleToggleStatus(client)}
                  disabled={isToggling}
                >
                  {client.isActive ? (
                    <>
                      <PowerOff className="mr-2 h-4 w-4" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Power className="mr-2 h-4 w-4" />
                      Activate
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => {
                    setClientToDelete(client);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))
      }</div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{clientToDelete?.name}&quot;?
              This action cannot be undone and will invalidate any tokens
              associated with this client.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
