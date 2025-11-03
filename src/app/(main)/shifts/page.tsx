'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCollection, useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { Personnel, ShiftSettings, GuardShift } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { toast } from '@/hooks/use-toast';
import { User, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const weekDays: (keyof GuardShift['days'])[] = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const weekDayLabels: { [key in keyof GuardShift['days']]: string } = {
    saturday: 'شنبه',
    sunday: 'یکشنبه',
    monday: 'دوشنبه',
    tuesday: 'سه‌شنبه',
    wednesday: 'چهارشنبه',
    thursday: 'پنج‌شنبه',
    friday: 'جمعه'
};


export default function GuardShiftsPage() {
    const { firestore, user } = useFirebase();
    const estateId = user?.uid;

    const personnelQuery = useMemoFirebase(() => estateId ? collection(firestore, 'estates', estateId, 'personnel') : null, [firestore, estateId]);
    const { data: allPersonnel, isLoading: loadingPersonnel } = useCollection<Personnel>(personnelQuery);
    
    const shiftsQuery = useMemoFirebase(() => estateId ? collection(firestore, 'estates', estateId, 'shifts') : null, [firestore, estateId]);
    const { data: shifts, isLoading: loadingShifts } = useCollection<ShiftSettings>(shiftsQuery);
    
    const guardShiftsQuery = useMemoFirebase(() => estateId ? collection(firestore, 'estates', estateId, 'guardShifts') : null, [firestore, estateId]);
    const { data: guardShifts, isLoading: loadingGuardShifts } = useCollection<GuardShift>(guardShiftsQuery);

    const guards = useMemoFirebase(() => {
        return allPersonnel?.filter(p => p.position === 'نگهبان' && p.status === 'مشغول کار') || [];
    }, [allPersonnel]);


    const handleShiftChange = (personnelId: string, day: keyof GuardShift['days'], shiftId: string) => {
        if (!estateId) return;
        
        const existingShiftData = guardShifts?.find(gs => gs.id === personnelId) || {
            id: personnelId,
            personnelId,
            estateId,
            days: {
                saturday: '', sunday: '', monday: '', tuesday: '', wednesday: '', thursday: '', friday: ''
            }
        };

        const updatedShiftData: GuardShift = {
            ...existingShiftData,
            days: {
                ...existingShiftData.days,
                [day]: shiftId
            }
        };
        
        const shiftDocRef = doc(firestore, 'estates', estateId, 'guardShifts', personnelId);
        setDocumentNonBlocking(shiftDocRef, updatedShiftData, { merge: true });

        toast({
            title: 'شیفت به‌روزرسانی شد',
            description: `شیفت ${weekDayLabels[day]} برای پرسنل مورد نظر تغییر کرد.`
        });
    };

    const isLoading = loadingPersonnel || loadingShifts || loadingGuardShifts;

    if (isLoading) {
        return (
             <>
                <PageHeader title="شیفت‌بندی نگهبانان" />
                <div className="flex items-center justify-center flex-col text-center gap-4 py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <h3 className="text-lg font-semibold">
                        {'در حال بارگذاری اطلاعات شیفت‌ها...'}
                    </h3>
                    <p className="text-muted-foreground">لطفا کمی صبر کنید.</p>
                </div>
            </>
        )
    }
    
    return (
        <>
            <PageHeader title="شیفت‌بندی نگهبانان" />
            <Card>
                <CardHeader>
                    <CardTitle>برنامه هفتگی شیفت نگهبانان</CardTitle>
                    <CardDescription>
                        برای هر نگهبان، شیفت مربوط به هر روز هفته را از لیست انتخاب کنید.
                        شیفت‌ها در صفحه تنظیمات قابل ویرایش هستند.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className='min-w-[200px] text-center'>نام نگهبان</TableHead>
                                    {weekDays.map(day => (
                                        <TableHead key={day} className='min-w-[180px] text-center'>{weekDayLabels[day]}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {guards.map(guard => {
                                    const currentShifts = guardShifts?.find(gs => gs.id === guard.id);
                                    return (
                                        <TableRow key={guard.id}>
                                            <TableCell className="text-center">
                                                <div className="flex items-center gap-2 justify-center">
                                                     <Avatar className="h-9 w-9">
                                                        <AvatarImage src={guard.photoUrl} alt="Avatar" />
                                                        <AvatarFallback>
                                                            <User className="h-5 w-5"/>
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col items-start">
                                                        <span className="font-medium">{guard.name} {guard.familyName}</span>
                                                        <span className="text-xs text-muted-foreground font-mono">{guard.id}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            {weekDays.map(day => (
                                                <TableCell key={day} className="text-center">
                                                    <Select
                                                        value={currentShifts?.days[day] || ''}
                                                        onValueChange={(shiftId) => handleShiftChange(guard.id, day, shiftId)}
                                                    >
                                                        <SelectTrigger className="mx-auto">
                                                            <SelectValue placeholder="انتخاب شیفت" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                             <SelectItem value="off">مرخصی</SelectItem>
                                                            {shifts?.map(shift => (
                                                                <SelectItem key={shift.id} value={shift.id}>
                                                                    {shift.name} ({shift.hours})
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                     {guards.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                            هیچ نگهبانی با وضعیت "مشغول کار" یافت نشد.
                        </p>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
