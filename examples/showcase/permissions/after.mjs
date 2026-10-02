export function canDelete(user) {
  return user.role === "admin";
}