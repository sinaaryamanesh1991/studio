'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useData } from '@/context/data-context';
import type { PayrollRecord, Personnel } from '@/lib/types';
import { Search, Printer } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

function PayslipDisplay({ payslip, personnel }: { payslip: PayrollRecord, personnel: Personnel }) {
    const { toast } = useToast();

    const handlePrint = () => {
        toast({
            title: "قابلیت چاپ در دست ساخت",
            description: "امکان چاپ و خروجی PDF به زودی اضافه خواهد شد.",
        });
        // window.print(); // This would be the actual print logic
    };

    return (
        <Card className="mt-6">
            <CardHeader className="flex flex-row justify-between items-center">
                <div>
                    <CardTitle>فیش حقوقی - {payslip.personnelName}</CardTitle>
                    <CardDescription>
                        تاریخ محاسبه: {payslip.calculationDate}
                    </CardDescription>
                </div>
                <Button onClick={handlePrint} variant="outline">
                    <Printer className="ms-2 h-4 w-4" />
                    چاپ
                </Button>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                    <div><span className="text-muted-foreground">کد پرسنلی: </span><span className="font-mono">{personnel.id}</span></div>
                    <div><span className="text-muted-foreground">کد ملی: </span><span className="font-mono">{personnel.nationalId}</span></div>
                    <div><span className="text-muted-foreground">شماره حساب: </span><span className="font-mono">{personnel.accountNumber}</span></div>
                    <div><span className="text-muted-foreground">شماره بیمه: </span><span className="font-mono">{personnel.insuranceNumber}</span></div>
                </div>

                <Separator />
                <div className="font-bold text-base my-4">اطلاعات کارکرد:</div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">نرخ ساعتی:</span>
                    <span className="font-mono">{payslip.hourlyRate.toLocaleString('fa-IR')} تومان</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">ساعت ورود:</span>
                    <span className="font-mono">{payslip.entryTime}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">ساعت خروج:</span>
                    <span className="font-mono">{payslip.exitTime}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">ساعات کارکرد عادی:</span>
                    <span className="font-mono">{payslip.hoursWorked}</span>
                </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">ساعات اضافه کاری:</span>
                    <span className="font-mono">{payslip.overtimeHours}</span>
                </div>
                <Separator />
                <div className="font-bold text-base my-4">محاسبات حقوق:</div>

                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">مبلغ تعطیل کاری:</span>
                    <span className="font-mono text-green-600">{`+ ${payslip.holidayPay.toLocaleString('fa-IR')}`}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">مبلغ اضافه کاری:</span>
                    <span className="font-mono text-green-600">{`+ ${payslip.overtimePay.toLocaleString('fa-IR')}`}</span>
                </div>
                <div className="flex justify-between items-center font-bold">
                    <span className="text-muted-foreground">حقوق ناخالص:</span>
                    <span className="font-mono">{payslip.grossPay.toLocaleString('fa-IR')} تومان</span>
                </div>
                 <Separator />
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">مجموع کسورات:</span>
                    <span className="font-mono text-destructive">{`- ${payslip.deductions.toLocaleString('fa-IR')}`}</span>
                </div>
                 <Separator />
                 <div className="flex justify-between items-center font-extrabold text-lg bg-muted -mx-6 px-6 py-3">
                    <span>پرداختی نهایی:</span>
                    <span className="font-mono text-primary">{payslip.netPay.toLocaleString('fa-IR')} تومان</span>
                </div>
            </CardContent>
        </Card>
    )
}

export default function PayslipPage() {
    const { payrollRecords, personnel } = useData();
    const [personnelId, setPersonnelId] = useState('');
    const [foundPayslip, setFoundPayslip] = useState<PayrollRecord | null>(null);
    const [foundPersonnel, setFoundPersonnel] = useState<Personnel | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const records = payrollRecords.filter(p => p.personnelId === personnelId).sort((a, b) => new Date(b.calculationDate).getTime() - new Date(a.calculationDate).getTime());
        if (records.length > 0) {
            setFoundPayslip(records[0]); // Get the latest record
            const person = personnel.find(p => p.id === personnelId);
            setFoundPersonnel(person || null);
        } else {
            setFoundPayslip(null);
            setFoundPersonnel(null);
        }
    };
    

    return (
        <>
            <PageHeader title="مشاهده و چاپ فیش حقوقی" />
            <Card>
                <CardHeader>
                    <CardTitle>جستجوی فیش حقوقی</CardTitle>
                    <CardDescription>
                        شماره پرسنلی کارمند مورد نظر را برای مشاهده آخرین فیش حقوقی او وارد کنید.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="flex items-end gap-4">
                        <div className="flex-grow">
                            <Label htmlFor="personnelId">شماره پرسنلی</Label>
                            <Input 
                                id="personnelId" 
                                value={personnelId} 
                                onChange={(e) => setPersonnelId(e.target.value)} 
                                placeholder="مثال: p001"
                            />
                        </div>
                        <Button type="submit">
                            <Search className="ms-2 h-4 w-4" />
                            جستجو
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {foundPayslip && foundPersonnel ? (
                <PayslipDisplay payslip={foundPayslip} personnel={foundPersonnel}/>
            ) : (
                <div className="text-center py-16 text-muted-foreground">
                    فیش حقوقی مورد نظر یافت نشد یا هنوز محاسبه‌ای برای این پرسنل ثبت نشده است.
                </div>
            )}
        </>
    );
}
