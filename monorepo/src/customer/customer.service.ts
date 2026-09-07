import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { PaginationQueryDto } from "./dto/pagination-query.dto";

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertCustomerLead(data: {
    name: string;
    email: string;
    phone: string;
    address: string;
    isRegistered: boolean;
  }) {
    return this.prisma.customer.upsert({
      where: { phone: data.phone },
      create: data,
      update: data,
    });
  }

  async createCustomer(dto: CreateCustomerDto) {
    const existing = await this.prisma.customer.findUnique({
      where: { phone: dto.phone },
    });
    if (existing)
      throw new BadRequestException(
        "Customer with this phone number already exists",
      );
    return this.prisma.customer.create({ data: dto });
  }

  async getCustomers(query: PaginationQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const [totalCustomers, customers] = await Promise.all([
      this.prisma.customer.count(),
      this.prisma.customer.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);
    return {
      meta: {
        totalCustomers,
        page,
        limit,
        totalPages: Math.ceil(totalCustomers / limit),
      },
      customers,
    };
  }

  async getCustomerById(id: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException("Customer not found");
    return customer;
  }

  async updateCustomer(id: string, dto: UpdateCustomerDto) {
    try {
      return await this.prisma.customer.update({ where: { id }, data: dto });
    } catch {
      throw new NotFoundException("Customer not found");
    }
  }

  async deleteCustomer(id: string) {
    try {
      await this.prisma.customer.delete({ where: { id } });
    } catch {
      throw new NotFoundException("Customer not found");
    }
    return { message: "Customer deleted successfully from CRM" };
  }
}
