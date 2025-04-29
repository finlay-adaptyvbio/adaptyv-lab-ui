"use client";

import Link from "next/link";
import { Protocol } from "@/lib/api";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRightIcon, BeakerIcon } from "lucide-react";

interface ProtocolCardProps {
  protocol: Protocol;
}

export function ProtocolCard({ protocol }: ProtocolCardProps) {
  const { id, name, description, tags } = protocol;
  
  // Truncate description to avoid long cards
  const truncatedDescription = description?.length > 150
    ? `${description.substring(0, 150)}...`
    : description;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BeakerIcon className="h-5 w-5" />
          <span>{name}</span>
        </CardTitle>
        <div className="flex flex-wrap gap-1 mt-2">
          {tags?.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground whitespace-pre-line">
          {truncatedDescription || "No description available."}
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/protocols/${id}`}>
            Configure
            <ChevronRightIcon className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}