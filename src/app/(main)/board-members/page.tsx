'use client';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { PlusCircle, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { BoardMember, Resident } from '@/lib/types';
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

export default function BoardMembersPage() {
    const { firestore, user } = useFirebase();
    const estateId = user?.uid;

    const boardMembersQuery = useMemoFirebase(() => estateId ? collection(firestore, 'estates', estateId, 'boardMembers') : null, [firestore, estateId]);
    const { data: boardMembers, isLoading: loadingBoardMembers } = useCollection<BoardMember>(boardMembersQuery);

    const residentsQuery = useMemoFirebase(() => estateId ? collection(firestore, 'estates', estateId, 'residents') : null, [firestore, estateId]);
    const { data: residents, isLoading: loadingResidents } = useCollection<Resident>(residentsQuery);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<BoardMember | null>(null);

    const handleAddNew = () => {
        setEditingMember(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (member: BoardMember) => {
        setEditingMember(member);
        setIsDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        if (!estateId) return;
        deleteDocumentNonBlocking(doc(firestore, 'estates', estateId, 'boardMembers', id));
    };
    
    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!estateId || !residents) return;

        const formData = new FormData(e.currentTarget);
        const residentId = formData.get('residentId') as string;
        const position = formData.get('position') as string;

        const selectedResident = residents.find(r => r.id === residentId);
        if (!selectedResident) return;

        const memberId = editingMember ? editingMember.id : `b${Date.now()}`;

        const newMemberData: BoardMember = {
            id: memberId,
            residentId,
            name: selectedResident.name,
            familyName: selectedResident.familyName,
            phone: selectedResident.phone,
            villaNumber: selectedResident.villaNumber,
            position,
            estateId: estateId,
        };

        const memberRef = doc(firestore, 'estates', estateId, 'boardMembers', memberId);
        setDocumentNonBlocking(memberRef, newMemberData, { merge: true });
        
        setIsDialogOpen(false);
        setEditingMember(null);
    };
    
    const isLoading = loadingBoardMembers || loadingResidents;

    if (isLoading) {
        return <div>در حال بارگذاری...</div>;
    }

    return (
        <>
            <PageHeader title="مدیریت هیئت مدیره">
                <Button onClick={handleAddNew}>
                    <PlusCircle className="ms-2 h-4 w-4" />
                    افزودن عضو جدید
                </Button>
            </PageHeader>
            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>نام و نام خانوادگی</TableHead>
                                <TableHead>شماره ویلا</TableHead>
                                <TableHead>شماره تماس</TableHead>
                                <TableHead>سمت</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {boardMembers?.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell className="font-medium">{member.name} {member.familyName}</TableCell>
                                    <TableCell>{member.villaNumber}</TableCell>
                                    <TableCell>{member.phone}</TableCell>
                                    <TableCell>{member.position}</TableCell>
                                    <TableCell className="text-left">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">باز کردن منو</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start" className="font-body">
                                                <DropdownMenuItem onClick={() => handleEdit(member)}>
                                                    <Edit className="ms-2 h-4 w-4" />
                                                    ویرایش
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(member.id)}>
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
                <DialogContent className="sm:max-w-[425px] font-body">
                    <form onSubmit={handleSave}>
                        <DialogHeader>
                            <DialogTitle>{editingMember ? 'ویرایش عضو هیئت مدیره' : 'افزودن عضو جدید'}</DialogTitle>
                            <DialogDescription>
                                اطلاعات عضو مورد نظر را وارد یا ویرایش کنید.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="residentId" className="text-right">انتخاب ساکن</Label>
                                <Select name="residentId" defaultValue={editingMember?.residentId}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="یکی از ساکنین را انتخاب کنید" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {residents?.filter(r => r.status === 'ساکن').map(resident => (
                                            <SelectItem key={resident.id} value={resident.id}>
                                                {resident.name} {resident.familyName} (ویلا {resident.villaNumber})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="position" className="text-right">سمت</Label>
                                <Input id="position" name="position" defaultValue={editingMember?.position} className="col-span-3" placeholder="مثال: مدیر عامل"/>
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
