import { CreateUserRequest, User } from "@/api/types/users";
import { UserData, UserRow } from "@/sections/users/types";
import { formatDate } from "@/api/mappings/formatters";

export function mapUserToRow(user: User): UserRow {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName ?? "-",
    companyName: user.companyName ?? "-",
    isActive: user.isActive,
    createdAt: formatDate(user.createdAt)
  };
}

export function mapUsersToRows(users: User[]): UserRow[] {
  return users.map(mapUserToRow);
}

export function mapUserDataToCreateUserRequest(userData: UserData): CreateUserRequest {
  const fullName = userData.fullName.trim();

  return {
    companyId: userData.companyId.trim(),
    email: userData.email.trim(),
    fullName: fullName.length > 0 ? fullName : null,
    password: userData.password
  };
}
