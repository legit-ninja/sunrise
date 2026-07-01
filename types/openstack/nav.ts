/** Icon keys for the services navigation menu (mapped to lucide components on the client). */
export type NavServiceIcon =
  | 'server'
  | 'container'
  | 'database'
  | 'layers'
  | 'globe'
  | 'folder-tree'
  | 'network'
  | 'shield'
  | 'gauge'
  | 'hard-drive'
  | 'image'
  | 'key'
  | 'box'
  | 'cpu';

export type NavServiceItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: NavServiceIcon;
  placeholder?: boolean;
  catalogType?: string;
  catalogName?: string;
};
