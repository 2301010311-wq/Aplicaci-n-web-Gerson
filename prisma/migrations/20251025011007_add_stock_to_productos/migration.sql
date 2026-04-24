-- AlterTable
ALTER TABLE "detallepedido" ADD COLUMN     "nombre_produc_personalizado" VARCHAR(255),
ALTER COLUMN "id_produc" DROP NOT NULL;

-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN     "observaciones" TEXT;

-- AlterTable
ALTER TABLE "productos" ADD COLUMN     "stock_produc" INTEGER NOT NULL DEFAULT 0;
