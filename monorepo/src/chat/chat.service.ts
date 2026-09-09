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

  private async ensureSenderUserExists(
    senderId: string,
    senderName: string,
    senderRole: string,
  ) {
    const emailBase = senderId.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const email = `${emailBase || "chat-user"}@chat.local`;

    await this.prisma.user.upsert({
      where: { id: senderId },
      update: {
        name: senderName || senderId,
        role: senderRole || "USER",
        email,
      },
      create: {
        id: senderId,
        email,
        name: senderName || senderId,
        role: senderRole || "USER",
      },
    });
  }

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

  async getUserConversations(userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: { participants: { has: userId } },
      orderBy: { updatedAt: "desc" },
    });

    const participantIds = [
      ...new Set(
        conversations.flatMap((conversation) => conversation.participants),
      ),
    ];
    const users = await this.prisma.user.findMany({
      where: { id: { in: participantIds } },
      select: {
        id: true,
        name: true,
        customer: { select: { phone: true } },
      },
    });
    const detailsById = new Map(
      users.map((user) => [
        user.id,
        { name: user.name, phone: user.customer?.phone },
      ]),
    );

    return conversations.map((conversation) => ({
      ...conversation,
      participantDetails: Object.fromEntries(
        conversation.participants.map((participant) => {
          const guestParts = participant.split("_");
          const isGuest = participant.startsWith("GUEST_");
          return [
            participant,
            {
              name:
                detailsById.get(participant)?.name ||
                (isGuest ? "Guest" : participant),
              ...(detailsById.get(participant)?.phone ||
              (isGuest && guestParts[1])
                ? {
                    phone: detailsById.get(participant)?.phone || guestParts[1],
                  }
                : {}),
            },
          ];
        }),
      ),
    }));
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

    await this.ensureSenderUserExists(senderId, senderName, senderRole);

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
