import { ServiceLayout } from '@/components/ServiceLayout';

export default async function GenericServiceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ serviceType: string }>;
}) {
  const { serviceType } = await params;
  const baseHref = `/services/${serviceType}`;
  const sidebarSections = [
    {
      items: [{ name: 'Overview', href: baseHref, icon: 'Gauge' }],
    },
  ];

  return (
    <ServiceLayout sidebarSections={sidebarSections}>
      {children}
    </ServiceLayout>
  );
}
