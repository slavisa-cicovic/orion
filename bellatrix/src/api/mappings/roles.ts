import { Role } from "@/api/types/roles";
import { RoleRow } from "@/sections/roles/types";
import { formatDate } from "@/api/mappings/formatters";

export function mapRoleToRow(role: Role): RoleRow {
  return {
    id: role.id,
    name: role.name,
    allowsMobile: role.allowsMobile,
    isSystem: role.isSystem,
    createdAt: formatDate(role.createdAt)
  };
}

export function mapRolesToRows(roles: Role[]): RoleRow[] {
  return roles.map(mapRoleToRow);
}
