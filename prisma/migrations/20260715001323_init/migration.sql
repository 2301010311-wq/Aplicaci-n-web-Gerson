/*
  Warnings:

  - You are about to alter the column `cantidad` on the `detallepedido` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - Added the required column `updatedAt` to the `detallepedido` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `pedidos` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "detallepedido" DROP CONSTRAINT "detallepedido_id_produc_fkey";

-- AlterTable
ALTER TABLE "detallepedido" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "estado" VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
ADD COLUMN     "notas" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "cantidad" SET DATA TYPE SMALLINT;

-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN     "cancelReason" TEXT,
ADD COLUMN     "canceledAt" TIMESTAMP(3),
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "total" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "detallepedido_id_pedido_idx" ON "detallepedido"("id_pedido");

-- CreateIndex
CREATE INDEX "detallepedido_id_produc_idx" ON "detallepedido"("id_produc");

-- CreateIndex
CREATE INDEX "detallepedido_estado_idx" ON "detallepedido"("estado");

-- CreateIndex
CREATE INDEX "pedidos_fecha_pedido_idx" ON "pedidos"("fecha_pedido");

-- CreateIndex
CREATE INDEX "pedidos_estado_pedido_idx" ON "pedidos"("estado_pedido");

-- CreateIndex
CREATE INDEX "pedidos_id_user_idx" ON "pedidos"("id_user");

-- CreateIndex
CREATE INDEX "pedidos_id_mesa_idx" ON "pedidos"("id_mesa");

-- AddForeignKey
ALTER TABLE "detallepedido" ADD CONSTRAINT "detallepedido_id_produc_fkey" FOREIGN KEY ("id_produc") REFERENCES "productos"("id_produc") ON DELETE SET NULL ON UPDATE NO ACTION;
