'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useData } from '@/context/data-context';
import type { Villa } from '@/lib/types';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { Home } from 'lucide-react';

export default function MapPage() {
    const { villas, setVillas } = useData();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedVilla, setSelectedVilla] = useState<Villa | null>(null);

    const handleCardClick = (villa: Villa) => {
        setSelectedVilla(villa);
        setIsDialogOpen(true);
    };

    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedVilla) return;

        const formData = new FormData(e.currentTarget);
        const updatedVilla: Villa = {
            ...selectedVilla,
            name: formData.get('name') as string,
            owner: formData.get('owner') as string,
            area: parseInt(formData.get('area') as string, 10),
            residentInfo: formData.get('residentInfo') as string,
        };

        setVillas(prev => prev.map(v => v.id === updatedVilla.id ? updatedVilla : v));
        setIsDialogOpen(false);
        setSelectedVilla(null);
    };

    return (
        <>
            <PageHeader title="نقشه شهرک" />
            <Card>
                <CardHeader>
                    <CardTitle>نمای کلی شهرک</CardTitle>
                    <CardDescription>
                        بر روی هر ویلا کلیک کنید تا اطلاعات آن را مشاهده و ویرایش کنید. در نسخه نهایی، این نقشه کاملا تعاملی خواهد بود.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {villas.map(villa => (
                            <Card 
                                key={villa.id} 
                                className="cursor-pointer hover:shadow-lg hover:border-primary transition-all"
                                onClick={() => handleCardClick(villa)}
                            >
                                <CardHeader className="flex-row gap-4 items-center p-4">
                                    <div className="p-2 bg-primary/10 rounded-md">
                                        <Home className="w-6 h-6 text-primary"/>
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{villa.name}</CardTitle>
                                        <CardDescription>{villa.owner}</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardFooter className="p-4 pt-0 text-sm text-muted-foreground">
                                    مساحت: {villa.area} متر مربع
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px] font-body">
                    <form onSubmit={handleSave}>
                        <DialogHeader>
                            <DialogTitle>ویرایش اطلاعات ویلا</DialogTitle>
                            <DialogDescription>
                                اطلاعات ویلای انتخاب شده را ویرایش کنید.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">نام ویلا</Label>
                                <Input id="name" name="name" defaultValue={selectedVilla?.name} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="owner" className="text-right">نام مالک</Label>
                                <Input id="owner" name="owner" defaultValue={selectedVilla?.owner} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="area" className="text-right">مساحت (متر)</Label>
                                <Input id="area" name="area" type="number" defaultValue={selectedVilla?.area} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="residentInfo" className="text-right">مشخصات ساکن</Label>
                                <Input id="residentInfo" name="residentInfo" defaultValue={selectedVilla?.residentInfo} className="col-span-3" />
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
