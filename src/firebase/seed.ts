'use client';

import { collection, doc, writeBatch, Firestore } from 'firebase/firestore';
import type { Personnel, Resident, Villa, BoardMember, Transaction, Document, CompanyInfo, PayrollSettings } from '@/lib/types';

const initialPersonnel: Omit<Personnel, 'estateId'>[] = [
    { id: 'p001', name: 'رضا', familyName: 'احمدی', nationalId: '1234567890', accountNumber: '1122334455', insuranceNumber: '987654', hireDate: '1400-05-10', phone: '09123456789', position: 'سرایدار', status: 'مشغول کار' },
    { id: 'p002', name: 'سارا', familyName: 'محمدی', nationalId: '0987654321', accountNumber: '5544332211', insuranceNumber: '123456', hireDate: '1401-02-15', phone: '09129876543', position: 'نگهبان', status: 'مشغول کار' },
];

const initialResidents: Omit<Resident, 'estateId' | 'villaId'>[] = [
    { id: 'res1', villaNumber: 1, name: 'علیرضا', familyName: 'عبادی', phone: '09123070435', carPlates: '', status: 'ساکن', isPresent: true },
    { id: 'res2', villaNumber: 2, name: 'شهمیری', familyName: '(احمدی) لنج', phone: '09394957777', carPlates: '', status: 'ساکن', isPresent: true },
    { id: 'res3', villaNumber: 3, name: 'احمدی', familyName: '(احمدی) گنج', phone: '09121148481', carPlates: '', status: 'ساکن', isPresent: true },
    { id: 'res4', villaNumber: 4, name: 'احمدی', familyName: 'گنج', phone: '09121122387', carPlates: '', status: 'ساکن', isPresent: true },
    { id: 'res5', villaNumber: 5, name: 'مندری', familyName: '', phone: '09121143803', carPlates: '', status: 'ساکن', isPresent: true },
    { id: 'res6', villaNumber: 6, name: 'احمدی', familyName: 'گنج', phone: '09121122387', carPlates: '', status: 'ساکن', isPresent: true },
    { id: 'res7', villaNumber: 7, name: 'تهرانی', familyName: '', phone: '09124772848', carPlates: '', status: 'ساکن', isPresent: true },
    { id: 'res8', villaNumber: 8, name: 'ظفرمندی', familyName: '', phone: '09124506178', carPlates: '', status: 'ساکن', isPresent: true },
    { id: 'res9', villaNumber: 9, name: 'مصری', familyName: '(احمدی) گنج', phone: '09121110000', carPlates: '', status: 'ساکن', isPresent: true },
    { id: 'res10', villaNumber: 10, name: 'عبداللهی', familyName: '', phone: '09122387053', carPlates: '', status: 'ساکن', isPresent: true },
    { id: 'res11', villaNumber: 11, name: 'نوید شمار', familyName: '', phone: '09121114885', carPlates: '', status: 'ساکن', isPresent: true },
    { id: 'res12', villaNumber: 12, name: 'جعفری', familyName: '', phone: '09121219871', carPlates: '', status: 'ساکن', isPresent: true },
    { id: 'res13', villaNumber: 13, name: 'دانشور', familyName: '', phone: '09122830616', carPlates: '', status: 'ساکن', isPresent: true },
    { id: 'res14', villaNumber: 14, name: 'مقدادی', familyName: '', phone: '09121162187', carPlates: '', status: 'ساکن', isPresent: true },
    { id: 'res15', villaNumber: 15, name: 'فروهری', familyName: '', phone: '09183344995', carPlates: '', status: 'ساکن', isPresent: true },
    { id: 'res16', villaNumber: 16, name: 'خدیوزاده', familyName: '(قاجار)', phone: '09123444541', carPlates: '', status: 'ساکن', isPresent: true },
    { id: 'res17', villaNumber: 17, name: 'شجاعی', familyName: '', phone: '09121063777', carPlates: '', status: 'ساکن', isPresent: true },
    { id: 'res18', villaNumber: 18, name: 'روحانی', familyName: '', phone: '09121195271', carPlates: '', status: 'ساکن', isPresent: true },
    { id: 'res19', villaNumber: 19, name: 'هاشمی جو', familyName: '', phone: '09131112799', carPlates: '', status: 'ساکن', isPresent: true },
    { id: 'res20', villaNumber: 20, name: 'مقصودی', familyName: '', phone: '09119021145', carPlates: '', status: 'ساکن', isPresent: true },
];


const initialVillas: Omit<Villa, 'estateId'>[] = Array.from({ length: 20 }, (_, i) => {
    const resident = initialResidents.find(r => r.villaNumber === i + 1);
    const ownerName = resident ? `${resident.name} ${resident.familyName}` : 'نامشخص';
    const ownerPhone = resident ? resident.phone : '';
    
    return {
        id: `v${i + 1}`,
        name: `ویلا ${i + 1}`,
        owner: ownerName,
        area: Math.floor(Math.random() * 100) + 150, // Random area between 150-250
        residentInfo: resident ? 'ساکن' : 'خالی',
        phone: ownerPhone,
        villaNumber: i + 1,
    };
});

const initialBoardMembers: Omit<BoardMember, 'estateId'>[] = [
  { id: 'bm1', residentId: 'res4', name: 'احمدی', familyName: 'گنج', position: 'مدیر شهرک', phone: '09121122387', villaNumber: 4 },
];

const initialTransactions: Omit<Transaction, 'estateId'>[] = [
    { id: 't1', type: 'دریافتی', party: 'ویلا شماره ۱', reason: 'شارژ ماهانه', amount: 500000, date: '1403/04/01' },
    { id: 't2', type: 'پرداختی', party: 'شرکت باغبانی', reason: 'هزینه نگهداری فضای سبز', amount: 1200000, date: '1403/04/05' },
    { id: 't3', type: 'دریافتی', party: 'ویلا شماره ۴', reason: 'شارژ ماهانه', amount: 500000, date: '1403/04/02' },
];

const initialDocuments: Omit<Document, 'estateId'>[] = [
  { id: 'doc1', name: 'اساسنامه شرکت', category: 'شرکت', uploadDate: '1400-01-20', url: '#' },
  { id: 'doc2', name: 'قرارداد نگهبانی', category: 'طرفین', uploadDate: '1402-03-15', url: '#' },
];

const initialCompanyInfo: Omit<CompanyInfo, 'estateId'> = {
    name: 'شهرک سینا',
    defaultEntryTime: '08:00',
    defaultExitTime: '17:00'
};

const initialPayrollSettings: Omit<PayrollSettings, 'estateId'> = {
    baseHourlyRate: 33299,
    overtimeMultiplier: 1.4
};


export async function seedDatabase(db: Firestore, estateId: string) {
  const batch = writeBatch(db);

  // Personnel
  initialPersonnel.forEach(item => {
    const docRef = doc(db, 'estates', estateId, 'personnel', item.id);
    batch.set(docRef, { ...item, estateId });
  });

  // Residents
  initialResidents.forEach(item => {
    const villaId = `v${item.villaNumber}`;
    const docRef = doc(db, 'estates', estateId, 'residents', item.id);
    batch.set(docRef, { ...item, villaId, estateId });
  });

  // Villas
  initialVillas.forEach(item => {
    const docRef = doc(db, 'estates', estateId, 'villas', item.id);
    batch.set(docRef, { ...item, estateId });
  });

  // Board Members
  initialBoardMembers.forEach(item => {
    const docRef = doc(db, 'estates', estateId, 'boardMembers', item.id);
    batch.set(docRef, { ...item, estateId });
  });

  // Transactions
  initialTransactions.forEach(item => {
    const docRef = doc(collection(db, 'estates', estateId, 'financialTransactions'));
    batch.set(docRef, { ...item, id: docRef.id, estateId });
  });

  // Documents
  initialDocuments.forEach(item => {
    const docRef = doc(collection(db, 'estates', estateId, 'documents'));
    batch.set(docRef, { ...item, id: docRef.id, estateId });
  });

  // Company Info
  const companyInfoRef = doc(db, 'estates', estateId, 'companyInfo', 'default');
  batch.set(companyInfoRef, { ...initialCompanyInfo, estateId });

  // Payroll Settings
  const payrollSettingsRef = doc(db, 'estates', estateId, 'payrollSettings', 'default');
  batch.set(payrollSettingsRef, { ...initialPayrollSettings, estateId });


  await batch.commit();
}
