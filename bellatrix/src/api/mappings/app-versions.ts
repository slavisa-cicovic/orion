import { AppVersion } from "@/api/types/app-versions";
import { AppVersionRow } from "@/sections/app-versions/types";

export function mapAppVersionToRow(version: AppVersion): AppVersionRow {
  return {
    id: version.id,
    appName: version.applicationName ?? "-",
    versionName: version.versionName,
    platform: version.platform,
    status: version.status,
    active: version.active
  };
}

export function mapAppVersionsToRows(versions: AppVersion[]): AppVersionRow[] {
  return versions.map(mapAppVersionToRow);
}
