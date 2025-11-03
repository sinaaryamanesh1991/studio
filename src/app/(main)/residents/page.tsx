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
import type { Resident, Villa } from '@/lib/types';
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
    const { data: residents, isLoading: loadingResidents } = useCollection<Resident>(residentsQuery);

    const villasQuery = useMemoFirebase(() => estateId ? collection(firestore, 'estates', estateId, 'villas') : null, [firestore, estateId]);
    const { data: villas, isLoading: loadingVillas } = useCollection<Villa>(villasQuery);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingResident, setEditingResident] = useState<Resident | null>(null);

    // State for occupant type within the dialog
    const [dialogOccupantType, setDialogOccupantType] = useState<'owner' | 'tenant'>('owner');

    const handleEdit = (resident: Resident) => {
        setEditingResident(resident);
        setDialogOccupantType(resident.occupantType);
        setIsDialogOpen(true);
    };
    
    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingResident || !estateId) return;

        const formData = new FormData(e.currentTarget);
        const newStatus = formData.get('status') as Resident['status'];
        const newOccupantType = (formData.get('occupantType') === 'on' ? 'tenant' : 'owner') as Resident['occupantType'];
        
        const tenantName = newOccupantType === 'tenant' ? (formData.get('tenantName') as string) : '';
        const tenantPhone = newOccupantType === 'tenant' ? (formData.get('tenantPhone') as string) : '';
        const ownerPhone = newOccupantType === 'owner' ? (formData.get('phone') as string) : editingResident.phone;


        const updatedResident: Resident = {
            ...editingResident,
            tenantName: tenantName,
            tenantPhone: tenantPhone,
            phone: ownerPhone,
            carPlates: formData.get('carPlates') as string,
            status: newStatus,
            isPresent: newStatus === 'ساکن',
            occupantType: newOccupantType,
        };

        const residentRef = doc(firestore, 'estates', estateId, 'residents', updatedResident.id);
        setDocumentNonBlocking(residentRef, updatedResident, { merge: true });

        // Also update the related villa
        const villa = villas?.find(v => v.id === editingResident.villaId);
        if (villa) {
            const villaRef = doc(firestore, 'estates', estateId, 'villas', editingResident.villaId);
            setDocumentNonBlocking(villaRef, { occupantType: newOccupantType }, { merge: true });
        }


        setIsDialogOpen(false);
        setEditingResident(null);
    };

    const handleStatusChange = (resident: Resident, isPresent: boolean) => {
        if (!estateId) return;
        const residentRef = doc(firestore, 'estates', estateId, 'residents', resident.id);
        const updatedData = { ...resident, isPresent, status: isPresent ? 'ساکن' : 'خالی' };
        setDocumentNonBlocking(residentRef, updatedData, { merge: true });
    };

    const isLoading = loadingResidents || loadingVillas;

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
                                <TableHead>نام ساکن</TableHead>
                                <TableHead>شماره تماس</TableHead>
                                <TableHead>پلاک خودرو</TableHead>
                                <TableHead>وضعیت</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {residents?.sort((a, b) => a.villaNumber - b.villaNumber).map((resident) => {
                                const displayName = resident.occupantType === 'tenant' && resident.tenantName ? resident.tenantName : `${resident.name} ${resident.familyName}`;
                                const displayPhone = resident.occupantType === 'tenant' ? resident.tenantPhone : resident.phone;
                                return (
                                <TableRow key={resident.id}>
                                    <TableCell className="font-medium font-mono">{String(resident.villaNumber).padStart(2, '0')}</TableCell>
                                    <TableCell>{displayName}</TableCell>
                                    <TableCell>{displayPhone}</TableCell>
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
                            )})}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md font-body">
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
                                <Label className="text-right">نام مالک</Label>
                                <p className="col-span-3 text-sm font-medium text-muted-foreground">
                                    {villas?.find(v => v.id === editingResident?.villaId)?.owner || 'نامشخص'}
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="occupantType" className="text-right">نوع سکونت</Label>
                                <div className="col-span-3 flex items-center space-x-2 space-x-reverse">
                                  <Switch
                                      id="occupantType"
                                      name="occupantType"
                                      checked={dialogOccupantType === 'tenant'}
                                      onCheckedChange={(checked) => setDialogOccupantType(checked ? 'tenant' : 'owner')}
                                  />
                                  <Label htmlFor="occupantType">{dialogOccupantType === 'tenant' ? 'مستاجر' : 'مالک'}</Label>
                                </div>
                            </div>
                            
                            {dialogOccupantType === 'tenant' ? (
                                <>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="tenantName" className="text-right">نام مستاجر</Label>
                                        <Input id="tenantName" name="tenantName" defaultValue={editingResident?.tenantName} className="col-span-3" placeholder="نام کامل مستاجر را وارد کنید"/>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="tenantPhone" className="text-right">تماس مستاجر</Label>
                                        <Input id="tenantPhone" name="tenantPhone" defaultValue={editingResident?.tenantPhone} className="col-span-3" placeholder="شماره موبایل مستاجر"/>
                                    </div>
                                </>
                            ) : (
                                <>
                                     <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="phone" className="text-right">شماره تماس مالک</Label>
                                        <Input id="phone" name="phone" defaultValue={editingResident?.phone} className="col-span-3" />
                                    </div>
                                </>
                            )}

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
