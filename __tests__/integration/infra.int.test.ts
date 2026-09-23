// Verifica la infraestructura de integración (BD de pruebas + factories). No prueba endpoints.
import { db, crearUsuario, crearMesa, crearProducto, limpiar, cerrarConexion } from './factories'

afterAll(async () => {
  await limpiar()
  await cerrarConexion()
})

describe('Infraestructura de integración', () => {
  it('usa una base de datos cuyo nombre termina en _test', async () => {
    const [{ current_database }] = await db.$queryRaw<Array<{ current_database: string }>>`SELECT current_database()`
    expect(current_database.endsWith('_test')).toBe(true)
  })

  it('las factories crean un usuario Tester, una mesa y un producto, y limpiar() los borra', async () => {
    const { usuario, token } = await crearUsuario('Tester')
    const mesa = await crearMesa()
    const producto = await crearProducto({ precio: 12.5 })

    expect(usuario.rol).toBe('Tester')
    expect(token.split('.')).toHaveLength(3)
    expect(mesa.estado_mesa).toBe('Libre')
    expect(Number(producto.precio_produc)).toBe(12.5)

    await limpiar()

    expect(await db.usuarios.count({ where: { id_user: usuario.id_user } })).toBe(0)
    expect(await db.mesas.count({ where: { id_mesa: mesa.id_mesa } })).toBe(0)
    expect(await db.productos.count({ where: { id_produc: producto.id_produc } })).toBe(0)
  })
})
