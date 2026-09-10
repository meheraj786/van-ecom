import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ReviewService } from "./review.service";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";
import { PaginationQueryDto } from "../product/dto/pagination-query.dto";

@Controller("review")
export class ReviewController {
  constructor(
    private reviewService: ReviewService,
    private jwt: JwtService,
  ) {}

  private getAuthPayload(req: any) {
    const authorization = req?.headers?.authorization || "";
    const token =
      authorization.replace(/^Bearer\s+/i, "") ||
      req?.cookies?.token ||
      req?.cookies?.jwt;

    if (!token) return null;

    try {
      return this.jwt.verify<{ userId?: string; sub?: string; name?: string }>(
        token,
      );
    } catch {
      return null;
    }
  }

  @Post()
  createReview(@Req() req: any, @Body() dto: CreateReviewDto) {
    const auth = this.getAuthPayload(req);
    const userId =
      auth?.userId ||
      auth?.sub ||
      req.user?.userId ||
      req.user?.id ||
      (req.headers["x-user-id"] as string);
    const userName =
      auth?.name ||
      req.user?.name ||
      (req.headers["x-user-name"] as string) ||
      "Customer";

    if (!userId) {
      throw new UnauthorizedException("Login is required to submit a review");
    }

    return this.reviewService.createReview(userId, userName, dto);
  }

  @Get()
  getAllReviews(@Query() query: PaginationQueryDto) {
    return this.reviewService.getAllReviews(query);
  }

  @Get("product/:productId")
  getReviewsByProduct(
    @Param("productId") productId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.reviewService.getReviewsByProduct(productId, query);
  }

  @Get("user/:userId")
  getReviewsByUser(
    @Param("userId") userId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.reviewService.getReviewsByUser(userId, query);
  }

  @Put(":id")
  updateReview(
    @Req() req: any,
    @Param("id") id: string,
    @Body() dto: UpdateReviewDto,
  ) {
    const userId =
      req.user?.userId || req.user?.id || (req.headers["x-user-id"] as string);
    return this.reviewService.updateReview(id, userId, dto);
  }

  @Delete(":id")
  deleteReview(@Req() req: any, @Param("id") id: string) {
    const userId =
      req.user?.userId || req.user?.id || (req.headers["x-user-id"] as string);
    const userRole =
      req.user?.role || (req.headers["x-user-role"] as string) || "USER";
    return this.reviewService.deleteReview(id, userId, userRole);
  }
}
