'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { CompanyInfo, PayrollSettings } from '@/lib/types';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


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

function PayrollSettingsForm() {
    const { firestore, user } = useFirebase();
    const estateId = user?.uid;
    const payrollSettingsQuery = useMemoFirebase(() => estateId ? doc(firestore, 'estates', estateId, 'payrollSettings', 'default') : null, [firestore, estateId]);
    const { data: payrollSettings, isLoading } = useDoc<PayrollSettings>(payrollSettingsQuery);
    const { toast } = useToast();
    const [formData, setFormData] = useState<Partial<Omit<PayrollSettings, 'taxDeductionPercentage'>>>({
        baseSalaryOfMonth: 71661840,
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
                                <p className="text-xs text-muted-foreground">معمولاً 1.9</p>
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

export default function SettingsPage() {
    return (
        <>
            <PageHeader title="تنظیمات" />
            <Tabs defaultValue="company-info" className="w-full">
                 <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="company-info">اطلاعات پایه</TabsTrigger>
                    <TabsTrigger value="payroll-settings">تنظیمات حقوق</TabsTrigger>
                </TabsList>
                 <TabsContent value="company-info">
                    <CompanyInfoForm />
                </TabsContent>
                 <TabsContent value="payroll-settings">
                    <PayrollSettingsForm />
                </TabsContent>
            </Tabs>
        </>
    );
}
