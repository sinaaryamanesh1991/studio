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
import { Home, Phone, PlusCircle, XCircle } from 'lucide-react';
import './map.css';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';

const SchematicMap = ({ onVillaClick, isEditMode, onAddVilla, onDeleteVilla }: { 
    onVillaClick: (villa: Villa) => void, 
    isEditMode: boolean,
    onAddVilla: () => void,
    onDeleteVilla: (id: number) => void
}) => {
    const { villas } = useData();

    const findAndClick = (id: number) => {
        if (isEditMode) return;
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
                {villas.map((villa) => (
                    <div key={villa.id} className={`villa v${villa.id}`} onClick={() => findAndClick(villa.id)}>
                        {`ویلاى ${villa.id}`}
                         {isEditMode && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteVilla(villa.id);
                                }}
                                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 z-10 hover:bg-destructive/80"
                                aria-label={`حذف ویلا ${villa.id}`}
                            >
                                <XCircle className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}
                {isEditMode && (
                     <Button
                        onClick={onAddVilla}
                        variant="outline"
                        className="absolute bottom-2 right-2 z-10"
                    >
                        <PlusCircle className="ms-2 h-4 w-4" />
                        افزودن ویلا
                    </Button>
                )}
            </div>
        </div>
    );
};


export default function MapPage() {
    const { villas, setVillas } = useData();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedVilla, setSelectedVilla] = useState<Villa | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);

    const handleCardClick = (villa: Villa) => {
        if (isEditMode) return;
        setSelectedVilla(villa);
        setIsDialogOpen(true);
    };
    
    const handleAddVilla = () => {
        const existingIds = villas.map(v => v.id);
        let newId = 1;
        while(existingIds.includes(newId)) {
            newId++;
        }

        if (newId > 20) {
            toast({ variant: 'destructive', title: 'خطا', description: 'ظرفیت نقشه برای افزودن ویلای جدید تکمیل است.' });
            return;
        }

        const newVilla: Villa = {
            id: newId,
            name: `ویلا ${newId}`,
            owner: 'نامشخص',
            area: 100,
            residentInfo: '',
            phone: '',
        };
        setVillas(prev => [...prev, newVilla].sort((a,b) => a.id - b.id));
        toast({ title: 'موفقیت', description: `ویلای شماره ${newId} با موفقیت اضافه شد.`});
    };

    const handleDeleteVilla = (id: number) => {
        setVillas(prev => prev.filter(v => v.id !== id));
        toast({ title: 'موفقیت', description: `ویلای شماره ${id} حذف شد.` });
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
            <PageHeader title="نقشه شهرک">
                <div className="flex items-center gap-4">
                     <div className="flex items-center space-x-2 space-x-reverse">
                        <Switch
                            id="edit-mode-switch"
                            checked={isEditMode}
                            onCheckedChange={setIsEditMode}
                        />
                        <Label htmlFor="edit-mode-switch">حالت ویرایش</Label>
                    </div>
                </div>
            </PageHeader>
             <Card className="mb-6">
                <CardHeader>
                    <CardTitle>شماتیک نقشه شهرک</CardTitle>
                    <CardDescription>
                        {isEditMode 
                            ? 'در حالت ویرایش می‌توانید ویلاها را اضافه یا حذف کنید. برای ویرایش اطلاعات، حالت ویرایش را غیرفعال کنید.'
                            : 'بر روی هر ویلا در نقشه کلیک کنید تا اطلاعات آن را مشاهده و ویرایش کنید.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <SchematicMap 
                        onVillaClick={handleCardClick} 
                        isEditMode={isEditMode}
                        onAddVilla={handleAddVilla}
                        onDeleteVilla={handleDeleteVilla}
                    />
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
                                className={`cursor-pointer hover:shadow-lg hover:border-primary transition-all flex flex-col ${isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => !isEditMode && handleCardClick(villa)}
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
