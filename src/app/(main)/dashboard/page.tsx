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

const statusVariant = {
  'ساکن': 'default',
  'خالی': 'secondary',
} as const;

export default function DashboardPage() {
  const { personnel, residents, setResidents, boardMembers, exportData, importData } = useData();
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
            <div className="text-2xl font-bold">{residents.filter(r => r.status === 'ساکن').length} خانوار</div>
            <p className="text-xs text-muted-foreground">تعداد واحدهای دارای سکنه</p>
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
                            <TableHead>وضعیت</TableHead>
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
