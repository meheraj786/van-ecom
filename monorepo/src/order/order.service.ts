import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateOrderDto } from "./dto/create-order.dto";
import { CreateCouponDto } from "./dto/create-coupon.dto";
import { UpdateCouponDto } from "./dto/update-coupon.dto";
import { PaginationQueryDto } from "./dto/pagination-query.dto";
import { SSLCommerzService } from "./sslcommerz.service";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sslcommerzService: SSLCommerzService,
  ) {}

  async validateCouponForUser(
    userId: string | undefined,
    code: string,
    items: Array<{
      productId: string;
      variantId: string;
      quantity: number;
      price?: number;
    }>,
  ) {
    const cleanCode = (code || "").trim().toUpperCase();
    if (!cleanCode) {
      throw new BadRequestException("Coupon code is required");
    }

    const coupon = await this.prisma.coupon.findUnique({
      where: { code: cleanCode },
      include: {
        products: true,
        categories: true,
      },
    });

    if (!coupon || !coupon.isActive) {
      throw new BadRequestException("Coupon is invalid or inactive");
    }

    const now = new Date();
    if (coupon.startsAt && now < new Date(coupon.startsAt)) {
      throw new BadRequestException("Coupon is not active yet");
    }

    if (coupon.expiresAt && now > new Date(coupon.expiresAt)) {
      throw new BadRequestException("Coupon has expired");
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException("Coupon usage limit has been reached");
    }

    const normalizedUserId =
      userId &&
      userId !== "GUEST" &&
      userId !== "undefined" &&
      userId !== "null"
        ? userId
        : null;

    if (coupon.perUserLimit && coupon.perUserLimit > 0) {
      if (!normalizedUserId) {
        throw new BadRequestException("Please log in to use this coupon");
      }

      const userUsageCount = await this.prisma.couponUsage.count({
        where: {
          couponId: coupon.id,
          userId: normalizedUserId,
        },
      });

      if (userUsageCount >= coupon.perUserLimit) {
        throw new BadRequestException(
          `You have reached the maximum usage limit (${coupon.perUserLimit}) for this coupon`,
        );
      }
    }

    const cartItems = items || [];
    let subtotal = 0;
    let eligibleSubtotal = 0;

    for (const item of cartItems) {
      const itemPrice = Number(item.price || 0);
      const qty = Number(item.quantity || 1);
      const lineTotal = itemPrice * qty;
      subtotal += lineTotal;

      if (coupon.scope === "ALL") {
        eligibleSubtotal += lineTotal;
      } else if (coupon.scope === "PRODUCTS") {
        const isEligibleProduct = coupon.products.some(
          (p) => p.productId === item.productId,
        );
        if (isEligibleProduct) {
          eligibleSubtotal += lineTotal;
        }
      } else if (coupon.scope === "CATEGORIES") {
        const productCategories = await this.prisma.productCategory.findMany({
          where: { productId: item.productId },
          select: { categoryId: true },
        });
        const productCategoryIds = productCategories.map((pc) => pc.categoryId);
        const isEligibleCategory = coupon.categories.some((c) =>
          productCategoryIds.includes(c.categoryId),
        );
        if (isEligibleCategory) {
          eligibleSubtotal += lineTotal;
        }
      }
    }

    if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
      throw new BadRequestException(
        `Minimum order value of ৳${coupon.minOrderValue} is required to apply this coupon`,
      );
    }

    if (eligibleSubtotal <= 0) {
      throw new BadRequestException(
        "None of the items in your cart are eligible for this coupon",
      );
    }

    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = (eligibleSubtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = Math.min(coupon.discountValue, eligibleSubtotal);
    }

    discountAmount = Math.min(discountAmount, subtotal);

    return {
      statusCode: 200,
      success: true,
      message: "Coupon applied successfully",
      data: {
        code: coupon.code,
        subtotal,
        eligibleSubtotal,
        discountAmount,
        totalAmount: Math.max(0, subtotal - discountAmount),
        discountType: coupon.discountType as "PERCENTAGE" | "FIXED",
        discountValue: coupon.discountValue,
        isValid: true,
      },
    };
  }

  async createOrder(userId: string | undefined, dto: CreateOrderDto) {
    const normalizedUserId =
      userId &&
      userId !== "GUEST" &&
      userId !== "undefined" &&
      userId !== "null"
        ? userId
        : null;

    let appliedCoupon: any = null;
    let discountAmount = 0;

    if (dto.couponCode) {
      const validationRes = await this.validateCouponForUser(
        normalizedUserId || undefined,
        dto.couponCode,
        dto.items as any,
      );
      discountAmount = validationRes.data.discountAmount;
      appliedCoupon = await this.prisma.coupon.findUnique({
        where: { code: dto.couponCode.trim().toUpperCase() },
      });
    }

    const division = await this.prisma.division.findUnique({
      where: { id: dto.divisionId },
    });

    if (!division) {
      throw new BadRequestException("Invalid delivery division selected");
    }

    const deliveryCharge = Number(division.deliveryCharge || 0);
    const subtotal = (dto.items || []).reduce((sum, item) => {
      return sum + Number(item.price || 0) * Number(item.quantity || 1);
    }, 0);

    const totalAmount = Math.max(0, subtotal - discountAmount + deliveryCharge);
    const transactionId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const order = await this.prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          userId: normalizedUserId,
          customerId: dto.customerId || normalizedUserId || "GUEST",
          customerName: dto.billing.fullName,
          customerEmail: dto.billing.email,
          customerPhone: dto.billing.phone,
          shippingAddress: dto.billing.address,
          city: dto.billing.city,
          zipCode: dto.billing.zipCode,
          totalAmount: totalAmount,
          discountAmount: discountAmount,
          couponCode: appliedCoupon ? appliedCoupon.code : null,
          couponId: appliedCoupon ? appliedCoupon.id : null,
          divisionId: dto.divisionId,
          paymentMethod: dto.paymentMethod || "COD",
          paymentStatus: "UNPAID",
          transactionId: transactionId,
          items: {
            create: dto.items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.price,
              variantSnapshot: {
                name: item.name,
                image: item.image,
                sku: item.sku,
                options: item.options,
              },
            })),
          },
        },
        include: {
          items: true,
        },
      });

      if (appliedCoupon) {
        await tx.coupon.update({
          where: { id: appliedCoupon.id },
          data: { usedCount: { increment: 1 } },
        });

        if (normalizedUserId) {
          await tx.couponUsage.create({
            data: {
              couponId: appliedCoupon.id,
              userId: normalizedUserId,
              orderId: createdOrder.id,
            },
          });
        }
      }

      for (const item of dto.items) {
        let remainingToDeduct = item.quantity;
        const stockBatches = await tx.stockBatch.findMany({
          where: {
            variantId: item.variantId,
            quantityRemaining: { gt: 0 },
          },
          orderBy: { createdAt: "asc" },
        });

        for (const batch of stockBatches) {
          if (remainingToDeduct <= 0) break;
          const deductAmount = Math.min(
            batch.quantityRemaining,
            remainingToDeduct,
          );
          await tx.stockBatch.update({
            where: { id: batch.id },
            data: {
              quantityRemaining: { decrement: deductAmount },
            },
          });
          remainingToDeduct -= deductAmount;
        }
      }

      return createdOrder;
    });

    let gatewayUrl: string | null = null;
    if (dto.paymentMethod === "SSLCOMMERZ") {
      gatewayUrl = await this.sslcommerzService.initiatePayment({
        totalAmount,
        transactionId,
        customerName: dto.billing.fullName,
        customerEmail: dto.billing.email,
        customerPhone: dto.billing.phone,
        customerAddress: dto.billing.address,
        customerCity: dto.billing.city,
        customerPostCode: dto.billing.zipCode,
      });
    }

    return {
      order,
      gatewayUrl,
    };
  }

  async updatePaymentStatus(
    transactionId: string,
    status: string,
    paymentDetails?: any,
  ) {
    return this.prisma.order.update({
      where: { transactionId },
      data: {
        paymentStatus: status,
        paymentDetails: paymentDetails || undefined,
        status: status === "PAID" ? "PROCESSING" : undefined,
      },
    });
  }

  async getOrders(userId?: string, query?: PaginationQueryDto) {
    const page = Number(query?.page || 1);
    const limit = Number(query?.limit || 10);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (userId) {
      where.userId = userId;
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          items: true,
          division: true,
          coupon: true,
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getOrderById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        division: true,
        coupon: true,
      },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    return order;
  }

  async updateOrderStatus(id: string, status: string) {
    return this.prisma.order.update({
      where: { id },
      data: { status },
    });
  }

  async createCoupon(dto: CreateCouponDto) {
    const existing = await this.prisma.coupon.findUnique({
      where: { code: dto.code.trim().toUpperCase() },
    });

    if (existing) {
      throw new BadRequestException("Coupon code already exists");
    }

    return this.prisma.coupon.create({
      data: {
        code: dto.code.trim().toUpperCase(),
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        minOrderValue: dto.minOrderValue ?? 0,
        maxDiscount: dto.maxDiscount,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
        expiresAt: new Date(dto.expiresAt),
        usageLimit: dto.usageLimit,
        perUserLimit: dto.perUserLimit,
        scope: dto.scope ?? "ALL",
        isActive: dto.isActive ?? true,
        products: dto.productIds?.length
          ? {
              create: dto.productIds.map((productId) => ({
                product: { connect: { id: productId } },
              })),
            }
          : undefined,
        categories: dto.categoryIds?.length
          ? {
              create: dto.categoryIds.map((categoryId) => ({
                category: { connect: { id: categoryId } },
              })),
            }
          : undefined,
      },
    });
  }

  async getCoupons(query?: PaginationQueryDto) {
    const page = Number(query?.page || 1);
    const limit = Number(query?.limit || 10);
    const skip = (page - 1) * limit;

    const [coupons, total] = await Promise.all([
      this.prisma.coupon.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          products: { include: { product: true } },
          categories: { include: { category: true } },
        },
      }),
      this.prisma.coupon.count(),
    ]);

    return {
      coupons,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getCouponById(id: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
      include: {
        products: { include: { product: true } },
        categories: { include: { category: true } },
      },
    });

    if (!coupon) {
      throw new NotFoundException("Coupon not found");
    }

    return coupon;
  }

  async updateCoupon(id: string, dto: UpdateCouponDto) {
    await this.getCouponById(id);

    return this.prisma.coupon.update({
      where: { id },
      data: {
        code: dto.code ? dto.code.trim().toUpperCase() : undefined,
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        minOrderValue: dto.minOrderValue,
        maxDiscount: dto.maxDiscount,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        usageLimit: dto.usageLimit,
        perUserLimit: dto.perUserLimit,
        scope: dto.scope,
        isActive: dto.isActive,
      },
    });
  }

  async deleteCoupon(id: string) {
    await this.getCouponById(id);
    return this.prisma.coupon.delete({
      where: { id },
    });
  }
}
