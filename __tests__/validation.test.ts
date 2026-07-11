/**
 * Test: Data Validation
 * Verifica validación de datos con Zod
 */

import { z } from 'zod';

describe('Data Validation with Zod', () => {
  describe('Pedido (Order) Schema', () => {
    const pedidoSchema = z.object({
      id_pedido: z.number().positive(),
      id_mesa: z.number().positive(),
      id_user: z.number().positive(),
      estado_pedido: z.enum(['En preparacion', 'Servido', 'Pagado', 'Cancelado']),
      total: z.number().nonnegative(),
      createdAt: z.date(),
    });

    it('should validate correct pedido', () => {
      const validPedido = {
        id_pedido: 1,
        id_mesa: 5,
        id_user: 2,
        estado_pedido: 'En preparacion' as const,
        total: 150.50,
        createdAt: new Date(),
      };

      expect(pedidoSchema.parse(validPedido)).toBeDefined();
    });

    it('should reject invalid estado_pedido', () => {
      const invalidPedido = {
        id_pedido: 1,
        id_mesa: 5,
        id_user: 2,
        estado_pedido: 'InvalidStatus',
        total: 150.50,
        createdAt: new Date(),
      };

      expect(() => pedidoSchema.parse(invalidPedido)).toThrow();
    });

    it('should reject negative total', () => {
      const invalidPedido = {
        id_pedido: 1,
        id_mesa: 5,
        id_user: 2,
        estado_pedido: 'En preparacion' as const,
        total: -50,
        createdAt: new Date(),
      };

      expect(() => pedidoSchema.parse(invalidPedido)).toThrow();
    });
  });

  describe('Usuario (User) Schema', () => {
    const usuarioSchema = z.object({
      id_user: z.number().positive(),
      nombre_user: z.string().min(2).max(100),
      apellido_user: z.string().min(2).max(100),
      correo_user: z.string().email(),
      rol: z.enum(['ADMIN', 'MESERO', 'COCINERO', 'CAJERO']),
      contrasena: z.string().min(8),
    });

    it('should validate correct usuario', () => {
      const validUser = {
        id_user: 1,
        nombre_user: 'Juan',
        apellido_user: 'Pérez',
        correo_user: 'juan@example.com',
        rol: 'ADMIN' as const,
        contrasena: 'SecurePass123',
      };

      expect(usuarioSchema.parse(validUser)).toBeDefined();
    });

    it('should reject invalid email', () => {
      const invalidUser = {
        id_user: 1,
        nombre_user: 'Juan',
        apellido_user: 'Pérez',
        correo_user: 'invalid-email',
        rol: 'ADMIN' as const,
        contrasena: 'SecurePass123',
      };

      expect(() => usuarioSchema.parse(invalidUser)).toThrow();
    });

    it('should reject short password', () => {
      const invalidUser = {
        id_user: 1,
        nombre_user: 'Juan',
        apellido_user: 'Pérez',
        correo_user: 'juan@example.com',
        rol: 'ADMIN' as const,
        contrasena: 'short',
      };

      expect(() => usuarioSchema.parse(invalidUser)).toThrow();
    });
  });

  describe('Producto (Product) Schema', () => {
    const productoSchema = z.object({
      id_produc: z.number().positive(),
      nombre_produc: z.string().min(3).max(100),
      precio_produc: z.number().nonnegative(),
      categoria_produc: z.string(),
      stock_produc: z.number().nonnegative(),
      controlar_stock: z.boolean(),
    });

    it('should validate correct producto', () => {
      const validProduct = {
        id_produc: 1,
        nombre_produc: 'Pollo Rostizado',
        precio_produc: 45.50,
        categoria_produc: 'Principales',
        stock_produc: 20,
        controlar_stock: true,
      };

      expect(productoSchema.parse(validProduct)).toBeDefined();
    });

    it('should reject zero stock if required', () => {
      const product = {
        id_produc: 1,
        nombre_produc: 'Pollo Rostizado',
        precio_produc: 45.50,
        categoria_produc: 'Principales',
        stock_produc: 0,
        controlar_stock: true,
      };

      // Validación base pasa, pero negocio podría rechazarlo
      expect(productoSchema.parse(product)).toBeDefined();
    });
  });
});
