import { Permission } from "@/api/types/permissions";
import { PermissionRow } from "@/sections/permissions/types";
import { formatDate } from "@/api/mappings/formatters";

export function mapPermissionToRow(permission: Permission): PermissionRow {
  return {
    id: permission.id,
    key: permission.key,
    isSystem: permission.isSystem,
    createdAt: formatDate(permission.createdAt)
  };
}

export function mapPermissionsToRows(permissions: Permission[]): PermissionRow[] {
  return permissions.map(mapPermissionToRow);
}
