'use client';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useData } from '@/context/data-context';
import { Users, Home, UserCheck, FileDown, FileUp, Briefcase } from 'lucide-react';
import type { Resident } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useRef } from 'react';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';

const statusVariant = {
  'ساکن': 'default',
  'خالی': 'secondary',
} as const;

const ownerStatusVariant = {
    'مالک ساکن است': 'default',
    'ویلا خالی است': 'secondary',
    'ساکن مستاجر است': 'outline',
};


export default function DashboardPage() {
  const { personnel, residents, setResidents, boardMembers, villas, exportData, importData, isLoading } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importData(file);
    }
  };

  const handleStatusChange = (residentId: string, isPresent: boolean) => {
    setResidents(prev =>
      prev.map(r =>
        r.id === residentId
          ? { ...r, isPresent: isPresent, status: isPresent ? 'ساکن' : 'خالی' }
          : r
      )
    );
  };
  
  const residentCount = residents.length;
  const presentCount = residents.filter(r => r.status === 'ساکن').length;

  const getOwnerStatus = (villaId: number): { text: string; variant: keyof typeof ownerStatusVariant } => {
    const resident = residents.find(r => r.villaNumber === villaId);
    const villa = villas.find(v => v.id === villaId);

    if (resident && resident.status === 'ساکن') {
      // A simple check to see if owner name is part of the resident name
      if (villa && (resident.name.includes(villa.owner) || resident.familyName.includes(villa.owner) || villa.owner.includes(resident.name) || villa.owner.includes(resident.familyName))) {
        return { text: 'مالک ساکن است', variant: 'مالک ساکن است' };
      }
      return { text: 'ساکن مستاجر است', variant: 'ساکن مستاجر است' };
    }
    return { text: 'ویلا خالی است', variant: 'ویلا خالی است' };
  };

  if (isLoading) {
    return (
      <>
        <PageHeader title="داشبورد">
           <Skeleton className="h-10 w-28" />
           <Skeleton className="h-10 w-28" />
        </PageHeader>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card><CardHeader><Skeleton className="h-4 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/3" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-4 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/3" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-4 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/3" /></CardContent></Card>
        </div>
         <div className="mt-6">
            <Card>
                <CardHeader><CardTitle><Skeleton className="h-6 w-1/4" /></CardTitle><CardDescription><Skeleton className="h-4 w-1/2" /></CardDescription></CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
      </>
    )
  }


  return (
    <>
      <PageHeader title="داشبورد">
        <Button variant="outline" onClick={handleImportClick}>
            <FileUp className="ms-2 h-4 w-4" />
            ورود اطلاعات
        </Button>
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".json"
        />
        <Button onClick={exportData}>
            <FileDown className="ms-2 h-4 w-4" />
            خروجی اطلاعات
        </Button>
      </PageHeader>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تعداد پرسنل</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{personnel.length} نفر</div>
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
            <p className="text-xs text-muted-foreground">از مجموع {residentCount} واحد</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">اعضای هیئت مدیره</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{boardMembers.length} نفر</div>
            <p className="text-xs text-muted-foreground">تعداد اعضای هیئت مدیره</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6">
        <Card>
            <CardHeader>
                <CardTitle>لیست ساکنین</CardTitle>
                <CardDescription>اطلاعات تماس و وضعیت سکونت ساکنین</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>شماره ویلا</TableHead>
                            <TableHead>نام</TableHead>
                            <TableHead>نام خانوادگی</TableHead>
                            <TableHead>شماره تماس</TableHead>
                            <TableHead>پلاک خودرو</TableHead>
                            <TableHead>وضعیت سکونت</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {residents.map((resident: Resident) => (
                            <TableRow key={resident.id}>
                                <TableCell className="font-medium">{resident.villaNumber}</TableCell>
                                <TableCell>{resident.name}</TableCell>
                                <TableCell>{resident.familyName}</TableCell>
                                <TableCell>{resident.phone}</TableCell>
                                <TableCell>{resident.carPlates}</TableCell>
                                <TableCell>
                                    <div className="flex items-center space-x-2 space-x-reverse">
                                        <Switch
                                            id={`status-switch-${resident.id}`}
                                            checked={resident.isPresent}
                                            onCheckedChange={(checked) => handleStatusChange(resident.id, checked)}
                                            aria-label="وضعیت سکونت"
                                        />
                                        <Badge variant={statusVariant[resident.status]}>
                                            {resident.status}
                                        </Badge>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
      <div className="mt-6">
        <Card>
            <CardHeader>
                <CardTitle>لیست صاحبین و وضعیت ویلاها</CardTitle>
                <CardDescription>فهرست مالکین ویلاها و وضعیت فعلی سکونت هر ویلا.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>شماره ویلا</TableHead>
                            <TableHead>نام مالک</TableHead>
                            <TableHead>شماره تماس مالک</TableHead>
                            <TableHead>وضعیت ویلا</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {villas.sort((a, b) => a.id - b.id).map((villa) => {
                            const status = getOwnerStatus(villa.id);
                            return (
                                <TableRow key={villa.id}>
                                    <TableCell className="font-medium">{villa.id}</TableCell>
                                    <TableCell>{villa.owner}</TableCell>
                                    <TableCell>{villa.phone}</TableCell>
                                    <TableCell>
                                        <Badge variant={ownerStatusVariant[status.variant]}>
                                            {status.text}
                                        </Badge>
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
                        {boardMembers.map((member) => (
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
