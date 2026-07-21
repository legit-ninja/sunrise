export type NavServiceStatus = 'available' | 'preview';

export type NavServiceIcon =
  | 'Server'
  | 'Container'
  | 'Database'
  | 'Layers'
  | 'Globe'
  | 'FolderTree'
  | 'Network';

export type NavServiceItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: NavServiceIcon;
  status: NavServiceStatus;
};
