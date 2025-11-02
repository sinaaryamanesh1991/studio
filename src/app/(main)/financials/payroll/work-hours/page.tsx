'use client';

import { useState, useMemo, ChangeEvent } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useData } from '@/context/data-context';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Save } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns-jalali';
import { cn } from '@/lib/utils';
import type { WorkLog } from '@/lib/types';
import { ar } from 'date-fns/locale';
import {format as formatEn} from 'date-fns'


// Helper to calculate hours worked
const calculateHours = (entry: string, exit: string): number => {
    if (!entry || !exit) return 0;
    try {
        const [entryH, entryM] = entry.split(':').map(Number);
        const [exitH, exitM] = exit.split(':').map(Number);
        const entryDate = new Date(0, 0, 0, entryH, entryM);
        const exitDate = new Date(0, 0, 0, exitH, exitM);
        let diff = (exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60);
        if (diff < 0) diff += 24; // Handle overnight shifts
        return Math.round(diff * 100) / 100; // Round to 2 decimal places
    } catch {
        return 0;
    }
};

export default function WorkHoursPage() {
    const { personnel, workLogs, setWorkLogs, companyInfo } = useData();
    const { toast } = useToast();
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const dateString = formatEn(selectedDate, 'yyyy-MM-dd');

    const dailyLogs = useMemo(() => {
        const logsForDate = workLogs.filter(log => log.date === dateString);
        
        return personnel.map(p => {
            const existingLog = logsForDate.find(log => log.personnelId === p.id);
            return {
                personnelId: p.id,
                name: `${p.name} ${p.familyName}`,
                entryTime: existingLog?.entryTime || '',
                exitTime: existingLog?.exitTime || '',
                hoursWorked: existingLog ? calculateHours(existingLog.entryTime, existingLog.exitTime) : 0,
            };
        });
    }, [personnel, workLogs, dateString]);

    const [editableLogs, setEditableLogs] = useState(dailyLogs);

    // Update editable logs when date changes
    useState(() => {
        setEditableLogs(dailyLogs);
    });

    const handleTimeChange = (personnelId: string, field: 'entryTime' | 'exitTime', value: string) => {
        setEditableLogs(prev => prev.map(log => {
            if (log.personnelId === personnelId) {
                const updatedLog = { ...log, [field]: value };
                return { ...updatedLog, hoursWorked: calculateHours(updatedLog.entryTime, updatedLog.exitTime) };
            }
            return log;
        }));
    };

    const handleSaveLogs = () => {
        const updatedLogs: WorkLog[] = [];
        const otherDayLogs = workLogs.filter(log => log.date !== dateString);

        editableLogs.forEach(log => {
            if (log.entryTime && log.exitTime) {
                updatedLogs.push({
                    id: `${log.personnelId}-${dateString}`,
                    personnelId: log.personnelId,
                    date: dateString,
                    entryTime: log.entryTime,
                    exitTime: log.exitTime,
                    hoursWorked: log.hoursWorked,
                });
            }
        });

        setWorkLogs([...otherDayLogs, ...updatedLogs]);
        toast({ title: 'موفقیت', description: 'ساعات کاری با موفقیت ذخیره شد.' });
    };
    

    return (
        <>
            <PageHeader title="مدیریت ساعات کاری پرسنل">
                <div className="flex items-center gap-4">
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-[280px] justify-start text-left font-normal",
                                !selectedDate && "text-muted-foreground"
                            )}
                            >
                            <CalendarIcon className="ml-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, 'PPP', {locale: ar}) : <span>انتخاب تاریخ</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => date && setSelectedDate(date)}
                            initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <Button onClick={handleSaveLogs}>
                        <Save className="ms-2 h-4 w-4" />
                        ذخیره تغییرات
                    </Button>
                </div>
            </PageHeader>
            <Card>
                <CardHeader>
                    <CardTitle>ثبت ورود و خروج روزانه</CardTitle>
                    <CardDescription>
                        ساعات ورود و خروج پرسنل را برای تاریخ انتخاب شده وارد کنید. ساعات کارکرد به طور خودکار محاسبه می‌شود.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>نام پرسنل</TableHead>
                                <TableHead>ساعت ورود</TableHead>
                                <TableHead>ساعت خروج</TableHead>
                                <TableHead>جمع ساعات کارکرد</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {editableLogs.map(log => (
                                <TableRow key={log.personnelId}>
                                    <TableCell className="font-medium">{log.name}</TableCell>
                                    <TableCell>
                                        <Input 
                                            type="time" 
                                            className="w-32" 
                                            value={log.entryTime}
                                            onChange={(e) => handleTimeChange(log.personnelId, 'entryTime', e.target.value)}
                                        />
                                    </TableCell>
                                     <TableCell>
                                        <Input 
                                            type="time" 
                                            className="w-32"
                                            value={log.exitTime}
                                            onChange={(e) => handleTimeChange(log.personnelId, 'exitTime', e.target.value)}
                                        />
                                    </TableCell>
                                     <TableCell>
                                        <span className="font-mono text-lg">{log.hoursWorked.toFixed(2)}</span>
                                        <span className="text-xs text-muted-foreground mr-1">ساعت</span>
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
