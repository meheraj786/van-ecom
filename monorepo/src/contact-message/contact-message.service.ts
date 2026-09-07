import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateContactMessageDto } from "./dto/create-contact-message.dto/create-contact-message.dto";

@Injectable()
export class ContactMessageService {
  constructor(private readonly prisma: PrismaService) {}

  createMessage(dto: CreateContactMessageDto) {
    return this.prisma.contactMessage.create({ data: dto });
  }

  async getMessages(query: {
    page?: string;
    limit?: string;
    isRead?: boolean;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 10);
    const isRead =
      query.isRead === undefined
        ? undefined
        : query.isRead === true ||
          query.isRead === ("true" as unknown as boolean);
    const where = isRead === undefined ? {} : { isRead };
    const [items, total] = await Promise.all([
      this.prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.contactMessage.count({ where }),
    ]);
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getMessageById(id: string) {
    const message = await this.prisma.contactMessage.findUnique({
      where: { id },
    });
    if (!message) throw new NotFoundException("Contact message not found");
    return message;
  }

  async markAsRead(id: string) {
    try {
      return await this.prisma.contactMessage.update({
        where: { id },
        data: { isRead: true },
      });
    } catch {
      throw new NotFoundException("Contact message not found");
    }
  }

  async deleteMessage(id: string) {
    try {
      await this.prisma.contactMessage.delete({ where: { id } });
    } catch {
      throw new NotFoundException("Contact message not found");
    }
    return { success: true };
  }
}
