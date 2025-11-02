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
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { Document } from '@/lib/types';

export default function DocumentsPage() {
    const { firestore, user } = useFirebase();
    const estateId = user?.uid;
    const documentsQuery = useMemoFirebase(() => estateId ? collection(firestore, 'estates', estateId, 'documents') : null, [firestore, estateId]);
    const { data: documents, isLoading } = useCollection<Document>(documentsQuery);
    
    const { toast } = useToast();

    const handleDelete = (id: string) => {
        if (!estateId) return;
        deleteDocumentNonBlocking(doc(firestore, 'estates', estateId, 'documents', id));
        toast({ title: 'سند حذف شد' });
    };

    const handleUpload = () => {
        toast({
            title: 'قابلیت در دست ساخت',
            description: 'امکان آپلود فایل در نسخه نهایی اضافه خواهد شد.',
        });
    }

    const handleView = () => {
        toast({
            title: 'قابلیت در دست ساخت',
            description: 'امکان مشاهده فایل در نسخه نهایی اضافه خواهد شد.',
        });
    }

    if (isLoading) {
        return <div>در حال بارگذاری...</div>;
    }

    return (
        <>
            <PageHeader title="اسناد و مدارک">
                <Button onClick={handleUpload}>
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
                                <TableHead>تاریخ بارگذاری</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {documents?.map((doc) => (
                                <TableRow key={doc.id}>
                                    <TableCell className="font-medium">{doc.name}</TableCell>
                                    <TableCell>{doc.category}</TableCell>
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
        </>
    );
}
