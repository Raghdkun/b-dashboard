/**
 * Test Detection Content
 *
 * Client component that intentionally uses:
 * - Missing translation keys
 * - Hardcoded strings
 * - Fallback scenarios
 */

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Bug, Languages, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export function TestDetectionContent() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const [showMissing, setShowMissing] = useState(false);
  const [counter, setCounter] = useState(0);

  // Test Case 1: This key exists
  const existingTranslation = t("common.save");

  // Test Case 2: These keys DON'T exist - should trigger detection
  const missingKey1 = showMissing ? t("test.nonExistent.welcomeMessage") : null;
  const missingKey2 = showMissing
    ? t("features.undefinedFeature.title")
    : null;
  const missingKey3 = showMissing ? t("errors.unknownCode.description") : null;

  // Test Case 3: Hardcoded strings (should be flagged by ESLint in future)
  const hardcodedTitle = "This is a hardcoded string that should be translated";
  const hardcodedButton = "Click Me";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bug className="h-8 w-8" />
          i18n Detection Test
        </h1>
        <p className="text-muted-foreground mt-2">
          This page intentionally uses missing translation keys to test the
          detection system.
        </p>
      </div>

      <Alert className="border-yellow-500 bg-yellow-500/10">
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
        <AlertTitle>Developer Testing Page</AlertTitle>
        <AlertDescription>
          The issues shown here are intentional for testing the i18n
          Intelligence system. Click the buttons below to trigger different
          issue types.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Working Translation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-500 text-white">
                ✓
              </Badge>
              Working Translation
            </CardTitle>
            <CardDescription>This translation key exists</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{existingTranslation}</p>
            <code className="block mt-2 text-xs text-muted-foreground bg-muted p-2 rounded">
              t(&quot;common.save&quot;) → &quot;{existingTranslation}&quot;
            </code>
          </CardContent>
        </Card>

        {/* Missing Translation Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="destructive">!</Badge>
              Missing Translation Test
            </CardTitle>
            <CardDescription>
              Click to trigger missing key detection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => setShowMissing(!showMissing)}
              variant={showMissing ? "destructive" : "outline"}
            >
              <Languages className="h-4 w-4 mr-2" />
              {showMissing ? "Hide Missing Keys" : "Trigger Missing Keys"}
            </Button>

            {showMissing && (
              <div className="space-y-2">
                <div className="text-sm">
                  <code className="text-red-400">
                    t(&quot;test.nonExistent.welcomeMessage&quot;)
                  </code>
                  <p className="text-muted-foreground">→ {missingKey1}</p>
                </div>
                <div className="text-sm">
                  <code className="text-red-400">
                    t(&quot;features.undefinedFeature.title&quot;)
                  </code>
                  <p className="text-muted-foreground">→ {missingKey2}</p>
                </div>
                <div className="text-sm">
                  <code className="text-red-400">
                    t(&quot;errors.unknownCode.description&quot;)
                  </code>
                  <p className="text-muted-foreground">→ {missingKey3}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hardcoded String Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-yellow-500 text-white">
                ⚠
              </Badge>
              Hardcoded Strings
            </CardTitle>
            <CardDescription>
              These should be using translation keys
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg">{hardcodedTitle}</p>
            <Button variant="secondary">{hardcodedButton}</Button>
            <p className="text-xs text-muted-foreground">
              Hardcoded strings will be detected by ESLint rules (Phase 2)
            </p>
          </CardContent>
        </Card>

        {/* Re-render Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge>🔄</Badge>
              Usage Tracking Test
            </CardTitle>
            <CardDescription>
              Track how often translations are accessed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Counter: <span className="font-mono font-bold">{counter}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Each click uses t(&quot;common.save&quot;): {existingTranslation}
            </p>
            <Button onClick={() => setCounter((c) => c + 1)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Increment & Track
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Link href={`/${locale}/dashboard/dev-tools/i18n`}>
          <Button variant="outline">
            <Languages className="h-4 w-4 mr-2" />
            View i18n Intelligence Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
