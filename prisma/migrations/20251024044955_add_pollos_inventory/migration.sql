-- CreateTable
CREATE TABLE "inventario_pollos" (
    "id_inventario" SERIAL NOT NULL,
    "fecha" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pollos_totales" INTEGER NOT NULL DEFAULT 0,
    "pechos_disponibles" INTEGER NOT NULL DEFAULT 0,
    "piernas_disponibles" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventario_pollos_pkey" PRIMARY KEY ("id_inventario")
);

-- CreateTable
CREATE TABLE "detalle_pollos_pedido" (
    "id_detalle" SERIAL NOT NULL,
    "id_pedido" INTEGER NOT NULL,
    "tipo_presa" VARCHAR(20) NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "detalle_pollos_pedido_pkey" PRIMARY KEY ("id_detalle")
);

-- CreateIndex
CREATE UNIQUE INDEX "inventario_pollos_fecha_key" ON "inventario_pollos"("fecha");
