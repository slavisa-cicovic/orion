import { CreateUserRequest, User } from "@/api/types/users";
import { UserData, UserRow } from "@/sections/users/types";
export function mapUserToRow(user: User): UserRow {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();

  return {
    id: String(user.id),
    email: user.email,
    fullName: fullName.length > 0 ? fullName : "-",
    companyName: user.companyName ?? "-",
    isActive: user.active
  };
}

export function mapUsersToRows(users: User[]): UserRow[] {
  return users.map(mapUserToRow);
}

export function mapUserDataToCreateUserRequest(userData: UserData): CreateUserRequest {
  const firstName = userData.firstName.trim();
  const lastName = userData.lastName.trim();
  const phone = userData.phone.trim();

  return {
    username: userData.username.trim(),
    companyId: userData.companyId.trim(),
    email: userData.email.trim(),
    firstName: firstName.length > 0 ? firstName : null,
    lastName: lastName.length > 0 ? lastName : null,
    phone: phone.length > 0 ? phone : null,
    password: userData.password,
    active: userData.active
  };
}
