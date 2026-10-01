export function canDelete(user) {
  if (user.role = "admin") return true;
  return false;
}