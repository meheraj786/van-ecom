import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from "@nestjs/common";
import { CustomerService } from "./customer.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { PaginationQueryDto } from "./dto/pagination-query.dto";

@Controller("customer")
export class CustomerController {
  constructor(private customerService: CustomerService) {}

  @Post()
  createCustomer(@Body() dto: CreateCustomerDto) {
    return this.customerService.createCustomer(dto);
  }

  @Get()
  getCustomers(@Query() query: PaginationQueryDto) {
    return this.customerService.getCustomers(query);
  }

  @Get(":id")
  getCustomerById(@Param("id") id: string) {
    return this.customerService.getCustomerById(id);
  }

  @Put(":id")
  updateCustomer(@Param("id") id: string, @Body() dto: UpdateCustomerDto) {
    return this.customerService.updateCustomer(id, dto);
  }

  @Delete(":id")
  deleteCustomer(@Param("id") id: string) {
    return this.customerService.deleteCustomer(id);
  }
}
