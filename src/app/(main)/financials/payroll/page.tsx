'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCollection, useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import type { CompanyInfo, Personnel, PayrollRecord, WorkLog, PayrollSettings } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Users, Clock, Receipt, Search, Printer, Save, Settings } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns-jalali';
import { faIR } from 'date-fns-jalali/locale';
import { format as formatEn, parse as parseEn } from 'date-fns';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import PayrollListPage from './payroll-list-content';
import { collection, doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

function CompanyInfoForm() {
    const { firestore, user } = useFirebase();
    const estateId = user?.uid;
    const companyInfoQuery = useMemoFirebase(() => estateId ? doc(firestore, 'estates', estateId, 'companyInfo', 'default') : null, [firestore, estateId]);
    const { data: companyInfo, isLoading } = useDoc<CompanyInfo>(companyInfoQuery);
    const { toast } = useToast();
    
    const [formData, setFormData] = useState<Partial<CompanyInfo>>({});

    useEffect(() => {
        if (companyInfo) {
            setFormData(companyInfo);
        }
    }, [companyInfo]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!estateId) return;
        const companyInfoRef = doc(firestore, 'estates', estateId, 'companyInfo', 'default');
        const dataToSave = { ...formData, estateId };
        setDocumentNonBlocking(companyInfoRef, dataToSave, { merge: true });
        toast({ title: 'موفقیت', description: 'اطلاعات پایه با موفقیت ذخیره شد.' });
    };

    if (isLoading) return <div>در حال بارگذاری...</div>

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
                        <Input id="name" name="name" value={formData?.name || ''} onChange={handleChange} placeholder="مثال: شهرک سینا" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="defaultEntryTime">ساعت ورود پیش‌فرض</Label>
                            <Input id="defaultEntryTime" name="defaultEntryTime" type="time" value={formData?.defaultEntryTime || '08:00'}  onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="defaultExitTime">ساعت خروج پیش‌فرض</Label>
                            <Input id="defaultExitTime" name="defaultExitTime" type="time" value={formData?.defaultExitTime || '17:00'} onChange={handleChange} />
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
    const { firestore, user } = useFirebase();
    const estateId = user?.uid;

    const personnelQuery = useMemoFirebase(() => estateId ? collection(firestore, 'estates', estateId, 'personnel') : null, [firestore, estateId]);
    const { data: personnel, isLoading: loadingPersonnel } = useCollection<Personnel>(personnelQuery);

    const workLogsQuery = useMemoFirebase(() => estateId ? collection(firestore, 'estates', estateId, 'workLogs') : null, [firestore, estateId]);
    const { data: workLogs, isLoading: loadingWorkLogs } = useCollection<WorkLog>(workLogsQuery);

    const { toast } = useToast();
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const dateStringForDb = formatEn(selectedDate, 'yyyy-MM-dd');

    const dailyLogs = useMemo(() => {
        if (!personnel || !workLogs) return [];
        const logsForDate = workLogs.filter(log => log.date === dateStringForDb);
        
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
    }, [personnel, workLogs, dateStringForDb]);

    const [editableLogs, setEditableLogs] = useState(dailyLogs);

    useEffect(() => {
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
        if (!estateId) return;

        editableLogs.forEach(log => {
            if (log.entryTime && log.exitTime) {
                const logId = `${log.personnelId}-${dateStringForDb}`;
                const logRef = doc(firestore, 'estates', estateId, 'workLogs', logId);
                const dataToSave: WorkLog = {
                    id: logId,
                    personnelId: log.personnelId,
                    date: dateStringForDb,
                    entryTime: log.entryTime,
                    exitTime: log.exitTime,
                    hoursWorked: log.hoursWorked,
                    estateId
                };
                setDocumentNonBlocking(logRef, dataToSave, { merge: true });
            }
        });
        toast({ title: 'موفقیت', description: 'ساعات کاری با موفقیت ذخیره شد.' });
    };

    if(loadingPersonnel || loadingWorkLogs) {
        return <div>در حال بارگذاری...</div>;
    }
    
    return (
        <Card>
            <CardHeader className="flex-col md:flex-row justify-between items-start md:items-center gap-4">
                 <div>
                    <CardTitle>ثبت ورود و خروج روزانه</CardTitle>
                    <CardDescription>
                        ساعات ورود و خروج پرسنل را برای تاریخ انتخاب شده وارد کنید.
                    </CardDescription>
                </div>
                 <div className="flex flex-col sm:flex-row items-center gap-4">
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full sm:w-[280px] justify-start text-left font-normal",
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
                    <Button onClick={handleSaveLogs} className="w-full sm:w-auto">
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

export function PayslipDisplay({ payslip, personnel }: { payslip: PayrollRecord, personnel: Personnel | null | undefined }) {
    const { toast } = useToast();

    const handlePrint = () => {
        toast({
            title: "قابلیت چاپ در دست ساخت",
            description: "امکان چاپ و خروجی PDF به زودی اضافه خواهد شد.",
        });
    };
    
    const formatDate = (dateString: string) => {
        if (!dateString) return "نامشخص";
        try {
            const date = parseEn(dateString, 'yyyy-MM-dd', new Date());
             if (isNaN(date.getTime())) return dateString; // fallback
            return format(date, 'yyyy/MM/dd', { locale: faIR });
        } catch {
            return dateString; // fallback
        }
    }

    if (!personnel) {
        return <div className="text-center py-16 text-muted-foreground">اطلاعات پرسنل یافت نشد.</div>
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
                    <span className="text-muted-foreground">کسر بابت تأخیر:</span>
                    <span className="font-mono text-destructive">{`- ${payslip.latenessDeduction.toLocaleString('fa-IR')}`}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">سایر کسورات:</span>
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
    const { firestore, user } = useFirebase();
    const estateId = user?.uid;

    const payrollRecordsQuery = useMemoFirebase(() => estateId ? collection(firestore, 'estates', estateId, 'payrollRecords') : null, [firestore, estateId]);
    const { data: payrollRecords, isLoading: loadingPayroll } = useCollection<PayrollRecord>(payrollRecordsQuery);

    const personnelQuery = useMemoFirebase(() => estateId ? collection(firestore, 'estates', estateId, 'personnel') : null, [firestore, estateId]);
    const { data: personnel, isLoading: loadingPersonnel } = useCollection<Personnel>(personnelQuery);

    const [personnelId, setPersonnelId] = useState('');
    const [foundPayslip, setFoundPayslip] = useState<PayrollRecord | null>(null);
    const [foundPersonnel, setFoundPersonnel] = useState<Personnel | null>(null);
    const [noRecordFound, setNoRecordFound] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setNoRecordFound(false);
        setFoundPayslip(null);
        setFoundPersonnel(null);

        if (!payrollRecords || !personnel) return;

        const records = payrollRecords.filter(p => p.personnelId === personnelId).sort((a, b) => new Date(b.calculationDate).getTime() - new Date(a.calculationDate).getTime());
        if (records.length > 0) {
            setFoundPayslip(records[0]); // Get the latest record
            const person = personnel.find(p => p.id === personnelId);
            setFoundPersonnel(person || null);
        } else {
            setNoRecordFound(true);
        }
    };
    
    if (loadingPayroll || loadingPersonnel) {
        return <div>در حال بارگذاری...</div>;
    }

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
    const { firestore, user } = useFirebase();
    const estateId = user?.uid;
    const payrollSettingsQuery = useMemoFirebase(() => estateId ? doc(firestore, 'estates', estateId, 'payrollSettings', 'default') : null, [firestore, estateId]);
    const { data: payrollSettings, isLoading } = useDoc<PayrollSettings>(payrollSettingsQuery);
    const { toast } = useToast();
    const [formData, setFormData] = useState<Partial<PayrollSettings>>({
        baseHourlyRate: 33299,
        overtimeMultiplier: 1.4,
        maxAllowedLateness: 15,
        latenessPenaltyAmount: 0
    });

    useEffect(() => {
        if(payrollSettings) {
            setFormData(payrollSettings);
        }
    }, [payrollSettings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!estateId) return;
        const settingsRef = doc(firestore, 'estates', estateId, 'payrollSettings', 'default');
        const dataToSave = { 
            ...formData, 
            estateId, 
            baseHourlyRate: Number(formData.baseHourlyRate), 
            overtimeMultiplier: Number(formData.overtimeMultiplier),
            maxAllowedLateness: Number(formData.maxAllowedLateness),
            latenessPenaltyAmount: Number(formData.latenessPenaltyAmount),
        };
        setDocumentNonBlocking(settingsRef, dataToSave, { merge: true });
        toast({ title: 'موفقیت', description: 'تنظیمات حقوق و دستمزد با موفقیت ذخیره شد.' });
    };

    if (isLoading) return <div>در حال بارگذاری...</div>;

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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="baseHourlyRate">پایه حقوق قانون کار (ساعتی)</Label>
                            <Input id="baseHourlyRate" name="baseHourlyRate" type="number" value={formData.baseHourlyRate || ''} onChange={handleChange} placeholder="مثال: 33299" />
                            <p className="text-xs text-muted-foreground">این مبلغ به عنوان نرخ پیش‌فرض ساعتی در محاسبه‌گر حقوق استفاده می‌شود.</p>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="overtimeMultiplier">ضریب اضافه کاری</Label>
                            <Input id="overtimeMultiplier" name="overtimeMultiplier" type="number" step="0.1" value={formData.overtimeMultiplier || ''} onChange={handleChange} placeholder="مثال: 1.4" />
                             <p className="text-xs text-muted-foreground">طبق قانون کار، این ضریب معمولا ۱.۴ است.</p>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="maxAllowedLateness">حداکثر تأخیر مجاز (دقیقه)</Label>
                            <Input id="maxAllowedLateness" name="maxAllowedLateness" type="number" value={formData.maxAllowedLateness || ''} onChange={handleChange} placeholder="مثال: 15" />
                             <p className="text-xs text-muted-foreground">تأخیر بیشتر از این مقدار شامل جریمه می‌شود.</p>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="latenessPenaltyAmount">مبلغ جریمه تأخیر (تومان)</Label>
                            <Input id="latenessPenaltyAmount" name="latenessPenaltyAmount" type="number" value={formData.latenessPenaltyAmount || ''} onChange={handleChange} placeholder="مثال: 50000" />
                             <p className="text-xs text-muted-foreground">این مبلغ در صورت تأخیر غیرمجاز از حقوق کسر می‌شود.</p>
                        </div>
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
                <TabsList className="grid w-full grid-cols-3 md:grid-cols-3 lg:grid-cols-6 mb-6">
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
