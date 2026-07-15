import { getSession } from "./auth"

export async function requireAuth(allowedRoles?: string[]) {
  const session = await getSession()

  if (!session) {
    return {
      error: "No autorizado",
      status: 401,
    }
  }

  if (allowedRoles) {
    // Normalizar rol del usuario: MAYÚSCULAS -> Capitalizadas
    const userRole = normalizeRole(session.rol)
    const normalizedAllowedRoles = allowedRoles.map(normalizeRole)

    if (!normalizedAllowedRoles.includes(userRole)) {
      return {
        error: "No tienes permisos para acceder a este recurso",
        status: 403,
      }
    }
  }

  return { session }
}

// Normaliza roles: 'ADMIN' -> 'Admin', 'admin' -> 'Admin'
function normalizeRole(role: string): string {
  return role
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}
