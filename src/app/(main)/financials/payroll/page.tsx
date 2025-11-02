'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useData } from '@/context/data-context';
import { useToast } from '@/hooks/use-toast';
import type { CompanyInfo } from '@/lib/types';
import Link from 'next/link';
import { Calculator, Users } from 'lucide-react';
import PayrollListPage from './payroll-list-content';

function CompanyInfoForm() {
    const { companyInfo, setCompanyInfo } = useData();
    const { toast } = useToast();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const newInfo: CompanyInfo = {
            name: formData.get('name') as string,
            defaultEntryTime: formData.get('defaultEntryTime') as string,
            defaultExitTime: formData.get('defaultExitTime') as string,
        };
        setCompanyInfo(newInfo);
        toast({ title: 'موفقیت', description: 'اطلاعات پایه با موفقیت ذخیره شد.' });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>اطلاعات پایه شرکت</CardTitle>
                <CardDescription>
                    اطلاعات کلی مربوط به شرکت یا مجموعه را در این بخش تنظیم کنید.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">نام شرکت/فروشگاه</Label>
                        <Input id="name" name="name" defaultValue={companyInfo?.name} placeholder="مثال: شهرک سینا" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="defaultEntryTime">ساعت ورود پیش‌فرض</Label>
                            <Input id="defaultEntryTime" name="defaultEntryTime" type="time" defaultValue={companyInfo?.defaultEntryTime ?? '08:00'} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="defaultExitTime">ساعت خروج پیش‌فرض</Label>
                            <Input id="defaultExitTime" name="defaultExitTime" type="time" defaultValue={companyInfo?.defaultExitTime ?? '17:00'} />
                        </div>
                    </div>
                    <Button type="submit">ذخیره اطلاعات پایه</Button>
                </form>
            </CardContent>
        </Card>
    );
}


export default function PayrollSystemPage() {
    return (
        <>
            <PageHeader title="سیستم جامع حقوق و دستمزد">
                 <Button asChild>
                    <Link href="/financials/payroll-calculator">
                        <Calculator className="ms-2 h-4 w-4" />
                        محاسبه حقوق جدید
                    </Link>
                </Button>
            </PageHeader>
            
            <Tabs defaultValue="company-info" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="company-info">اطلاعات پایه</TabsTrigger>
                    <TabsTrigger value="personnel-info">اطلاعات پرسنل</TabsTrigger>
                    <TabsTrigger value="payroll-list">لیست حقوق</TabsTrigger>
                </TabsList>
                
                <TabsContent value="company-info">
                    <CompanyInfoForm />
                </TabsContent>
                <TabsContent value="personnel-info">
                    <Card>
                        <CardHeader>
                            <CardTitle>اطلاعات پرسنل</CardTitle>
                            <CardDescription>برای مدیریت کامل پرسنل، به صفحه اختصاصی آن مراجعه کنید.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild>
                                <Link href="/personnel">
                                    <Users className="ms-2 h-4 w-4" />
                                    رفتن به صفحه مدیریت پرسنل
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="payroll-list">
                    <PayrollListPage />
                </TabsContent>
            </Tabs>
        </>
    );
}
