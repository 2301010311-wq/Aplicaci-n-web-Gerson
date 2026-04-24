/*
  Warnings:

  - You are about to drop the `finanzas` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "finanzas";

-- CreateTable
CREATE TABLE "ingresos" (
    "id_ingreso" SERIAL NOT NULL,
    "fecha_ingreso" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monto" DECIMAL(12,2) NOT NULL,
    "descripcion" VARCHAR(255) NOT NULL,
    "categoria" VARCHAR(50) NOT NULL,
    "cliente" VARCHAR(100),
    "metodo_pago" VARCHAR(50) NOT NULL,
    "comprobante" VARCHAR(255),
    "estado" VARCHAR(20) NOT NULL DEFAULT 'Registrado',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ingresos_pkey" PRIMARY KEY ("id_ingreso")
);

-- CreateTable
CREATE TABLE "gastos" (
    "id_gasto" SERIAL NOT NULL,
    "fecha_gasto" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monto" DECIMAL(12,2) NOT NULL,
    "categoria" VARCHAR(50) NOT NULL,
    "proveedor" VARCHAR(100),
    "descripcion" VARCHAR(255) NOT NULL,
    "comprobante" VARCHAR(255),
    "metodo_pago" VARCHAR(50) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'Registrado',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gastos_pkey" PRIMARY KEY ("id_gasto")
);

-- CreateTable
CREATE TABLE "facturas" (
    "id_factura" SERIAL NOT NULL,
    "numero_factura" VARCHAR(50) NOT NULL,
    "fecha_emision" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_vencimiento" TIMESTAMP(6) NOT NULL,
    "cliente" VARCHAR(100) NOT NULL,
    "monto_total" DECIMAL(12,2) NOT NULL,
    "monto_pagado" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
    "metodo_pago" VARCHAR(50),
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facturas_pkey" PRIMARY KEY ("id_factura")
);

-- CreateTable
CREATE TABLE "cuentas_por_cobrar" (
    "id_cobro" SERIAL NOT NULL,
    "cliente" VARCHAR(100) NOT NULL,
    "deuda_total" DECIMAL(12,2) NOT NULL,
    "deuda_vencida" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "fecha_vencimiento" TIMESTAMP(6) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cuentas_por_cobrar_pkey" PRIMARY KEY ("id_cobro")
);

-- CreateTable
CREATE TABLE "cuentas_por_pagar" (
    "id_pago" SERIAL NOT NULL,
    "proveedor" VARCHAR(100) NOT NULL,
    "deuda_total" DECIMAL(12,2) NOT NULL,
    "deuda_pendiente" DECIMAL(12,2) NOT NULL,
    "fecha_vencimiento" TIMESTAMP(6) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
    "metodo_pago" VARCHAR(50),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cuentas_por_pagar_pkey" PRIMARY KEY ("id_pago")
);

-- CreateTable
CREATE TABLE "presupuestos" (
    "id_presupuesto" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "monto_total" DECIMAL(12,2) NOT NULL,
    "monto_usado" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "categoria" VARCHAR(50) NOT NULL,
    "fecha_inicio" TIMESTAMP(6) NOT NULL,
    "fecha_fin" TIMESTAMP(6) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'Activo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "presupuestos_pkey" PRIMARY KEY ("id_presupuesto")
);

-- CreateTable
CREATE TABLE "movimientos_caja" (
    "id_movimiento" SERIAL NOT NULL,
    "fecha" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo" VARCHAR(20) NOT NULL,
    "concepto" VARCHAR(100) NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "saldo_anterior" DECIMAL(12,2) NOT NULL,
    "saldo_nuevo" DECIMAL(12,2) NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "movimientos_caja_pkey" PRIMARY KEY ("id_movimiento")
);

-- CreateIndex
CREATE UNIQUE INDEX "facturas_numero_factura_key" ON "facturas"("numero_factura");
