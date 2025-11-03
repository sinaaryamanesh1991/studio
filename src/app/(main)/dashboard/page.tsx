'use client';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Users, Home, Loader2, DollarSign, ArrowLeft } from 'lucide-react';
import type { Resident, Villa, Personnel } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';

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
  
  const handleOccupantTypeChange = (resident: Resident, isTenant: boolean) => {
      if (!estateId) return;
      const residentRef = doc(firestore, 'estates', estateId, 'residents', resident.id);
      const updatedData = { ...resident, occupantType: isTenant ? 'tenant' : 'owner' };
      setDocumentNonBlocking(residentRef, updatedData, { merge: true });
  
      // Also update the related villa
      const villaRef = doc(firestore, 'estates', estateId, 'villas', resident.villaId);
      setDocumentNonBlocking(villaRef, { occupantType: isTenant ? 'tenant' : 'owner' }, { merge: true });
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
      
       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
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
                        <TableHead>طرف حساب</TableHead>
                        <TableHead>بابت</TableHead>
                        <TableHead className="text-left">مبلغ (ریال)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions?.slice(0, 5).map(t => (
                        <TableRow key={t.id}>
                            <TableCell className="font-medium">{t.party}</TableCell>
                            <TableCell>{t.reason}</TableCell>
                            <TableCell className={`text-left font-mono ${t.type === 'دریافتی' ? 'text-green-600' : 'text-destructive'}`}>
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
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>پرسنل</CardTitle>
            <CardDescription>
              نمای کلی از کارکنان شهرک.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
              {personnel?.slice(0, 5).map((person) => (
                <div key={person.id} className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={person.photoUrl} alt="Avatar" />
                    <AvatarFallback>
                        <Users className="h-5 w-5"/>
                    </AvatarFallback>
                  </Avatar>
                  <div className="mr-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{person.name} {person.familyName}</p>
                    <p className="text-sm text-muted-foreground">{person.position}</p>
                  </div>
                  <div className="mr-auto font-medium">
                      <Badge variant={personnelStatusVariant[person.status]}>{person.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
             {(personnel?.length ?? 0) === 0 && (
                <p className="text-center text-muted-foreground py-8">
                    هنوز هیچ پرسنلی ثبت نشده است.
                </p>
            )}
          </CardContent>
        </Card>
      </div>

       <Card className="mt-6">
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
                <TableHead>شماره ویلا</TableHead>
                <TableHead>نام و نام خانوادگی</TableHead>
                <TableHead>شماره تماس</TableHead>
                <TableHead>پلاک خودرو</TableHead>
                <TableHead>وضعیت سکونت</TableHead>
                <TableHead>نوع سکونت</TableHead>
                <TableHead>وضعیت حضور</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {residents?.sort((a,b) => a.villaNumber - b.villaNumber).map((resident) => (
                <TableRow key={resident.id}>
                  <TableCell className="font-mono font-medium">{String(resident.villaNumber).padStart(2, '0')}</TableCell>
                  <TableCell>{resident.name} {resident.familyName}</TableCell>
                  <TableCell>{resident.phone}</TableCell>
                  <TableCell>{resident.carPlates}</TableCell>
                   <TableCell>
                      <Badge variant={residentStatusVariant[resident.status]}>{resident.status}</Badge>
                   </TableCell>
                   <TableCell>
                      <div className="flex items-center space-x-2 space-x-reverse">
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
                  <TableCell>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Switch
                        id={`presence-switch-${resident.id}`}
                        checked={resident.isPresent}
                        onCheckedChange={(checked) => handleStatusChange(resident, checked)}
                        aria-label="وضعیت حضور"
                      />
                       <Label htmlFor={`presence-switch-${resident.id}`}>{resident.isPresent ? 'حاضر' : 'غایب'}</Label>
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
    </>
  );
}
