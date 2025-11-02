'use client';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useData } from '@/context/data-context';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Users, Home, UserCheck, FileDown, FileUp, Building2 } from 'lucide-react';
import type { BoardMember, Resident } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useRef } from 'react';

const statusVariant = {
  'ساکن': 'default',
  'غیر ساکن': 'secondary',
} as const;

export default function DashboardPage() {
  const { personnel, residents, boardMembers, exportData, importData } = useData();
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

  const residentStatusData = [
    { status: 'ساکن', count: residents.filter(r => r.status === 'ساکن').length, fill: 'hsl(var(--chart-1))' },
    { status: 'غیر ساکن', count: residents.filter(r => r.status === 'غیر ساکن').length, fill: 'hsl(var(--chart-2))' },
  ]

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
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{boardMembers.length} نفر</div>
            <p className="text-xs text-muted-foreground">تعداد اعضای هیئت مدیره</p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6">
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>وضعیت سکونت</CardTitle>
                <CardDescription>نمودار وضعیت سکونت واحدها</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={{}} className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Tooltip
                                cursor={{ fill: 'hsl(var(--muted))' }}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Pie data={residentStatusData} dataKey="count" nameKey="status" innerRadius={50} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
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
                                    <Badge variant={statusVariant[resident.status]}>
                                        {resident.status}
                                    </Badge>
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
                            <TableHead>وضعیت سکونت</TableHead>
                            <TableHead>شماره ویلا</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {boardMembers.map((member: BoardMember) => (
                            <TableRow key={member.id}>
                                <TableCell className="font-medium">{member.name} {member.familyName}</TableCell>
                                <TableCell>{member.phone}</TableCell>
                                <TableCell>
                                    <Badge variant={member.isResident ? 'default' : 'secondary'}>
                                        {member.isResident ? 'ساکن' : 'خیر'}
                                    </Badge>
                                </TableCell>
                                <TableCell>{member.isResident ? member.villaNumber : '-'}</TableCell>
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
