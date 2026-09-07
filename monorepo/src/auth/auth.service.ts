import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterUserDto } from "./dto/register-user.dto";
import { RegisterVendorDto } from "./dto/register-vendor.dto";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async registerUser(dto: RegisterUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new BadRequestException("User already exists");
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: await bcrypt.hash(dto.password, 10),
        provider: "local",
        role: "USER",
      },
    });
    return { message: "User registered successfully", userId: user.id };
  }

  async loginUser(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (
      !user ||
      !user.password ||
      !(await bcrypt.compare(dto.password, user.password))
    ) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const token = this.jwt.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    return {
      message: "Login successful",
      token,
      user: { id: user.id, email: user.email, name: user.name },
    };
  }

  async googleAuth(data: {
    googleId: string;
    email: string;
    name: string;
    avatar?: string;
  }) {
    let user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: data.email,
          name: data.name || data.email.split("@")[0],
          googleId: data.googleId,
          avatar: data.avatar,
          provider: "google",
          role: "USER",
        },
      });
    }
    const token = this.jwt.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    return {
      message: "Google login successful",
      token,
      user: { id: user.id, email: user.email, name: user.name },
    };
  }

  async registerVendor(dto: RegisterVendorDto) {
    const existingVendor = await this.prisma.user.findFirst({
      where: {
        role: {
          not: "USER",
        },
      },
    });

    if (existingVendor) {
      throw new BadRequestException(
        "A vendor account already exists. Only one vendor is allowed for this single-vendor store.",
      );
    }

    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingEmail) {
      throw new BadRequestException(
        "An account with this email already exists",
      );
    }

    const vendor = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: await bcrypt.hash(dto.password, 10),
        role: dto.role || "ADMIN",
        provider: "local",
      },
    });

    return {
      message: "Vendor account registered successfully",
      vendorId: vendor.id,
    };
  }

  async loginVendor(dto: LoginDto) {
    const vendor = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (
      !vendor ||
      !vendor.password ||
      !(await bcrypt.compare(dto.password, vendor.password))
    ) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const token = this.jwt.sign({
      userId: vendor.id,
      email: vendor.email,
      role: vendor.role,
    });
    return {
      message: "Administrative login successful",
      token,
      vendor: {
        id: vendor.id,
        email: vendor.email,
        name: vendor.name,
        role: vendor.role,
      },
    };
  }
}
