-- CreateEnum
CREATE TYPE "EstadoMesa" AS ENUM ('LIBRE', 'OCUPADA', 'RESERVADA');

-- CreateEnum
CREATE TYPE "EstadoPedido" AS ENUM ('EN_PREPARACION', 'EN_PROCESO', 'LISTO_PARA_RECOGER', 'SERVIDO', 'PAGADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'MESERO', 'COCINERO', 'CAJERO');

-- CreateEnum
CREATE TYPE "TipoFinanza" AS ENUM ('INGRESO', 'EGRESO');

-- CreateTable
CREATE TABLE "detalle_pedidos" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "detalle_pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finanzas" (
    "id_finanza" SERIAL NOT NULL,
    "fecha_finanza" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "tipo_finanza" VARCHAR(20) NOT NULL,
    "descripcion_finanza" TEXT,
    "monto" DECIMAL(10,2) NOT NULL,
    "metodo_pago" VARCHAR(20) NOT NULL,

    CONSTRAINT "finanzas_pkey" PRIMARY KEY ("id_finanza")
);

-- CreateTable
CREATE TABLE "insumos" (
    "id_insumo" SERIAL NOT NULL,
    "nombre_insu" VARCHAR(100) NOT NULL,
    "unidadmedida_insu" VARCHAR(20) NOT NULL,
    "stock_act_insu" DECIMAL(10,2) DEFAULT 0,
    "stock_min_insu" DECIMAL(10,2) DEFAULT 0,
    "vencimiento_insu" DATE NOT NULL,

    CONSTRAINT "insumos_pkey" PRIMARY KEY ("id_insumo")
);

-- CreateTable
CREATE TABLE "mesas" (
    "id_mesa" SERIAL NOT NULL,
    "numero_mesa" INTEGER NOT NULL,
    "capacidad_mesa" INTEGER NOT NULL,
    "estado_mesa" VARCHAR(20) DEFAULT 'Libre',

    CONSTRAINT "mesas_pkey" PRIMARY KEY ("id_mesa")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id_pedido" SERIAL NOT NULL,
    "fecha_pedido" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "id_user" INTEGER NOT NULL,
    "id_mesa" INTEGER NOT NULL,
    "estado_pedido" VARCHAR(20) DEFAULT 'En preparacion',

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id_pedido")
);

-- CreateTable
CREATE TABLE "productos" (
    "id_produc" SERIAL NOT NULL,
    "nombre_produc" VARCHAR(100) NOT NULL,
    "descripcion_produc" TEXT,
    "precio_produc" DECIMAL(10,2) NOT NULL,
    "categoria_produc" VARCHAR(20) NOT NULL,
    "estado_produc" VARCHAR(20) DEFAULT 'Activo',
    "vencimiento_produc" DATE NOT NULL,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id_produc")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id_user" SERIAL NOT NULL,
    "nombre_user" VARCHAR(100) NOT NULL,
    "apellido_user" VARCHAR(100) NOT NULL,
    "dni_user" VARCHAR(20),
    "telefono_user" VARCHAR(20),
    "correo_user" VARCHAR(100),
    "rol" VARCHAR(20) NOT NULL,
    "contrasena" VARCHAR(255) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "detallepedido" (
    "id_detalle" SERIAL NOT NULL,
    "id_pedido" INTEGER NOT NULL,
    "id_produc" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "detallepedido_pkey" PRIMARY KEY ("id_detalle")
);

-- CreateTable
CREATE TABLE "pedidos_delivery" (
    "id_delivery" SERIAL NOT NULL,
    "id_pedido" INTEGER NOT NULL,
    "numero_telefono" VARCHAR(20) NOT NULL,
    "nombre_cliente" VARCHAR(100) NOT NULL,
    "direccion" TEXT NOT NULL,
    "notas" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pedidos_delivery_pkey" PRIMARY KEY ("id_delivery")
);

-- CreateIndex
CREATE UNIQUE INDEX "mesas_numero_mesa_key" ON "mesas"("numero_mesa");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_dni_user_key" ON "usuarios"("dni_user");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_user_key" ON "usuarios"("correo_user");

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_delivery_id_pedido_key" ON "pedidos_delivery"("id_pedido");

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_id_mesa_fkey" FOREIGN KEY ("id_mesa") REFERENCES "mesas"("id_mesa") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "usuarios"("id_user") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detallepedido" ADD CONSTRAINT "detallepedido_id_pedido_fkey" FOREIGN KEY ("id_pedido") REFERENCES "pedidos"("id_pedido") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detallepedido" ADD CONSTRAINT "detallepedido_id_produc_fkey" FOREIGN KEY ("id_produc") REFERENCES "productos"("id_produc") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pedidos_delivery" ADD CONSTRAINT "pedidos_delivery_id_pedido_fkey" FOREIGN KEY ("id_pedido") REFERENCES "pedidos"("id_pedido") ON DELETE CASCADE ON UPDATE NO ACTION;
