"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    setIsOpen(true);
  }, [error]);

  const message = error?.message || "Something went wrong.";

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Oops, something broke.</AlertDialogTitle>
          <AlertDialogDescription>
            We could not complete your request. Please screenshot this message
            and send it to:
            {" "}
            <Link
              href="https://tasks.rdexperts.tech/support-ticket"
              className="font-medium text-primary hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              https://tasks.rdexperts.tech/support-ticket
            </Link>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
          {message}
          {error?.digest ? ` (ref: ${error.digest})` : ""}
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={() => reset()}>
            Try again
          </Button>
          <AlertDialogAction asChild>
            <Link href="/">Go home</Link>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
