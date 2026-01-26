import { App, CreateAppRequest } from "@/api/types/apps";
import { AppData, AppRow } from "@/sections/apps/types";
import { formatDate } from "@/api/mappings/formatters";

export function mapAppToRow(app: App): AppRow {
  return {
    id: app.id,
    displayName: app.displayName,
    packageName: app.packageName,
    isActive: app.isActive,
    createdAt: formatDate(app.createdAt)
  };
}

export function mapAppsToRows(apps: App[]): AppRow[] {
  return apps.map(mapAppToRow);
}

export function mapAppDataToCreateAppRequest(appData: AppData): CreateAppRequest {
  const description = appData.description.trim();
  const iconUrl = appData.iconUrl.trim();
  const ownerCompanyId = appData.ownerCompanyId.trim();

  return {
    displayName: appData.displayName.trim(),
    packageName: appData.packageName.trim(),
    description: description.length > 0 ? description : null,
    iconUrl: iconUrl.length > 0 ? iconUrl : null,
    ownerCompanyId: ownerCompanyId.length > 0 ? ownerCompanyId : null
  };
}
