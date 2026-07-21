import { ServiceLayout } from "@/components/ServiceLayout";

const dnsSidebarSections = [
  {
    items: [
      { name: "Overview", href: "/dns", icon: "Gauge" },
    ],
  },
];

export default function DNSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ServiceLayout sidebarSections={dnsSidebarSections}>
      {children}
    </ServiceLayout>
  );
}
