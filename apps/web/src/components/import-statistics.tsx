import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertTriangle, Copy, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ImportStatisticsProps {
  statistics: {
    totalRequested: number;
    found: number;
    notFound: number;
    notFoundValues: string[];
  };
}

export function ImportStatistics({ statistics }: ImportStatisticsProps) {
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());
  const [showNotFound, setShowNotFound] = useState(false);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems((prev) => new Set(prev).add(id));
      setTimeout(() => {
        setCopiedItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const copyAllNotFound = async () => {
    try {
      await navigator.clipboard.writeText(statistics.notFoundValues.join("\n"));
      setCopiedItems((prev) => new Set(prev).add("all-not-found"));
      setTimeout(() => {
        setCopiedItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete("all-not-found");
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const successRate =
    statistics.totalRequested > 0
      ? Math.round((statistics.found / statistics.totalRequested) * 100)
      : 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Import Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {statistics.totalRequested}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Requested
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {statistics.found}
              </div>
              <div className="text-sm text-muted-foreground">Found</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {statistics.notFound}
              </div>
              <div className="text-sm text-muted-foreground">Not Found</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {successRate}%
              </div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {statistics.notFound > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                Not Found Records ({statistics.notFound})
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyAllNotFound}>
                  {copiedItems.has("all-not-found") ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  Copy All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNotFound(!showNotFound)}
                >
                  {showNotFound ? "Hide" : "Show"} Details
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          {showNotFound && (
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground mb-2">
                  These no_sep values were in your CSV but not found in the
                  database:
                </div>
                <div className="max-h-60 overflow-y-auto border rounded-lg p-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {statistics.notFoundValues.map((noSep, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                      >
                        <span className="font-mono">{noSep}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleCopy(noSep, `not-found-${index}`)
                          }
                        >
                          {copiedItems.has(`not-found-${index}`) ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {statistics.notFound > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
              <div className="space-y-1">
                <div className="font-medium text-orange-800 dark:text-orange-200">
                  Some records were not found
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-300">
                  {statistics.notFound} out of {statistics.totalRequested}{" "}
                  no_sep values from your CSV were not found in the database.
                  This could be due to:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Incorrect no_sep values in the CSV</li>
                    <li>Records outside the selected date range</li>
                    <li>Records that don't exist in the database</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
