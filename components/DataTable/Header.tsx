import pluralize from "pluralize";
import { ReactNode } from "react";

interface DataTableHeaderProps {
  resourceName: string;
  actions: ReactNode;
}

function toSentenceCase(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function DataTableHeader({ resourceName, actions }: DataTableHeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h1 className="text-3xl font-bold">
        {toSentenceCase(pluralize(resourceName))}
      </h1>
      {actions}
    </div>
  );
}
