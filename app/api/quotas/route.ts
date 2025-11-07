import { NextRequest, NextResponse } from "next/server";
import { session } from "@/lib/session";
import { getComputeQuotas, getVolumeQuotas, getNetworkQuotas } from "@/lib/keystone";

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const projectToken = await session().get("projectToken");
    if (!projectToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Fetch quotas from all services in parallel
    const [computeQuotas, volumeQuotas, networkQuotas] = await Promise.all([
      getComputeQuotas().catch((error) => {
        console.error("Failed to fetch compute quotas:", error);
        return null;
      }),
      getVolumeQuotas().catch((error) => {
        console.error("Failed to fetch volume quotas:", error);
        return null;
      }),
      getNetworkQuotas().catch((error) => {
        console.error("Failed to fetch network quotas:", error);
        return null;
      }),
    ]);

    console.log("API quotas response:", {
      compute: computeQuotas,
      volume: volumeQuotas,
      network: networkQuotas,
    });

    return NextResponse.json({
      compute: computeQuotas,
      volume: volumeQuotas,
      network: networkQuotas,
    });
  } catch (error) {
    console.error("Error fetching quotas:", error);
    return NextResponse.json({ error: "Failed to fetch quotas" }, { status: 500 });
  }
}