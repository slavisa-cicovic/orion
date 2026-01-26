import { Installation } from "@/api/types/installations";
import { InstallationRow } from "@/sections/installations/types";
import { formatDate } from "@/api/mappings/formatters";

export function mapInstallationToRow(installation: Installation): InstallationRow {
  return {
    id: installation.id,
    appVersionId: installation.appVersionId,
    appVersionName: installation.appVersionName,
    appVersionCode: installation.appVersionCode,
    appVersionPlatform: installation.appVersionPlatform,
    appName: installation.appName ?? "-",
    userFullName: installation.userFullName ?? "-",
    installedAt: formatDate(installation.installedAt),
    createdAt: formatDate(installation.createdAt)
  };
}

export function mapInstallationsToRows(installations: Installation[]): InstallationRow[] {
  return installations.map(mapInstallationToRow);
}
