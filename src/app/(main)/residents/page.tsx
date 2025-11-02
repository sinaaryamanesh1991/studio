'use client';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useData } from '@/context/data-context';
import { MoreHorizontal, Edit } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Resident } from '@/lib/types';
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

const statusVariant = {
  'ساکن': 'default',
  'غیر ساکن': 'secondary',
} as const;


export default function ResidentsPage() {
    const { residents, setResidents } = useData();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingResident, setEditingResident] = useState<Resident | null>(null);

    const handleEdit = (resident: Resident) => {
        setEditingResident(resident);
        setIsDialogOpen(true);
    };

    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingResident) return;

        const formData = new FormData(e.currentTarget);
        const updatedResident: Resident = {
            ...editingResident,
            name: formData.get('name') as string,
            familyName: formData.get('familyName') as string,
            phone: formData.get('phone') as string,
            carPlates: formData.get('carPlates') as string,
            villaNumber: parseInt(formData.get('villaNumber') as string, 10),
            status: formData.get('status') as Resident['status'],
        };

        setResidents(prev => prev.map(r => r.id === updatedResident.id ? updatedResident : r));
        setIsDialogOpen(false);
        setEditingResident(null);
    };


    return (
        <>
            <PageHeader title="مدیریت ساکنین" />
            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>شماره ویلا</TableHead>
                                <TableHead>نام</TableHead>
                                <TableHead>نام خانوادگی</TableHead>
                                <TableHead>شماره تماس</TableHead>
                                <TableHead>پلاک خودرو</TableHead>
                                <TableHead>وضعیت</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {residents.map((resident) => (
                                <TableRow key={resident.id}>
                                    <TableCell className="font-medium">{resident.villaNumber}</TableCell>
                                    <TableCell>{resident.name}</TableCell>
                                    <TableCell>{resident.familyName}</TableCell>
                                    <TableCell>{resident.phone}</TableCell>
                                    <TableCell>{resident.carPlates}</TableCell>
                                    <TableCell>
                                        <Badge variant={statusVariant[resident.status]}>{resident.status}</Badge>
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
                                                <DropdownMenuItem onClick={() => handleEdit(resident)}>
                                                    <Edit className="ms-2 h-4 w-4" />
                                                    ویرایش
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
                <DialogContent className="sm:max-w-[425px] font-body">
                    <form onSubmit={handleSave}>
                        <DialogHeader>
                            <DialogTitle>ویرایش اطلاعات ساکن</DialogTitle>
                            <DialogDescription>
                                اطلاعات ساکن مورد نظر را ویرایش کنید.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="villaNumber" className="text-right">شماره ویلا</Label>
                                <Input id="villaNumber" name="villaNumber" defaultValue={editingResident?.villaNumber} className="col-span-3" readOnly />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">نام</Label>
                                <Input id="name" name="name" defaultValue={editingResident?.name} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="familyName" className="text-right">نام خانوادگی</Label>
                                <Input id="familyName" name="familyName" defaultValue={editingResident?.familyName} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="phone" className="text-right">شماره تماس</Label>
                                <Input id="phone" name="phone" defaultValue={editingResident?.phone} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="carPlates" className="text-right">پلاک خودرو</Label>
                                <Input id="carPlates" name="carPlates" defaultValue={editingResident?.carPlates} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="status" className="text-right">وضعیت</Label>
                                <Select name="status" defaultValue={editingResident?.status}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="انتخاب وضعیت" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ساکن">ساکن</SelectItem>
                                        <SelectItem value="غیر ساکن">غیر ساکن</SelectItem>
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
