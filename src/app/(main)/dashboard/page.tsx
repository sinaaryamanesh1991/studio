'use client';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Users, Home, Briefcase, DatabaseZap, Loader2 } from 'lucide-react';
import type { Resident, Villa, BoardMember, Personnel } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { seedDatabase } from '@/firebase/seed';
import { useToast } from '@/hooks/use-toast';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"
import { useEffect, useState } from 'react';


const statusVariant = {
  'ساکن': 'default',
  'خالی': 'secondary',
} as const;

const occupantTypeVariant = {
  'owner': 'default',
  'tenant': 'outline',
} as const;


export default function DashboardPage() {
  const { firestore, user, isUserLoading } = useFirebase();
  const { toast } = useToast();
  const estateId = user?.uid;

  const personnelQuery = useMemoFirebase(() => estateId ? collection(firestore, 'estates', estateId, 'personnel') : null, [firestore, estateId]);
  const { data: personnel, isLoading: loadingPersonnel } = useCollection<Personnel>(personnelQuery);

  const residentsQuery = useMemoFirebase(() => estateId ? collection(firestore, 'estates', estateId, 'residents') : null, [firestore, estateId]);
  const { data: residents, isLoading: loadingResidents } = useCollection<Resident>(residentsQuery);

  const boardMembersQuery = useMemoFirebase(() => estateId ? collection(firestore, 'estates', estateId, 'boardMembers') : null, [firestore, estateId]);
  const { data: boardMembers, isLoading: loadingBoardMembers } = useCollection<BoardMember>(boardMembersQuery);

  const villasQuery = useMemoFirebase(() => estateId ? collection(firestore, 'estates', estateId, 'villas') : null, [firestore, estateId]);
  const { data: villas, isLoading: loadingVillas } = useCollection<Villa>(villasQuery);

  const globalLoading = loadingPersonnel || loadingResidents || loadingBoardMembers || loadingVillas || isUserLoading;

  const handleStatusChange = (resident: Resident, isPresent: boolean) => {
    if (!estateId) return;
    const residentRef = doc(firestore, 'estates', estateId, 'residents', resident.id);
    const updatedData = { ...resident, isPresent: isPresent, status: isPresent ? 'ساکن' : 'خالی' };
    setDocumentNonBlocking(residentRef, updatedData, { merge: true });
  };
  
  const handleOccupantTypeChange = (villa: Villa, isOwner: boolean) => {
      if (!estateId) return;
      const villaRef = doc(firestore, 'estates', estateId, 'villas', villa.id);
      const updatedData = { ...villa, occupantType: isOwner ? 'owner' : 'tenant' };
      setDocumentNonBlocking(villaRef, updatedData, { merge: true });
  };

  const presentCount = residents?.filter(r => r.status === 'ساکن').length ?? 0;

  const getOccupantText = (villa: Villa | undefined, resident: Resident): string => {
      if(resident.status !== 'ساکن' || !villa) {
          return 'ویلا خالی است';
      }
      return villa.occupantType === 'owner' ? 'مالک ساکن است' : 'ساکن مستاجر است';
  }


  const handleSeed = async () => {
    if (!firestore || !estateId) return;
    try {
        await seedDatabase(firestore, estateId);
        toast({
            title: 'موفقیت',
            description: 'داده‌های نمونه با موفقیت در دیتابیس بارگذاری شدند.',
        });
    } catch(e) {
        console.error(e);
        toast({
            variant: 'destructive',
            title: 'خطا',
            description: 'خطایی در بارگذاری داده‌های نمونه رخ داد.',
        });
    }
  }


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
      <PageHeader title="داشبورد">
        <Button onClick={handleSeed} variant="outline" size="sm">
            <DatabaseZap className="ms-2 h-4 w-4" />
            بارگذاری داده‌های نمونه
        </Button>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تعداد پرسنل</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{personnel?.length ?? 0} نفر</div>
            <p className="text-xs text-muted-foreground">تعداد کل کارکنان ثبت شده</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تعداد ساکنین</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{presentCount} خانوار</div>
            <p className="text-xs text-muted-foreground">از مجموع {residents?.length ?? 0} واحد</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">اعضای هیئت مدیره</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{boardMembers?.length ?? 0} نفر</div>
            <p className="text-xs text-muted-foreground">تعداد اعضای هیئت مدیره</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6">
        <Card>
            <CardHeader>
                <CardTitle>لیست ساکنین و وضعیت ویلاها</CardTitle>
                <CardDescription>اطلاعات تماس، وضعیت سکونت و مالکیت ساکنین</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>شماره ویلا</TableHead>
                            <TableHead>نام</TableHead>
                            <TableHead>نام خانوادگی</TableHead>
                            <TableHead>شماره تماس</TableHead>
                            <TableHead>وضعیت سکونت</TableHead>
                            <TableHead>وضعیت مالکیت</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {residents?.sort((a,b) => a.villaNumber - b.villaNumber).map((resident: Resident) => {
                             const villa = villas?.find(v => v.villaNumber === resident.villaNumber);
                             const occupantText = getOccupantText(villa, resident);
                             return (
                                <TableRow key={resident.id}>
                                    <TableCell className="font-medium">{resident.villaNumber}</TableCell>
                                    <TableCell>{resident.name}</TableCell>
                                    <TableCell>{resident.familyName}</TableCell>
                                    <TableCell>{resident.phone}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2 space-x-reverse">
                                            <Switch
                                                id={`status-switch-${resident.id}`}
                                                checked={resident.isPresent}
                                                onCheckedChange={(checked) => handleStatusChange(resident, checked)}
                                                aria-label="وضعیت سکونت"
                                            />
                                            <Badge variant={statusVariant[resident.status]}>
                                                {resident.status}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {resident.status === 'ساکن' && villa ? (
                                             <div className="flex items-center space-x-2 space-x-reverse">
                                                <Switch
                                                    id={`occupant-type-switch-${villa.id}`}
                                                    checked={villa.occupantType === 'owner'}
                                                    onCheckedChange={(checked) => handleOccupantTypeChange(villa, checked)}
                                                    aria-label="وضعیت مالکیت"
                                                />
                                                <Badge variant={occupantTypeVariant[villa.occupantType]}>
                                                    {villa.occupantType === 'owner' ? 'مالک' : 'مستاجر'}
                                                </Badge>
                                            </div>
                                        ) : (
                                            <Badge variant="secondary">ویلا خالی است</Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
      
      <div className="mt-6">
        <Card>
            <CardHeader>
                <CardTitle>لیست اعضای هیئت مدیره</CardTitle>
                <CardDescription>اطلاعات تماس اعضای هیئت مدیره شهرک</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>نام و نام خانوادگی</TableHead>
                            <TableHead>شماره تماس</TableHead>
                            <TableHead>سمت</TableHead>
                            <TableHead>شماره ویلا</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {boardMembers?.map((member) => (
                            <TableRow key={member.id}>
                                <TableCell className="font-medium">{member.name} {member.familyName}</TableCell>
                                <TableCell>{member.phone}</TableCell>
                                <TableCell>{member.position}</TableCell>
                                <TableCell>{member.villaNumber}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </>
  );
}
