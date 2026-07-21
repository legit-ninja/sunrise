import { Badge } from '@/components/ui/badge';
import { PageShell } from '@/components/PageShell';
import { SERVICE_NAV_REGISTRY } from '@/lib/openstack/nav-services';

const TITLES: Record<string, string> = Object.fromEntries(
  SERVICE_NAV_REGISTRY.map((entry) => [entry.id, entry.title])
);

export default async function ServicePlaceholderPage({
  params,
}: {
  params: Promise<{ serviceType: string }>;
}) {
  const { serviceType } = await params;
  const title = TITLES[serviceType] ?? serviceType.replace(/-/g, ' ');

  return (
    <PageShell>
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center gap-3">
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          <Badge variant="secondary">Preview</Badge>
        </div>
        <p className="text-muted-foreground">
          This OpenStack service is listed in the Keystone catalog for your region,
          but Sunrise does not implement a full console for it yet. Check back as
          coverage expands, or use the OpenStack CLI / API directly.
        </p>
      </div>
    </PageShell>
  );
}
