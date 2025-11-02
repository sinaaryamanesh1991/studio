'use client';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { PlusCircle, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Personnel } from '@/lib/types';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { collection, doc } from 'firebase/firestore';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';

const statusVariant = {
  'مشغول کار': 'default',
  'اتمام کار': 'destructive',
  'مرخصی': 'secondary',
  'غیبت': 'outline',
} as const;


export default function PersonnelPage() {
    const { firestore, user } = useFirebase();
    const estateId = user?.uid;
    const personnelQuery = useMemoFirebase(() => estateId ? collection(firestore, 'estates', estateId, 'personnel') : null, [firestore, estateId]);
    const { data: personnel, isLoading } = useCollection<Personnel>(personnelQuery);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPersonnel, setEditingPersonnel] = useState<Personnel | null>(null);

    const handleAddNew = () => {
        setEditingPersonnel(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (person: Personnel) => {
        setEditingPersonnel(person);
        setIsDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        if (!estateId) return;
        deleteDocumentNonBlocking(doc(firestore, 'estates', estateId, 'personnel', id));
    };
    
    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!estateId) return;

        const formData = new FormData(e.currentTarget);
        const personId = editingPersonnel ? editingPersonnel.id : `p${Date.now()}`;
        
        const newPerson: Personnel = {
            id: personId,
            name: formData.get('name') as string,
            familyName: formData.get('familyName') as string,
            phone: formData.get('phone') as string,
            hireDate: formData.get('hireDate') as string,
            position: formData.get('position') as Personnel['position'],
            status: formData.get('status') as Personnel['status'],
            nationalId: formData.get('nationalId') as string,
            accountNumber: formData.get('accountNumber') as string,
            insuranceNumber: formData.get('insuranceNumber') as string,
            estateId: estateId,
        };
        
        const personRef = doc(firestore, 'estates', estateId, 'personnel', personId);
        setDocumentNonBlocking(personRef, newPerson, { merge: true });

        setIsDialogOpen(false);
        setEditingPersonnel(null);
    };

    if (isLoading) {
        return <div>در حال بارگذاری...</div>
    }


    return (
        <>
            <PageHeader title="مدیریت پرسنل">
                <Button onClick={handleAddNew}>
                    <PlusCircle className="ms-2 h-4 w-4" />
                    افزودن پرسنل جدید
                </Button>
            </PageHeader>
            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>شماره پرسنلی</TableHead>
                                <TableHead>نام</TableHead>
                                <TableHead>نام خانوادگی</TableHead>
                                <TableHead>تاریخ استخدام</TableHead>
                                <TableHead>شماره تماس</TableHead>
                                <TableHead>سمت</TableHead>
                                <TableHead>وضعیت</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {personnel?.map((person) => (
                                <TableRow key={person.id}>
                                    <TableCell className="font-mono">{person.id}</TableCell>
                                    <TableCell>{person.name}</TableCell>
                                    <TableCell>{person.familyName}</TableCell>
                                    <TableCell>{person.hireDate}</TableCell>
                                    <TableCell>{person.phone}</TableCell>
                                    <TableCell>{person.position}</TableCell>
                                    <TableCell>
                                        <Badge variant={statusVariant[person.status]}>{person.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-left">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">باز کردن منو</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start" className="font-body">
                                                <DropdownMenuItem onClick={() => handleEdit(person)}>
                                                    <Edit className="ms-2 h-4 w-4" />
                                                    ویرایش
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(person.id)}>
                                                    <Trash2 className="ms-2 h-4 w-4" />
                                                    حذف
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md font-body">
                    <form onSubmit={handleSave}>
                        <DialogHeader>
                            <DialogTitle>{editingPersonnel ? 'ویرایش پرسنل' : 'افزودن پرسنل جدید'}</DialogTitle>
                            <DialogDescription>
                                اطلاعات فرد مورد نظر را وارد یا ویرایش کنید.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-2">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">نام</Label>
                                <Input id="name" name="name" defaultValue={editingPersonnel?.name} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="familyName" className="text-right">نام خانوادگی</Label>
                                <Input id="familyName" name="familyName" defaultValue={editingPersonnel?.familyName} className="col-span-3" />
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="nationalId" className="text-right">کد ملی</Label>
                                <Input id="nationalId" name="nationalId" defaultValue={editingPersonnel?.nationalId} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="phone" className="text-right">شماره تماس</Label>
                                <Input id="phone" name="phone" defaultValue={editingPersonnel?.phone} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="hireDate" className="text-right">تاریخ استخدام</Label>
                                <Input id="hireDate" name="hireDate" defaultValue={editingPersonnel?.hireDate} className="col-span-3" placeholder="مثال: 1403-01-20" />
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="accountNumber" className="text-right">شماره حساب</Label>
                                <Input id="accountNumber" name="accountNumber" defaultValue={editingPersonnel?.accountNumber} className="col-span-3" />
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="insuranceNumber" className="text-right">شماره بیمه</Label>
                                <Input id="insuranceNumber" name="insuranceNumber" defaultValue={editingPersonnel?.insuranceNumber} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="position" className="text-right">سمت</Label>
                                <Select name="position" defaultValue={editingPersonnel?.position}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="انتخاب سمت" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="سرایدار">سرایدار</SelectItem>
                                        <SelectItem value="خدمات">خدمات</SelectItem>
                                        <SelectItem value="نگهبان">نگهبان</SelectItem>
                                        <SelectItem value="حسابدار">حسابدار</SelectItem>
                                        <SelectItem value="مدیر شهرک">مدیر شهرک</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="status" className="text-right">وضعیت</Label>
                                <Select name="status" defaultValue={editingPersonnel?.status}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="انتخاب وضعیت" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="مشغول کار">مشغول کار</SelectItem>
                                        <SelectItem value="اتمام کار">اتمام کار</SelectItem>
                                        <SelectItem value="مرخصی">مرخصی</SelectItem>
                                        <SelectItem value="غیبت">غیبت</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">انصراف</Button>
                            </DialogClose>
                            <Button type="submit">ذخیره</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
