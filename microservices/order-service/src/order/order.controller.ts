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
} from '@nestjs/common';
import { OrderService } from './order.service';
import { SSLCommerzService } from './sslcommerz.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';

@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly sslcommerzService: SSLCommerzService,
  ) {}

  @Post()
  createOrder(@Query('userId') userId: string, @Body() dto: CreateOrderDto) {
    return this.orderService.createOrder(userId || undefined, dto);
  }

  @Post('payment/sslcommerz/success')
  async paymentSuccess(@Body() body: any, @Query('tran_id') tran_id: string) {
    const transactionId = tran_id || body?.tran_id;
    const val_id = body?.val_id;

    const isValid = await this.sslcommerzService.validatePayment(val_id);

    if (isValid) {
      await this.orderService.updatePaymentStatus(transactionId, 'PAID', body);
      return { success: true, status: 'PAID', transactionId };
    } else {
      await this.orderService.updatePaymentStatus(
        transactionId,
        'FAILED',
        body,
      );
      throw new BadRequestException('Payment validation failed');
    }
  }

  @Post('payment/sslcommerz/fail')
  async paymentFail(@Body() body: any, @Query('tran_id') tran_id: string) {
    const transactionId = tran_id || body?.tran_id;
    await this.orderService.updatePaymentStatus(transactionId, 'FAILED', body);
    return { success: false, status: 'FAILED', transactionId };
  }

  @Post('payment/sslcommerz/cancel')
  async paymentCancel(@Body() body: any, @Query('tran_id') tran_id: string) {
    const transactionId = tran_id || body?.tran_id;
    await this.orderService.updatePaymentStatus(
      transactionId,
      'CANCELLED',
      body,
    );
    return { success: false, status: 'CANCELLED', transactionId };
  }

  @Post('payment/sslcommerz/ipn')
  async paymentIPN(@Body() body: any) {
    if (body?.status === 'VALID' || body?.status === 'VALIDATED') {
      await this.orderService.updatePaymentStatus(body.tran_id, 'PAID', body);
    }
    return { status: 'OK' };
  }

  @Get()
  getOrders(
    @Query('userId') userId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.orderService.getOrders(userId || undefined, query);
  }

  @Get('single/:id')
  getOrderById(@Param('id') id: string) {
    return this.orderService.getOrderById(id);
  }

  @Put(':id/status')
  updateOrderStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.orderService.updateOrderStatus(id, status);
  }

  @Post('coupon/validate')
  validateCoupon(
    @Query('userId') userId: string,
    @Body() dto: ValidateCouponDto,
  ) {
    return this.orderService.validateCouponForUser(userId, dto.code, dto.items);
  }

  @Post('coupon')
  createCoupon(@Body() dto: CreateCouponDto) {
    return this.orderService.createCoupon(dto);
  }

  @Get('coupon')
  getCoupons(@Query() query: PaginationQueryDto) {
    return this.orderService.getCoupons(query);
  }

  @Get('coupon/:id')
  getCouponById(@Param('id') id: string) {
    return this.orderService.getCouponById(id);
  }

  @Put('coupon/:id')
  updateCoupon(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    return this.orderService.updateCoupon(id, dto);
  }

  @Delete('coupon/:id')
  deleteCoupon(@Param('id') id: string) {
    return this.orderService.deleteCoupon(id);
  }
}
