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
  type LucideIcon,
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
import { Badge } from '@/components/ui/badge';
import type { NavServiceIcon, NavServiceItem } from '@/lib/openstack/nav-types';

const ICONS: Record<NavServiceIcon, LucideIcon> = {
  Server,
  Container,
  Database,
  Layers,
  Globe,
  FolderTree,
  Network,
};

function ServiceItem({
  title,
  children,
  href,
  icon: Icon,
  preview,
  ...props
}: React.ComponentPropsWithoutRef<'li'> & {
  href: string;
  icon: LucideIcon;
  preview?: boolean;
}) {
  return (
    <li {...props} className="h-full">
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className="group/service flex h-full flex-col rounded-lg border border-border/40 bg-card p-4 transition-all duration-200 hover:border-border hover:bg-accent hover:shadow-sm"
        >
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors group-hover/service:bg-primary group-hover/service:text-primary-foreground">
              <Icon className="h-5 w-5 text-current" aria-hidden="true" />
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <div className="truncate text-sm font-semibold">{title}</div>
              {preview ? (
                <Badge variant="secondary" className="shrink-0 text-[10px]">
                  Preview
                </Badge>
              ) : null}
            </div>
          </div>
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}

export function ServicesMenu({ services }: { services: NavServiceItem[] }) {
  const isMobile = useMediaQuery('(max-width: 767px)', {
    initializeWithValue: false,
  });

  return (
    <NavigationMenu viewport={isMobile}>
      <NavigationMenuList className="flex items-center gap-3">
        <NavigationMenuItem>
          <NavigationMenuTrigger
            className="flex items-center justify-center p-0 px-3 hover:bg-accent"
            aria-label="Services"
          >
            <LayoutGrid className="h-5 w-5" />
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="w-[500px] p-6">
              <div className="mb-4">
                <h3 className="mb-1 text-lg font-semibold">Services</h3>
                <p className="text-sm text-muted-foreground">
                  Services available in this region
                </p>
              </div>
              {services.length === 0 ? (
                <p className="rounded-md border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                  No catalog services are available for the selected region.
                </p>
              ) : (
                <ul className="grid grid-cols-2 gap-3">
                  {services.map((service) => {
                    const Icon = ICONS[service.icon] ?? Server;
                    return (
                      <ServiceItem
                        key={service.id}
                        title={service.title}
                        href={service.href}
                        icon={Icon}
                        preview={service.status === 'preview'}
                      >
                        {service.description}
                      </ServiceItem>
                    );
                  })}
                </ul>
              )}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
