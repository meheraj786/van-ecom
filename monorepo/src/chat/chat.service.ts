import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SendMessageDto } from "./dto/chat.dto";

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateConversation(userA: string, userB: string) {
    if (userA === userB)
      throw new BadRequestException("Cannot start conversation with yourself");
    const existing = await this.prisma.conversation.findFirst({
      where: { participants: { hasEvery: [userA, userB] } },
    });
    if (existing) return existing;
    return this.prisma.conversation.create({
      data: {
        participants: [userA, userB],
        unreadCount: { [userA]: 0, [userB]: 0 },
      },
    });
  }

  getUserConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: { participants: { has: userId } },
      orderBy: { updatedAt: "desc" },
    });
  }

  async getConversationMessages(conversationId: string, page = 1, limit = 50) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conversation) throw new BadRequestException("Invalid conversation ID");
    const [total, messages] = await Promise.all([
      this.prisma.chatMessage.count({ where: { conversationId } }),
      this.prisma.chatMessage.findMany({
        where: { conversationId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return {
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      messages: messages.reverse(),
    };
  }

  async saveMessage(
    senderId: string,
    senderName: string,
    senderRole: string,
    dto: SendMessageDto,
  ) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: dto.conversationId },
    });
    if (!conversation) throw new NotFoundException("Conversation not found");
    const message = await this.prisma.chatMessage.create({
      data: {
        conversationId: dto.conversationId,
        senderId,
        senderName,
        senderRole,
        content: dto.content,
        attachments: dto.attachments || [],
        readBy: [senderId],
      },
    });
    const unread = {
      ...((conversation.unreadCount as Record<string, number>) || {}),
    };
    const isAdmin = senderRole === "ADMIN" || senderRole === "STAFF";
    for (const participant of conversation.participants) {
      if (
        (isAdmin && participant !== "ADMIN") ||
        (!isAdmin && participant === "ADMIN")
      )
        unread[participant] = (unread[participant] || 0) + 1;
    }
    unread[isAdmin ? "ADMIN" : senderId] = 0;
    await this.prisma.conversation.update({
      where: { id: dto.conversationId },
      data: {
        lastMessage: dto.content,
        lastMessageSenderId: senderId,
        lastMessageAt: new Date(),
        unreadCount: unread,
      },
    });
    return message;
  }

  async markAsRead(conversationId: string, userId: string) {
    const resetKey =
      userId === "ADMIN" || userId.startsWith("ADMIN") ? "ADMIN" : userId;
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conversation) return;
    const unread = {
      ...((conversation.unreadCount as Record<string, number>) || {}),
      [resetKey]: 0,
    };
    await this.prisma.$transaction([
      this.prisma.chatMessage.updateMany({
        where: { conversationId, NOT: { readBy: { has: userId } } },
        data: { readBy: { push: userId } },
      }),
      this.prisma.conversation.update({
        where: { id: conversationId },
        data: { unreadCount: unread },
      }),
    ]);
  }
}
