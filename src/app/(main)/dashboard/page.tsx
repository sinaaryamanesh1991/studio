'use client';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Users, Home, Loader2, DollarSign, ArrowLeft, Clock } from 'lucide-react';
import type { Resident, Villa, Personnel, GuardShift, ShiftSettings } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { useMemo } from 'react';
import { Input } from '@/components/ui/input';

// Define a type for financial transactions to avoid 'any'
interface Transaction {
  id: string;
  party: string;
  reason: string;
  type: 'دریافتی' | 'پرداختی';
  amount: number;
}


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

const weekDays: (keyof GuardShift['days'])[] = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const weekDayLabels: { [key in keyof GuardShift['days']]: string } = {
    saturday: 'شنبه',
    sunday: 'یکشنبه',
    monday: 'دوشنبه',
    tuesday: 'سه‌شنبه',
    wednesday: 'چهارشنبه',
    thursday: 'پنج‌شنبه',
    friday: 'جمعه'
};


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

  const shiftsQuery = useMemoFirebase(() => estateId ? collection(firestore, 'estates', estateId, 'shifts') : null, [firestore, estateId]);
  const { data: shifts, isLoading: loadingShifts } = useCollection<ShiftSettings>(shiftsQuery);
    
  const guardShiftsQuery = useMemoFirebase(() => estateId ? collection(firestore, 'estates', estateId, 'guardShifts') : null, [firestore, estateId]);
  const { data: guardShifts, isLoading: loadingGuardShifts } = useCollection<GuardShift>(guardShiftsQuery);

  const globalLoading = loadingPersonnel || loadingResidents || loadingVillas || isUserLoading || loadingTransactions || loadingShifts || loadingGuardShifts;

  const guards = useMemo(() => {
    return personnel?.filter(p => p.position === 'نگهبان' && p.status === 'مشغول کار') || [];
  }, [personnel]);

  const handleStatusChange = (resident: Resident, isPresent: boolean) => {
    if (!estateId) return;
    const residentRef = doc(firestore, 'estates', estateId, 'residents', resident.id);
    const updatedData = { ...resident, isPresent, status: isPresent ? 'ساکن' : 'خالی' };
    setDocumentNonBlocking(residentRef, updatedData, { merge: true });
  };
  
  const handleOccupantTypeChange = (resident: Resident, isTenant: boolean) => {
      if (!estateId) return;
      const residentRef = doc(firestore, 'estates', estateId, 'residents', resident.id);
      const updatedData = { ...resident, occupantType: isTenant ? 'tenant' : 'owner' };
      setDocumentNonBlocking(residentRef, updatedData, { merge: true });
  
      const villaRef = doc(firestore, 'estates', estateId, 'villas', resident.villaId);
      setDocumentNonBlocking(villaRef, { occupantType: isTenant ? 'tenant' : 'owner' }, { merge: true });
  };

  const handleTenantNameChange = (resident: Resident, tenantName: string) => {
    if (!estateId) return;
    const residentRef = doc(firestore, 'estates', estateId, 'residents', resident.id);
    setDocumentNonBlocking(residentRef, { tenantName }, { merge: true });
  };

  const handleTenantPhoneChange = (resident: Resident, tenantPhone: string) => {
    if (!estateId) return;
    const residentRef = doc(firestore, 'estates', estateId, 'residents', resident.id);
    setDocumentNonBlocking(residentRef, { tenantPhone }, { merge: true });
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

  const occupiedVillas = residents?.filter(r => r.status === 'ساکن').length ?? 0;

  return (
    <>
      <PageHeader title="داشبورد" />

       <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تعداد ساکنین</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupiedVillas}</div>
            <p className="text-xs text-muted-foreground">
                از مجموع {villas?.length ?? 0} ویلا
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تعداد ویلاها</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{villas?.length ?? 0}</div>
            <p className="text-xs text-muted-foreground">ویلا ثبت شده در سیستم</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تعداد پرسنل</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{personnel?.length ?? 0}</div>
            <p className="text-xs text-muted-foreground">پرسنل فعال و غیرفعال</p>
          </CardContent>
        </Card>
      </div>

       <div className="flex flex-col gap-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>مدیریت ساکنین</CardTitle>
                <CardDescription>
                  لیست کامل ساکنین و وضعیت حضور آنها.
                </CardDescription>
              </div>
              <Button asChild variant="outline">
                <Link href="/residents">
                  مشاهده همه
                  <ArrowLeft className="mr-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">شماره ویلا</TableHead>
                    <TableHead className="text-center">نوع سکونت</TableHead>
                    <TableHead className="text-center">نام مالک</TableHead>
                    <TableHead className="text-center">شماره تماس مالک</TableHead>
                    <TableHead className="text-center">ساکن</TableHead>
                    <TableHead className="text-center">شماره تماس ساکن</TableHead>
                    <TableHead className="text-center">پلاک خودرو</TableHead>
                    <TableHead className="text-center">وضعیت حضور</TableHead>
                    <TableHead className="text-center">وضعیت سکونت</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {residents?.sort((a,b) => a.villaNumber - b.villaNumber).map((resident) => {
                    const villa = villas?.find(v => v.id === resident.villaId);
                    
                    return (
                    <TableRow key={resident.id}>
                      <TableCell className="font-mono font-medium text-center">{String(resident.villaNumber).padStart(2, '0')}</TableCell>
                       <TableCell className="text-center">
                          <div className="flex items-center justify-center space-x-2 space-x-reverse">
                            <Switch
                                id={`occupant-switch-${resident.id}`}
                                checked={resident.occupantType === 'tenant'}
                                onCheckedChange={(checked) => handleOccupantTypeChange(resident, checked)}
                                aria-label="نوع سکونت"
                            />
                            <Label htmlFor={`occupant-switch-${resident.id}`}>
                                {resident.occupantType === 'tenant' ? 'مستاجر' : 'مالک'}
                            </Label>
                          </div>
                       </TableCell>
                      <TableCell className="text-center">{villa?.owner || '-'}</TableCell>
                      <TableCell className="text-center">{resident.phone}</TableCell>
                      <TableCell className="text-center">
                        {resident.occupantType === 'tenant' ? (
                            <Input
                                defaultValue={resident.tenantName}
                                onBlur={(e) => handleTenantNameChange(resident, e.target.value)}
                                placeholder="نام مستاجر"
                                className="w-32 mx-auto text-center"
                            />
                        ) : (
                           <span>{resident.name} {resident.familyName}</span>
                        )}
                        </TableCell>
                       <TableCell className="text-center">
                        {resident.occupantType === 'tenant' ? (
                            <Input
                                defaultValue={resident.tenantPhone}
                                onBlur={(e) => handleTenantPhoneChange(resident, e.target.value)}
                                placeholder="شماره مستاجر"
                                className="w-32 mx-auto text-center"
                            />
                        ) : (
                            <span>-</span>
                        )}
                       </TableCell>
                      <TableCell className="text-center">{resident.carPlates}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center space-x-2 space-x-reverse">
                          <Switch
                            id={`presence-switch-${resident.id}`}
                            checked={resident.isPresent}
                            onCheckedChange={(checked) => handleStatusChange(resident, checked)}
                            aria-label="وضعیت حضور"
                          />
                           <Label htmlFor={`presence-switch-${resident.id}`}>{resident.isPresent ? 'حاضر' : 'غایب'}</Label>
                        </div>
                      </TableCell>
                       <TableCell className="text-center">
                          <Badge variant={residentStatusVariant[resident.status]}>{resident.status}</Badge>
                       </TableCell>
                    </TableRow>
                  )})}
                </TableBody>
              </Table>
              {(residents?.length ?? 0) === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  هنوز هیچ ساکنی ثبت نشده است.
                </p>
              )}
            </CardContent>
          </Card>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>شیفت نگهبانی</CardTitle>
                    <CardDescription>
                    نمای کلی برنامه هفتگی شیفت نگهبانان.
                    </CardDescription>
                </div>
                <Button asChild variant="outline">
                    <Link href="/shifts">
                        مشاهده و ویرایش
                        <ArrowLeft className="mr-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='min-w-[200px] text-center'>نام نگهبان</TableHead>
                                {weekDays.map(day => (
                                    <TableHead key={day} className='min-w-[150px] text-center'>{weekDayLabels[day]}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {guards.map(guard => {
                                const currentGuardShifts = guardShifts?.find(gs => gs.id === guard.id);
                                return (
                                    <TableRow key={guard.id}>
                                        <TableCell className="text-center">
                                            <div className="flex items-center gap-2 justify-center">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={guard.photoUrl} alt={guard.name} />
                                                    <AvatarFallback><Users className="h-5 w-5"/></AvatarFallback>
                                                </Avatar>
                                                <span>{guard.name} {guard.familyName}</span>
                                            </div>
                                        </TableCell>
                                        {weekDays.map(day => {
                                            const shiftId = currentGuardShifts?.days[day];
                                            const shiftInfo = shifts?.find(s => s.id === shiftId);
                                            const shiftLabel = shiftId === 'off' ? 'مرخصی' : (shiftInfo?.name || '-');
                                            return (
                                                <TableCell key={day} className="text-center">
                                                    <Badge variant={shiftId === 'off' ? 'secondary' : 'default'} className="whitespace-nowrap">
                                                        {shiftLabel}
                                                    </Badge>
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
                {guards.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                        هیچ نگهبانی با وضعیت "مشغول کار" برای نمایش شیفت وجود ندارد.
                    </p>
                )}
            </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>پرسنل</CardTitle>
                <CardDescription>
                  نمای کلی از کارکنان شهرک.
                </CardDescription>
              </CardHeader>
              <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center">نام پرسنل</TableHead>
                            <TableHead className="text-center">سمت</TableHead>
                            <TableHead className="text-center">وضعیت</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {personnel?.slice(0, 5).map((person) => (
                            <TableRow key={person.id}>
                                 <TableCell className="text-center">
                                    <div className="flex items-center gap-2 justify-center">
                                         <Avatar className="h-9 w-9">
                                            <AvatarImage src={person.photoUrl} alt="Avatar" />
                                            <AvatarFallback>
                                                <Users className="h-5 w-5"/>
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col items-start">
                                            <span className="font-medium">{person.name} {person.familyName}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">{person.position}</TableCell>
                                <TableCell className="text-center">
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
            <Card className="lg:col-span-4">
               <CardHeader>
                <CardTitle>تراکنش های اخیر</CardTitle>
                <CardDescription>
                  ۵ تراکنش آخر ثبت شده در سیستم
                </CardDescription>
              </CardHeader>
              <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center">طرف حساب</TableHead>
                            <TableHead className="text-center">بابت</TableHead>
                            <TableHead className="text-center">مبلغ (ریال)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions?.slice(0, 5).map(t => (
                            <TableRow key={t.id}>
                                <TableCell className="font-medium text-center">{t.party}</TableCell>
                                <TableCell className="text-center">{t.reason}</TableCell>
                                <TableCell className={`text-center font-mono ${t.type === 'دریافتی' ? 'text-green-600' : 'text-destructive'}`}>
                                    {`${t.type === 'دریافتی' ? '+' : '-'} ${t.amount.toLocaleString('fa-IR')}`}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {(transactions?.length ?? 0) === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                        هنوز هیچ تراکنشی ثبت نشده است.
                    </p>
                )}
              </CardContent>
            </Card>
        </div>
      </div>
    </>
  );
}
