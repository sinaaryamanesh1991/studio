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
import { Calculator, List, Users } from 'lucide-react';
import PersonnelPage from '../../personnel/page';
import PayrollListPage from '../payroll-list/page';

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
                 <Link href="/financials/payroll-calculator" passHref>
                    <Button>
                        <Calculator className="ms-2 h-4 w-4" />
                        محاسبه حقوق جدید
                    </Button>
                </Link>
            </PageHeader>
            
            <Tabs defaultValue="company-info" className="w-full">
                <TabsList className="grid w-full grid-cols-5 mb-6">
                    <TabsTrigger value="company-info">اطلاعات پایه</TabsTrigger>
                    <TabsTrigger value="personnel-info">اطلاعات پرسنل</TabsTrigger>
                    <TabsTrigger value="work-hours" disabled>ساعت کاری (بزودی)</TabsTrigger>
                    <TabsTrigger value="payroll-list">لیست حقوق</TabsTrigger>
                    <TabsTrigger value="payslip" disabled>فیش حقوق (بزودی)</TabsTrigger>
                </TabsList>
                
                <TabsContent value="company-info">
                    <CompanyInfoForm />
                </TabsContent>
                <TabsContent value="personnel-info">
                    <PersonnelPage />
                </TabsContent>
                <TabsContent value="work-hours">
                    {/* Work hours component will go here */}
                </TabsContent>
                <TabsContent value="payroll-list">
                    <PayrollListPage/>
                </TabsContent>
                <TabsContent value="payslip">
                    {/* Payslip component will go here */}
                </TabsContent>
            </Tabs>
        </>
    );
}
