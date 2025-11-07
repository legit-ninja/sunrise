import Login from "@/components/Auth/Login";
import { getSession } from "@/lib/session";

export default async function Provider({ children }: any) {
  const session = await getSession();
  if (!session.keystone_unscoped_token) {
    return <Login />;
  }

  // Check if user has appropriate roles for the selected project
  const projectData = await session().get("projectData");
  if (projectData && projectData.roles) {
    const allowedRoles = ["member", "reader"];
    const userRoles = projectData.roles.map((role: any) => role.name.toLowerCase());
    const hasAllowedRole = allowedRoles.some(role => userRoles.includes(role));

    if (!hasAllowedRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Access Denied
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                You do not have the required permissions to access this dashboard.
                Please contact your administrator.
              </p>
            </div>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
