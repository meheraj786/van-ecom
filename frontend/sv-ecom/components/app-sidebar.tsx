"use client";

import * as React from "react";
import {
  Bookmark,
  ChartBarIcon,
  CircleHelpIcon,
  DatabaseIcon,
  FileChartColumnIcon,
  FileIcon,
  FolderIcon,
  Headphones,
  LayoutDashboardIcon,
  ListIcon,
  MessageCircle,
  SearchIcon,
  Settings2Icon,
  Star,
  UsersIcon,
} from "lucide-react";
import { BsTruck } from "react-icons/bs";
import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Logo from "./clientComponents/Logo";
import { useAuthStore } from "@/store/useAuthStore";

const navData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Products",
      url: "/admin/products",
      icon: <ListIcon />,
    },
    {
      title: "Orders",
      url: "/admin/orders",
      icon: <ListIcon />,
    },
    {
      title: "Categories",
      url: "/admin/categories",
      icon: <ChartBarIcon />,
    },
    {
      title: "Subcategories",
      url: "/admin/sub-category",
      icon: <ChartBarIcon />,
    },
    {
      title: "Stocks",
      url: "/admin/stocks",
      icon: <FolderIcon />,
    },
    {
      title: "Customers",
      url: "/admin/customers",
      icon: <UsersIcon />,
    },
    {
      title: "Coupons",
      url: "/admin/coupons",
      icon: <Bookmark />,
    },
    {
      title: "Shipping & Divisions",
      url: "/admin/divisions",
      icon: <BsTruck />,
    },
    {
      title: "Live Support",
      url: "/admin/support",
      icon: <Headphones />,
    },
    {
      title: "Messages",
      url: "/admin/messages",
      icon: <MessageCircle />,
    },
    {
      title: "Reviews",
      url: "/admin/reviews",
      icon: <Star />,
    },
    {
      title: "Theme",
      url: "/admin/theme",
      icon: <UsersIcon />,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: <Settings2Icon />,
    },
    {
      title: "Support Help",
      url: "/admin/support",
      icon: <CircleHelpIcon />,
    },
    {
      title: "Search",
      url: "#",
      icon: <SearchIcon />,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: <DatabaseIcon />,
    },
    {
      name: "Reports",
      url: "#",
      icon: <FileChartColumnIcon />,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: <FileIcon />,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const vendor = useAuthStore((state) => state.vendor);
  const user = useAuthStore((state) => state.user);

  const currentAccount = vendor || user;

  const dynamicUser = {
    name: currentAccount?.name || "Admin",
    email: currentAccount?.email || "admin@e-com.com",
    avatar: (currentAccount as any)?.avatar || "",
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Logo />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navData.navMain} />
        {/* <NavDocuments items={navData.documents} />
        <NavSecondary items={navData.navSecondary} className="mt-auto" /> */}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={dynamicUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
