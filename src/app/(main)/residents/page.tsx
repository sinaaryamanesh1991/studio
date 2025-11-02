'use client';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { collection, doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

const statusVariant = {
  'ساکن': 'default',
  'خالی': 'secondary',
} as const;


export default function ResidentsPage() {
    const { firestore, user } = useFirebase();
    const estateId = user?.uid;
    const residentsQuery = useMemoFirebase(() => estateId ? collection(firestore, 'estates', estateId, 'residents') : null, [firestore, estateId]);
    const { data: residents, isLoading } = useCollection<Resident>(residentsQuery);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingResident, setEditingResident] = useState<Resident | null>(null);

    const handleEdit = (resident: Resident) => {
        setEditingResident(resident);
        setIsDialogOpen(true);
    };
    
    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingResident || !estateId) return;

        const formData = new FormData(e.currentTarget);
        const newStatus = formData.get('status') as Resident['status'];
        const updatedResident: Resident = {
            ...editingResident,
            name: formData.get('name') as string,
            familyName: formData.get('familyName') as string,
            phone: formData.get('phone') as string,
            carPlates: formData.get('carPlates') as string,
            villaNumber: parseInt(formData.get('villaNumber') as string, 10),
            status: newStatus,
            isPresent: newStatus === 'ساکن',
        };

        const residentRef = doc(firestore, 'estates', estateId, 'residents', updatedResident.id);
        setDocumentNonBlocking(residentRef, updatedResident, { merge: true });

        setIsDialogOpen(false);
        setEditingResident(null);
    };

    const handleStatusChange = (resident: Resident, isPresent: boolean) => {
        if (!estateId) return;
        const residentRef = doc(firestore, 'estates', estateId, 'residents', resident.id);
        const updatedData = { ...resident, isPresent, status: isPresent ? 'ساکن' : 'خالی' };
        setDocumentNonBlocking(residentRef, updatedData, { merge: true });
    };

    if (isLoading) {
        return <div>در حال بارگذاری...</div>;
    }

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
                            {residents?.sort((a, b) => a.villaNumber - b.villaNumber).map((resident) => (
                                <TableRow key={resident.id}>
                                    <TableCell className="font-medium font-mono">{String(resident.villaNumber).padStart(2, '0')}</TableCell>
                                    <TableCell>{resident.name}</TableCell>
                                    <TableCell>{resident.familyName}</TableCell>
                                    <TableCell>{resident.phone}</TableCell>
                                    <TableCell>{resident.carPlates}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2 space-x-reverse">
                                            <Switch
                                                checked={resident.isPresent}
                                                onCheckedChange={(checked) => handleStatusChange(resident, checked)}
                                                aria-label="وضعیت سکونت"
                                            />
                                            <Badge variant={statusVariant[resident.status]}>{resident.status}</Badge>
                                        </div>
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
                                        <SelectItem value="خالی">خالی</SelectItem>
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
