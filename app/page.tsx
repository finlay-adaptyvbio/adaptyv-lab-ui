"use client";

import { useProtocols } from "@/lib/api";
import { ProtocolCard } from "@/components/protocol-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RefreshCcwIcon, BeakerIcon, FilterIcon, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const { data: protocols, isLoading, error, refetch } = useProtocols();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Get all unique tags
  const allTags = protocols?.flatMap(p => p.tags || []) || [];
  const uniqueTags = [...new Set(allTags)];
  
  // Filter protocols based on search query
  const filteredProtocols = protocols?.filter(protocol => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      protocol.name.toLowerCase().includes(query) ||
      (protocol.description || "").toLowerCase().includes(query) ||
      (protocol.tags || []).some(tag => tag.toLowerCase().includes(query))
    );
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <header className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BeakerIcon className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Protocols</h1>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCcwIcon className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        <p className="text-muted-foreground mb-4">
          Select a protocol to configure and run on the Hamilton robot.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center mb-4">
          <div className="relative w-full sm:w-1/2">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search protocols..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          {uniqueTags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <FilterIcon className="h-4 w-4 text-muted-foreground" />
              {uniqueTags.map(tag => (
                <Badge 
                  key={tag} 
                  variant="outline"
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => setSearchQuery(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </header>

      {isLoading && (
        <div className="mb-8">
          <Progress value={80} className="mb-2" />
          <p className="text-sm text-muted-foreground text-center">Loading protocols...</p>
        </div>
      )}

      {error && (
        <div className="p-4 mb-8 bg-destructive/10 text-destructive rounded-md">
          <h3 className="font-medium">Error loading protocols</h3>
          <p>{error instanceof Error ? error.message : "Failed to load protocols"}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => refetch()}
          >
            Try Again
          </Button>
        </div>
      )}

      {filteredProtocols?.length === 0 && (
        <div className="text-center py-12 bg-muted rounded-lg">
          <h3 className="text-xl font-medium mb-2">No protocols found</h3>
          {searchQuery ? (
            <p className="text-muted-foreground mb-4">
              No protocols match your search criteria.
              <Button 
                variant="ghost" 
                onClick={() => setSearchQuery("")}
                className="ml-2"
              >
                Clear Search
              </Button>
            </p>
          ) : (
            <p className="text-muted-foreground mb-4">
              No protocols are currently registered in the system.
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProtocols?.map((protocol) => (
          <ProtocolCard key={protocol.id} protocol={protocol} />
        ))}
      </div>
    </div>
  );
}