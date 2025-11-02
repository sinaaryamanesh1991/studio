'use client';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Users, Home, ArrowLeft, Loader2, CalendarDays, Clock, BarChart3, PieChart } from 'lucide-react';
import type { Resident, Villa, Personnel, Transaction } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState, useMemo } from 'react';
import { format as formatJalali, subMonths, getMonth, getYear } from 'date-fns-jalali';
import { faIR } from 'date-fns-jalali/locale';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart as RechartsPieChart, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

const personnelStatusVariant = {
  'مشغول کار': 'default',
  'اتمام کار': 'destructive',
  'مرخصی': 'secondary',
  'غیبت': 'outline',
} as const;

const residentStatusVariant = {
  'ساکن': 'default',
  'خالی': 'secondary',
} as const;


function ClockAndDate() {
    const [time, setTime] = useState('');
    const [date, setDate] = useState('');

    useEffect(() => {
        const timerId = setInterval(() => {
            const now = new Date();
            setTime(now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }, 1000);
        setDate(formatJalali(new Date(), 'PPPP', { locale: faIR }));
        return () => clearInterval(timerId);
    }, []);

    return (
        <Card className="mb-6">
            <CardContent className="p-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                         <Clock className="h-6 w-6 text-primary" />
                        <div>
                            <p className="text-sm text-muted-foreground">ساعت</p>
                            <p className="text-xl font-bold font-mono">{time || '...'}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3">
                        <CalendarDays className="h-6 w-6 text-primary" />
                        <div>
                             <p className="text-sm text-muted-foreground">تاریخ امروز</p>
                            <p className="text-xl font-bold">{date || '...'}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function FinancialChart({ transactions }: { transactions: Transaction[] | null }) {
    const chartData = useMemo(() => {
        const now = new Date();
        const data: { month: string; دریافتی: number; پرداختی: number }[] = [];

        for (let i = 5; i >= 0; i--) {
            const date = subMonths(now, i);
            const monthName = formatJalali(date, 'MMM', { locale: faIR });
            const month = getMonth(date);
            const year = getYear(date);

            const receipts = transactions
                ?.filter(t => {
                    const tDate = new Date(t.date);
                    return getMonth(tDate) === month && getYear(tDate) === year && t.type === 'دریافتی';
                })
                .reduce((sum, t) => sum + t.amount, 0) ?? 0;

            const payments = transactions
                ?.filter(t => {
                    const tDate = new Date(t.date);
                    return getMonth(tDate) === month && getYear(tDate) === year && t.type === 'پرداختی';
                })
                .reduce((sum, t) => sum + t.amount, 0) ?? 0;

            data.push({ month: monthName, 'دریافتی': receipts, 'پرداختی': payments });
        }
        return data;
    }, [transactions]);
    
    const chartConfig = {
      دریافتی: { label: 'دریافتی', color: 'hsl(var(--chart-1))' },
      پرداختی: { label: 'پرداختی', color: 'hsl(var(--chart-2))' },
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    تحلیل مالی ۶ ماه اخیر
                </CardTitle>
                <CardDescription>نمودار مقایسه‌ای درآمدها و هزینه‌ها</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    <BarChart data={chartData} accessibilityLayer>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                        />
                        <YAxis tickFormatter={(value) => `${(value / 1000000).toLocaleString()} M`} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="دریافتی" fill="var(--color-دریافتی)" radius={4} />
                        <Bar dataKey="پرداختی" fill="var(--color-پرداختی)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

function ResidentsChart({ residents }: { residents: Resident[] | null }) {
    const chartData = useMemo(() => {
        const total = residents?.length ?? 0;
        const occupied = residents?.filter(r => r.status === 'ساکن').length ?? 0;
        const vacant = total - occupied;
        return [
            { name: 'ساکن', value: occupied, fill: 'hsl(var(--chart-1))' },
            { name: 'خالی', value: vacant, fill: 'hsl(var(--chart-2))' }
        ];
    }, [residents]);

     const chartConfig = {
      ساکن: { label: 'ساکن' },
      خالی: { label: 'خالی' },
    }

    return (
         <Card className="flex flex-col">
          <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    وضعیت سکونت ویلاها
                </CardTitle>
                <CardDescription>نمودار تفکیکی واحدهای دارای سکنه و خالی</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square h-[250px]"
                >
                <RechartsPieChart>
                    <Tooltip content={<ChartTooltipContent nameKey="name" />} />
                    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                         {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                    <Legend />
                </RechartsPieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}


export default function DashboardPage() {
  const { firestore, user, isUserLoading } = useFirebase();
  const estateId = user?.uid;

  const personnelQuery = useMemoFirebase(() => estateId ? collection(firestore, 'estates', estateId, 'personnel') : null, [firestore, estateId]);
  const { data: personnel, isLoading: loadingPersonnel } = useCollection<Personnel>(personnelQuery);

  const residentsQuery = useMemoFirebase(() => estateId ? collection(firestore, 'estates', estateId, 'residents') : null, [firestore, estateId]);
  const { data: residents, isLoading: loadingResidents } = useCollection<Resident>(residentsQuery);

  const transactionsQuery = useMemoFirebase(() => estateId ? collection(firestore, 'estates', estateId, 'financialTransactions') : null, [firestore, estateId]);
  const { data: transactions, isLoading: loadingTransactions } = useCollection<Transaction>(transactionsQuery);
  
  const villasQuery = useMemoFirebase(() => estateId ? collection(firestore, 'estates', estateId, 'villas') : null, [firestore, estateId]);
  const { data: villas, isLoading: loadingVillas } = useCollection<Villa>(villasQuery);

  const globalLoading = loadingPersonnel || loadingResidents || loadingVillas || isUserLoading || loadingTransactions;

  const handleStatusChange = (resident: Resident, isPresent: boolean) => {
    if (!estateId) return;
    const residentRef = doc(firestore, 'estates', estateId, 'residents', resident.id);
    const updatedData = { ...resident, isPresent, status: isPresent ? 'ساکن' : 'خالی' };
    setDocumentNonBlocking(residentRef, updatedData, { merge: true });
  };


  if (globalLoading) {
    return (
      <>
        <PageHeader title="داشبورد" />
        <div className="flex items-center justify-center flex-col text-center gap-4 py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <h3 className="text-lg font-semibold">
                {'در حال بارگذاری اطلاعات...'}
            </h3>
            <p className="text-muted-foreground">لطفا کمی صبر کنید.</p>
        </div>
      </>
    )
  }


  return (
    <>
      <PageHeader title="داشبورد" />
      
      <ClockAndDate />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 mt-6">
          <FinancialChart transactions={transactions} />
          <ResidentsChart residents={residents} />
      </div>


       <div className="grid gap-6 md:grid-cols-2 mt-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>لیست پرسنل</CardTitle>
                            <CardDescription>نمای کلی از کارکنان شهرک</CardDescription>
                        </div>
                        <Button asChild variant="outline" size="sm">
                            <Link href="/personnel">
                                <ArrowLeft className="ms-2 h-4 w-4" />
                                مشاهده همه
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>عکس</TableHead>
                                <TableHead>نام و نام خانوادگی</TableHead>
                                <TableHead>سمت</TableHead>
                                <TableHead>وضعیت</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {personnel?.slice(0, 5).map((person) => (
                                <TableRow key={person.id}>
                                    <TableCell>
                                        <Avatar>
                                            <AvatarImage src={person.photoUrl} alt={`${person.name} ${person.familyName}`} />
                                            <AvatarFallback>
                                                <Users className="h-5 w-5"/>
                                            </AvatarFallback>
                                        </Avatar>
                                    </TableCell>
                                    <TableCell className="font-medium">{person.name} {person.familyName}</TableCell>
                                    <TableCell>{person.position}</TableCell>
                                    <TableCell>
                                        <Badge variant={personnelStatusVariant[person.status]}>{person.status}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {(personnel?.length ?? 0) === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                            هنوز هیچ پرسنلی ثبت نشده است.
                        </p>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>ورود و خروج ساکنین</CardTitle>
                            <CardDescription>وضعیت حضور ساکنین در شهرک</CardDescription>
                        </div>
                        <Button asChild variant="outline" size="sm">
                            <Link href="/residents">
                                <ArrowLeft className="ms-2 h-4 w-4" />
                                مشاهده همه
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>شماره ویلا</TableHead>
                            <TableHead>نام و نام خانوادگی</TableHead>
                            <TableHead>وضعیت حضور</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {residents?.filter(r => r.status === 'ساکن').slice(0, 5).map((resident) => (
                            <TableRow key={resident.id}>
                                <TableCell className="font-mono">{String(resident.villaNumber).padStart(2, '0')}</TableCell>
                                <TableCell className="font-medium">{resident.name} {resident.familyName}</TableCell>
                                <TableCell>
                                    <div className="flex items-center space-x-2 space-x-reverse">
                                        <Switch
                                            checked={resident.isPresent}
                                            onCheckedChange={(checked) => handleStatusChange(resident, checked)}
                                            aria-label="وضعیت حضور"
                                        />
                                        <Badge variant={resident.isPresent ? 'default' : 'secondary'}>{resident.isPresent ? 'حاضر' : 'خارج از شهرک'}</Badge>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                 {(residents?.length ?? 0) === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                        هنوز هیچ ساکنی ثبت نشده است.
                    </p>
                 )}
                </CardContent>
            </Card>
       </div>
    </>
  );
}
