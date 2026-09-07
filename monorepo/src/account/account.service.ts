import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateAccountDto } from "./dto/update-account.dto";

@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(vendorId: string) {
    const settings = await this.prisma.account.findUnique({
      where: { vendorId },
    });
    return (
      settings || {
        themeColor: "#6366F1",
        bannerLayout: "HERO_SPLIT",
        bannerImages: [],
        featuredCategoryIds: [],
      }
    );
  }

  async updateSettings(vendorId: string, dto: UpdateAccountDto) {
    const settings = await this.prisma.account.upsert({
      where: { vendorId },
      create: { vendorId, ...dto },
      update: dto,
    });
    return { message: "Store settings updated successfully", settings };
  }
}
