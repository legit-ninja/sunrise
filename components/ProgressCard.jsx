import React from "react";

import { Badge } from "@/components/ui/badge";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { CircularProgress } from "@/components/ui/circular-progress";

export default function ProgressCard({ label, used, limit, units }) {
  console.log(`ProgressCard ${label}: used=${used}, limit=${limit}, units=${units}`);

  // Handle unlimited quotas (limit = -1) and disabled quotas (limit = 0)
  const isUnlimited = limit === -1;
  const isDisabled = limit === 0;
  const displayLimit = isUnlimited ? "∞" : isDisabled ? "0" : limit;
  const percentage = isUnlimited || isDisabled ? 0 : (used / limit) * 100;

  console.log(`ProgressCard ${label}: percentage=${percentage}, isUnlimited=${isUnlimited}`);

  return (
    <Card className="w-[240px] h-[260px] border-none">
      <CardContent className="justify-center items-center pb-0">
        <CircularProgress
          classNames={{
            svg: "w-36 h-36 drop-shadow-md",
            indicator: isUnlimited ? "stroke-green-500" : isDisabled ? "stroke-gray-400" : "stroke-black",
            track: "stroke-black/10",
            value: "text-3xl font-semibold text-white",
          }}
          value={percentage}
          strokeWidth={4}
          showValueLabel={!isUnlimited && !isDisabled}
          aria-label={label}
        />
        {(isUnlimited || isDisabled) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-semibold text-gray-600">
              {isUnlimited ? "∞" : "0"}
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-center items-center pt-0">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h3 className="font-bold p-2">{label}</h3>
            <Badge variant="outline">
              Used {used}
              {units ? units : ""} of {displayLimit}
              {units ? units : ""}
            </Badge>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
