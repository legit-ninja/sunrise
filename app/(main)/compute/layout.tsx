import { ServiceLayout } from "@/components/ServiceLayout";

const computeSidebarSections = [
  {
    title: "Instances",
    items: [
      { name: "Instances", href: "/compute/instances", icon: "Server" },
      { name: "Instance flavors", href: "/compute/instance-flavors", icon: "Cpu" },
      { name: "Images", href: "/compute/images", icon: "Image" },
      { name: "Image builds", href: "/compute/image-builds", icon: "Hammer" },
    ],
  },
  {
    title: "Block storage",
    items: [
      { name: "Volumes", href: "/compute/volumes", icon: "HardDrive" },
      { name: "Snapshots", href: "/compute/snapshots", icon: "Camera" },
    ],
  },
  {
    title: "Network & security",
    items: [
      { name: "Networks", href: "/compute/networks", icon: "Network" },
      { name: "Key pairs", href: "/compute/key-pairs", icon: "Key" },
    ],
  },
];

export default function ComputeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ServiceLayout sidebarSections={computeSidebarSections}>
      {children}
    </ServiceLayout>
  );
}
