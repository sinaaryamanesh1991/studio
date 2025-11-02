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
  ChevronDown,
  Settings,
  List,
  Receipt,
} from 'lucide-react';
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuSub,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard', label: 'داشبورد', icon: LayoutDashboard },
  { href: '/personnel', label: 'پرسنل', icon: Users },
  { href: '/residents', label: 'ساکنین', icon: Home },
  { href: '/board-members', label: 'هیئت مدیره', icon: Briefcase },
  { href: '/map', label: 'نقشه شهرک', icon: Map },
  { href: '/documents', label: 'اسناد و مدارک', icon: FileText },
];

export function MainNav() {
  const pathname = usePathname();
  const [isFinancialOpen, setIsFinancialOpen] = useState(pathname.startsWith('/financials'));

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
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={{ children: item.label, className: 'font-body' }}
                  >
                      <item.icon />
                      <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
             <SidebarMenuItem>
                <Collapsible open={isFinancialOpen} onOpenChange={setIsFinancialOpen}>
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton isActive={pathname.startsWith('/financials')}>
                            <CircleDollarSign />
                            <span>امور مالی</span>
                            <ChevronDown className="ms-auto h-4 w-4 shrink-0 transition-transform ease-in-out group-data-[state=open]:rotate-180" />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <SidebarMenuSub>
                          <SidebarMenuItem>
                               <Link href="/financials">
                                    <SidebarMenuSubButton isActive={pathname === '/financials'}>
                                        <List />
                                        <span>لیست تراکنش ها</span>
                                    </SidebarMenuSubButton>
                                </Link>
                           </SidebarMenuItem>
                           <SidebarMenuItem>
                                <Link href="/financials/payroll">
                                    <SidebarMenuSubButton isActive={pathname.startsWith('/financials/payroll')}>
                                        <Settings />
                                        <span>حقوق و دستمزد</span>
                                    </SidebarMenuSubButton>
                                </Link>
                            </SidebarMenuItem>
                             <SidebarMenuItem>
                                <Link href="/financials/payroll/payslip">
                                    <SidebarMenuSubButton isActive={pathname === '/financials/payroll/payslip'}>
                                        <Receipt />
                                        <span>فیش حقوقی</span>
                                    </SidebarMenuSubButton>
                                </Link>
                            </SidebarMenuItem>
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </Collapsible>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </>
  );
}
