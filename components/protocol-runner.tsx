"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useRunProtocol } from "@/lib/api";
import { toast } from "sonner";


interface ProtocolRunnerProps {
  protocolId: string;
  protocolName: string;
  params: Record<string, any>;
}

export function ProtocolRunner({ protocolId, protocolName, params }: ProtocolRunnerProps) {
  const [simulate, setSimulate] = useState(true);
  const [status, setStatus] = useState<"idle" | "running" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  
  const runMutation = useRunProtocol();

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
      toast({
        title: "Protocol completed",
        description: "The protocol was executed successfully",
      });
    } catch (error) {
      setStatus("error");
      setProgress(100);
      toast({
        title: "Protocol failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Run Protocol: {protocolName}</span>
          <Badge variant={status === "idle" ? "outline" : 
                        status === "running" ? "secondary" :
                        status === "success" ? "success" : "destructive"}>
            {status === "idle" ? "Ready" : 
             status === "running" ? "Running..." :
             status === "success" ? "Completed" : "Failed"}
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
            {simulate ? 
              "Run in simulation mode without connecting to hardware" : 
              "Run on actual hardware (make sure the Hamilton is connected)"}
          </p>
        </div>
        
        {status !== "idle" && (
          <Progress value={progress} className="mb-4" />
        )}
        
        {status === "success" && result && (
          <div className="mt-4 p-3 bg-muted rounded-md">
            <h4 className="font-medium mb-2">Results:</h4>
            <pre className="text-xs overflow-auto max-h-40">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
        
        {status === "error" && (
          <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md">
            <h4 className="font-medium mb-2">Error:</h4>
            <p>{runMutation.error instanceof Error ? runMutation.error.message : "Unknown error"}</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleRun} 
          disabled={status === "running"} 
          variant={status === "error" ? "outline" : "default"}
        >
          {status === "idle" ? "Run Protocol" : 
           status === "running" ? "Running..." :
           status === "success" ? "Run Again" : "Try Again"}
        </Button>
      </CardFooter>
    </Card>
  );
}