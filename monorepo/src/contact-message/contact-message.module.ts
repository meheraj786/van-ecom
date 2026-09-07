import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { ContactMessageService } from "./contact-message.service";
import { ContactMessageController } from "./contact-message.controller";

@Module({
  imports: [PrismaModule],
  controllers: [ContactMessageController],
  providers: [ContactMessageService],
  exports: [ContactMessageService],
})
export class ContactMessageModule {}
