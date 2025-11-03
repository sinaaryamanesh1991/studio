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
  DatabaseZap,
  Clock,
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
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { seedDatabase } from '@/firebase/seed';

const navItems = [
  { href: '/dashboard', label: 'داشبورد', icon: LayoutDashboard },
  { href: '/personnel', label: 'پرسنل', icon: Users },
  { href: '/residents', label: 'ساکنین', icon: Home },
  { href: '/board-members', label: 'هیئت مدیره', icon: Briefcase },
  { href: '/shifts', label: 'شیفت‌بندی نگهبانان', icon: Clock },
  { href: '/map', label: 'نقشه شهرک', icon: Map },
  { href: '/documents', label: 'اسناد و مدارک', icon: FileText },
];

export function MainNav() {
  const pathname = usePathname();
  const [isFinancialOpen, setIsFinancialOpen] = useState(pathname.startsWith('/financials'));

  const { firestore, user } = useFirebase();
  const { toast } = useToast();

  const handleSeed = async () => {
    if (!firestore || !user?.uid) return;
    try {
        await seedDatabase(firestore, user.uid);
        toast({
            title: 'موفقیت',
            description: 'داده‌های نمونه با موفقیت در دیتابیس بارگذاری شدند.',
        });
    } catch(e) {
        console.error(e);
        toast({
            variant: 'destructive',
            title: 'خطا',
            description: 'خطایی در بارگذاری داده‌های نمونه رخ داد.',
        });
    }
  }

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
                               <SidebarMenuSubButton asChild isActive={pathname === '/financials'}>
                                    <Link href="/financials">
                                        <List />
                                        <span>لیست تراکنش ها</span>
                                    </Link>
                                </SidebarMenuSubButton>
                           </SidebarMenuItem>
                           <SidebarMenuItem>
                                <SidebarMenuSubButton asChild isActive={pathname.startsWith('/financials/payroll')}>
                                    <Link href="/financials/payroll">
                                        <Settings />
                                        <span>حقوق و دستمزد</span>
                                    </Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuItem>
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </Collapsible>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <Link href="/settings">
                <SidebarMenuButton
                  isActive={pathname === '/settings'}
                  tooltip={{ children: 'تنظیمات', className: 'font-body' }}
                >
                  <Settings />
                  <span>تنظیمات</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleSeed}
                tooltip={{
                  children: 'بارگذاری داده‌های نمونه',
                  className: 'font-body',
                }}
              >
                <DatabaseZap />
                <span>بارگذاری داده‌های نمونه</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
       <SidebarFooter className="mt-auto" />
    </>
  );
}
