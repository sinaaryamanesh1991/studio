'use client';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useData } from '@/context/data-context';
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

export default function BoardMembersPage() {
    const { boardMembers, setBoardMembers, residents } = useData();
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
        setBoardMembers(prev => prev.filter(m => m.id !== id));
    };
    
    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const residentId = formData.get('residentId') as string;
        const position = formData.get('position') as string;

        const selectedResident = residents.find(r => r.id === residentId);
        if (!selectedResident) return;

        const newMemberData = {
            residentId,
            name: selectedResident.name,
            familyName: selectedResident.familyName,
            phone: selectedResident.phone,
            villaNumber: selectedResident.villaNumber,
            position,
        };

        if (editingMember) {
            setBoardMembers(prev => prev.map(m => m.id === editingMember.id ? { ...m, ...newMemberData } : m));
        } else {
            setBoardMembers(prev => [...prev, { id: `b${Date.now()}`, ...newMemberData }]);
        }
        setIsDialogOpen(false);
        setEditingMember(null);
    };

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
                            {boardMembers.map((member) => (
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
                                        {residents.filter(r => r.status === 'ساکن').map(resident => (
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
