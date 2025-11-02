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
import { Home, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

const MapBlock = ({ label, className, onClick, clickable = false }: { label: string | number, className?: string, onClick?: () => void, clickable?: boolean }) => (
    <div
        className={cn(
            "flex items-center justify-center p-2 border border-destructive/50 text-center text-xs sm:text-sm bg-white h-12",
            clickable && "cursor-pointer hover:bg-primary/10 hover:border-primary transition-colors",
            className
        )}
        onClick={onClick}
    >
        {typeof label === 'number' ? `ویلا ${label}` : label}
    </div>
);

const Street = ({ className }: { className?: string }) => (
    <div className={cn("bg-gray-800", className)} />
);

const EntranceLabel = ({ label, className }: { label: string, className?: string }) => (
    <div className={cn("flex items-center justify-center text-xs sm:text-sm text-muted-foreground", className)}>
        {label}
    </div>
);


const SchematicMap = ({ onVillaClick }: { onVillaClick: (villa: Villa) => void }) => {
    const { villas } = useData();

    const findAndClick = (id: number) => {
        const villa = villas.find(v => v.id === id);
        if (villa) {
            onVillaClick(villa);
        }
    }

    return (
        <div className="bg-card p-2 sm:p-4 md:p-6 rounded-lg border w-full max-w-7xl mx-auto font-body" dir="rtl">
            <div className="grid grid-cols-[80px_1fr] md:grid-cols-[120px_1fr] gap-2">
                {/* Left Column for Side Buildings */}
                <div className="grid grid-rows-3 gap-2">
                   <div className="grid grid-rows-2 gap-2">
                     <MapBlock label="سرایداری" />
                     <MapBlock label="استخر" />
                   </div>
                   <MapBlock label="نگهبانی" />
                   <EntranceLabel label="درب ورودی عمومی" className="rotate-180" style={{ writingMode: 'vertical-rl' }}/>
                </div>

                {/* Right Column for Map */}
                <div className="grid grid-rows-[auto_40px_auto_40px_auto] gap-2">
                    {/* Top Section */}
                    <div className="space-y-2">
                        <EntranceLabel label="درب ورود ساکنین" className="h-8" />
                        <div className="flex flex-wrap-reverse justify-end gap-2">
                             {[6, 5, 4, 3, 2, 1].map(id => <MapBlock key={id} label={id} clickable onClick={() => findAndClick(id)} className="flex-grow min-w-[60px]" />)}
                        </div>
                    </div>
                    
                    <Street/>

                    {/* Middle Section */}
                     <div className="flex flex-wrap-reverse justify-end gap-2">
                        <div className="flex-grow min-w-[60px]"></div>
                        {[11, 10, 9, 8, 7].map(id => <MapBlock key={id} label={id} clickable onClick={() => findAndClick(id)} className="flex-grow min-w-[60px]" />)}
                     </div>

                    <Street/>

                    {/* Bottom Section */}
                    <div className="flex flex-wrap-reverse justify-end gap-2">
                         {[20, 19, 18, 17, 16, 15, 14, 13, 12].map(id => <MapBlock key={id} label={id} clickable onClick={() => findAndClick(id)} className="flex-grow min-w-[60px]" />)}
                    </div>
                </div>
            </div>
        </div>
    );
};


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
            phone: formData.get('phone') as string,
        };

        setVillas(prev => prev.map(v => v.id === updatedVilla.id ? updatedVilla : v));
        setIsDialogOpen(false);
        setSelectedVilla(null);
    };

    return (
        <>
            <PageHeader title="نقشه شهرک" />
             <Card className="mb-6">
                <CardHeader>
                    <CardTitle>شماتیک نقشه شهرک</CardTitle>
                    <CardDescription>
                        بر روی هر ویلا در نقشه کلیک کنید تا اطلاعات آن را مشاهده و ویرایش کنید.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <SchematicMap onVillaClick={handleCardClick} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>لیست ویلاها</CardTitle>
                    <CardDescription>
                        لیست کلی ویلاها و مالکین آنها.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {villas.sort((a,b) => a.id - b.id).map(villa => (
                            <Card 
                                key={villa.id} 
                                className="cursor-pointer hover:shadow-lg hover:border-primary transition-all flex flex-col"
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
                                <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
                                    مساحت: {villa.area} متر مربع
                                </CardContent>
                                <CardFooter className="p-4 pt-0 mt-auto flex items-center gap-2 text-sm text-muted-foreground">
                                    <Phone className="w-4 h-4"/>
                                    <span>{villa.phone || 'ثبت نشده'}</span>
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
                                <Label htmlFor="phone" className="text-right">شماره تماس</Label>
                                <Input id="phone" name="phone" defaultValue={selectedVilla?.phone} className="col-span-3" />
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
