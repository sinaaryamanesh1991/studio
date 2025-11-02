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
import { Calculator, Users, Clock, Receipt } from 'lucide-react';
import PayrollListPage from './payroll-list-content';
import { useRouter } from 'next/navigation';

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
    const router = useRouter();
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
            
            <Tabs defaultValue="company-info" className="w-full" onValueChange={(value) => router.push(`/financials/payroll/${value}`)}>
                <TabsList className="grid w-full grid-cols-5 mb-6">
                    <TabsTrigger value="info">اطلاعات پایه</TabsTrigger>
                    <TabsTrigger value="personnel">اطلاعات پرسنل</TabsTrigger>
                    <TabsTrigger value="work-hours">ساعت کاری</TabsTrigger>
                    <TabsTrigger value="list">لیست حقوق</TabsTrigger>
                    <TabsTrigger value="payslip">فیش حقوقی</TabsTrigger>
                </TabsList>
                
                <TabsContent value="info">
                    <CompanyInfoForm />
                </TabsContent>
                <TabsContent value="personnel">
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
                <TabsContent value="work-hours">
                    <Card>
                        <CardHeader>
                            <CardTitle>مدیریت ساعات کاری</CardTitle>
                            <CardDescription>برای مدیریت ساعت ورود و خروج پرسنل به صفحه مربوطه مراجعه کنید.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <Button asChild>
                                <Link href="/financials/payroll/work-hours">
                                    <Clock className="ms-2 h-4 w-4" />
                                    رفتن به صفحه ساعت کاری
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="list">
                    <PayrollListPage />
                </TabsContent>
                 <TabsContent value="payslip">
                    <Card>
                        <CardHeader>
                            <CardTitle>مشاهده فیش حقوقی</CardTitle>
                            <CardDescription>برای مشاهده و چاپ فیش حقوقی به صفحه مربوطه مراجعه کنید.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <Button asChild>
                                <Link href="/financials/payroll/payslip">
                                    <Receipt className="ms-2 h-4 w-4" />
                                    رفتن به صفحه فیش حقوقی
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </>
    );
}
