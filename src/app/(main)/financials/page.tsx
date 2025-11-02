'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useData } from '@/context/data-context';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Transaction } from '@/lib/types';
import { format } from 'date-fns-jalali';

export default function FinancialsPage() {
    const { transactions, setTransactions } = useData();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const receipts = transactions.filter(t => t.type === 'دریافتی');
    const payments = transactions.filter(t => t.type === 'پرداختی');

    const handleSaveTransaction = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        const newTransaction: Transaction = {
            id: `t${Date.now()}`,
            type: formData.get('type') as 'دریافتی' | 'پرداختی',
            party: formData.get('party') as string,
            reason: formData.get('reason') as string,
            amount: Number(formData.get('amount')),
            date: format(new Date(), 'yyyy-MM-dd'),
        };

        setTransactions(prev => [...prev, newTransaction]);
        setIsDialogOpen(false);
    };

    return (
        <>
            <PageHeader title="تراکنش های مالی">
                <Button onClick={() => setIsDialogOpen(true)}>
                    <PlusCircle className="ms-2 h-4 w-4" />
                    ثبت تراکنش جدید
                </Button>
            </PageHeader>
            <Card>
                <CardHeader>
                    <CardTitle>لیست تراکنش ها</CardTitle>
                    <CardDescription>فهرست دریافتی ها و پرداختی های اخیر.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="receipts" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="receipts">دریافتی ها</TabsTrigger>
                            <TabsTrigger value="payments">پرداختی ها</TabsTrigger>
                        </TabsList>
                        <TabsContent value="receipts">
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>تاریخ</TableHead>
                                        <TableHead>طرف حساب</TableHead>
                                        <TableHead>بابت</TableHead>
                                        <TableHead className="text-left">مبلغ (تومان)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {receipts.map(t => (
                                        <TableRow key={t.id}>
                                            <TableCell>{t.date}</TableCell>
                                            <TableCell className="font-medium">{t.party}</TableCell>
                                            <TableCell>{t.reason}</TableCell>
                                            <TableCell className="text-left font-mono text-green-600">
                                                {`+ ${t.amount.toLocaleString('fa-IR')}`}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {receipts.length === 0 && (
                                <p className="text-center text-muted-foreground py-8">
                                    هنوز هیچ دریافتی ثبت نشده است.
                                </p>
                            )}
                        </TabsContent>
                        <TabsContent value="payments">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>تاریخ</TableHead>
                                        <TableHead>طرف حساب</TableHead>
                                        <TableHead>بابت</TableHead>
                                        <TableHead className="text-left">مبلغ (تومان)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payments.map(t => (
                                        <TableRow key={t.id}>
                                            <TableCell>{t.date}</TableCell>
                                            <TableCell className="font-medium">{t.party}</TableCell>
                                            <TableCell>{t.reason}</TableCell>
                                            <TableCell className="text-left font-mono text-destructive">
                                                {`- ${t.amount.toLocaleString('fa-IR')}`}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                             {payments.length === 0 && (
                                <p className="text-center text-muted-foreground py-8">
                                    هنوز هیچ پرداختی ثبت نشده است.
                                </p>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px] font-body">
                    <form onSubmit={handleSaveTransaction}>
                        <DialogHeader>
                            <DialogTitle>ثبت تراکنش جدید</DialogTitle>
                            <DialogDescription>
                                اطلاعات تراکنش جدید را وارد کنید.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="type" className="text-right">نوع تراکنش</Label>
                                <Select name="type" required>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="نوع را انتخاب کنید" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="دریافتی">دریافتی</SelectItem>
                                        <SelectItem value="پرداختی">پرداختی</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="party" className="text-right">طرف حساب</Label>
                                <Input id="party" name="party" className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="reason" className="text-right">بابت</Label>
                                <Input id="reason" name="reason" className="col-span-3" required />
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="amount" className="text-right">مبلغ (تومان)</Label>
                                <Input id="amount" name="amount" type="number" className="col-span-3" required />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">انصراف</Button>
                            </DialogClose>
                            <Button type="submit">ذخیره تراکنش</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
