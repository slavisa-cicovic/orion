import { App, CreateAppRequest } from "@/api/types/apps";
import { AppData, AppRow } from "@/sections/apps/types";

export function mapAppToRow(app: App): AppRow {
  const baseUrl = (process.env.NEXT_PUBLIC_HOST_API ?? "").replace(/\/$/, "");
  const apiBase = baseUrl.endsWith("/api") ? baseUrl : `${baseUrl}/api`;
  const iconUrl = app.iconUrl ? `${apiBase}/uploads/${app.iconUrl.replace(/^\/+/, "")}` : null;

  return {
    id: String(app.id),
    iconUrl,
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
