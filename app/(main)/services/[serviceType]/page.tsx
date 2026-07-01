import { getRegistryEntryForSlug } from '@/lib/openstack/service-registry';

type ServicePlaceholderPageProps = {
  params: Promise<{ serviceType: string }>;
};

function titleCase(value: string): string {
  return value
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default async function ServicePlaceholderPage({
  params,
}: ServicePlaceholderPageProps) {
  const { serviceType } = await params;
  const registryEntry = getRegistryEntryForSlug(serviceType);
  const title = registryEntry?.title ?? titleCase(decodeURIComponent(serviceType));
  const description =
    registryEntry?.description ??
    `OpenStack ${decodeURIComponent(serviceType)} service.`;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{title}</h1>
      <p className="text-muted-foreground mb-4">{description}</p>
      <p className="text-sm text-muted-foreground">
        This service is enabled in your cloud catalog. A full Sunrise experience
        for {title} is coming soon.
      </p>
    </div>
  );
}
