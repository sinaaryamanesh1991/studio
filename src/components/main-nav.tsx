'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Home,
  Map,
  CircleDollarSign,
  FileText,
  Building,
  Briefcase,
  UserSquare,
} from 'lucide-react';
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'داشبورد', icon: LayoutDashboard },
  { href: '/personnel', label: 'پرسنل', icon: Users },
  { href: '/residents', label: 'ساکنین', icon: Home },
  { href: '/owners', label: 'صاحبین', icon: UserSquare },
  { href: '/board-members', label: 'هیئت مدیره', icon: Briefcase },
  { href: '/map', label: 'نقشه شهرک', icon: Map },
  { href: '/financials', label: 'امور مالی', icon: CircleDollarSign },
  { href: '/documents', label: 'اسناد و مدارک', icon: FileText },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 p-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Building className="size-5" />
            </div>
            <span className="text-lg font-semibold text-sidebar-foreground">مدیریت شهرک</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>منو اصلی</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href)}
                    tooltip={{ children: item.label, className: 'font-body' }}
                  >
                    <a>
                      <item.icon />
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </>
  );
}
