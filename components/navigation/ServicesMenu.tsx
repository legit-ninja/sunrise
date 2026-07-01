'use client';

import {
  LayoutGrid,
  Server,
  Container,
  Database,
  Globe,
  FolderTree,
  Layers,
  Network,
  Shield,
  Gauge,
  HardDrive,
  Image,
  Key,
  Box,
  Cpu,
} from 'lucide-react';
import Link from 'next/link';
import { useMediaQuery } from 'usehooks-ts';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuList,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu';
import type { NavServiceIcon, NavServiceItem } from '@/types/openstack/nav';

export type ServicesMenuItem = NavServiceItem;

const ICONS: Record<
  NavServiceIcon,
  React.ComponentType<{ className?: string }>
> = {
  server: Server,
  container: Container,
  database: Database,
  layers: Layers,
  globe: Globe,
  'folder-tree': FolderTree,
  network: Network,
  shield: Shield,
  gauge: Gauge,
  'hard-drive': HardDrive,
  image: Image,
  key: Key,
  box: Box,
  cpu: Cpu,
};

function ServiceItem({
  title,
  children,
  href,
  icon,
  placeholder,
  ...props
}: React.ComponentPropsWithoutRef<'li'> & {
  href: string;
  icon: NavServiceIcon;
  placeholder?: boolean;
}) {
  const Icon = ICONS[icon];

  return (
    <li {...props} className="h-full">
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className="group flex flex-col h-full p-4 rounded-lg border border-border/40 bg-card hover:bg-accent hover:border-border transition-all duration-200 hover:shadow-sm"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Icon className="h-5 w-5" />
            </div>
            <div className="font-semibold text-sm">
              {title}
              {placeholder ? (
                <span className="ml-2 text-[10px] font-normal uppercase tracking-wide text-muted-foreground">
                  Preview
                </span>
              ) : null}
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}

export function ServicesMenu({ services }: { services: ServicesMenuItem[] }) {
  const isMobile = useMediaQuery('(max-width: 767px)', {
    initializeWithValue: false,
  });

  if (services.length === 0) {
    return null;
  }

  return (
    <NavigationMenu viewport={isMobile}>
      <NavigationMenuList className="flex items-center gap-3">
        <NavigationMenuItem>
          <NavigationMenuTrigger className="p-0 px-3 flex items-center justify-center hover:bg-accent">
            <LayoutGrid className="h-5 w-5" />
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="p-6 w-[500px]">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-1">Services</h3>
                <p className="text-sm text-muted-foreground">
                  Access your OpenStack services
                </p>
              </div>
              <ul className="grid grid-cols-2 gap-3">
                {services.map((service) => (
                  <ServiceItem
                    key={service.id}
                    title={service.title}
                    href={service.href}
                    icon={service.icon}
                    placeholder={service.placeholder}
                  >
                    {service.description}
                  </ServiceItem>
                ))}
              </ul>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
