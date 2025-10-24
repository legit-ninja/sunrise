"use client";

import { useEffect, useState } from "react";
import ProgressCard from "@/components/ProgressCard";
import { ComputeQuotas, VolumeQuotas, NetworkQuotas } from "@/lib/keystone";

type QuotaItem = {
  label: string;
  used: number;
  limit: number;
  units: string;
};

type QuotaGroup = {
  name: string;
  items: QuotaItem[];
};

export default function ProjectStats() {
  const [limitSummaryData, setLimitSummaryData] = useState<QuotaGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuotas = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch quotas from API route
        const response = await fetch("/api/quotas");
        if (!response.ok) {
          throw new Error(`Failed to fetch quotas: ${response.statusText}`);
        }

        const quotaData = await response.json();

        const computeQuotas = quotaData.compute;
        const volumeQuotas = quotaData.volume;
        const networkQuotas = quotaData.network;

        const data: QuotaGroup[] = [];

        // Compute quotas
        if (computeQuotas) {
          const computeItems = [
            { label: "Instances", used: computeQuotas.instances.used, limit: computeQuotas.instances.limit, units: "" },
            { label: "VCPUs", used: computeQuotas.cores.used, limit: computeQuotas.cores.limit, units: "" },
            { label: "RAM", used: computeQuotas.ram.used, limit: computeQuotas.ram.limit, units: "GB" },
          ];

          if (computeQuotas.key_pairs) {
            computeItems.push({ label: "Key Pairs", used: computeQuotas.key_pairs.used, limit: computeQuotas.key_pairs.limit, units: "" });
          }
          if (computeQuotas.server_groups) {
            computeItems.push({ label: "Server Groups", used: computeQuotas.server_groups.used, limit: computeQuotas.server_groups.limit, units: "" });
          }
          if (computeQuotas.server_group_members) {
            computeItems.push({ label: "Server Group Members", used: computeQuotas.server_group_members.used, limit: computeQuotas.server_group_members.limit, units: "" });
          }

          data.push({
            name: "Compute",
            items: computeItems,
          });
        }

        // Volume quotas
        if (volumeQuotas) {
          const volumeItems = [
            { label: "Volumes", used: volumeQuotas.volumes.used, limit: volumeQuotas.volumes.limit, units: "" },
            { label: "Volume Snapshots", used: volumeQuotas.snapshots.used, limit: volumeQuotas.snapshots.limit, units: "" },
            { label: "Volume Storage", used: volumeQuotas.gigabytes.used, limit: volumeQuotas.gigabytes.limit, units: "GB" },
          ];

          if (volumeQuotas.backups) {
            volumeItems.push({ label: "Volume Backups", used: volumeQuotas.backups.used, limit: volumeQuotas.backups.limit, units: "" });
          }
          if (volumeQuotas.backup_gigabytes) {
            volumeItems.push({ label: "Backup Storage", used: volumeQuotas.backup_gigabytes.used, limit: volumeQuotas.backup_gigabytes.limit, units: "GB" });
          }

          data.push({
            name: "Volume",
            items: volumeItems,
          });
        }

        // Network quotas
        if (networkQuotas) {
          data.push({
            name: "Network",
            items: [
              { label: "Floating IPs", used: networkQuotas.floatingips.used, limit: networkQuotas.floatingips.limit, units: "" },
              { label: "Security Groups", used: networkQuotas.security_groups.used, limit: networkQuotas.security_groups.limit, units: "" },
              { label: "Security Group Rules", used: networkQuotas.security_group_rules.used, limit: networkQuotas.security_group_rules.limit, units: "" },
              { label: "Networks", used: networkQuotas.networks.used, limit: networkQuotas.networks.limit, units: "" },
              { label: "Subnets", used: networkQuotas.subnets.used, limit: networkQuotas.subnets.limit, units: "" },
              { label: "Ports", used: networkQuotas.ports.used, limit: networkQuotas.ports.limit, units: "" },
              { label: "Routers", used: networkQuotas.routers.used, limit: networkQuotas.routers.limit, units: "" },
            ],
          });
        }

        setLimitSummaryData(data);
      } catch (err) {
        console.error("Failed to fetch quotas:", err);
        setError("Failed to load quota information");
      } finally {
        setLoading(false);
      }
    };

    fetchQuotas();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2 text-gray-600">Loading quota information...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading quotas</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (limitSummaryData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No quota information available</p>
      </div>
    );
  }

  return (
    <>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-gray-900">
            Limit Summary
          </h1>
        </div>
      </div>
      {limitSummaryData.map((group) => (
        <div key={group.name}>
          <h2 className="text-xl font-semibold pt-5 pb-3">{group.name}</h2>
          <ul
            role="list"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          >
            {group.items.map((item, i) => (
              <div key={i}>
                <li className="col-span-1 flex flex-col divide-y text-center items-center">
                  <ProgressCard
                    label={item.label}
                    used={item.used}
                    limit={item.limit}
                    units={item.units}
                  />
                </li>
              </div>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}
