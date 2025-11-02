'use client';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Users, Home, Briefcase, DatabaseZap, Loader2, ArrowLeft } from 'lucide-react';
import type { Resident, Villa, BoardMember, Personnel } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { seedDatabase } from '@/firebase/seed';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const residentStatusVariant = {
  'ساکن': 'default',
  'خالی': 'secondary',
} as const;

const personnelStatusVariant = {
  'مشغول کار': 'default',
  'اتمام کار': 'destructive',
  'مرخصی': 'secondary',
  'غیبت': 'outline',
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

       <div className="mt-6">
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
                                            <Badge variant={residentStatusVariant[resident.status]}>
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
