"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProtocol } from "@/lib/api";
import { ProtocolForm } from "@/components/protocol-form";
import { ProtocolRunner } from "@/components/protocol-runner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftIcon, InfoIcon } from "lucide-react";

export default function ProtocolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: protocol, isLoading, error } = useProtocol(id);
  const [formValues, setFormValues] = useState<Record<string, unknown> | null>(null);

  const handleFormSubmit = (values: Record<string, unknown>) => {
    setFormValues(values);
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4">
      <Button 
        variant="outline" 
        onClick={() => router.push("/")}
        className="mb-6"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Back to Protocols
      </Button>

      {isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Loading protocol...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40 flex items-center justify-center">
              <div className="animate-pulse w-full max-w-md">
                <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Protocol</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              {error instanceof Error
                ? error.message
                : "Failed to load protocol details"}
            </p>
            <Button 
              variant="outline" 
              onClick={() => router.push("/")}
              className="mt-4"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      )}

      {protocol && (
        <>
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <span>{protocol.name}</span>
              {protocol.tags?.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </h1>
            {protocol.description && (
              <p className="text-muted-foreground whitespace-pre-line">
                {protocol.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuration Form - Left Side */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <InfoIcon className="h-5 w-5" />
                  Protocol Parameters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProtocolForm 
                  protocol={protocol} 
                  onSubmit={handleFormSubmit} 
                />
              </CardContent>
            </Card>
            
            {/* Protocol Runner - Right Side */}
            <div>
              {formValues ? (
                <ProtocolRunner 
                  protocolId={protocol.id}
                  protocolName={protocol.name}
                  params={formValues}
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Ready to Run</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center py-8">
                    <div className="mb-4 text-muted-foreground">
                      <p>Configure protocol parameters on the left panel and submit to run.</p>
                    </div>
                    <Button disabled>Run Protocol</Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}