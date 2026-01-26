import { AppVersion } from "@/api/types/app-versions";
import { AppVersionRow } from "@/sections/app-versions/types";
import { formatDate } from "@/api/mappings/formatters";

export function mapAppVersionToRow(version: AppVersion): AppVersionRow {
  return {
    id: version.id,
    appName: version.appName ?? "-",
    versionName: version.versionName,
    versionCode: version.versionCode,
    platform: version.platform,
    status: version.status,
    createdAt: formatDate(version.createdAt)
  };
}

export function mapAppVersionsToRows(versions: AppVersion[]): AppVersionRow[] {
  return versions.map(mapAppVersionToRow);
}
