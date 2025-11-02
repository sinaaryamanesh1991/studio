'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirebase } from '@/firebase';
import { signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { Building, Loader2 } from 'lucide-react';
import { setDoc, doc } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

export default function LoginPage() {
  const { auth, user, isUserLoading, firestore } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('sinakaleji@gmail.com');
  const [password, setPassword] = useState('123456');
  const [isSigningIn, setIsSigningIn] = useState(false);


  useEffect(() => {
    if (!isUserLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) {
        toast({ variant: 'destructive', title: 'خطا', description: 'سرویس Firebase در دسترس نیست.' });
        return;
    }
    setIsSigningIn(true);
    try {
      // First, try to sign in.
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'ورود موفق', description: 'خوش آمدید!' });
      // The useEffect will handle redirection to /dashboard
    } catch (error: any) {
      // If the user is not found, it means they are a new user.
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        try {
          // Create a new user with the provided email and password.
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const estateId = userCredential.user.uid;
          
          // Create the initial estate document for the new user, making them the owner.
          const estateRef = doc(firestore, 'estates', estateId);
          await setDoc(estateRef, {
            id: estateId,
            name: 'شهرک سینا',
            ownerId: estateId, // Explicitly set owner
            createdAt: new Date().toISOString(),
          });
          toast({ title: 'حساب کاربری جدید ایجاد شد', description: 'به سامانه مدیریت شهرک خوش آمدید. شما به عنوان ادمین ثبت شدید.' });
          // Redirection will be handled by the useEffect after state update
        } catch (creationError: any) {
           toast({ 
               variant: 'destructive', 
               title: 'خطا در ایجاد حساب', 
               description: creationError.message || 'خطایی در ایجاد حساب کاربری جدید رخ داد.' 
            });
        }
      } else {
         // Handle other sign-in errors (e.g., wrong password)
         toast({ 
             variant: 'destructive', 
             title: 'خطا در ورود', 
             description: 'ایمیل یا رمز عبور اشتباه است.' 
        });
      }
    } finally {
        setIsSigningIn(false);
    }
  };
  
  const handleAnonymousSignIn = async () => {
    if (!auth || !firestore) {
      toast({ variant: 'destructive', title: 'خطا', description: 'سرویس Firebase در دسترس نیست.' });
      return;
    }
    setIsSigningIn(true);
    try {
      const userCredential = await signInAnonymously(auth);
      const estateId = userCredential.user.uid;
      
      const estateRef = doc(firestore, 'estates', estateId);
      await setDoc(estateRef, {
        id: estateId,
        name: 'شهرک سینا (مهمان)',
        ownerId: estateId,
        createdAt: new Date().toISOString(),
      });

    } catch (error) {
      console.error('Anonymous sign-in failed', error);
      toast({ variant: 'destructive', title: 'خطا', description: 'ورود به عنوان کاربر مهمان با خطا مواجه شد.' });
    } finally {
        setIsSigningIn(false);
    }
  };


  if (isUserLoading || user) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mr-4">در حال بارگذاری...</p>
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
          <CardDescription>برای شروع، وارد حساب کاربری خود شوید.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">ایمیل</Label>
                <Input 
                    id="email" 
                    type="email" 
                    placeholder="admin@example.com" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    dir="ltr"
                />
            </div>
             <div className="space-y-2">
                <Label htmlFor="password">رمز عبور</Label>
                <Input 
                    id="password" 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    dir="ltr"
                />
            </div>
            <Button type="submit" className="w-full" disabled={isSigningIn}>
              {isSigningIn && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
              ورود یا ایجاد حساب ادمین
            </Button>
          </form>

          <Separator className="my-6" />

          <Button onClick={handleAnonymousSignIn} className="w-full" variant="secondary" disabled={isSigningIn}>
             {isSigningIn && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
            ورود به عنوان کاربر مهمان
          </Button>

        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground text-center w-full">
                حساب کاربری ادمین در اولین ورود به صورت خودکار ایجاد خواهد شد.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
