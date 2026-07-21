"use client";

import { useState, useTransition } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createImageBuildJob } from "@/lib/image-build/actions";
import { imageBuildTemplatesQueryOptions } from "@/hooks/queries/useImageBuildJobs";

interface BuildImageActionsProps {
  regionId?: string;
  projectId?: string;
}

export function BuildImageActions({
  regionId,
  projectId,
}: BuildImageActionsProps) {
  const queryClient = useQueryClient();
  const { data: templates = [] } = useQuery(imageBuildTemplatesQueryOptions());
  const [open, setOpen] = useState(false);
  const [templateId, setTemplateId] = useState("");
  const [suffix, setSuffix] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const selectedTemplateId = templateId || templates[0]?.id || "";

  const handleSubmit = () => {
    if (!selectedTemplateId) {
      setError("Select a template");
      return;
    }

    setError(null);
    startTransition(async () => {
      const parameters: Record<string, unknown> = {};
      if (suffix.trim()) {
        parameters.image_name_suffix = suffix.trim();
      }

      const result = await createImageBuildJob({
        templateId: selectedTemplateId,
        parameters,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setOpen(false);
      setSuffix("");
      void queryClient.invalidateQueries({
        queryKey: [regionId, projectId, "image-build", "jobs"],
      });
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={!templates.length}>
          <Plus className="mr-1.5 h-4 w-4" />
          Build image
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Build image</DialogTitle>
          <DialogDescription>
            Start an on-demand image build from an approved template. Progress
            is tracked as a job; Glance inventory stays under Images.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Template</Label>
            <RadioGroup
              value={selectedTemplateId}
              onValueChange={setTemplateId}
              className="gap-3"
            >
              {templates.map((template) => (
                <label
                  key={template.id}
                  className="flex cursor-pointer items-start gap-3 rounded-md border border-border/60 p-3 hover:bg-accent/40"
                >
                  <RadioGroupItem value={template.id} className="mt-0.5" />
                  <span className="min-w-0 space-y-0.5">
                    <span className="block text-sm font-medium">
                      {template.name}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {template.description}
                    </span>
                  </span>
                </label>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image-name-suffix">Name suffix (optional)</Label>
            <Input
              id="image-name-suffix"
              value={suffix}
              onChange={(event) => setSuffix(event.target.value)}
              placeholder="e.g. acme-20260721"
              maxLength={32}
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={pending || !selectedTemplateId}
          >
            {pending ? "Submitting…" : "Start build"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
