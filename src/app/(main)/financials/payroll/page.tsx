'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Calculator } from 'lucide-react';
import { automatedPayrollCalculation } from '@/ai/flows/automated-payroll-calculation';
import type { AutomatedPayrollCalculationOutput } from '@/ai/flows/automated-payroll-calculation';
import { useData } from '@/context/data-context';
import type { PayrollRecord } from '@/lib/types';

const formSchema = z.object({
  personnelId: z.string().min(1, { message: "لطفا یک پرسنل را انتخاب کنید." }),
  hourlyRate: z.coerce.number().min(0, { message: "نرخ ساعتی باید مثبت باشد." }),
  hoursWorked: z.coerce.number().min(0, { message: "ساعات کار باید مثبت باشد." }),
  overtimeHours: z.coerce.number().min(0, { message: "ساعات اضافه کاری باید مثبت باشد." }),
  holidayPay: z.coerce.number().min(0, { message: "مبلغ تعطیل کاری باید مثبت باشد." }),
  deductions: z.coerce.number().min(0, { message: "مبلغ کسورات باید مثبت باشد." }),
});

export default function PayrollCalculatorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AutomatedPayrollCalculationOutput | null>(null);
  const { toast } = useToast();
  const { personnel, setPayrollRecords } = useData();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      personnelId: '',
      hourlyRate: 0,
      hoursWorked: 0,
      overtimeHours: 0,
      holidayPay: 0,
      deductions: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    const selectedPersonnel = personnel.find(p => p.id === values.personnelId);
    if (!selectedPersonnel) {
        toast({ variant: "destructive", title: "خطا", description: "پرسنل انتخاب شده یافت نشد."});
        setIsLoading(false);
        return;
    }

    try {
      const { personnelId, ...calculationInput } = values;
      const response = await automatedPayrollCalculation(calculationInput);
      setResult(response);

      const newRecord: PayrollRecord = {
        id: `pr${Date.now()}`,
        personnelId: values.personnelId,
        personnelName: `${selectedPersonnel.name} ${selectedPersonnel.familyName}`,
        calculationDate: new Date().toLocaleDateString('fa-IR'),
        ...values,
        ...response,
      };

      setPayrollRecords(prev => [...prev, newRecord]);

      toast({
        title: "محاسبه و ذخیره موفق",
        description: `حقوق برای ${newRecord.personnelName} محاسبه و ذخیره شد.`,
        action: (
          <Button variant="outline" size="sm" onClick={() => router.push('/financials')}>
            مشاهده لیست حقوق
          </Button>
        ),
      });

      // Reset form for next entry
      form.reset();
      setResult(null);

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "خطا در محاسبه",
        description: "هنگام ارتباط با سرویس محاسبه‌گر خطایی رخ داد.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <PageHeader title="محاسبه‌گر خودکار حقوق" />
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>ورود اطلاعات</CardTitle>
            <CardDescription>اطلاعات کارکرد پرسنل را برای محاسبه حقوق وارد کنید.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="personnelId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>انتخاب پرسنل</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="یکی از پرسنل را انتخاب کنید" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {personnel.map(p => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name} {p.familyName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hourlyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نرخ ساعتی (تومان)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hoursWorked"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ساعات کارکرد</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="overtimeHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ساعات اضافه کاری</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="holidayPay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>مبلغ تعطیل کاری (تومان)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deductions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>مجموع کسورات (تومان)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <Loader2 className="ms-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Calculator className="ms-2 h-4 w-4" />
                  )}
                  محاسبه و ذخیره
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>نتیجه محاسبه</CardTitle>
            <CardDescription>نتایج محاسبه شده توسط هوش مصنوعی.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center">
            {isLoading && <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />}
            {!isLoading && !result && <div className="text-muted-foreground">نتیجه اینجا نمایش داده می‌شود.</div>}
            {result && (
              <div className="w-full space-y-4 text-lg">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium text-muted-foreground">دستمزد اضافه کاری:</span>
                  <span className="font-bold font-mono text-primary">{result.overtimePay.toLocaleString('fa-IR')} تومان</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium text-muted-foreground">حقوق ناخالص:</span>
                  <span className="font-bold font-mono text-primary">{result.grossPay.toLocaleString('fa-IR')} تومان</span>
                </div>
                <div className="flex justify-between items-center bg-muted -mx-6 px-6 py-4 rounded-b-lg">
                  <span className="font-extrabold text-xl text-foreground">پرداختی نهایی:</span>
                  <span className="font-extrabold font-mono text-xl text-accent">{result.netPay.toLocaleString('fa-IR')} تومان</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
