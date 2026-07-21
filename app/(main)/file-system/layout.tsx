import { ServiceLayout } from "@/components/ServiceLayout";

const fileSystemSidebarSections = [
  {
    items: [
      { name: "Overview", href: "/file-system", icon: "Gauge" },
    ],
  },
];

export default function FileSystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ServiceLayout sidebarSections={fileSystemSidebarSections}>
      {children}
    </ServiceLayout>
  );
}
