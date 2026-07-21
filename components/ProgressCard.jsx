import React from "react";

import { Badge } from "@/components/ui/badge";

import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import { CircularProgress } from "@/components/ui/circular-progress";

export default function ProgressCard({ label, used, limit, units }) {
  const unlimited = limit < 0;
  const safeLimit = unlimited ? 1 : limit > 0 ? limit : 1;
  const percent = unlimited ? 0 : (used / safeLimit) * 100;
  const unitSuffix = units ? units : "";
  const usageLabel = unlimited
    ? `Used ${used}${unitSuffix} (unlimited)`
    : `Used ${used}${unitSuffix} of ${limit}${unitSuffix}`;

  return (
    <Card className="h-[260px] w-[240px] border-border">
      <CardContent className="items-center justify-center pb-0">
        <CircularProgress
          value={percent}
          aria-label={label}
        />
      </CardContent>
      <CardFooter className="items-center justify-center pt-0">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h3 className="p-2 font-bold text-foreground">{label}</h3>
            <Badge variant="outline">{usageLabel}</Badge>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
