import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  BadRequestException,
  Req,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Response } from "express";
import { OrderService } from "./order.service";
import { SSLCommerzService } from "./sslcommerz.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { CreateCouponDto } from "./dto/create-coupon.dto";
import { UpdateCouponDto } from "./dto/update-coupon.dto";
import { ValidateCouponDto } from "./dto/validate-coupon.dto";
import { PaginationQueryDto } from "./dto/pagination-query.dto";
import type { SSLCommerzPaymentDetails } from "types";

@Controller("order")
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly sslcommerzService: SSLCommerzService,
    private readonly jwt: JwtService,
  ) {}

  private getAuthPayload(req: any) {
    const authorization = req?.headers?.authorization || "";
    const token =
      authorization.replace(/^Bearer\s+/i, "") ||
      req?.cookies?.token ||
      req?.cookies?.jwt;

    if (!token) return null;

    try {
      return this.jwt.verify<{ userId?: string; sub?: string; role?: string }>(
        token,
      );
    } catch {
      return null;
    }
  }

  @Post()
  createOrder(
    @Req() req: any,
    @Query("userId") userId: string,
    @Body() dto: CreateOrderDto,
  ) {
    const auth = this.getAuthPayload(req);
    const authenticatedUserId = auth?.userId || auth?.sub;
    return this.orderService.createOrder(
      authenticatedUserId || userId || undefined,
      dto,
    );
  }

  @Post("payment/sslcommerz/success")
  async paymentSuccess(
    @Body() body: SSLCommerzPaymentDetails,
    @Query("tran_id") tran_id: string,
    @Res() res: Response,
  ) {
    const transactionId = tran_id || body?.tran_id;
    const val_id = body?.val_id;
    const frontendUrl = (
      process.env.FRONTEND_URL ||
      process.env.FRONTEND_BASE_URL ||
      "http://localhost:3000"
    ).replace(/\/$/, "");

    const isValid = await this.sslcommerzService.validatePayment(val_id || "");

    if (isValid) {
      await this.orderService.updatePaymentStatus(transactionId, "PAID", body);
      return res.redirect(
        `${frontendUrl}/checkout/success?tran_id=${encodeURIComponent(transactionId)}`,
      );
    } else {
      await this.orderService.updatePaymentStatus(
        transactionId,
        "FAILED",
        body,
      );
      return res.redirect(
        `${frontendUrl}/checkout/failed?tran_id=${encodeURIComponent(transactionId)}&error=validation_failed`,
      );
    }
  }

  @Post("payment/sslcommerz/fail")
  async paymentFail(
    @Body() body: SSLCommerzPaymentDetails,
    @Query("tran_id") tran_id: string,
    @Res() res: Response,
  ) {
    const transactionId = tran_id || body?.tran_id;
    await this.orderService.updatePaymentStatus(transactionId, "FAILED", body);
    const frontendUrl = (
      process.env.FRONTEND_URL ||
      process.env.FRONTEND_BASE_URL ||
      "http://localhost:3000"
    ).replace(/\/$/, "");
    return res.redirect(
      `${frontendUrl}/checkout/failed?tran_id=${encodeURIComponent(transactionId)}`,
    );
  }

  @Post("payment/sslcommerz/cancel")
  async paymentCancel(
    @Body() body: SSLCommerzPaymentDetails,
    @Query("tran_id") tran_id: string,
    @Res() res: Response,
  ) {
    const transactionId = tran_id || body?.tran_id;
    await this.orderService.updatePaymentStatus(
      transactionId,
      "CANCELLED",
      body,
    );
    const frontendUrl = (
      process.env.FRONTEND_URL ||
      process.env.FRONTEND_BASE_URL ||
      "http://localhost:3000"
    ).replace(/\/$/, "");
    return res.redirect(
      `${frontendUrl}/checkout/cancel?tran_id=${encodeURIComponent(transactionId)}`,
    );
  }

  @Post("payment/sslcommerz/ipn")
  async paymentIPN(@Body() body: SSLCommerzPaymentDetails) {
    if (body?.status === "VALID" || body?.status === "VALIDATED") {
      await this.orderService.updatePaymentStatus(body.tran_id, "PAID", body);
    }
    return { status: "OK" };
  }

  @Get()
  getOrders(
    @Req() req: any,
    @Query("userId") userId: string,
    @Query() query: PaginationQueryDto,
  ) {
    const auth = this.getAuthPayload(req);
    const isAdmin = auth?.role === "ADMIN" || auth?.role === "STAFF";
    const authenticatedUserId = auth?.userId || auth?.sub;
    if (!isAdmin && !authenticatedUserId) {
      throw new UnauthorizedException("Login is required to view orders");
    }

    const effectiveUserId = isAdmin ? undefined : authenticatedUserId;

    return this.orderService.getOrders(effectiveUserId, query);
  }

  @Get("single/:id")
  getOrderById(@Param("id") id: string) {
    return this.orderService.getOrderById(id);
  }

  @Put(":id/status")
  updateOrderStatus(@Param("id") id: string, @Body("status") status: string) {
    return this.orderService.updateOrderStatus(id, status);
  }

  @Post("coupon/validate")
  validateCoupon(
    @Req() req: any,
    @Query("userId") userId: string,
    @Body() dto: ValidateCouponDto,
  ) {
    const auth = this.getAuthPayload(req);
    const authenticatedUserId = auth?.userId || auth?.sub;
    const effectiveUserId = authenticatedUserId || userId;

    return this.orderService.validateCouponForUser(
      effectiveUserId,
      dto.code,
      dto.items as any,
    );
  }

  @Post("coupon")
  createCoupon(@Body() dto: CreateCouponDto) {
    return this.orderService.createCoupon(dto);
  }

  @Get("coupon")
  getCoupons(@Query() query: PaginationQueryDto) {
    return this.orderService.getCoupons(query);
  }

  @Get("coupon/:id")
  getCouponById(@Param("id") id: string) {
    return this.orderService.getCouponById(id);
  }

  @Put("coupon/:id")
  updateCoupon(@Param("id") id: string, @Body() dto: UpdateCouponDto) {
    return this.orderService.updateCoupon(id, dto);
  }

  @Delete("coupon/:id")
  deleteCoupon(@Param("id") id: string) {
    return this.orderService.deleteCoupon(id);
  }
}