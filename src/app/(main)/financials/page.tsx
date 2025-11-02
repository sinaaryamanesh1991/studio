'use client';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useData } from '@/context/data-context';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function FinancialsPage() {
    const { transactions } = useData();

    return (
        <>
            <PageHeader title="امور مالی" />
            <Tabs defaultValue="transactions" className="w-full" dir="rtl">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="transactions">تراکنش ها</TabsTrigger>
                    <TabsTrigger value="payroll">حقوق و دستمزد</TabsTrigger>
                </TabsList>
                <TabsContent value="transactions">
                    <Card>
                        <CardHeader>
                            <CardTitle>لیست تراکنش ها</CardTitle>
                            <CardDescription>فهرست دریافتی ها و پرداختی های اخیر.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>تاریخ</TableHead>
                                        <TableHead>نوع</TableHead>
                                        <TableHead>طرف حساب</TableHead>
                                        <TableHead>بابت</TableHead>
                                        <TableHead className="text-left">مبلغ (تومان)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.map(t => (
                                        <TableRow key={t.id}>
                                            <TableCell>{t.date}</TableCell>
                                            <TableCell>
                                                <Badge variant={t.type === 'دریافتی' ? 'default' : 'secondary'}>{t.type}</Badge>
                                            </TableCell>
                                            <TableCell className="font-medium">{t.party}</TableCell>
                                            <TableCell>{t.reason}</TableCell>
                                            <TableCell className="text-left font-mono">
                                                {t.amount.toLocaleString('fa-IR')}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="payroll">
                    <Card>
                        <CardHeader>
                            <CardTitle>مدیریت حقوق و دستمزد</CardTitle>
                            <CardDescription>
                                ابزارهای مورد نیاز برای محاسبه و مدیریت حقوق پرسنل.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                در این بخش می‌توانید حقوق پرسنل را به صورت خودکار محاسبه کنید، لیست حقوق را مشاهده کرده و فیش حقوقی صادر نمایید.
                            </p>
                            <Link href="/financials/payroll" passHref>
                                <Button>
                                    ورود به بخش محاسبه‌گر حقوق
                                </Button>
                            </Link>
                             <p className="text-xs text-muted-foreground pt-4">
                                (بخش‌های دیگر مانند لیست حقوق و فیش حقوقی در نسخه نهایی اضافه خواهند شد.)
                             </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </>
    );
}
