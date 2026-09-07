import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { AccountModule } from "./account/account.module";
import { CustomerModule } from "./customer/customer.module";
import { ChatModule } from "./chat/chat.module";
import { ThemeModule } from "./theme/theme.module";
import { ContactMessageModule } from "./contact-message/contact-message.module";
import { ProductModule } from "./product/product.module";
import { ReviewModule } from "./review/review.module";
import { CartModule } from "./cart/cart.module";
import { InventoryModule } from "./inventory/inventory.module";
import { OrderModule } from "./order/order.module";
import { DivisionModule } from "./division/division.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ".env" }),
    PrismaModule,
    AuthModule,
    AccountModule,
    CustomerModule,
    ProductModule,
    ReviewModule,
    CartModule,
    InventoryModule,
    OrderModule,
    DivisionModule,
    ThemeModule,
    ChatModule,
    ContactMessageModule,
  ],
})
export class AppModule {}
