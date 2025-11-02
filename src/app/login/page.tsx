'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirebase } from '@/firebase';
import { signInAnonymously } from 'firebase/auth';
import { Building } from 'lucide-react';
import { setDoc, doc } from 'firebase/firestore';

export default function LoginPage() {
  const { auth, user, isUserLoading, firestore } = useFirebase();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleAnonymousSignIn = async () => {
    try {
      const userCredential = await signInAnonymously(auth);
      const estateId = userCredential.user.uid;
      
      // Create the initial estate document for the new user
      const estateRef = doc(firestore, 'estates', estateId);
      await setDoc(estateRef, {
        id: estateId,
        name: 'شهرک سینا',
        createdAt: new Date().toISOString(),
      });

    } catch (error) {
      console.error('Anonymous sign-in failed', error);
    }
  };

  if (isUserLoading || user) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <p>در حال بارگذاری...</p>
        </div>
    );
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground mb-4">
                <Building className="size-8" />
            </div>
          <CardTitle>مدیریت شهرک سینا</CardTitle>
          <CardDescription>برای شروع، به عنوان کاربر مهمان وارد شوید.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleAnonymousSignIn} className="w-full">
            ورود به عنوان کاربر مهمان
          </Button>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground text-center w-full">
                با ورود، یک حساب کاربری موقت برای شما ایجاد می‌شود.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
