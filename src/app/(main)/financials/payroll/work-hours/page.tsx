'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function WorkHoursPage() {
    const { toast } = useToast();

    const handleComingSoon = () => {
        toast({
            title: 'این بخش در حال توسعه است',
            description: 'قابلیت ثبت و مدیریت ساعات کاری پرسنل به زودی اضافه خواهد شد.',
        });
    };

    return (
        <>
            <PageHeader title="مدیریت ساعات کاری پرسنل" />
            <Card>
                <CardHeader>
                    <CardTitle>ساعت ورود و خروج</CardTitle>
                    <CardDescription>
                        در این بخش می‌توانید ساعات ورود و خروج پرسنل را ثبت کرده و کارکرد ماهانه آن‌ها را مشاهده کنید.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center text-center py-16">
                    <p className="text-muted-foreground mb-4">
                        این قابلیت به زودی در دسترس خواهد بود.
                    </p>
                    <Button onClick={handleComingSoon}>یادآوری کن</Button>
                </CardContent>
            </Card>
        </>
    );
}
