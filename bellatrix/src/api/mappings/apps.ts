import { App, CreateAppRequest } from "@/api/types/apps";
import { AppData, AppRow } from "@/sections/apps/types";

export function mapAppToRow(app: App): AppRow {
  return {
    id: String(app.id),
    displayName: app.displayName,
    packageName: app.packageName,
    isActive: app.active
  };
}

export function mapAppsToRows(apps: App[]): AppRow[] {
  return apps.map(mapAppToRow);
}

export function mapAppDataToCreateAppRequest(appData: AppData): CreateAppRequest {
  const description = appData.description.trim();
  const iconUrl = appData.iconUrl.trim();

  return {
    displayName: appData.displayName.trim(),
    packageName: appData.packageName.trim(),
    description: description.length > 0 ? description : null,
    iconUrl: iconUrl.length > 0 ? iconUrl : null,
    active: appData.active
  };
}
