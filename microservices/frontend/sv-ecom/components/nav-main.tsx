"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { MailIcon } from "lucide-react";
import { chatService } from "@/services/chatService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: React.ReactNode;
  }[];
}) {
  const pathname = usePathname();
  const { data: rawConversations = [] } = useQuery({
    queryKey: ["chat-conversations"],
    queryFn: () => chatService.getUserConversations("ADMIN"),
    refetchInterval: 4000,
  });

  // isActive
  const isActive = (url: string) => {
    return pathname === url;
  };

  const conversations = React.useMemo(
    () => (Array.isArray(rawConversations) ? rawConversations : []),
    [rawConversations],
  );

  const totalUnreadMessages = React.useMemo(() => {
    return conversations.reduce((sum: number, conv: any) => {
      const count = Number(conv.unreadCount?.["ADMIN"] || 0);
      return sum + count;
    }, 0);
  }, [conversations]);

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            {/* <SidebarMenuButton
              tooltip="Quick Create"
              className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
            >
              <CirclePlusIcon />
              <span>Quick Create</span>
            </SidebarMenuButton> */}
            <Link href="/admin/support">
              <Button
                size="icon"
                className="size-8 group-data-[collapsible=icon]:opacity-0 relative cursor-pointer"
                variant="outline"
              >
                <MailIcon />
                {totalUnreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 bg-red-600 text-white rounded-full text-[9px] font-black flex items-center justify-center">
                    {totalUnreadMessages > 99 ? "99+" : totalUnreadMessages}
                  </span>
                )}
                <span className="sr-only">Inbox</span>
              </Button>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => {
            const isMessagesLink =
              item.url === "/admin/support" ||
              item.url === "/admin/messages" ||
              item.title.toLowerCase().includes("message") ||
              item.title.toLowerCase().includes("support");

            return (
              <Link href={item.url} key={item.title}>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={`${
                      isMessagesLink && totalUnreadMessages > 0
                        ? "bg-accent text-accent-foreground"
                        : isActive(item.url)
                          ? "bg-primary text-primary-foreground"
                          : "bg-transparent text-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <span>{item.title}</span>
                    </div>
                    {isMessagesLink && totalUnreadMessages > 0 && (
                      <Badge
                        variant="secondary"
                        className="h-5 px-1.5 bg-red-500 text-white text-[10px] font-black rounded-full border-none"
                      >
                        {totalUnreadMessages > 99 ? "99+" : totalUnreadMessages}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </Link>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
