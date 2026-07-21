import ProgressCard from "@/components/ProgressCard";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { fetchProjectQuotaGroups } from "@/lib/openstack/quotas";
import { getSession } from "@/lib/session";

export default async function ProjectStats() {
  const session = await getSession();

  if (!session.projectId || !session.keystoneProjectToken) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyTitle>Select a project</EmptyTitle>
          <EmptyDescription>
            Choose a project in the header to see quota usage for this region.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const result = await fetchProjectQuotaGroups();

  if (!result) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyTitle>Select a project</EmptyTitle>
          <EmptyDescription>
            Choose a project in the header to see quota usage for this region.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (result.error) {
    return (
      <div
        role="status"
        className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-foreground"
      >
        <p className="font-medium">Couldn&apos;t load quotas</p>
        <p className="mt-1 text-muted-foreground">{result.error}</p>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-lg font-semibold text-foreground">Limit summary</h2>
      {result.groups.map((group) => (
        <div key={group.name}>
          <h3 className="text-lg font-semibold pt-5 pb-3">{group.name}</h3>
          <ul
            role="list"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          >
            {group.items.map((item) => (
              <li
                key={item.label}
                className="col-span-1 flex flex-col divide-y text-center items-center"
              >
                <ProgressCard
                  label={item.label}
                  used={item.used}
                  limit={item.limit}
                  units={item.units}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}
