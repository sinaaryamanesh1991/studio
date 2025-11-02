'use client';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { PlusCircle, MoreHorizontal, Eye, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { Document, Personnel, Resident } from '@/lib/types';
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
import { format } from 'date-fns-jalali';

export default function DocumentsPage() {
    const { firestore, user } = useFirebase();
    const estateId = user?.uid;
    
    const documentsQuery = useMemoFirebase(() => estateId ? collection(firestore, 'estates', estateId, 'documents') : null, [firestore, estateId]);
    const { data: documents, isLoading: loadingDocs } = useCollection<Document>(documentsQuery);

    const personnelQuery = useMemoFirebase(() => estateId ? collection(firestore, 'estates', estateId, 'personnel') : null, [firestore, estateId]);
    const { data: personnel, isLoading: loadingPersonnel } = useCollection<Personnel>(personnelQuery);

    const residentsQuery = useMemoFirebase(() => estateId ? collection(firestore, 'estates', estateId, 'residents') : null, [firestore, estateId]);
    const { data: residents, isLoading: loadingResidents } = useCollection<Resident>(residentsQuery);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Document['category'] | ''>('');

    const { toast } = useToast();

    const handleSaveDocument = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!estateId || !selectedCategory) return;

        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const file = formData.get('file') as File;
        
        // In a real app, you would upload the file to Firebase Storage here
        // and get the URL. For now, we'll use a placeholder.
        if (file.size === 0) {
            toast({
                variant: 'destructive',
                title: 'خطا',
                description: 'لطفا یک فایل برای بارگذاری انتخاب کنید.',
            });
            return;
        }

        const newDoc: Omit<Document, 'id'> = {
            name,
            category: selectedCategory,
            uploadDate: format(new Date(), 'yyyy/MM/dd'),
            url: `placeholder/documents/${file.name}`,
            fileName: file.name,
            relatedEntityId: formData.get('relatedEntityId') as string || '',
            description: formData.get('description') as string || '',
            estateId,
        };

        addDocumentNonBlocking(collection(firestore, 'estates', estateId, 'documents'), newDoc);
        
        toast({ title: 'موفقیت', description: 'سند با موفقیت برای بارگذاری ثبت شد.' });
        setIsDialogOpen(false);
        setSelectedCategory('');
    };

    const handleDelete = (id: string) => {
        if (!estateId) return;
        deleteDocumentNonBlocking(doc(firestore, 'estates', estateId, 'documents', id));
        toast({ title: 'سند حذف شد' });
    };

    const handleView = () => {
        toast({
            title: 'قابلیت در دست ساخت',
            description: 'امکان مشاهده فایل در نسخه نهایی اضافه خواهد شد.',
        });
    };

    const getRelatedEntityName = (doc: Document) => {
        if (!doc.relatedEntityId) return doc.description || '-';
        if (doc.category === 'پرسنل') {
            const p = personnel?.find(p => p.id === doc.relatedEntityId);
            return p ? `${p.name} ${p.familyName}` : 'یافت نشد';
        }
        if (doc.category === 'ساکنین') {
            const r = residents?.find(r => r.id === doc.relatedEntityId);
            return r ? `${r.name} ${r.familyName}` : 'یافت نشد';
        }
        return '-';
    }
    
    const isLoading = loadingDocs || loadingPersonnel || loadingResidents;

    if (isLoading) {
        return <div>در حال بارگذاری...</div>;
    }

    return (
        <>
            <PageHeader title="اسناد و مدارک">
                <Button onClick={() => setIsDialogOpen(true)}>
                    <PlusCircle className="ms-2 h-4 w-4" />
                    بارگذاری سند جدید
                </Button>
            </PageHeader>
            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>نام سند</TableHead>
                                <TableHead>دسته بندی</TableHead>
                                <TableHead>موجودیت مرتبط / توضیحات</TableHead>
                                <TableHead>تاریخ بارگذاری</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {documents?.map((doc) => (
                                <TableRow key={doc.id}>
                                    <TableCell className="font-medium">{doc.name}</TableCell>
                                    <TableCell>{doc.category}</TableCell>
                                    <TableCell>{getRelatedEntityName(doc)}</TableCell>
                                    <TableCell>{doc.uploadDate}</TableCell>
                                    <TableCell className="text-left">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">باز کردن منو</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start" className="font-body">
                                                <DropdownMenuItem onClick={handleView}>
                                                    <Eye className="ms-2 h-4 w-4" />
                                                    مشاهده
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(doc.id)}>
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

             <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
                 if(!isOpen) setSelectedCategory('');
                 setIsDialogOpen(isOpen);
             }}>
                <DialogContent className="sm:max-w-lg font-body">
                    <form onSubmit={handleSaveDocument}>
                        <DialogHeader>
                            <DialogTitle>بارگذاری سند جدید</DialogTitle>
                            <DialogDescription>
                                اطلاعات و فایل سند مورد نظر را وارد کنید.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                             <div className="space-y-2">
                                <Label htmlFor="name">نام سند</Label>
                                <Input id="name" name="name" placeholder="مثال: قرارداد نگهبانی" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">نوع سند</Label>
                                <Select onValueChange={(value: Document['category']) => setSelectedCategory(value)} required>
                                    <SelectTrigger id="category">
                                        <SelectValue placeholder="دسته‌بندی سند را انتخاب کنید" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="شهرک">شهرک</SelectItem>
                                        <SelectItem value="پرسنل">پرسنل</SelectItem>
                                        <SelectItem value="ساکنین">ساکنین</SelectItem>
                                        <SelectItem value="ویلا">ویلا</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            {selectedCategory === 'پرسنل' && (
                                <div className="space-y-2">
                                    <Label htmlFor="relatedEntityId">انتخاب پرسنل</Label>
                                    <Select name="relatedEntityId" required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="پرسنل مورد نظر را انتخاب کنید" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {personnel?.map(p => (
                                                <SelectItem key={p.id} value={p.id}>{p.name} {p.familyName}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                             {selectedCategory === 'ساکنین' && (
                                <div className="space-y-2">
                                    <Label htmlFor="relatedEntityId">انتخاب ساکن</Label>
                                    <Select name="relatedEntityId" required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="ساکن مورد نظر را انتخاب کنید" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {residents?.map(r => (
                                                <SelectItem key={r.id} value={r.id}>{r.name} {r.familyName} (ویلا {r.villaNumber})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {(selectedCategory === 'ویلا' || selectedCategory === 'شهرک') && (
                                 <div className="space-y-2">
                                    <Label htmlFor="description">توضیحات</Label>
                                    <Input id="description" name="description" placeholder={`توضیحاتی در مورد سند مربوط به ${selectedCategory}`} required />
                                </div>
                            )}
                            
                            <div className="space-y-2">
                                <Label htmlFor="file">فایل سند</Label>
                                <Input id="file" name="file" type="file" required />
                                <p className="text-xs text-muted-foreground">
                                    توجه: قابلیت آپلود در حال حاضر شبیه‌سازی شده است.
                                </p>
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
