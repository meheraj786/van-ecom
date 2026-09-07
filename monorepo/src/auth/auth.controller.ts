import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterUserDto } from "./dto/register-user.dto";
import { RegisterVendorDto } from "./dto/register-vendor.dto";
import { LoginDto } from "./dto/login.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("auth/register")
  registerUser(@Body() dto: RegisterUserDto) {
    return this.authService.registerUser(dto);
  }

  @Post("auth/login")
  loginUser(@Body() dto: LoginDto) {
    return this.authService.loginUser(dto);
  }

  @Post("auth/google")
  googleAuth(
    @Body()
    data: {
      googleId: string;
      email: string;
      name: string;
      avatar?: string;
    },
  ) {
    return this.authService.googleAuth(data);
  }

  @Post("auth/vendor/register")
  registerVendor(@Body() dto: RegisterVendorDto) {
    return this.authService.registerVendor(dto);
  }

  @Post("auth/vendor/login")
  loginVendor(@Body() dto: LoginDto) {
    return this.authService.loginVendor(dto);
  }
  @UseGuards(JwtAuthGuard)
  @Get("me")
  getMe(@Req() req: any) {
    return this.authService.getMe(req.user.userId);
  }
}
