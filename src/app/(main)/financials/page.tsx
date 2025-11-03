'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export default function FinancialsPage() {
    const { firestore, user } = useFirebase();
    const estateId = user?.uid;
    const transactionsQuery = useMemoFirebase(() => estateId ? collection(firestore, 'estates', estateId, 'financialTransactions') : null, [firestore, estateId]);
    const { data: transactions, isLoading } = useCollection<Transaction>(transactionsQuery);

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const receipts = transactions?.filter(t => t.type === 'دریافتی') ?? [];
    const payments = transactions?.filter(t => t.type === 'پرداختی') ?? [];

    const handleSaveTransaction = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!estateId) return;

        const formData = new FormData(e.currentTarget);
        const transactionRef = collection(firestore, 'estates', estateId, 'financialTransactions');
        
        const newTransaction: Omit<Transaction, 'id'> = {
            type: formData.get('type') as 'دریافتی' | 'پرداختی',
            party: formData.get('party') as string,
            reason: formData.get('reason') as string,
            amount: Number(formData.get('amount')),
            date: format(new Date(), 'yyyy/MM/dd'),
            estateId,
        };

        addDocumentNonBlocking(transactionRef, newTransaction);
        setIsDialogOpen(false);
    };
    
    if (isLoading) {
        return <div>در حال بارگذاری...</div>;
    }

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
                                        <TableHead className="text-center">تاریخ</TableHead>
                                        <TableHead className="text-center">طرف حساب</TableHead>
                                        <TableHead className="text-center">بابت</TableHead>
                                        <TableHead className="text-center">مبلغ (تومان)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {receipts.map(t => (
                                        <TableRow key={t.id}>
                                            <TableCell className="text-center">{t.date}</TableCell>
                                            <TableCell className="font-medium text-center">{t.party}</TableCell>
                                            <TableCell className="text-center">{t.reason}</TableCell>
                                            <TableCell className="text-center font-mono text-green-600">
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
                                        <TableHead className="text-center">تاریخ</TableHead>
                                        <TableHead className="text-center">طرف حساب</TableHead>
                                        <TableHead className="text-center">بابت</TableHead>
                                        <TableHead className="text-center">مبلغ (تومان)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payments.map(t => (
                                        <TableRow key={t.id}>
                                            <TableCell className="text-center">{t.date}</TableCell>
                                            <TableCell className="font-medium text-center">{t.party}</TableCell>
                                            <TableCell className="text-center">{t.reason}</TableCell>
                                            <TableCell className="text-center font-mono text-destructive">
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
