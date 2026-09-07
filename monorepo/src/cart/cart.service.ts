import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AddToCartDto, UpdateCartQuantityDto } from "./dto/add-to-cart.dto";

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  private requireUser(userId: string) {
    if (!userId || userId === "GUEST")
      throw new BadRequestException(
        "A registered user is required to persist a cart",
      );
  }

  private async getOrCreateCart(userId: string) {
    this.requireUser(userId);
    return this.prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
      include: { items: true },
    });
  }

  async getCart(userId: string) {
    if (!userId || userId === "GUEST") return [];
    const cart = await this.getOrCreateCart(userId);
    return cart.items;
  }

  async addToCart(userId: string, dto: AddToCartDto) {
    const cart = await this.getOrCreateCart(userId);
    await this.prisma.cartItem.upsert({
      where: {
        cartId_variantId: { cartId: cart.id, variantId: dto.variantId },
      },
      create: {
        cartId: cart.id,
        productId: dto.productId,
        variantId: dto.variantId,
        quantity: dto.quantity,
        price: dto.price || 0,
        name: dto.name || "Product",
        image: dto.image || "",
        sku: dto.sku || "",
        options: dto.options || {},
      },
      update: {
        quantity: { increment: dto.quantity },
        ...(dto.price !== undefined ? { price: dto.price } : {}),
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.image ? { image: dto.image } : {}),
        ...(dto.sku ? { sku: dto.sku } : {}),
        ...(dto.options ? { options: dto.options } : {}),
      },
    });
    return this.prisma.cartItem.findMany({ where: { cartId: cart.id } });
  }

  async updateQuantity(userId: string, dto: UpdateCartQuantityDto) {
    const cart = await this.getOrCreateCart(userId);
    if (dto.quantity <= 0)
      await this.prisma.cartItem.deleteMany({
        where: { cartId: cart.id, variantId: dto.variantId },
      });
    else
      await this.prisma.cartItem.updateMany({
        where: { cartId: cart.id, variantId: dto.variantId },
        data: { quantity: dto.quantity },
      });
    return this.prisma.cartItem.findMany({ where: { cartId: cart.id } });
  }

  async removeFromCart(userId: string, variantId: string) {
    if (!userId || userId === "GUEST") return [];
    const cart = await this.getOrCreateCart(userId);
    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id, variantId },
    });
    return this.prisma.cartItem.findMany({ where: { cartId: cart.id } });
  }

  async clearCart(userId: string) {
    if (!userId || userId === "GUEST") return { message: "Cart cleared" };
    const cart = await this.getOrCreateCart(userId);
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return { message: "Cart cleared successfully" };
  }
}
