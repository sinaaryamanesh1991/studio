'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useData } from '@/context/data-context';
import { useToast } from '@/hooks/use-toast';
import type { CompanyInfo, Personnel, PayrollRecord, WorkLog, PayrollSettings } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Users, Clock, Receipt, Search, Printer, Save, Settings } from 'lucide-react';
import PayrollListPage from './payroll-list-content';
import { useState, useMemo } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format, toDate } from 'date-fns-jalali';
import { faIR } from 'date-fns/locale';
import { format as formatEn } from 'date-fns';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';

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

// Helper to calculate hours worked
const calculateHours = (entry: string, exit: string): number => {
    if (!entry || !exit) return 0;
    try {
        const [entryH, entryM] = entry.split(':').map(Number);
        const [exitH, exitM] = exit.split(':').map(Number);
        const entryDate = new Date(0, 0, 0, entryH, entryM);
        const exitDate = new Date(0, 0, 0, exitH, exitM);
        let diff = (exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60);
        if (diff < 0) diff += 24; // Handle overnight shifts
        return Math.round(diff * 100) / 100; // Round to 2 decimal places
    } catch {
        return 0;
    }
};

function WorkHoursContent() {
    const { personnel, workLogs, setWorkLogs } = useData();
    const { toast } = useToast();
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const dateString = formatEn(selectedDate, 'yyyy-MM-dd');

    const dailyLogs = useMemo(() => {
        const logsForDate = workLogs.filter(log => log.date === dateString);
        
        return personnel.map(p => {
            const existingLog = logsForDate.find(log => log.personnelId === p.id);
            return {
                personnelId: p.id,
                name: `${p.name} ${p.familyName}`,
                entryTime: existingLog?.entryTime || '',
                exitTime: existingLog?.exitTime || '',
                hoursWorked: existingLog ? calculateHours(existingLog.entryTime, existingLog.exitTime) : 0,
            };
        });
    }, [personnel, workLogs, dateString]);

    const [editableLogs, setEditableLogs] = useState(dailyLogs);

    // Update editable logs when date or personnel changes
    useMemo(() => {
        setEditableLogs(dailyLogs);
    }, [dailyLogs]);

    const handleTimeChange = (personnelId: string, field: 'entryTime' | 'exitTime', value: string) => {
        setEditableLogs(prev => prev.map(log => {
            if (log.personnelId === personnelId) {
                const updatedLog = { ...log, [field]: value };
                return { ...updatedLog, hoursWorked: calculateHours(updatedLog.entryTime, updatedLog.exitTime) };
            }
            return log;
        }));
    };

    const handleSaveLogs = () => {
        const updatedLogs: WorkLog[] = [];
        const otherDayLogs = workLogs.filter(log => log.date !== dateString);

        editableLogs.forEach(log => {
            if (log.entryTime && log.exitTime) {
                updatedLogs.push({
                    id: `${log.personnelId}-${dateString}`,
                    personnelId: log.personnelId,
                    date: dateString,
                    entryTime: log.entryTime,
                    exitTime: log.exitTime,
                    hoursWorked: log.hoursWorked,
                });
            }
        });

        setWorkLogs([...otherDayLogs, ...updatedLogs]);
        toast({ title: 'موفقیت', description: 'ساعات کاری با موفقیت ذخیره شد.' });
    };
    
    return (
        <Card>
            <CardHeader className="flex-row justify-between items-start">
                 <div>
                    <CardTitle>ثبت ورود و خروج روزانه</CardTitle>
                    <CardDescription>
                        ساعات ورود و خروج پرسنل را برای تاریخ انتخاب شده وارد کنید.
                    </CardDescription>
                </div>
                 <div className="flex items-center gap-4">
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-[280px] justify-start text-left font-normal",
                                !selectedDate && "text-muted-foreground"
                            )}
                            >
                            <CalendarIcon className="ml-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, 'PPP', {locale: faIR}) : <span>انتخاب تاریخ</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                locale={faIR}
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => date && setSelectedDate(date)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <Button onClick={handleSaveLogs}>
                        <Save className="ms-2 h-4 w-4" />
                        ذخیره تغییرات
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>نام پرسنل</TableHead>
                            <TableHead>ساعت ورود</TableHead>
                            <TableHead>ساعت خروج</TableHead>
                            <TableHead>جمع ساعات کارکرد</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {editableLogs.map(log => (
                            <TableRow key={log.personnelId}>
                                <TableCell className="font-medium">{log.name}</TableCell>
                                <TableCell>
                                    <Input 
                                        type="time" 
                                        className="w-32" 
                                        value={log.entryTime}
                                        onChange={(e) => handleTimeChange(log.personnelId, 'entryTime', e.target.value)}
                                    />
                                </TableCell>
                                 <TableCell>
                                    <Input 
                                        type="time" 
                                        className="w-32"
                                        value={log.exitTime}
                                        onChange={(e) => handleTimeChange(log.personnelId, 'exitTime', e.target.value)}
                                    />
                                </TableCell>
                                 <TableCell>
                                    <span className="font-mono text-lg">{log.hoursWorked.toFixed(2)}</span>
                                    <span className="text-xs text-muted-foreground mr-1">ساعت</span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

function PayslipDisplay({ payslip, personnel }: { payslip: PayrollRecord, personnel: Personnel }) {
    const { toast } = useToast();

    const handlePrint = () => {
        toast({
            title: "قابلیت چاپ در دست ساخت",
            description: "امکان چاپ و خروجی PDF به زودی اضافه خواهد شد.",
        });
    };
    
    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'yyyy/MM/dd');
        } catch(e) {
            return dateString;
        }
    }

    return (
        <Card className="mt-6">
            <CardHeader className="flex flex-row justify-between items-center">
                <div>
                    <CardTitle>فیش حقوقی - {payslip.personnelName}</CardTitle>
                    <CardDescription>
                        تاریخ محاسبه: {formatDate(payslip.calculationDate)}
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

function PayslipContent() {
    const { payrollRecords, personnel } = useData();
    const [personnelId, setPersonnelId] = useState('');
    const [foundPayslip, setFoundPayslip] = useState<PayrollRecord | null>(null);
    const [foundPersonnel, setFoundPersonnel] = useState<Personnel | null>(null);
    const [noRecordFound, setNoRecordFound] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setNoRecordFound(false);
        setFoundPayslip(null);
        setFoundPersonnel(null);

        const records = payrollRecords.filter(p => p.personnelId === personnelId).sort((a, b) => new Date(b.calculationDate).getTime() - new Date(a.calculationDate).getTime());
        if (records.length > 0) {
            setFoundPayslip(records[0]); // Get the latest record
            const person = personnel.find(p => p.id === personnelId);
            setFoundPersonnel(person || null);
        } else {
            setNoRecordFound(true);
        }
    };
    

    return (
        <>
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
            ) : noRecordFound ? (
                <div className="text-center py-16 text-muted-foreground">
                    فیش حقوقی مورد نظر یافت نشد یا هنوز محاسبه‌ای برای این پرسنل ثبت نشده است.
                </div>
            ) : null}
        </>
    );
}

function PayrollSettingsForm() {
    const { payrollSettings, setPayrollSettings } = useData();
    const { toast } = useToast();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const newSettings: PayrollSettings = {
            baseHourlyRate: Number(formData.get('baseHourlyRate')),
            overtimeMultiplier: Number(formData.get('overtimeMultiplier')),
        };
        setPayrollSettings(newSettings);
        toast({ title: 'موفقیت', description: 'تنظیمات حقوق و دستمزد با موفقیت ذخیره شد.' });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>تنظیمات حقوق و دستمزد</CardTitle>
                <CardDescription>
                    پارامترهای پایه برای محاسبه حقوق را بر اساس قوانین کار تنظیم کنید.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="baseHourlyRate">پایه حقوق قانون کار (ساعتی)</Label>
                        <Input id="baseHourlyRate" name="baseHourlyRate" type="number" defaultValue={payrollSettings?.baseHourlyRate} placeholder="مثال: 33299" />
                        <p className="text-xs text-muted-foreground">این مبلغ به عنوان نرخ پیش‌فرض ساعتی در محاسبه‌گر حقوق استفاده می‌شود.</p>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="overtimeMultiplier">ضریب اضافه کاری</Label>
                        <Input id="overtimeMultiplier" name="overtimeMultiplier" type="number" step="0.1" defaultValue={payrollSettings?.overtimeMultiplier} placeholder="مثال: 1.4" />
                         <p className="text-xs text-muted-foreground">طبق قانون کار، این ضریب معمولا ۱.۴ است.</p>
                    </div>
                    <Button type="submit">ذخیره تنظیمات</Button>
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
            
            <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-6 mb-6">
                    <TabsTrigger value="info">اطلاعات پایه</TabsTrigger>
                    <TabsTrigger value="payroll-settings">تنظیمات حقوق</TabsTrigger>
                    <TabsTrigger value="personnel">اطلاعات پرسنل</TabsTrigger>
                    <TabsTrigger value="work-hours">ساعت کاری</TabsTrigger>
                    <TabsTrigger value="list">لیست حقوق</TabsTrigger>
                    <TabsTrigger value="payslip">فیش حقوقی</TabsTrigger>
                </TabsList>
                
                <TabsContent value="info">
                    <CompanyInfoForm />
                </TabsContent>
                 <TabsContent value="payroll-settings">
                    <PayrollSettingsForm />
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
                    <WorkHoursContent />
                </TabsContent>
                <TabsContent value="list">
                    <PayrollListPage />
                </TabsContent>
                 <TabsContent value="payslip">
                    <PayslipContent />
                </TabsContent>
            </Tabs>
        </>
    );
}
