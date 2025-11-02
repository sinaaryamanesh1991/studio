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
import './map.css';

const SchematicMap = ({ onVillaClick }: { onVillaClick: (villa: Villa) => void }) => {
    const { villas } = useData();

    const findAndClick = (id: number) => {
        const villa = villas.find(v => v.id === id);
        if (villa) {
            onVillaClick(villa);
        }
    };

    return (
        <div className="flex justify-center items-center py-4">
             <div className="map" aria-label="نقشه شهرک">
                {/* Roads */}
                <div className="road left-vertical" aria-hidden="true"></div>
                <div className="road entrance-up" aria-hidden="true"></div>
                <div className="road top" aria-hidden="true"></div>
                <div className="road mid" aria-hidden="true"></div>

                {/* Labels */}
                <div className="label left-entr">درِ ورودی عمومی</div>
                <div className="label entrance-up">درب ورود ساكنين</div>

                {/* Buildings */}
                <div className="guard">نگهبانی</div>
                <div className="pool">استخر</div>

                {/* Villas */}
                {[...Array(20)].map((_, i) => {
                    const villaId = i + 1;
                    return (
                        <div key={villaId} className={`villa v${villaId}`} onClick={() => findAndClick(villaId)}>
                            ویلاى {villaId}
                        </div>
                    );
                })}
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
                <CardContent className="overflow-x-auto">
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
