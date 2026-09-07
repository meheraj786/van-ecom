import { Module } from "@nestjs/common";
import { OrderService } from "./order.service";
import { OrderController } from "./order.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { InventoryModule } from "../inventory/inventory.module";
import { SSLCommerzService } from "./sslcommerz.service";

@Module({
  imports: [PrismaModule, InventoryModule],
  controllers: [OrderController],
  providers: [OrderService, SSLCommerzService],
  exports: [OrderService, SSLCommerzService],
})
export class OrderModule {}
