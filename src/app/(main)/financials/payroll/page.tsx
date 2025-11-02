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
import { format, getDaysInMonth, startOfMonth } from 'date-fns-jalali';
import { faIR } from 'date-fns-jalali/locale';
import { format as formatEn, parse as parseEn } from 'date-fns';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import PayrollListPage from './payroll-list-content';
import { collection, doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    
    const today = new Date();
    const currentJalaliYear = parseInt(format(today, 'yyyy'));
    const currentJalaliMonth = parseInt(format(today, 'M'));

    const personnelQuery = useMemoFirebase(() => estateId ? collection(firestore, 'estates', estateId, 'personnel') : null, [firestore, estateId]);
    const { data: personnel, isLoading: loadingPersonnel } = useCollection<Personnel>(personnelQuery);

    const companyInfoQuery = useMemoFirebase(() => estateId ? doc(firestore, 'estates', estateId, 'companyInfo', 'default') : null, [firestore, estateId]);
    const { data: companyInfo, isLoading: loadingCompanyInfo } = useDoc<CompanyInfo>(companyInfoQuery);

    const { toast } = useToast();
    const [selectedPersonnelId, setSelectedPersonnelId] = useState<string>('');
    const [selectedYear, setSelectedYear] = useState<number>(currentJalaliYear);
    const [selectedMonth, setSelectedMonth] = useState<number>(currentJalaliMonth);

    const workLogId = selectedPersonnelId ? `${selectedPersonnelId}-${selectedYear}-${String(selectedMonth).padStart(2, '0')}` : null;
    const workLogQuery = useMemoFirebase(() => (estateId && workLogId) ? doc(firestore, 'estates', estateId, 'workLogs', workLogId) : null, [estateId, workLogId]);
    const { data: workLog, isLoading: loadingWorkLog } = useDoc<WorkLog>(workLogQuery);

    const [monthlyLogs, setMonthlyLogs] = useState<WorkLog['days']>([]);
    
    const standardWorkHours = useMemo(() => {
        if (!companyInfo) return 8; // Default to 8 hours
        return calculateHours(companyInfo.defaultEntryTime, companyInfo.defaultExitTime);
    }, [companyInfo]);

    useEffect(() => {
        if (selectedPersonnelId && !loadingWorkLog && !loadingCompanyInfo) {
            const daysInMonth = getDaysInMonth(new Date(selectedYear, selectedMonth - 1));
            const newLogs = Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const existingLog = workLog?.days.find(d => d.day === day);
                return existingLog || {
                    day,
                    entryTime: '',
                    exitTime: '',
                    hoursWorked: 0,
                    overtimeHours: 0,
                    holidayHours: 0,
                    nightWorkHours: 0,
                };
            });
            setMonthlyLogs(newLogs);
        } else if (!selectedPersonnelId) {
            setMonthlyLogs([]);
        }
    }, [selectedPersonnelId, selectedYear, selectedMonth, workLog, loadingWorkLog, loadingCompanyInfo]);


    const handleTimeChange = (day: number, field: 'entryTime' | 'exitTime', value: string) => {
        setMonthlyLogs(prev => prev.map(log => {
            if (log.day === day) {
                const updatedLog = { ...log, [field]: value };
                const hoursWorked = calculateHours(updatedLog.entryTime, updatedLog.exitTime);

                const date = new Date(selectedYear, selectedMonth - 1, day);
                const dayName = format(date, 'EEEE', { locale: faIR });
                // TODO: Add a proper holiday calendar check instead of just Friday
                const isHoliday = dayName === 'جمعه'; 

                let overtimeHours = 0;
                let holidayHours = 0;
                let nightWorkHours = 0; // Simplified night work calculation

                if (isHoliday) {
                    holidayHours = hoursWorked;
                } else {
                    if (hoursWorked > standardWorkHours) {
                        overtimeHours = hoursWorked - standardWorkHours;
                    }
                }
                
                return { ...updatedLog, hoursWorked, overtimeHours, holidayHours, nightWorkHours };
            }
            return log;
        }));
    };

    const handleSaveLogs = () => {
        if (!estateId || !selectedPersonnelId || !workLogId) return;

        const logRef = doc(firestore, 'estates', estateId, 'workLogs', workLogId);
        const dataToSave: WorkLog = {
            id: workLogId,
            personnelId: selectedPersonnelId,
            year: selectedYear,
            month: selectedMonth,
            days: monthlyLogs.filter(log => log.entryTime && log.exitTime), // Only save days with data
            estateId
        };
        setDocumentNonBlocking(logRef, dataToSave, { merge: true });
        toast({ title: 'موفقیت', description: 'ساعات کاری ماه با موفقیت ذخیره شد.' });
    };

    const isLoading = loadingPersonnel || loadingWorkLog || loadingCompanyInfo;
    
    const years = Array.from({ length: 5 }, (_, i) => currentJalaliYear - i);
    const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, name: format(new Date(2000, i, 1), 'LLLL', { locale: faIR }) }));

    return (
        <Card>
            <CardHeader className="flex-col md:flex-row justify-between items-start md:items-center gap-4">
                 <div>
                    <CardTitle>ثبت کارکرد ماهانه پرسنل</CardTitle>
                    <CardDescription>
                        ساعات کاری پرسنل را برای ماه انتخاب شده وارد و ذخیره کنید.
                    </CardDescription>
                </div>
                 <div className="flex flex-col sm:flex-row items-center gap-4">
                     <Button onClick={handleSaveLogs} className="w-full sm:w-auto" disabled={!selectedPersonnelId || isLoading}>
                        <Save className="ms-2 h-4 w-4" />
                        ذخیره تغییرات
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 border rounded-lg">
                    <div className="space-y-2">
                        <Label>انتخاب پرسنل</Label>
                        <Select onValueChange={setSelectedPersonnelId} value={selectedPersonnelId} disabled={loadingPersonnel}>
                             <SelectTrigger>
                                <SelectValue placeholder="یکی از پرسنل را انتخاب کنید" />
                            </SelectTrigger>
                            <SelectContent>
                                {personnel?.map(p => <SelectItem key={p.id} value={p.id}>{p.name} {p.familyName}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label>انتخاب سال</Label>
                        <Select onValueChange={(v) => setSelectedYear(Number(v))} value={String(selectedYear)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label>انتخاب ماه</Label>
                         <Select onValueChange={(v) => setSelectedMonth(Number(v))} value={String(selectedMonth)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {months.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {isLoading && <p>در حال بارگذاری اطلاعات...</p>}

                {!isLoading && selectedPersonnelId && (
                     <div className='overflow-x-auto'>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>روز</TableHead>
                                <TableHead>تاریخ</TableHead>
                                <TableHead>ساعت ورود</TableHead>
                                <TableHead>ساعت خروج</TableHead>
                                <TableHead>اضافه‌کاری (خودکار)</TableHead>
                                <TableHead>تعطیل‌کاری (خودکار)</TableHead>
                                <TableHead>جمع ساعات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                           {monthlyLogs.map((log) => {
                               const date = new Date(selectedYear, selectedMonth - 1, log.day);
                               const dayName = format(date, 'EEEE', { locale: faIR });
                               const isHoliday = dayName === 'جمعه';

                               return (
                                    <TableRow key={log.day} className={cn(isHoliday && 'bg-muted/50')}>
                                        <TableCell className="font-medium">
                                            {log.day}
                                            <span className="text-xs text-muted-foreground mr-1">({dayName})</span>
                                        </TableCell>
                                        <TableCell>{format(date, 'yyyy/MM/dd')}</TableCell>
                                        <TableCell>
                                            <Input 
                                                type="time" 
                                                className="w-32" 
                                                value={log.entryTime}
                                                onChange={(e) => handleTimeChange(log.day, 'entryTime', e.target.value)}
                                            />
                                        </TableCell>
                                         <TableCell>
                                            <Input 
                                                type="time" 
                                                className="w-32"
                                                value={log.exitTime}
                                                onChange={(e) => handleTimeChange(log.day, 'exitTime', e.target.value)}
                                            />
                                        </TableCell>
                                         <TableCell>
                                            <span className="font-mono text-base">{log.overtimeHours > 0 ? log.overtimeHours.toFixed(2) : '-'}</span>
                                        </TableCell>
                                         <TableCell>
                                            <span className="font-mono text-base">{log.holidayHours > 0 ? log.holidayHours.toFixed(2) : '-'}</span>
                                        </TableCell>
                                         <TableCell>
                                            <span className="font-mono text-lg">{log.hoursWorked.toFixed(2)}</span>
                                            <span className="text-xs text-muted-foreground mr-1">ساعت</span>
                                        </TableCell>
                                    </TableRow>
                               );
                           })}
                        </TableBody>
                    </Table>
                    </div>
                )}

                 {!isLoading && !selectedPersonnelId && (
                     <div className="text-center py-16 text-muted-foreground">
                         لطفا برای مشاهده و ثبت کارکرد، یکی از پرسنل را انتخاب کنید.
                    </div>
                 )}
            </CardContent>
        </Card>
    );
}

export function PayslipDisplay({ payslip, personnel }: { payslip: Partial<PayrollRecord>, personnel: Personnel | null | undefined }) {
    const { toast } = useToast();

    const handlePrint = () => {
        toast({
            title: "قابلیت چاپ در دست ساخت",
            description: "امکان چاپ و خروجی PDF به زودی اضافه خواهد شد.",
        });
    };
    
    const formatDate = (dateString: string | undefined) => {
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
                <div className="font-bold text-base my-4">خلاصه کارکرد:</div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">کل ساعات کاری:</span>
                    <span className="font-mono">{payslip.totalHoursWorked?.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">کل ساعات اضافه‌کاری:</span>
                    <span className="font-mono">{payslip.totalOvertimeHours?.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">کل ساعات تعطیل‌کاری:</span>
                    <span className="font-mono">{payslip.totalHolidayHours?.toFixed(2)}</span>
                </div>

                <Separator />
                <div className="font-bold text-base my-4">مزایا و پرداخت‌ها:</div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">حقوق پایه:</span>
                    <span className="font-mono text-green-600">{`+ ${payslip.baseSalaryPay?.toLocaleString('fa-IR') || 0}`}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">مبلغ اضافه‌کاری:</span>
                    <span className="font-mono text-green-600">{`+ ${payslip.overtimePay?.toLocaleString('fa-IR') || 0}`}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">مبلغ تعطیل‌کاری:</span>
                    <span className="font-mono text-green-600">{`+ ${payslip.holidayPay?.toLocaleString('fa-IR') || 0}`}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">حق مسکن:</span>
                    <span className="font-mono text-green-600">{`+ ${payslip.housingAllowance?.toLocaleString('fa-IR') || 0}`}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">حق خوار و بار:</span>
                    <span className="font-mono text-green-600">{`+ ${payslip.foodAllowance?.toLocaleString('fa-IR') || 0}`}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">حق اولاد:</span>
                    <span className="font-mono text-green-600">{`+ ${payslip.childAllowance?.toLocaleString('fa-IR') || 0}`}</span>
                </div>
                <div className="flex justify-between items-center font-bold">
                    <span className="text-muted-foreground">حقوق ناخالص:</span>
                    <span className="font-mono">{payslip.grossPay?.toLocaleString('fa-IR')} تومان</span>
                </div>
                 <Separator />
                <div className="font-bold text-base my-4">کسورات:</div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">کسر بیمه (7%):</span>
                    <span className="font-mono text-destructive">{`- ${payslip.insuranceDeduction?.toLocaleString('fa-IR') || 0}`}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">کسر مالیات:</span>
                    <span className="font-mono text-destructive">{`- ${payslip.taxDeduction?.toLocaleString('fa-IR') || 0}`}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">کسر بابت تأخیر:</span>
                    <span className="font-mono text-destructive">{`- ${payslip.latenessDeduction?.toLocaleString('fa-IR') || 0}`}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">سایر کسورات:</span>
                    <span className="font-mono text-destructive">{`- ${payslip.otherDeductions?.toLocaleString('fa-IR') || 0}`}</span>
                </div>
                 <Separator />
                 <div className="flex justify-between items-center font-extrabold text-lg bg-muted -mx-6 px-6 py-3">
                    <span>پرداختی نهایی:</span>
                    <span className="font-mono text-primary">{payslip.netPay?.toLocaleString('fa-IR')} تومان</span>
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
        baseSalaryOfMonth: 71661840, // For 1403
        overtimeMultiplier: 1.4,
        nightWorkMultiplier: 1.35,
        holidayWorkMultiplier: 1.9,
        childAllowance: 7166184,
        housingAllowance: 9000000,
        foodAllowance: 14000000,
        insuranceDeductionPercentage: 7,
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
        
        const dataToSave = Object.fromEntries(
             Object.entries(formData).map(([key, value]) => [key, Number(value)])
        );

        setDocumentNonBlocking(settingsRef, { ...dataToSave, estateId }, { merge: true });
        toast({ title: 'موفقیت', description: 'تنظیمات حقوق و دستمزد با موفقیت ذخیره شد.' });
    };

    if (isLoading) return <div>در حال بارگذاری...</div>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>تنظیمات جامع حقوق و دستمزد</CardTitle>
                <CardDescription>
                    پارامترهای پایه برای محاسبه حقوق را بر اساس قوانین کار سال جاری تنظیم کنید.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                     {/* Allowances */}
                    <div>
                        <h3 className="text-lg font-medium mb-4 border-b pb-2">مزایا (مبالغ ماهانه به ریال)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="baseSalaryOfMonth">پایه حقوق قانون کار (ماهانه)</Label>
                                <Input id="baseSalaryOfMonth" name="baseSalaryOfMonth" type="number" value={formData.baseSalaryOfMonth || ''} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="housingAllowance">حق مسکن</Label>
                                <Input id="housingAllowance" name="housingAllowance" type="number" value={formData.housingAllowance || ''} onChange={handleChange} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="foodAllowance">بن خوار و بار</Label>
                                <Input id="foodAllowance" name="foodAllowance" type="number" value={formData.foodAllowance || ''} onChange={handleChange} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="childAllowance">حق اولاد (به ازای هر فرزند)</Label>
                                <Input id="childAllowance" name="childAllowance" type="number" value={formData.childAllowance || ''} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                    
                    {/* Multipliers */}
                    <div>
                        <h3 className="text-lg font-medium mb-4 border-b pb-2">ضرایب</h3>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="overtimeMultiplier">ضریب اضافه کاری</Label>
                                <Input id="overtimeMultiplier" name="overtimeMultiplier" type="number" step="0.01" value={formData.overtimeMultiplier || ''} onChange={handleChange} />
                                <p className="text-xs text-muted-foreground">معمولاً 1.4</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="holidayWorkMultiplier">ضریب تعطیل کاری</Label>
                                <Input id="holidayWorkMultiplier" name="holidayWorkMultiplier" type="number" step="0.01" value={formData.holidayWorkMultiplier || ''} onChange={handleChange} />
                                <p className="text-xs text-muted-foreground">معمولاً 1.9 (1.4 برای تعطیل + 0.5 برای جمعه)</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nightWorkMultiplier">ضریب شب کاری</Label>
                                <Input id="nightWorkMultiplier" name="nightWorkMultiplier" type="number" step="0.01" value={formData.nightWorkMultiplier || ''} onChange={handleChange} />
                                <p className="text-xs text-muted-foreground">معمولاً 1.35</p>
                            </div>
                        </div>
                    </div>

                    {/* Deductions & Penalties */}
                    <div>
                        <h3 className="text-lg font-medium mb-4 border-b pb-2">کسورات و جرائم</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                             <div className="space-y-2">
                                <Label htmlFor="insuranceDeductionPercentage">درصد بیمه سهم کارگر</Label>
                                <Input id="insuranceDeductionPercentage" name="insuranceDeductionPercentage" type="number" step="0.1" value={formData.insuranceDeductionPercentage || ''} onChange={handleChange} />
                                <p className="text-xs text-muted-foreground">معمولاً 7 درصد</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="maxAllowedLateness">حداکثر تأخیر مجاز (دقیقه)</Label>
                                <Input id="maxAllowedLateness" name="maxAllowedLateness" type="number" value={formData.maxAllowedLateness || ''} onChange={handleChange} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="latenessPenaltyAmount">مبلغ جریمه تأخیر (ریال)</Label>
                                <Input id="latenessPenaltyAmount" name="latenessPenaltyAmount" type="number" value={formData.latenessPenaltyAmount || ''} onChange={handleChange} />
                            </div>
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
            
            <Tabs defaultValue="payroll-settings" className="w-full">
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
