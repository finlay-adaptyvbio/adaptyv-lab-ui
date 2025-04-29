"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  useRunProtocol,
  ProtocolResult,
  ProtocolCommandResult,
} from "@/lib/api";
import { toast } from "sonner";
import {
  CheckCircle2Icon,
  AlertCircleIcon,
  PlayIcon,
  PauseIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProtocolRunnerProps {
  protocolId: string;
  protocolName: string;
  params: Record<string, unknown>;
}

export function ProtocolRunner({
  protocolId,
  protocolName,
  params,
}: ProtocolRunnerProps) {
  const [simulate, setSimulate] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "running" | "success" | "error"
  >("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ProtocolResult | null>(null);
  const [expandedCommands, setExpandedCommands] = useState<boolean[]>([]);

  const runMutation = useRunProtocol();

  // Reset progress when returning to idle state
  useEffect(() => {
    if (status === "idle") {
      setProgress(0);
    }
  }, [status]);

  // Simulate progress updates during running state
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (status === "running") {
      // Start at 10%
      setProgress(10);

      // Simulate progress updates
      interval = setInterval(() => {
        setProgress((prev) => {
          // Don't exceed 90% during simulation - the final jump to 100% happens on completion
          const next = prev + Math.random() * 5;
          return next > 90 ? 90 : next;
        });
      }, 500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status]);

  const handleRun = async () => {
    setStatus("running");
    setProgress(10);

    try {
      const result = await runMutation.mutateAsync({
        id: protocolId,
        params,
        simulate,
      });

      setResult(result);
      setStatus("success");
      setProgress(100);
      toast.success("Protocol completed", {
        description: "The protocol was executed successfully",
      });
    } catch (error) {
      setStatus("error");
      setProgress(100);
      toast.error("Protocol failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Run Protocol: {protocolName}</span>
          <Badge
            variant={
              status === "idle"
                ? "outline"
                : status === "running"
                ? "secondary"
                : status === "success"
                ? "default"
                : "destructive"
            }
          >
            {status === "idle" ? (
              "Ready"
            ) : status === "running" ? (
              <span className="flex items-center gap-1">
                <PauseIcon className="h-3 w-3 animate-pulse" />
                Running...
              </span>
            ) : status === "success" ? (
              <span className="flex items-center gap-1">
                <CheckCircle2Icon className="h-3 w-3" />
                Completed
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <AlertCircleIcon className="h-3 w-3" />
                Failed
              </span>
            )}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span>Simulation Mode</span>
            <Switch
              checked={simulate}
              onCheckedChange={setSimulate}
              disabled={status === "running"}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {simulate
              ? "Run in simulation mode without connecting to hardware"
              : "Run on actual hardware (make sure the Hamilton is connected)"}
          </p>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {status === "idle"
                ? "Ready to run"
                : status === "running"
                ? "Executing protocol..."
                : status === "success"
                ? "Protocol completed successfully"
                : "Protocol execution failed"}
            </span>
            <span className="text-xs text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="mb-2" />
        </div>

        {status === "success" && result && (
          <div className="mt-4 p-3 bg-muted rounded-md">
            <h4 className="font-medium mb-2">Results:</h4>
            <div className="mb-2">
              <Badge variant="outline" className="mb-2">
                {result.command_count} Commands Executed
              </Badge>
            </div>
            <div className="overflow-auto max-h-60 rounded border p-2 bg-background text-xs font-mono">
              {result.results?.map((cmd: ProtocolCommandResult, i: number) => (
                <div key={i} className="mb-2 last:mb-0">
                  <div className="flex items-center gap-1">
                    <Badge
                      variant={
                        cmd.status === "SUCCESS" ? "default" : "destructive"
                      }
                      className="text-xs"
                    >
                      Command {i + 1}
                    </Badge>
                    <div className="flex items-center gap-1 ml-auto">
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full",
                          cmd.status === "SUCCESS"
                            ? "bg-green-500"
                            : "bg-destructive"
                        )}
                      />
                      <span className="text-xs text-muted-foreground">
                        {cmd.status}
                      </span>
                    </div>
                    {Object.keys(cmd.data).length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={() => {
                          const newExpanded = [...expandedCommands];
                          newExpanded[i] = !newExpanded[i];
                          setExpandedCommands(newExpanded);
                        }}
                      >
                        {expandedCommands[i] ? (
                          <ChevronUpIcon className="h-3 w-3" />
                        ) : (
                          <ChevronDownIcon className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                  </div>
                  {cmd.errors?.length > 0 && (
                    <div className="mt-1 text-destructive">
                      {cmd.errors.map((err: string, j: number) => (
                        <div key={j} className="text-xs">
                          {err}
                        </div>
                      ))}
                    </div>
                  )}
                  {expandedCommands[i] && Object.keys(cmd.data).length > 0 && (
                    <div className="mt-2 p-2 bg-muted rounded text-xs font-mono overflow-auto">
                      <pre>{JSON.stringify(cmd.data, null, 2)}</pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md">
            <h4 className="font-medium mb-2">Error:</h4>
            <p className="text-sm">
              {runMutation.error instanceof Error
                ? runMutation.error.message
                : "Unknown error"}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleRun}
          disabled={status === "running"}
          variant={status === "error" ? "outline" : "default"}
          className="mr-2"
        >
          {status === "running" ? (
            <PauseIcon className="mr-2 h-4 w-4 animate-pulse" />
          ) : (
            <PlayIcon className="mr-2 h-4 w-4" />
          )}
          {status === "idle"
            ? "Run Protocol"
            : status === "running"
            ? "Running..."
            : status === "success"
            ? "Run Again"
            : "Try Again"}
        </Button>

        {(status === "success" || status === "error") && (
          <Button
            variant="outline"
            onClick={() => {
              setStatus("idle");
              setProgress(0);
              setResult(null);
              setExpandedCommands([]);
            }}
          >
            Reset
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
