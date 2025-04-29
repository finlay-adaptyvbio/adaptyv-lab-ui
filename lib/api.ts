import { useMutation, useQuery } from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Types
export interface Protocol {
  id: string;
  name: string;
  description: string;
  tags: string[];
  params_schema: {
    properties: Record<string, ProtocolParameter>;
    required?: string[];
    title: string;
    description?: string;
    type: string;
  };
}

export interface ProtocolParameter {
  type: string;
  title?: string;
  description?: string;
  default?: unknown;
  enum?: string[];
  minimum?: number;
  maximum?: number;
  items?: {
    type: string;
  };
}

export interface RunProtocolParams {
  id: string;
  params: Record<string, unknown>;
  simulate?: boolean;
}

export interface ProtocolResult {
  status: string;
  command_count: number;
  results: ProtocolCommandResult[];
}

export interface ProtocolCommandResult {
  status: string;
  errors: string[];
  data: Record<string, unknown>;
}

// API Functions
export function useProtocols() {
  return useQuery({
    queryKey: ["protocols"],
    queryFn: async () => {
      console.log("Fetching protocols from:", API_URL);

      try {
        const response = await fetch(`${API_URL}/protocols`);
        console.log("Protocols response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Failed to fetch protocols:", {
            status: response.status,
            statusText: response.statusText,
            error: errorText,
          });
          throw new Error(
            `Failed to fetch protocols: ${response.statusText}\n${errorText}`
          );
        }

        const data = (await response.json()) as Protocol[];
        console.log("Fetched protocols:", data);
        return data;
      } catch (error) {
        console.error("Error in protocols query:", error);
        throw error;
      }
    },
  });
}

export function useProtocol(id: string) {
  return useQuery({
    queryKey: ["protocol", id],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/protocols/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch protocol: ${response.statusText}`);
      }
      return response.json() as Promise<Protocol>;
    },
  });
}

export function useRunProtocol() {
  return useMutation({
    mutationFn: async ({ id, params, simulate = false }: RunProtocolParams) => {
      const response = await fetch(`${API_URL}/protocols/${id}/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ params, simulate }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.detail || `Failed to run protocol: ${response.statusText}`
        );
      }

      return response.json() as Promise<ProtocolResult>;
    },
  });
}
