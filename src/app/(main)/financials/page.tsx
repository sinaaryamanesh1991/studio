'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useData } from '@/context/data-context';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function FinancialsPage() {
    const { transactions } = useData();

    return (
        <>
            <PageHeader title="تراکنش های مالی" />
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
                     {transactions.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                            هنوز هیچ تراکنشی ثبت نشده است.
                        </p>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
