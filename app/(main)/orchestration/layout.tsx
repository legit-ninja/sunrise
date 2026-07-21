import { ServiceLayout } from "@/components/ServiceLayout";

const orchestrationSidebarSections = [
  {
    items: [
      { name: "Overview", href: "/orchestration", icon: "Gauge" },
    ],
  },
];

export default function OrchestrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ServiceLayout sidebarSections={orchestrationSidebarSections}>
      {children}
    </ServiceLayout>
  );
}
