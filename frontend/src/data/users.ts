/**
 * Admin user directory (local mock). Public site users are separate (client accounts).
 * BACKEND: admin_users table with role = admin only for this product.
 */

export type UserRole = 'admin'

export interface UserRecord {
  id: string
  name: string
  email: string
  role: UserRole
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
}

let usersStore: UserRecord[] = [
  { id: 'a1', name: 'Primary Admin', email: 'admin@chararealty.com', role: 'admin' },
]

export function getUsersStore(): UserRecord[] {
  return [...usersStore]
}

export function setUsersStore(updater: (prev: UserRecord[]) => UserRecord[]) {
  usersStore = updater(usersStore)
}
