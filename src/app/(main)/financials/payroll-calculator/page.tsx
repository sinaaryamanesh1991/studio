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
import type { PayrollRecord, Personnel, PayrollSettings, CompanyInfo } from '@/lib/types';
import { automatedPayrollCalculation } from '@/ai/flows/automated-payroll-calculation';
import { Wand2, Loader2, Save } from 'lucide-react';
import { format as formatEn } from 'date-fns';
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

    const companyInfoQuery = useMemoFirebase(() => estateId ? doc(firestore, 'estates', estateId, 'companyInfo', 'default') : null, [firestore, estateId]);
    const { data: companyInfo, isLoading: loadingCompanyInfo } = useDoc<CompanyInfo>(companyInfoQuery);

    const payrollSettingsQuery = useMemoFirebase(() => estateId ? doc(firestore, 'estates', estateId, 'payrollSettings', 'default') : null, [firestore, estateId]);
    const { data: payrollSettings, isLoading: loadingPayrollSettings } = useDoc<PayrollSettings>(payrollSettingsQuery);

    const payrollRecordToEditQuery = useMemoFirebase(() => (estateId && payrollIdToEdit) ? doc(firestore, 'estates', estateId, 'payrollRecords', payrollIdToEdit) : null, [firestore, estateId, payrollIdToEdit]);
    const { data: payrollRecordToEdit, isLoading: loadingRecordToEdit } = useDoc<PayrollRecord>(payrollRecordToEditQuery);


    const [selectedPersonnelId, setSelectedPersonnelId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [calculationResult, setCalculationResult] = useState<Omit<PayrollRecord, 'id' | 'personnelId' | 'personnelName' | 'calculationDate' | 'estateId'> | null>(null);
    
    const [formState, setFormState] = useState({
        hourlyRate: 0,
        entryTime: '08:00',
        exitTime: '17:00',
        overtimeHours: 0,
        overtimeMultiplier: 1.4,
        holidayPay: 0,
        deductions: 0,
    });

    useEffect(() => {
        if (payrollIdToEdit && payrollRecordToEdit) {
            setSelectedPersonnelId(payrollRecordToEdit.personnelId);
            const newFormState = {
                hourlyRate: payrollRecordToEdit.hourlyRate,
                entryTime: payrollRecordToEdit.entryTime,
                exitTime: payrollRecordToEdit.exitTime,
                overtimeHours: payrollRecordToEdit.overtimeHours,
                overtimeMultiplier: payrollRecordToEdit.overtimeMultiplier,
                holidayPay: payrollRecordToEdit.holidayPay,
                deductions: payrollRecordToEdit.deductions,
            };
            setFormState(newFormState);
            setCalculationResult({ ...payrollRecordToEdit });
        } else if (!payrollIdToEdit && payrollSettings && companyInfo) {
             const defaultState = {
                hourlyRate: payrollSettings.baseHourlyRate || 0,
                entryTime: companyInfo.defaultEntryTime || '08:00',
                exitTime: companyInfo.defaultExitTime || '17:00',
                overtimeHours: 0,
                overtimeMultiplier: payrollSettings.overtimeMultiplier || 1.4,
                holidayPay: 0,
                deductions: 0,
            };
            setFormState(defaultState);
            setCalculationResult(null);
            setSelectedPersonnelId('');
        }
    }, [payrollIdToEdit, payrollRecordToEdit, payrollSettings, companyInfo]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedPersonnelId) {
            toast({ variant: 'destructive', title: 'خطا', description: 'لطفا یکی از پرسنل را انتخاب کنید.' });
            return;
        }
        setIsLoading(true);
        setCalculationResult(null);
        
        const input = {
            hourlyRate: Number(formState.hourlyRate),
            entryTime: formState.entryTime,
            exitTime: formState.exitTime,
            overtimeHours: Number(formState.overtimeHours),
            overtimeMultiplier: Number(formState.overtimeMultiplier),
            holidayPay: Number(formState.holidayPay),
            deductions: Number(formState.deductions),
        };

        try {
            const result = await automatedPayrollCalculation(input);
            setCalculationResult({ ...input, ...result });
        } catch (error) {
            console.error('AI payroll calculation failed:', error);
            toast({
                variant: 'destructive',
                title: 'خطا در محاسبه',
                description: 'محاسبه حقوق با هوش مصنوعی با خطا مواجه شد. لطفا دوباره تلاش کنید.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveRecord = () => {
        if (!calculationResult || !selectedPersonnelId || !estateId || !personnel) return;

        const selectedPerson = personnel.find(p => p.id === selectedPersonnelId);
        if (!selectedPerson) return;
        
        const id = payrollIdToEdit || `pay-${Date.now()}`;
        const recordRef = doc(firestore, 'estates', estateId, 'payrollRecords', id);

        const recordData: PayrollRecord = {
            id,
            personnelId: selectedPersonnelId,
            personnelName: `${selectedPerson.name} ${selectedPerson.familyName}`,
            calculationDate: formatEn(new Date(), 'yyyy-MM-dd'),
            hourlyRate: calculationResult.hourlyRate,
            entryTime: calculationResult.entryTime,
            exitTime: calculationResult.exitTime,
            hoursWorked: calculationResult.hoursWorked,
            overtimeHours: calculationResult.overtimeHours,
            overtimeMultiplier: calculationResult.overtimeMultiplier,
            holidayPay: calculationResult.holidayPay,
            deductions: calculationResult.deductions,
            grossPay: calculationResult.grossPay,
            netPay: calculationResult.netPay,
            overtimePay: calculationResult.overtimePay,
            estateId: estateId,
        };

        setDocumentNonBlocking(recordRef, recordData, { merge: true });
        
        toast({ title: 'موفقیت', description: `محاسبه حقوق با موفقیت ${payrollIdToEdit ? 'به‌روزرسانی' : 'ذخیره'} شد.` });
        router.push('/financials/payroll');
    };
    
    const pageIsLoading = loadingPersonnel || loadingCompanyInfo || loadingPayrollSettings || loadingRecordToEdit;
    
    if (pageIsLoading) {
        return <div>در حال بارگذاری...</div>;
    }

    return (
        <>
            <PageHeader title={payrollIdToEdit ? "ویرایش محاسبه حقوق" : "محاسبه‌گر حقوق و دستمزد"} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>فرم محاسبه حقوق</CardTitle>
                            <CardDescription>اطلاعات کارکرد پرسنل را برای محاسبه حقوق وارد کنید.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="personnelId">انتخاب پرسنل</Label>
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
                                <div className="space-y-2">
                                    <Label htmlFor="hourlyRate">نرخ ساعتی (تومان)</Label>
                                    <Input id="hourlyRate" name="hourlyRate" type="number" value={formState.hourlyRate} onChange={handleInputChange} required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="entryTime">ساعت ورود</Label>
                                        <Input id="entryTime" name="entryTime" type="time" value={formState.entryTime} onChange={handleInputChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="exitTime">ساعت خروج</Label>
                                        <Input id="exitTime" name="exitTime" type="time" value={formState.exitTime} onChange={handleInputChange} required />
                                    </div>
                                </div>
                                 <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="overtimeHours">ساعات اضافه کاری</Label>
                                        <Input id="overtimeHours" name="overtimeHours" type="number" step="0.1" value={formState.overtimeHours} onChange={handleInputChange} required />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="overtimeMultiplier">ضریب اضافه کاری</Label>
                                        <Input id="overtimeMultiplier" name="overtimeMultiplier" type="number" step="0.1" value={formState.overtimeMultiplier} onChange={handleInputChange} required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="holidayPay">مبلغ تعطیل کاری (تومان)</Label>
                                    <Input id="holidayPay" name="holidayPay" type="number" value={formState.holidayPay} onChange={handleInputChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="deductions">کسورات (تومان)</Label>
                                    <Input id="deductions" name="deductions" type="number" value={formState.deductions} onChange={handleInputChange} required />
                                </div>

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? (
                                        <Loader2 className="ms-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Wand2 className="ms-2 h-4 w-4" />
                                    )}
                                    محاسبه با هوش مصنوعی
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
                            {isLoading && (
                                <div className="flex items-center justify-center py-16">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    <p className="mr-4 text-muted-foreground">در حال محاسبه...</p>
                                </div>
                            )}
                            {!isLoading && !calculationResult && (
                                <div className="text-center py-16 text-muted-foreground">
                                    پس از پر کردن فرم، نتیجه محاسبه اینجا نمایش داده می‌شود.
                                </div>
                            )}
                            {calculationResult && (
                                <div className="space-y-4 text-sm">
                                    <div className="font-bold text-base mb-4">اطلاعات کارکرد:</div>
                                    <div className="flex justify-between items-center"><span className="text-muted-foreground">ساعات کارکرد عادی:</span><span className="font-mono">{calculationResult.hoursWorked} ساعت</span></div>
                                    <div className="flex justify-between items-center"><span className="text-muted-foreground">ساعات اضافه کاری:</span><span className="font-mono">{calculationResult.overtimeHours} ساعت</span></div>
                                    <Separator />
                                    <div className="font-bold text-base my-4">محاسبات حقوق:</div>
                                    <div className="flex justify-between items-center"><span className="text-muted-foreground">مبلغ اضافه کاری:</span><span className="font-mono text-green-600">{`+ ${calculationResult.overtimePay.toLocaleString('fa-IR')}`}</span></div>
                                    <div className="flex justify-between items-center"><span className="text-muted-foreground">مبلغ تعطیل کاری:</span><span className="font-mono text-green-600">{`+ ${calculationResult.holidayPay.toLocaleString('fa-IR')}`}</span></div>
                                    <div className="flex justify-between items-center font-bold"><span className="text-muted-foreground">حقوق ناخالص:</span><span className="font-mono">{calculationResult.grossPay.toLocaleString('fa-IR')} تومان</span></div>
                                    <Separator />
                                    <div className="flex justify-between items-center"><span className="text-muted-foreground">مجموع کسورات:</span><span className="font-mono text-destructive">{`- ${calculationResult.deductions.toLocaleString('fa-IR')}`}</span></div>
                                    <Separator />
                                    <div className="flex justify-between items-center font-extrabold text-lg bg-muted -mx-6 px-6 py-3"><span >پرداختی نهایی:</span><span className="font-mono text-primary">{calculationResult.netPay.toLocaleString('fa-IR')} تومان</span></div>
                                    
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
