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
import { useRouter } from 'next/navigation';
import { format, toDate } from 'date-fns-jalali';
import { PayslipDisplay } from './page';

export default function PayrollListPage() {
    const { payrollRecords, setPayrollRecords, personnel } = useData();
    const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);
    const router = useRouter();

    const handleDeletePayroll = (id: string) => {
        setPayrollRecords(prev => prev.filter(p => p.id !== id));
    };

    const handleEditPayroll = (id: string) => {
        router.push(`/financials/payroll-calculator?id=${id}`);
    };
    
    const formatDate = (dateString: string) => {
        try {
            return format(toDate(new Date(dateString)), 'yyyy/MM/dd');
        } catch (e) {
            return dateString;
        }
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
                        <Button asChild>
                            <Link href="/financials/payroll-calculator">
                                <Calculator className="ms-2 h-4 w-4" />
                                محاسبه حقوق جدید
                            </Link>
                        </Button>
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
                                    <TableCell>{formatDate(record.calculationDate)}</TableCell>
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
                                                 <DropdownMenuItem onClick={() => handleEditPayroll(record.id)}>
                                                    <Edit className="ms-2 h-4 w-4" />
                                                    ویرایش
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
                    <DialogContent className="sm:max-w-lg font-body">
                       <PayslipDisplay payslip={selectedPayslip} personnel={personnel.find(p => p.id === selectedPayslip.personnelId)} />
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
