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
    const {
      divisionId,
      couponCode,
      billing,
      items = [],
      paymentMethod = "COD",
    } = dto;

    const division = await this.prisma.division.findUnique({
      where: { id: divisionId },
    });

    if (!division) {
      throw new BadRequestException("Invalid division selected");
    }

    let subtotal = 0;
    const orderItemsData: any[] = [];

    for (const item of items) {
      const price = Number(item.price || 0);
      const qty = Number(item.quantity || 1);
      subtotal += price * qty;

      orderItemsData.push({
        productId: item.productId,
        variantId: item.variantId,
        quantity: qty,
        price: price,
        variantSnapshot: {
          productName: item.name || item.productName || "Product Item",
          productSlug: item.slug || item.productSlug || "",
          image: item.image || "",
          sku: item.sku || "",
          options: item.options || {},
        },
      });
    }

    let discountAmount = 0;
    if (couponCode) {
      const cleanCouponCode = couponCode.toUpperCase();
      const coupon = await this.prisma.coupon.findUnique({
        where: { code: cleanCouponCode },
      });

      if (coupon && coupon.isActive) {
        if (coupon.discountType === "PERCENTAGE") {
          discountAmount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
          }
        } else {
          discountAmount = coupon.discountValue;
        }
      }
    }

    const deliveryCharge = division.deliveryCharge;
    const totalAmount = Math.max(0, subtotal - discountAmount + deliveryCharge);
    const transactionId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const customerPhone = billing.phone.trim();
    const linkedUser = userId
      ? await this.prisma.user.findUnique({
          where: { id: userId },
          select: { id: true },
        })
      : null;

    await this.prisma.customer.upsert({
      where: { phone: customerPhone },
      create: {
        phone: customerPhone,
        name: billing.fullName,
        email: billing.email,
        address: billing.address,
        isRegistered: Boolean(linkedUser),
        ...(linkedUser ? { userId: linkedUser.id } : {}),
      },
      update: {
        name: billing.fullName,
        email: billing.email,
        address: billing.address,
      },
    });

    const order = await this.prisma.order.create({
      data: {
        customerId: userId || "GUEST",
        divisionId,
        couponCode: couponCode ? couponCode.toUpperCase() : null,
        discountAmount,
        totalAmount,
        status: "PENDING",
        paymentMethod,
        paymentStatus: paymentMethod === "COD" ? "UNPAID" : "PENDING",
        transactionId,
        customerName: billing.fullName,
        customerEmail: billing.email,
        customerPhone,
        shippingAddress: billing.address,
        city: billing.city,
        zipCode: billing.zipCode || null,
        items: {
          create: orderItemsData as any,
        },
      },
      include: {
        items: true,
        division: true,
      },
    });

    await this.inventoryService.deductMultipleFifoStocks(
      items.map((item) => ({
        variantId: item.variantId,
        quantity: Number(item.quantity || 1),
      })),
    );

    let gatewayUrl: string | null = null;
    if (paymentMethod === "SSLCOMMERZ") {
      gatewayUrl = await this.sslcommerzService.initPayment({
        total_amount: Number(totalAmount),
        tran_id: transactionId,
        cus_name: billing.fullName,
        cus_email: billing.email,
        cus_phone: billing.phone,
        cus_add1: billing.address,
        cus_city: billing.city,
        cus_postcode: billing.zipCode || "1000",
        cus_country: billing.country || "Bangladesh",
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
  items: Array<{ productId: string; variantId: string; quantity: number; price?: number }>,
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
    userId && userId !== "GUEST" && userId !== "undefined" && userId !== "null"
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
