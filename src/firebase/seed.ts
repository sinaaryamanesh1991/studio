'use client';

import { collection, doc, writeBatch, Firestore } from 'firebase/firestore';
import type { Personnel, Resident, Villa, BoardMember, FinancialTransaction, Document, CompanyInfo, PayrollSettings, ShiftSettings, GuardShift } from '@/lib/types';

const initialPersonnel: Omit<Personnel, 'estateId'>[] = [
  { id: 'p1', name: 'اسحاق', familyName: 'بهادری', phone: '09103053794', hireDate: '1403-01-01', position: 'نگهبان', status: 'مشغول کار', nationalId: '1234567890', accountNumber: '123-456-789', insuranceNumber: '987654321', photoUrl: 'https://picsum.photos/seed/p1/200/200', childrenCount: 1 },
  { id: 'p2', name: 'رضا', familyName: 'کابچی', phone: '09117444694', hireDate: '1402-05-10', position: 'خدمات', status: 'مشغول کار', nationalId: '0987654321', accountNumber: '987-654-321', insuranceNumber: '123456789', photoUrl: 'https://picsum.photos/seed/p2/200/200', childrenCount: 2 },
  { id: 'p3', name: 'علی', familyName: 'فرهنگ', phone: '09334881914', hireDate: '1401-11-20', position: 'نگهبان', status: 'مشغول کار', nationalId: '1122334455', accountNumber: '112-233-445', insuranceNumber: '554433221', photoUrl: 'https://picsum.photos/seed/p3/200/200', childrenCount: 0 },
  { id: 'p4', name: 'ناصر', familyName: 'رمضانی', phone: '09120000000', hireDate: '1400-01-01', position: 'مدیر شهرک', status: 'اتمام کار', nationalId: '2233445566', accountNumber: '223-344-556', insuranceNumber: '665544332', photoUrl: 'https://picsum.photos/seed/p4/200/200', childrenCount: 3 },
  { id: 'p5', name: 'مهدی', familyName: 'حاتمی', phone: '09121112222', hireDate: '1403-02-15', position: 'نگهبان', status: 'مشغول کار', nationalId: '3344556677', accountNumber: '334-455-667', insuranceNumber: '776655443', photoUrl: 'https://picsum.photos/seed/p5/200/200', childrenCount: 0 },
];

const initialVillas: Omit<Villa, 'estateId'>[] = Array.from({ length: 20 }, (_, i) => {
    const villaNumber = i + 1;
    return {
        id: `v${villaNumber}`,
        name: `ویلا ${villaNumber}`,
        owner: 'نامشخص',
        area: Math.floor(Math.random() * 100) + 150, // 150-250
        residentInfo: '',
        phone: '',
        villaNumber: villaNumber,
        occupantType: 'owner',
    };
});

const initialResidents: Omit<Resident, 'estateId'| 'occupantType'>[] = [
  { id: 'res1', villaId: 'v1', name: 'علیرضا', familyName: 'عبادی', phone: '09123070435', carPlates: '۱۱الف۱۲۳-۴۵', villaNumber: 1, status: 'ساکن', isPresent: true },
  { id: 'res2', villaId: 'v2', name: 'شهمیری', familyName: '(احمدی) گنج', phone: '09394957877', carPlates: '۲۲ب۴۵۶-۷۸', villaNumber: 2, status: 'ساکن', isPresent: true },
  { id: 'res3', villaId: 'v3', name: 'احمدی', familyName: '(احمدی) گنج', phone: '09121148481', carPlates: '', villaNumber: 3, status: 'ساکن', isPresent: false },
  { id: 'res4', villaId: 'v4', name: 'احمدی', familyName: 'گنج', phone: '09121122387', carPlates: '۴۴د۷۸۹-۱۲', villaNumber: 4, status: 'ساکن', isPresent: true },
  { id: 'res5', villaId: 'v5', name: 'مندری', familyName: '', phone: '09121143803', carPlates: '', villaNumber: 5, status: 'خالی', isPresent: false },
  { id: 'res6', villaId: 'v6', name: 'احمدی', familyName: 'گنج', phone: '09121122387', carPlates: '', villaNumber: 6, status: 'ساکن', isPresent: true },
  { id: 'res7', villaId: 'v7', name: 'تهرانی', familyName: '', phone: '09124772848', carPlates: '', villaNumber: 7, status: 'ساکن', isPresent: true },
  { id: 'res8', villaId: 'v8', name: 'ظفرمندی', familyName: '', phone: '09124506178', carPlates: '۸۸و۱۱۱-۲۲', villaNumber: 8, status: 'ساکن', isPresent: false },
  { id: 'res9', villaId: 'v9', name: 'مصدی', familyName: '(احمدی) گنج', phone: '09121110100', carPlates: '', villaNumber: 9, status: 'خالی', isPresent: false },
  { id: 'res10', villaId: 'v10', name: 'عبدالهی', familyName: '', phone: '09122387053', carPlates: '', villaNumber: 10, status: 'ساکن', isPresent: true },
  { id: 'res11', villaId: 'v11', name: 'نوید', familyName: 'شمار', phone: '09121114885', carPlates: '۱۱س۲۲۲-۳۳', villaNumber: 11, status: 'ساکن', isPresent: true },
  { id: 'res12', villaId: 'v12', name: 'جعفری', familyName: '', phone: '09121219871', carPlates: '', villaNumber: 12, status: 'ساکن', isPresent: true },
  { id: 'res13', villaId: 'v13', name: 'دانشور', familyName: '', phone: '09122830616', carPlates: '', villaNumber: 13, status: 'ساکن', isPresent: false },
  { id: 'res14', villaId: 'v14', name: 'مقدادی', familyName: '', phone: '09121162187', carPlates: '', villaNumber: 14, status: 'ساکن', isPresent: true },
  { id: 'res15', villaId: 'v15', name: 'فورادی', familyName: '', phone: '09183344995', carPlates: '', villaNumber: 15, status: 'ساکن', isPresent: true },
  { id: 'res16', villaId: 'v16', name: 'خدیوزاده', familyName: '(قاجار)', phone: '09123444541', carPlates: '', villaNumber: 16, status: 'ساکن', isPresent: false },
  { id: 'res17', villaId: 'v17', name: 'شجاعی', familyName: '', phone: '09121063777', carPlates: '', villaNumber: 17, status: 'ساکن', isPresent: true },
  { id: 'res18', villaId: 'v18', name: 'روحانی', familyName: '', phone: '09121195271', carPlates: '', villaNumber: 18, status: 'خالی', isPresent: false },
  { id: 'res19', villaId: 'v19', name: 'هاشمی', familyName: 'جو', phone: '09131112799', carPlates: '۱۹م۱۱۱-۱۱', villaNumber: 19, status: 'ساکن', isPresent: true },
  { id: 'res20', villaId: 'v20', name: 'مقصودی', familyName: '', phone: '09119021145', carPlates: '', villaNumber: 20, status: 'ساکن', isPresent: true },
];


const initialBoardMembers: Omit<BoardMember, 'estateId'>[] = [
    { id: 'bm1', residentId: 'res1', name: 'علیرضا', familyName: 'عبادی', position: 'مدیر عامل', phone: '09123070435', villaNumber: 1 },
    { id: 'bm2', residentId: 'res2', name: 'شهمیری', familyName: '(احمدی) گنج', position: 'نایب رئیس', phone: '09394957877', villaNumber: 2 },
    { id: 'bm3', residentId: 'res3', name: 'احمدی', familyName: '(احمدی) گنج', position: 'خزانه دار', phone: '09121148481', villaNumber: 3 },
    { id: 'bm4', residentId: 'res4', name: 'احمدی', familyName: 'گنج', position: 'منشی', phone: '09121122387', villaNumber: 4 },
];
const initialTransactions: Omit<FinancialTransaction, 'estateId' | 'id'>[] = [
    { type: 'دریافتی', party: 'ویلا شماره ۵', reason: 'شارژ ماهانه', amount: 5000000, date: '1403/04/01' },
    { type: 'پرداختی', party: 'شرکت باغبانی', reason: 'هزینه نگهداری فضای سبز', amount: 12000000, date: '1403/04/05' },
    { type: 'دریافتی', party: 'ویلا شماره ۱۰', reason: 'شارژ ماهانه', amount: 5000000, date: '1403/04/02' },
    { type: 'پرداختی', party: 'اداره برق', reason: 'قبض برق مشاعات', amount: 7500000, date: '1403/04/10' },
];

const initialCompanyInfo: Omit<CompanyInfo, 'estateId'> = {
    name: 'شهرک سینا',
    defaultEntryTime: '08:00',
    defaultExitTime: '17:00'
};

const initialPayrollSettings: Omit<PayrollSettings, 'estateId'> = {
    baseSalaryOfMonth: 71661840,
    overtimeMultiplier: 1.4,
    nightWorkMultiplier: 1.35,
    holidayWorkMultiplier: 1.9,
    childAllowance: 7166184,
    housingAllowance: 9000000,
    foodAllowance: 14000000,
    insuranceDeductionPercentage: 7,
    maxAllowedLateness: 15,
    latenessPenaltyAmount: 500000
};

const initialShiftSettings: Omit<ShiftSettings, 'estateId'>[] = [
    { id: 'shift1', name: 'شیفت صبح', hours: '08:00-16:00' },
    { id: 'shift2', name: 'شیفت عصر', hours: '16:00-24:00' },
    { id: 'shift3', name: 'شیفت شب', hours: '00:00-08:00' },
];

const initialGuardShifts: Omit<GuardShift, 'estateId'>[] = [
    {
        id: 'p1', // اسحاق بهادری
        personnelId: 'p1',
        days: {
            saturday: 'shift1',
            sunday: 'shift1',
            monday: 'shift2',
            tuesday: 'shift2',
            wednesday: 'off',
            thursday: 'off',
            friday: 'shift3'
        }
    },
    {
        id: 'p3', // علی فرهنگ
        personnelId: 'p3',
        days: {
            saturday: 'shift2',
            sunday: 'shift2',
            monday: 'off',
            tuesday: 'off',
            wednesday: 'shift1',
            thursday: 'shift1',
            friday: 'shift1'
        }
    },
    {
        id: 'p5', // مهدی حاتمی
        personnelId: 'p5',
        days: {
            saturday: 'shift3',
            sunday: 'shift3',
            monday: 'shift3',
            tuesday: 'shift1',
            wednesday: 'shift1',
            thursday: 'off',
            friday: 'off'
        }
    }
];

export async function seedDatabase(db: Firestore, estateId: string) {
  const batch = writeBatch(db);
  
  initialPersonnel.forEach(item => {
      const docRef = doc(db, 'estates', estateId, 'personnel', item.id);
      batch.set(docRef, { ...item, estateId });
  });

  initialVillas.forEach(villa => {
    const resident = initialResidents.find(r => r.villaNumber === villa.villaNumber);
    const docRef = doc(db, 'estates', estateId, 'villas', villa.id);
    if(resident){
        batch.set(docRef, { 
            ...villa, 
            owner: `${resident.name} ${resident.familyName}`.trim(),
            residentInfo: `ساکن: ${resident.name} ${resident.familyName}`.trim(),
            phone: resident.phone,
            estateId 
        });
    } else {
         batch.set(docRef, { ...villa, estateId });
    }
  });

  initialResidents.forEach(item => {
    const occupantType = Math.random() > 0.8 ? 'tenant' : 'owner'; // ~20% tenants
    const docRef = doc(db, 'estates', estateId, 'residents', item.id);
    batch.set(docRef, { ...item, estateId, occupantType });
  });

  initialBoardMembers.forEach(item => {
    const docRef = doc(db, 'estates', estateId, 'boardMembers', item.id);
    batch.set(docRef, { ...item, estateId });
  });

  initialTransactions.forEach(item => {
    const docRef = doc(collection(db, 'estates', estateId, 'financialTransactions'));
    batch.set(docRef, { ...item, id: docRef.id, estateId });
  });

  const companyInfoRef = doc(db, 'estates', estateId, 'companyInfo', 'default');
  batch.set(companyInfoRef, { ...initialCompanyInfo, estateId });

  const payrollSettingsRef = doc(db, 'estates', estateId, 'payrollSettings', 'default');
  batch.set(payrollSettingsRef, { ...initialPayrollSettings, estateId });

  initialShiftSettings.forEach(item => {
    const docRef = doc(db, 'estates', estateId, 'shifts', item.id);
    batch.set(docRef, { ...item, estateId });
  });

  initialGuardShifts.forEach(item => {
    const docRef = doc(db, 'estates', estateId, 'guardShifts', item.id);
    batch.set(docRef, { ...item, estateId });
  });

  await batch.commit();
}
