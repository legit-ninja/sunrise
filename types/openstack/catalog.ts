export type CatalogEndpoint = {
  id: string;
  interface: string;
  region: string;
  region_id?: string;
  url: string;
};

export type CatalogService = {
  id: string;
  type: string;
  name: string;
  endpoints: CatalogEndpoint[];
};

export type ServiceCatalog = {
  catalog: CatalogService[];
};
