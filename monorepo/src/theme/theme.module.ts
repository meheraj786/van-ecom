import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { ThemeService } from "./theme.service";
import { ThemeController } from "./theme.controller";

@Module({
  imports: [PrismaModule],
  controllers: [ThemeController],
  providers: [ThemeService],
  exports: [ThemeService],
})
export class ThemeModule {}
