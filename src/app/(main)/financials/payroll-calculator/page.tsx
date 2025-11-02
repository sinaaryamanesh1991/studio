'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCollection, useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import type { PayrollRecord, Personnel, PayrollSettings, WorkLog, AutomatedPayrollCalculationInput } from '@/lib/types';
import { calculatePayroll, type PayrollCalculationResult } from '@/lib/payroll-calculator';
import { Wand2, Loader2, Save } from 'lucide-react';
import { format as formatEn, parse } from 'date-fns';
import { faIR } from 'date-fns-jalali/locale';
import { format as formatJalali } from 'date-fns-jalali';
import { useRouter, useSearchParams } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { collection, doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export default function PayrollCalculatorPage() {
    const { firestore, user } = useFirebase();
    const estateId = user?.uid;
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const payrollIdToEdit = searchParams.get('id');

    const personnelQuery = useMemoFirebase(() => estateId ? collection(firestore, 'estates', estateId, 'personnel') : null, [firestore, estateId]);
    const { data: personnel, isLoading: loadingPersonnel } = useCollection<Personnel>(personnelQuery);

    const payrollSettingsQuery = useMemoFirebase(() => estateId ? doc(firestore, 'estates', estateId, 'payrollSettings', 'default') : null, [firestore, estateId]);
    const { data: payrollSettings, isLoading: loadingPayrollSettings } = useDoc<PayrollSettings>(payrollSettingsQuery);
    
    const companyInfoQuery = useMemoFirebase(() => estateId ? doc(firestore, 'estates', estateId, 'companyInfo', 'default') : null, [firestore, estateId]);
    const { data: companyInfo, isLoading: loadingCompanyInfo } = useDoc<PayrollSettings>(companyInfoQuery);

    const payrollRecordToEditQuery = useMemoFirebase(() => (estateId && payrollIdToEdit) ? doc(firestore, 'estates', estateId, 'payrollRecords', payrollIdToEdit) : null, [firestore, estateId, payrollIdToEdit]);
    const { data: payrollRecordToEdit, isLoading: loadingRecordToEdit } = useDoc<PayrollRecord>(payrollRecordToEditQuery);

    const [selectedPersonnelId, setSelectedPersonnelId] = useState<string>('');
    const [selectedYear, setSelectedYear] = useState<number>(parseInt(formatJalali(new Date(), 'yyyy')));
    const [selectedMonth, setSelectedMonth] = useState<number>(parseInt(formatJalali(new Date(), 'M')));
    
    const [isLoading, setIsLoading] = useState(false);
    const [calculationResult, setCalculationResult] = useState<Partial<PayrollRecord> | null>(null);
    const [formState, setFormState] = useState({ otherDeductions: 0 });

    const workLogId = selectedPersonnelId ? `${selectedPersonnelId}-${selectedYear}-${String(selectedMonth).padStart(2, '0')}` : null;
    const workLogQuery = useMemoFirebase(() => (estateId && workLogId) ? doc(firestore, 'estates', estateId, 'workLogs', workLogId) : null, [estateId, workLogId]);
    const { data: workLog, isLoading: loadingWorkLog } = useDoc<WorkLog>(workLogQuery);
    
    useEffect(() => {
        if (payrollIdToEdit && payrollRecordToEdit && personnel) {
            setSelectedPersonnelId(payrollRecordToEdit.personnelId);
            const date = parse(payrollRecordToEdit.calculationDate, 'yyyy-MM-dd', new Date());
            setSelectedYear(parseInt(formatJalali(date, 'yyyy')));
            setSelectedMonth(parseInt(formatJalali(date, 'M')));
            setFormState({ otherDeductions: payrollRecordToEdit.otherDeductions || 0 });
            setCalculationResult(payrollRecordToEdit);
        } else if (!payrollIdToEdit) {
            setCalculationResult(null);
            setSelectedPersonnelId('');
            setFormState({ otherDeductions: 0 });
        }
    }, [payrollIdToEdit, payrollRecordToEdit, personnel]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: Number(value) }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const selectedPerson = personnel?.find(p => p.id === selectedPersonnelId);

        if (!selectedPerson || !workLog || !payrollSettings || !companyInfo) {
            toast({ variant: 'destructive', title: 'خطا', description: 'لطفا پرسنل و ماه کارکرد را انتخاب کنید یا از وجود تنظیمات حقوق، اطلاعات شرکت و کارکرد ثبت شده اطمینان حاصل کنید.' });
            return;
        }
        setIsLoading(true);
        setCalculationResult(null);

        const totalOvertimeHours = workLog.days.reduce((acc, day) => acc + (day.overtimeHours || 0), 0);
        const totalHolidayHours = workLog.days.reduce((acc, day) => acc + (day.holidayHours || 0), 0);
        const totalNightWorkHours = workLog.days.reduce((acc, day) => acc + (day.nightWorkHours || 0), 0);
        const totalHoursWorked = workLog.days.reduce((acc, day) => acc + (day.hoursWorked || 0), 0);
        
        // Simplified lateness check: check first day with entry time
        const firstWorkDay = workLog.days.find(d => d.entryTime);
        const entryTime = firstWorkDay?.entryTime || '00:00';

        const calculationInput: AutomatedPayrollCalculationInput = {
            baseSalaryOfMonth: payrollSettings.baseSalaryOfMonth,
            totalHoursWorked,
            totalOvertimeHours,
            totalHolidayHours,
            totalNightWorkHours,
            childrenCount: selectedPerson.childrenCount || 0,
            otherDeductions: formState.otherDeductions,
            entryTime: entryTime, // For lateness calculation
            ...payrollSettings,
            ...companyInfo,
        };

        try {
            // Use the reliable TypeScript calculation function
            const result: PayrollCalculationResult = calculatePayroll(calculationInput);
            setCalculationResult({ 
                ...result,
                workLogId: workLog.id,
                totalHoursWorked,
                totalOvertimeHours,
                totalHolidayHours,
                totalNightWorkHours,
                otherDeductions: formState.otherDeductions,
             });
        } catch (error) {
            console.error('Payroll calculation failed:', error);
            toast({
                variant: 'destructive',
                title: 'خطا در محاسبه',
                description: 'محاسبه حقوق با خطا مواجه شد. لطفا دوباره تلاش کنید.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveRecord = () => {
        if (!calculationResult || !selectedPersonnelId || !estateId || !personnel || !workLogId) return;

        const selectedPerson = personnel.find(p => p.id === selectedPersonnelId);
        if (!selectedPerson) return;
        
        const id = payrollIdToEdit || `pay-${Date.now()}`;
        const recordRef = doc(firestore, 'estates', estateId, 'payrollRecords', id);

        const recordData: PayrollRecord = {
            id,
            personnelId: selectedPersonnelId,
            personnelName: `${selectedPerson.name} ${selectedPerson.familyName}`,
            calculationDate: formatEn(new Date(), 'yyyy-MM-dd'),
            estateId: estateId,
            workLogId: workLogId,
            ...calculationResult,
        } as PayrollRecord;

        setDocumentNonBlocking(recordRef, recordData, { merge: true });
        
        toast({ title: 'موفقیت', description: `محاسبه حقوق با موفقیت ${payrollIdToEdit ? 'به‌روزرسانی' : 'ذخیره'} شد.` });
        router.push('/financials/payroll');
    };
    
    const pageIsLoading = loadingPersonnel || loadingPayrollSettings || loadingRecordToEdit || loadingWorkLog || loadingCompanyInfo;
    const years = Array.from({ length: 5 }, (_, i) => parseInt(formatJalali(new Date(), 'yyyy')) - i);
    const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, name: formatJalali(new Date(2000, i, 1), 'LLLL', { locale: faIR }) }));


    return (
        <>
            <PageHeader title={payrollIdToEdit ? "ویرایش محاسبه حقوق" : "محاسبه‌گر حقوق و دستمزد"} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>فرم محاسبه حقوق</CardTitle>
                            <CardDescription>پرسنل و ماه مورد نظر برای محاسبه را انتخاب کنید.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label>انتخاب پرسنل</Label>
                                    <Select name="personnelId" onValueChange={setSelectedPersonnelId} value={selectedPersonnelId} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="یکی از پرسنل را انتخاب کنید" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {personnel?.map(p => (
                                                <SelectItem key={p.id} value={p.id}>{p.name} {p.familyName}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="space-y-2">
                                        <Label>انتخاب سال</Label>
                                        <Select onValueChange={(v) => setSelectedYear(Number(v))} value={String(selectedYear)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                     <div className="space-y-2">
                                        <Label>انتخاب ماه</Label>
                                         <Select onValueChange={(v) => setSelectedMonth(Number(v))} value={String(selectedMonth)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {months.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                
                                {workLog && <div className="text-sm text-green-600">کارکرد ماه انتخاب شده یافت شد.</div>}
                                {selectedPersonnelId && !workLog && !loadingWorkLog && <div className="text-sm text-red-600">کارکردی برای این ماه ثبت نشده است.</div>}

                                <div className="space-y-2">
                                    <Label htmlFor="otherDeductions">سایر کسورات (ریال)</Label>
                                    <Input id="otherDeductions" name="otherDeductions" type="number" value={formState.otherDeductions} onChange={handleInputChange} />
                                </div>

                                <Button type="submit" className="w-full" disabled={isLoading || !workLog}>
                                    {isLoading ? (
                                        <Loader2 className="ms-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Wand2 className="ms-2 h-4 w-4" />
                                    )}
                                    محاسبه حقوق
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <Card className="sticky top-20">
                        <CardHeader>
                            <CardTitle>نتیجه محاسبه</CardTitle>
                            <CardDescription>نتیجه محاسبه حقوق در این بخش نمایش داده می‌شود.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {pageIsLoading && (
                                <div className="flex items-center justify-center py-16">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    <p className="mr-4 text-muted-foreground">در حال بارگذاری اطلاعات اولیه...</p>
                                </div>
                            )}
                            {isLoading && (
                                <div className="flex items-center justify-center py-16">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    <p className="mr-4 text-muted-foreground">در حال محاسبه...</p>
                                </div>
                            )}
                            {!isLoading && !pageIsLoading && !calculationResult && (
                                <div className="text-center py-16 text-muted-foreground">
                                    پس از پر کردن فرم، نتیجه محاسبه اینجا نمایش داده می‌شود.
                                </div>
                            )}
                            {calculationResult && (
                                <div className="space-y-4 text-sm">
                                    <div className="font-bold text-base mb-4">خلاصه کارکرد:</div>
                                    <div className="flex justify-between items-center"><span className="text-muted-foreground">کل ساعات کاری:</span><span className="font-mono">{calculationResult.totalHoursWorked?.toFixed(2)} ساعت</span></div>
                                    <div className="flex justify-between items-center"><span className="text-muted-foreground">کل ساعات اضافه‌کاری:</span><span className="font-mono">{calculationResult.totalOvertimeHours?.toFixed(2)} ساعت</span></div>
                                    <div className="flex justify-between items-center"><span className="text-muted-foreground">کل ساعات تعطیل‌کاری:</span><span className="font-mono">{calculationResult.totalHolidayHours?.toFixed(2)} ساعت</span></div>

                                    <Separator />
                                    <div className="font-bold text-base my-4">مزایا و پرداخت‌ها (ریال):</div>
                                    <div className="flex justify-between items-center"><span className="text-muted-foreground">حقوق پایه:</span><span className="font-mono text-green-600">{`+ ${calculationResult.baseSalaryPay?.toLocaleString('fa-IR') || 0}`}</span></div>
                                    <div className="flex justify-between items-center"><span className="text-muted-foreground">مبلغ اضافه‌کاری:</span><span className="font-mono text-green-600">{`+ ${calculationResult.overtimePay?.toLocaleString('fa-IR') || 0}`}</span></div>
                                    <div className="flex justify-between items-center"><span className="text-muted-foreground">مبلغ تعطیل‌کاری:</span><span className="font-mono text-green-600">{`+ ${calculationResult.holidayPay?.toLocaleString('fa-IR') || 0}`}</span></div>
                                    <div className="flex justify-between items-center"><span className="text-muted-foreground">حق مسکن:</span><span className="font-mono text-green-600">{`+ ${calculationResult.housingAllowance?.toLocaleString('fa-IR') || 0}`}</span></div>
                                    <div className="flex justify-between items-center"><span className="text-muted-foreground">حق خوار و بار:</span><span className="font-mono text-green-600">{`+ ${calculationResult.foodAllowance?.toLocaleString('fa-IR') || 0}`}</span></div>
                                    <div className="flex justify-between items-center"><span className="text-muted-foreground">حق اولاد:</span><span className="font-mono text-green-600">{`+ ${calculationResult.childAllowance?.toLocaleString('fa-IR') || 0}`}</span></div>
                                    <div className="flex justify-between items-center font-bold"><span className="text-muted-foreground">حقوق ناخالص:</span><span className="font-mono">{calculationResult.grossPay?.toLocaleString('fa-IR') || 0}</span></div>
                                    
                                    <Separator />
                                    <div className="font-bold text-base my-4">کسورات (ریال):</div>
                                    <div className="flex justify-between items-center"><span className="text-muted-foreground">کسر بیمه:</span><span className="font-mono text-destructive">{`- ${calculationResult.insuranceDeduction?.toLocaleString('fa-IR') || 0}`}</span></div>
                                    <div className="flex justify-between items-center"><span className="text-muted-foreground">کسر مالیات:</span><span className="font-mono text-destructive">{`- ${calculationResult.taxDeduction?.toLocaleString('fa-IR') || 0}`}</span></div>
                                    <div className="flex justify-between items-center"><span className="text-muted-foreground">کسر بابت تأخیر:</span><span className="font-mono text-destructive">{`- ${calculationResult.latenessDeduction?.toLocaleString('fa-IR') || 0}`}</span></div>
                                    <div className="flex justify-between items-center"><span className="text-muted-foreground">سایر کسورات:</span><span className="font-mono text-destructive">{`- ${calculationResult.otherDeductions?.toLocaleString('fa-IR') || 0}`}</span></div>

                                    <Separator />
                                    <div className="flex justify-between items-center font-extrabold text-lg bg-muted -mx-6 px-6 py-3"><span >پرداختی نهایی:</span><span className="font-mono text-primary">{calculationResult.netPay?.toLocaleString('fa-IR') || 0}</span></div>
                                    
                                    <div className="pt-6">
                                        <Button onClick={handleSaveRecord} className="w-full">
                                            <Save className="ms-2 h-4 w-4" />
                                            {payrollIdToEdit ? 'ذخیره تغییرات' : 'ذخیره در لیست حقوق'}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
