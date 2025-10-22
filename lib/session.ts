import nextAppSession, { MemoryStore } from "next-app-session";
import { Endpoint, Project } from "@/lib/keystone";

export type User = {
  id: string;
  name: string;
  domain: {
    id: string;
    name: string;
  };
};

export type TokenData = {
  user: User;
  catalog: any[];
  expires_at: string;
  issued_at: string;
  methods: string[];
  project: Project;
  roles: any[];
  is_domain: boolean;
  [key: string]: any;
};

export type SunriseSession = {
  keystone_unscoped_token?: string;
  keystone_token?: string;
  projects?: Project[];
  selectedProject?: Project;
  projectToken?: string;
  userName?: string;
  redirect_to?: string;
};

// Setup the config for your session and cookie
export const session = nextAppSession<SunriseSession>({
  secret: process.env.SESSION_SECRET,
  // TODO(mnaser): Make this configurable for production setups
  store: new MemoryStore(),
});

export async function getProjectToken(): Promise<string> {
  const projectToken = await session().get("projectToken");

  return projectToken;
}

export async function getServiceEndpoint(
  service: string,
  serviceInterface: string = "public",
): Promise<Endpoint | null> {
  const projectToken = await getProjectToken();
  if (!projectToken) return null;

  try {
    // Fetch the service catalog from Keystone
    const response = await fetch(`${process.env.KEYSTONE_API}/v3/auth/catalog`, {
      headers: {
        "X-Auth-Token": projectToken,
      },
    });

    if (!response.ok) return null;

    const catalog = await response.json();

    const serviceEntry = catalog.catalog.find(
      (item: { name: string }) => item.name === service,
    );

    if (!serviceEntry) return null;

    const endpoint = serviceEntry.endpoints.find(
      (endpoint: { interface: string }) => endpoint.interface === serviceInterface,
    );

    return endpoint || null;
  } catch (error) {
    console.error("Failed to get service endpoint:", error);
    return null;
  }
}

export async function getServiceEndpoints(
  services: string[],
  serviceInterface: string = "public",
): Promise<Endpoint[]> {
  const projectToken = await getProjectToken();
  if (!projectToken) return [];

  try {
    // Fetch the service catalog from Keystone
    const response = await fetch(`${process.env.KEYSTONE_API}/v3/auth/catalog`, {
      headers: {
        "X-Auth-Token": projectToken,
      },
    });

    if (!response.ok) return [];

    const catalog = await response.json();

    const endpoints = catalog.catalog
      .filter((item: { name: string }) => services.includes(item.name))
      .map((item: { endpoints: Endpoint[] }) => item.endpoints)
      .flat()
      .filter((endpoint: { interface: string }) => endpoint.interface === serviceInterface);

    return endpoints;
  } catch (error) {
    console.error("Failed to get service endpoints:", error);
    return [];
  }
}

