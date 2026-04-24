import { getSession } from "./auth"

export async function requireAuth(allowedRoles?: string[]) {
  const session = await getSession()

  if (!session) {
    return {
      error: "No autorizado",
      status: 401,
    }
  }

  if (allowedRoles && !allowedRoles.includes(session.rol)) {
    return {
      error: "No tienes permisos para acceder a este recurso",
      status: 403,
    }
  }

  return { session }
}
