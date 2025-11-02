'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useData } from '@/context/data-context';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import type { PayrollRecord } from '@/lib/types';
import { MoreHorizontal, FileText, Trash2, Edit, Calculator } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

export default function PayrollListPage() {
    const { payrollRecords, setPayrollRecords } = useData();
    const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);

    const handleDeletePayroll = (id: string) => {
        setPayrollRecords(prev => prev.filter(p => p.id !== id));
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>مدیریت حقوق و دستمزد</CardTitle>
                            <CardDescription>
                                مشاهده و مدیریت حقوق و دستمزد محاسبه شده برای پرسنل.
                            </CardDescription>
                        </div>
                        <Link href="/financials/payroll-calculator" passHref>
                            <Button>
                                <Calculator className="ms-2 h-4 w-4" />
                                محاسبه حقوق جدید
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>نام پرسنل</TableHead>
                                <TableHead>تاریخ محاسبه</TableHead>
                                <TableHead>حقوق ناخالص</TableHead>
                                <TableHead>پرداختی نهایی</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payrollRecords.map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell className="font-medium">{record.personnelName}</TableCell>
                                    <TableCell>{record.calculationDate}</TableCell>
                                    <TableCell className="font-mono">{record.grossPay.toLocaleString('fa-IR')} تومان</TableCell>
                                    <TableCell className="font-mono font-bold">{record.netPay.toLocaleString('fa-IR')} تومان</TableCell>
                                    <TableCell className="text-left">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">باز کردن منو</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start" className="font-body">
                                                <DropdownMenuItem onClick={() => setSelectedPayslip(record)}>
                                                    <FileText className="ms-2 h-4 w-4" />
                                                    مشاهده فیش
                                                </DropdownMenuItem>
                                                 <DropdownMenuItem disabled>
                                                    <Edit className="ms-2 h-4 w-4" />
                                                    ویرایش (بزودی)
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => handleDeletePayroll(record.id)}>
                                                    <Trash2 className="ms-2 h-4 w-4" />
                                                    حذف
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {payrollRecords.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                            هنوز هیچ محاسبه حقوقی ثبت نشده است. برای شروع، یک محاسبه جدید ایجاد کنید.
                        </p>
                    )}
                </CardContent>
            </Card>
            
            {selectedPayslip && (
                 <Dialog open={!!selectedPayslip} onOpenChange={(isOpen) => !isOpen && setSelectedPayslip(null)}>
                    <DialogContent className="sm:max-w-md font-body">
                        <DialogHeader>
                            <DialogTitle>فیش حقوقی - {selectedPayslip.personnelName}</DialogTitle>
                            <DialogDescription>
                                تاریخ محاسبه: {selectedPayslip.calculationDate}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4 text-sm">
                            <div className="font-bold text-base mb-4">اطلاعات کارکرد:</div>
                             <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">نرخ ساعتی:</span>
                                <span className="font-mono">{selectedPayslip.hourlyRate.toLocaleString('fa-IR')} تومان</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">ساعت ورود:</span>
                                <span className="font-mono">{selectedPayslip.entryTime}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">ساعت خروج:</span>
                                <span className="font-mono">{selectedPayslip.exitTime}</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">ساعات کارکرد عادی:</span>
                                <span className="font-mono">{selectedPayslip.hoursWorked}</span>
                            </div>
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">ساعات اضافه کاری:</span>
                                <span className="font-mono">{selectedPayslip.overtimeHours}</span>
                            </div>
                            <Separator />
                            <div className="font-bold text-base my-4">محاسبات حقوق:</div>

                             <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">مبلغ تعطیل کاری:</span>
                                <span className="font-mono text-green-600">{`+ ${selectedPayslip.holidayPay.toLocaleString('fa-IR')}`}</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">مبلغ اضافه کاری:</span>
                                <span className="font-mono text-green-600">{`+ ${selectedPayslip.overtimePay.toLocaleString('fa-IR')}`}</span>
                            </div>
                            <div className="flex justify-between items-center font-bold">
                                <span className="text-muted-foreground">حقوق ناخالص:</span>
                                <span className="font-mono">{selectedPayslip.grossPay.toLocaleString('fa-IR')} تومان</span>
                            </div>
                             <Separator />
                             <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">مجموع کسورات:</span>
                                <span className="font-mono text-destructive">{`- ${selectedPayslip.deductions.toLocaleString('fa-IR')}`}</span>
                            </div>
                             <Separator />
                             <div className="flex justify-between items-center font-extrabold text-lg bg-muted -mx-6 px-6 py-3">
                                <span>پرداختی نهایی:</span>
                                <span className="font-mono text-primary">{selectedPayslip.netPay.toLocaleString('fa-IR')} تومان</span>
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">بستن</Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

        </>
    );
}
