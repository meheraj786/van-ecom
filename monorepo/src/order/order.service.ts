import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { PaginationQueryDto } from "./dto/pagination-query.dto";
import { CreateCouponDto } from "./dto/create-coupon.dto";
import { UpdateCouponDto } from "./dto/update-coupon.dto";
import { SSLCommerzService } from "./sslcommerz.service";
import { CartItem, OrderItem, SSLCommerzPaymentDetails } from "types";
import { Prisma } from "../generated/prisma/client";
import { InventoryService } from "../inventory/inventory.service";

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private sslcommerzService: SSLCommerzService,
    private inventoryService: InventoryService,
  ) {}

  async createOrder(userId: string | undefined, dto: CreateOrderDto) {
    let validDbUserId: string | null = null;
    const candidateUserId =
      userId &&
      userId !== "GUEST" &&
      userId !== "undefined" &&
      userId !== "null"
        ? userId.trim()
        : null;

    if (candidateUserId) {
      const userInDb = await this.prisma.user.findUnique({
        where: { id: candidateUserId },
        select: { id: true },
      });
      if (userInDb) {
        validDbUserId = userInDb.id;
      }
    }

    let appliedCoupon: any = null;
    let discountAmount = 0;

    if (dto.couponCode) {
      const validationRes = await this.validateCouponForUser(
        validDbUserId || undefined,
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
          userId: validDbUserId,
          customerId: dto.customerId || validDbUserId || "GUEST",
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

        if (validDbUserId) {
          await tx.couponUsage.create({
            data: {
              couponId: appliedCoupon.id,
              userId: validDbUserId,
              orderId: createdOrder.id,
            },
          });
        }
      }

      return createdOrder;
    });

    let gatewayUrl: string | null = null;
    if (dto.paymentMethod === "SSLCOMMERZ") {
      gatewayUrl = await this.sslcommerzService.initPayment({
        total_amount: totalAmount,
        tran_id: transactionId,
        cus_name: dto.billing.fullName,
        cus_email: dto.billing.email,
        cus_phone: dto.billing.phone,
        cus_add1: dto.billing.address,
        cus_city: dto.billing.city,
        cus_postcode: dto.billing.zipCode,
      });
    }

    return {
      order,
      gatewayUrl,
    };
  }

  async updatePaymentStatus(
    transactionId: string,
    paymentStatus: "PAID" | "FAILED" | "CANCELLED",
    paymentDetails?: SSLCommerzPaymentDetails,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { transactionId },
    });

    if (!order) {
      throw new NotFoundException(
        `Order with transaction ${transactionId} not found`,
      );
    }

    return this.prisma.order.update({
      where: { transactionId },
      data: {
        paymentStatus,
        status: paymentStatus === "PAID" ? "PROCESSING" : order.status,
        paymentDetails: paymentDetails ? (paymentDetails as any) : null,
      },
    });
  }

  async getOrderById(searchId: string) {
    const cleanId = searchId
      .trim()
      .replace(/^#ORD-/i, "")
      .replace(/^#LX-/i, "");

    const order = await this.prisma.order.findFirst({
      where: {
        OR: [
          { id: cleanId },
          { id: { endsWith: cleanId.toLowerCase() } },
          { id: { endsWith: cleanId.toUpperCase() } },
          { id: { endsWith: cleanId } },
          { transactionId: cleanId },
        ],
      },
      include: {
        division: true,
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException(
        "Order not found with provided ID or Reference",
      );
    }

    return order;
  }

  async getOrders(userId: string | undefined, query: PaginationQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};
    if (userId) {
      where.customerId = userId;
    }

    const [total, orders] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          items: true,
          division: true,
        },
      }),
    ]);

    return {
      meta: {
        totalOrders: total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      orders,
    };
  }

  async updateOrderStatus(id: string, status: string, reason?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    if (
      ["CANCELLED", "RETURNED"].includes(status) &&
      !["CANCELLED", "RETURNED"].includes(order.status)
    ) {
      await this.inventoryService.restockMultipleStocks(
        order.items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      );
    }

    let paymentStatus = order.paymentStatus;
    if (status === "CANCELLED" && order.paymentStatus === "UNPAID") {
      paymentStatus = "CANCELLED";
    } else if (status === "RETURNED" && order.paymentStatus === "PAID") {
      paymentStatus = "REFUNDED";
    }

    return this.prisma.order.update({
      where: { id },
      data: {
        status,
        paymentStatus,
      },
      include: {
        items: true,
        division: true,
      },
    });
  }

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
      userId !== "null" &&
      userId.trim() !== ""
        ? userId.trim()
        : null;

    if (coupon.perUserLimit && coupon.perUserLimit > 0) {
      if (!normalizedUserId) {
        throw new BadRequestException("Please log in to use this coupon");
      }

      const [usageCount, orderCount] = await Promise.all([
        this.prisma.couponUsage.count({
          where: {
            couponId: coupon.id,
            userId: normalizedUserId,
          },
        }),
        this.prisma.order.count({
          where: {
            couponId: coupon.id,
            userId: normalizedUserId,
            status: { not: "CANCELLED" },
          },
        }),
      ]);

      const totalUserUsage = Math.max(usageCount, orderCount);

      if (totalUserUsage >= coupon.perUserLimit) {
        throw new BadRequestException(
          `You have already used this coupon maximum (${coupon.perUserLimit}) time(s)`,
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

  async createCoupon(dto: CreateCouponDto) {
    const existing = await this.prisma.coupon.findUnique({
      where: { code: dto.code.toUpperCase() },
    });

    if (existing) {
      throw new BadRequestException("Coupon code already exists");
    }

    const createData: Prisma.CouponCreateInput = {
      code: dto.code.toUpperCase(),
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      minOrderValue: dto.minOrderValue,
      maxDiscount: dto.maxDiscount,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : new Date(),
      expiresAt: new Date(dto.expiresAt),
      usageLimit: dto.usageLimit,
      perUserLimit: dto.perUserLimit,
      scope: dto.scope,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    };

    if (dto.productIds && dto.productIds.length > 0) {
      createData.products = {
        create: dto.productIds.map((productId: string) => ({ productId })),
      };
    }

    if (dto.categoryIds && dto.categoryIds.length > 0) {
      createData.categories = {
        create: dto.categoryIds.map((categoryId: string) => ({ categoryId })),
      };
    }

    return this.prisma.coupon.create({
      data: createData,
    });
  }

  async getCoupons(query: PaginationQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [total, coupons] = await Promise.all([
      this.prisma.coupon.count(),
      this.prisma.coupon.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      meta: {
        totalCoupons: total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      coupons,
    };
  }

  async getCouponById(id: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      throw new NotFoundException("Coupon not found");
    }

    return coupon;
  }

  async updateCoupon(id: string, dto: UpdateCouponDto) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      throw new NotFoundException("Coupon not found");
    }

    const updateData: Prisma.CouponUpdateInput = {
      ...(dto.code ? { code: dto.code.toUpperCase() } : {}),
      ...(dto.discountType ? { discountType: dto.discountType } : {}),
      ...(dto.discountValue !== undefined
        ? { discountValue: dto.discountValue }
        : {}),
      ...(dto.minOrderValue !== undefined
        ? { minOrderValue: dto.minOrderValue }
        : {}),
      ...(dto.maxDiscount !== undefined
        ? { maxDiscount: dto.maxDiscount }
        : {}),
      ...(dto.startsAt ? { startsAt: new Date(dto.startsAt) } : {}),
      ...(dto.expiresAt ? { expiresAt: new Date(dto.expiresAt) } : {}),
      ...(dto.usageLimit !== undefined ? { usageLimit: dto.usageLimit } : {}),
      ...(dto.perUserLimit !== undefined
        ? { perUserLimit: dto.perUserLimit }
        : {}),
      ...(dto.scope ? { scope: dto.scope } : {}),
      ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
    };

    if (dto.productIds !== undefined) {
      updateData.products = {
        deleteMany: {},
        create: dto.productIds.map((productId: string) => ({ productId })),
      };
    }

    if (dto.categoryIds !== undefined) {
      updateData.categories = {
        deleteMany: {},
        create: dto.categoryIds.map((categoryId: string) => ({ categoryId })),
      };
    }

    return this.prisma.coupon.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteCoupon(id: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      throw new NotFoundException("Coupon not found");
    }

    await this.prisma.coupon.delete({
      where: { id },
    });

    return { message: "Coupon deleted successfully" };
  }
}
