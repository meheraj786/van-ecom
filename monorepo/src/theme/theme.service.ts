import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateThemeDto } from "./dto/theme.dto";

const defaultTheme = {
  navbar: { layout: 1, menus: [] },
  product: { cardLayout: 1, detailLayout: 1 },
  socialLinks: {},
  chat: { isWhatsappEnabled: true, isMessengerEnabled: true },
  seo: { keywords: ["ecommerce", "store"] },
  banner: { layout: 1, bgImg: [], productId: [], categoryId: "" },
  footer: { layout: 1 },
};

@Injectable()
export class ThemeService {
  constructor(private readonly prisma: PrismaService) {}

  async getTheme() {
    const theme = await this.prisma.theme.findUnique({
      where: { themeKey: "default" },
    });
    if (theme)
      return {
        id: theme.id,
        themeKey: theme.themeKey,
        ...(theme.config as object),
        createdAt: theme.createdAt,
        updatedAt: theme.updatedAt,
      };
    const created = await this.prisma.theme.create({
      data: { themeKey: "default", config: defaultTheme },
    });
    return {
      id: created.id,
      themeKey: created.themeKey,
      ...defaultTheme,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }

  async updateTheme(dto: UpdateThemeDto) {
    const current = await this.prisma.theme.findUnique({
      where: { themeKey: "default" },
    });
    const config = {
      ...((current?.config as object) || defaultTheme),
      ...(dto as object),
    };
    const theme = await this.prisma.theme.upsert({
      where: { themeKey: "default" },
      create: { themeKey: "default", config },
      update: { config },
    });
    return {
      id: theme.id,
      themeKey: theme.themeKey,
      ...(theme.config as object),
      createdAt: theme.createdAt,
      updatedAt: theme.updatedAt,
    };
  }

  async resetTheme() {
    const theme = await this.prisma.theme.upsert({
      where: { themeKey: "default" },
      create: { themeKey: "default", config: defaultTheme },
      update: { config: defaultTheme },
    });
    return {
      id: theme.id,
      themeKey: theme.themeKey,
      ...defaultTheme,
      createdAt: theme.createdAt,
      updatedAt: theme.updatedAt,
    };
  }
}
