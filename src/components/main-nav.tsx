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
  UploadCloud,
  DownloadCloud,
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
import { exportData, importData } from '@/lib/backup';
import { Button } from './ui/button';

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

  const handleExport = async () => {
    if (!firestore || !user?.uid) {
        toast({ variant: 'destructive', title: 'خطا', description: 'برای خروج داده، ابتدا وارد شوید.' });
        return;
    }
    try {
        await exportData(firestore, user.uid);
        toast({ title: 'موفقیت', description: 'فایل پشتیبان با نام backup.json دانلود شد.' });
    } catch (e: any) {
        console.error(e);
        toast({ variant: 'destructive', title: 'خطا در خروج داده', description: e.message });
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!firestore || !user?.uid) {
        toast({ variant: 'destructive', title: 'خطا', description: 'برای ورود داده، ابتدا وارد شوید.' });
        return;
    }
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const content = e.target?.result;
            if (typeof content !== 'string') throw new Error('محتوای فایل نامعتبر است.');
            
            const data = JSON.parse(content);
            await importData(firestore, user.uid, data);
            toast({ title: 'موفقیت', description: 'داده‌ها با موفقیت وارد شدند. صفحه را مجددا بارگذاری کنید.' });
        } catch (err: any) {
            console.error(err);
            toast({ variant: 'destructive', title: 'خطا در ورود داده', description: err.message });
        }
    };
    reader.readAsText(file);
  };


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
                <Button asChild variant="ghost" className="h-8 justify-start w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground px-2">
                    <label htmlFor="import-file" className="cursor-pointer">
                        <UploadCloud className="ms-2" />
                        <span className="text-sm">ورود داده (Import)</span>
                    </label>
                </Button>
                <input id="import-file" type="file" accept=".json" className="hidden" onChange={handleImport} />
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleExport}
                tooltip={{
                  children: 'خروج داده (Export)',
                  className: 'font-body',
                }}
              >
                <DownloadCloud />
                <span>خروج داده (Export)</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
       <SidebarFooter className="mt-auto" />
    </>
  );
}
