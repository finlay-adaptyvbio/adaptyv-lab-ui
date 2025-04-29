"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Protocol } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface ProtocolFormProps {
  protocol: Protocol;
  onSubmit: (values: Record<string, unknown>) => void;
  isSubmitting?: boolean;
}

export function ProtocolForm({
  protocol,
  onSubmit,
  isSubmitting = false,
}: ProtocolFormProps) {
  // Generate Zod schema from protocol parameter schema
  const formSchema = createZodSchema(protocol.params_schema);

  // Create default values
  const defaultValues = createDefaultValues(protocol.params_schema);

  // Create form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Handle form submission
  function handleSubmit(values: z.infer<typeof formSchema>) {
    onSubmit(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {Object.entries(protocol.params_schema.properties).map(
          ([name, schema]) => (
            <FormField
              key={name}
              control={form.control}
              name={name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{schema.title || name}</FormLabel>
                  {renderFormControl(name, schema, field)}
                  {schema.description && (
                    <FormDescription>{schema.description}</FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          )
        )}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Run Protocol"}
        </Button>
      </form>
    </Form>
  );
}

// Helper functions

function createZodSchema(paramSchema: Protocol["params_schema"]) {
  const schemaMap: Record<string, z.ZodType> = {};

  Object.entries(paramSchema.properties).forEach(([name, schema]) => {
    let fieldSchema;

    switch (schema.type) {
      case "string":
        fieldSchema = z.string();
        break;
      case "number":
        fieldSchema = z.number();
        if ("minimum" in schema && typeof schema.minimum === "number")
          fieldSchema = fieldSchema.min(schema.minimum);
        if ("maximum" in schema && typeof schema.maximum === "number")
          fieldSchema = fieldSchema.max(schema.maximum);
        if (
          "exclusiveMinimum" in schema &&
          typeof schema.exclusiveMinimum === "number"
        )
          fieldSchema = fieldSchema.gt(schema.exclusiveMinimum);
        if (
          "exclusiveMaximum" in schema &&
          typeof schema.exclusiveMaximum === "number"
        )
          fieldSchema = fieldSchema.lt(schema.exclusiveMaximum);
        break;
      case "integer":
        fieldSchema = z.number().int();
        if ("minimum" in schema && typeof schema.minimum === "number")
          fieldSchema = fieldSchema.min(schema.minimum);
        if ("maximum" in schema && typeof schema.maximum === "number")
          fieldSchema = fieldSchema.max(schema.maximum);
        break;
      case "boolean":
        fieldSchema = z.boolean();
        break;
      case "array":
        if (schema.items?.type === "string") {
          fieldSchema = z.array(z.string());
        } else {
          fieldSchema = z.array(z.any());
        }
        break;
      default:
        fieldSchema = z.any();
    }

    // Make optional if not in required list
    if (!paramSchema.required?.includes(name)) {
      fieldSchema = fieldSchema.optional();
    }

    schemaMap[name] = fieldSchema;
  });

  return z.object(schemaMap);
}

function createDefaultValues(paramSchema: Protocol["params_schema"]) {
  const defaults: Record<string, unknown> = {};

  Object.entries(paramSchema.properties).forEach(([name, schema]) => {
    if ("default" in schema) {
      defaults[name] = schema.default;
    }
  });

  return defaults;
}

function renderFormControl(
  name: string,
  schema: Protocol["params_schema"]["properties"][string],
  field: {
    value: unknown;
    onChange: (value: unknown) => void;
    disabled?: boolean;
  }
) {
  switch (schema.type) {
    case "string":
      if (schema.enum) {
        return (
          <Select
            onValueChange={field.onChange}
            defaultValue={
              typeof field.value === "string" ? field.value : undefined
            }
            disabled={field.disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {schema.enum.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }
      return (
        <FormControl>
          <Input
            {...field}
            value={
              typeof field.value === "string"
                ? field.value
                : String(field.value ?? "")
            }
          />
        </FormControl>
      );
    case "number":
    case "integer":
      if (schema.minimum !== undefined && schema.maximum !== undefined) {
        // Calculate step size based on the range
        const range = schema.maximum - schema.minimum;
        const step = range > 100 ? 5 : 1;

        return (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <Slider
                min={schema.minimum}
                max={schema.maximum}
                step={step}
                value={[
                  typeof field.value === "number"
                    ? field.value
                    : schema.minimum,
                ]}
                onValueChange={(value) => field.onChange(value[0])}
                disabled={field.disabled}
                className="flex-1"
              />
              <Input
                type="number"
                value={typeof field.value === "number" ? field.value : ""}
                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                min={schema.minimum}
                max={schema.maximum}
                step={step}
                className="w-24"
                disabled={field.disabled}
              />
            </div>
          </div>
        );
      }
      return (
        <FormControl>
          <Input
            type="number"
            value={typeof field.value === "number" ? field.value : ""}
            onChange={(e) => field.onChange(e.target.valueAsNumber)}
            min={schema.minimum}
            max={schema.maximum}
            disabled={field.disabled}
          />
        </FormControl>
      );
    case "boolean":
      return (
        <FormControl>
          <div className="flex items-center gap-2">
            <Switch
              checked={field.value as boolean}
              onCheckedChange={field.onChange}
              disabled={field.disabled}
            />
            <span>{field.value ? "Enabled" : "Disabled"}</span>
          </div>
        </FormControl>
      );
    default:
      return (
        <FormControl>
          <Input
            {...field}
            value={
              typeof field.value === "string"
                ? field.value
                : String(field.value ?? "")
            }
          />
        </FormControl>
      );
  }
}
