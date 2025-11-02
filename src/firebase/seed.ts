'use client';

import { collection, doc, writeBatch, Firestore } from 'firebase/firestore';
import type { Personnel, Resident, Villa, BoardMember, Transaction, Document, CompanyInfo, PayrollSettings } from '@/lib/types';

const initialPersonnel: Omit<Personnel, 'estateId'>[] = [
];

const initialResidents: Omit<Resident, 'estateId' | 'villaId'>[] = [
  { id: 'res1', name: 'علیرضا', familyName: 'عبادی', phone: '09123070435', carPlates: '', villaNumber: 1, status: 'ساکن', isPresent: true },
  { id: 'res2', name: 'شهمیری', familyName: '(احمدی) گنج', phone: '09394957877', carPlates: '', villaNumber: 2, status: 'ساکن', isPresent: true },
  { id: 'res3', name: 'احمدی', familyName: '(احمدی) گنج', phone: '09121148481', carPlates: '', villaNumber: 3, status: 'ساکن', isPresent: true },
  { id: 'res4', name: 'احمدی', familyName: 'گنج', phone: '09121122387', carPlates: '', villaNumber: 4, status: 'ساکن', isPresent: true },
  { id: 'res5', name: 'مندری', familyName: '', phone: '09121143803', carPlates: '', villaNumber: 5, status: 'ساکن', isPresent: true },
  { id: 'res6', name: 'احمدی', familyName: 'گنج', phone: '09121122387', carPlates: '', villaNumber: 6, status: 'ساکن', isPresent: true },
  { id: 'res7', name: 'تهرانی', familyName: '', phone: '09124772848', carPlates: '', villaNumber: 7, status: 'ساکن', isPresent: true },
  { id: 'res8', name: 'ظفرمندی', familyName: '', phone: '09124506178', carPlates: '', villaNumber: 8, status: 'ساکن', isPresent: true },
  { id: 'res9', name: 'مصدی', familyName: '(احمدی) گنج', phone: '09121110100', carPlates: '', villaNumber: 9, status: 'ساکن', isPresent: true },
  { id: 'res10', name: 'عبدالهی', familyName: '', phone: '09122387053', carPlates: '', villaNumber: 10, status: 'ساکن', isPresent: true },
  { id: 'res11', name: 'نوید', familyName: 'شمار', phone: '09121114885', carPlates: '', villaNumber: 11, status: 'ساکن', isPresent: true },
  { id: 'res12', name: 'جعفری', familyName: '', phone: '09121219871', carPlates: '', villaNumber: 12, status: 'ساکن', isPresent: true },
  { id: 'res13', name: 'دانشور', familyName: '', phone: '09122830616', carPlates: '', villaNumber: 13, status: 'ساکن', isPresent: true },
  { id: 'res14', name: 'مقدادی', familyName: '', phone: '09121162187', carPlates: '', villaNumber: 14, status: 'ساکن', isPresent: true },
  { id: 'res15', name: 'فورادی', familyName: '', phone: '09183344995', carPlates: '', villaNumber: 15, status: 'ساکن', isPresent: true },
  { id: 'res16', name: 'خدیوزاده', familyName: '(قاجار)', phone: '09123444541', carPlates: '', villaNumber: 16, status: 'ساکن', isPresent: true },
  { id: 'res17', name: 'شجاعی', familyName: '', phone: '09121063777', carPlates: '', villaNumber: 17, status: 'ساکن', isPresent: true },
  { id: 'res18', name: 'روحانی', familyName: '', phone: '09121195271', carPlates: '', villaNumber: 18, status: 'ساکن', isPresent: true },
  { id: 'res19', name: 'هاشمی', familyName: 'جو', phone: '09131112799', carPlates: '', villaNumber: 19, status: 'ساکن', isPresent: true },
  { id: 'res20', name: 'مقصودی', familyName: '', phone: '09119021145', carPlates: '', villaNumber: 20, status: 'ساکن', isPresent: true },
];

const initialVillas: Omit<Villa, 'estateId'>[] = initialResidents.map(resident => ({
    id: `v${resident.villaNumber}`,
    name: `ویلا ${resident.villaNumber}`,
    owner: `${resident.name} ${resident.familyName}`.trim(),
    area: Math.floor(Math.random() * 100) + 150, // Random area between 150-250
    residentInfo: `ساکن: ${resident.name} ${resident.familyName}`,
    phone: resident.phone,
    villaNumber: resident.villaNumber
}));

const initialBoardMembers: Omit<BoardMember, 'estateId'>[] = [
    { id: 'bm1', residentId: 'res1', name: 'علیرضا', familyName: 'عبادی', position: 'مدیر عامل', phone: '09123070435', villaNumber: 1 },
    { id: 'bm2', residentId: 'res2', name: 'شهمیری', familyName: '(احمدی) گنج', position: 'نایب رئیس', phone: '09394957877', villaNumber: 2 },
    { id: 'bm3', residentId: 'res3', name: 'احمدی', familyName: '(احمدی) گنج', position: 'خزانه دار', phone: '09121148481', villaNumber: 3 },
    { id: 'bm4', residentId: 'res4', name: 'احمدی', familyName: 'گنج', position: 'منشی', phone: '09121122387', villaNumber: 4 },
];
const initialTransactions: Omit<Transaction, 'estateId'>[] = [];
const initialDocuments: Omit<Document, 'estateId'>[] = [];

const initialCompanyInfo: Omit<CompanyInfo, 'estateId'> = {
    name: 'شهرک شما',
    defaultEntryTime: '08:00',
    defaultExitTime: '17:00'
};

const initialPayrollSettings: Omit<PayrollSettings, 'estateId'> = {
    baseHourlyRate: 33299, // Example rate, can be adjusted
    overtimeMultiplier: 1.4
};


export async function seedDatabase(db: Firestore, estateId: string) {
  const batch = writeBatch(db);
  
  if (initialPersonnel.length > 0) {
    initialPersonnel.forEach(item => {
        const docRef = doc(db, 'estates', estateId, 'personnel', item.id);
        batch.set(docRef, { ...item, estateId });
    });
  }

  if (initialResidents.length > 0) {
      initialResidents.forEach(item => {
        const villaId = `v${item.villaNumber}`;
        const docRef = doc(db, 'estates', estateId, 'residents', item.id);
        batch.set(docRef, { ...item, estateId, villaId });
      });
  }

  if (initialVillas.length > 0) {
      initialVillas.forEach(item => {
        const docRef = doc(db, 'estates', estateId, 'villas', item.id);
        batch.set(docRef, { ...item, estateId });
      });
  }

  if (initialBoardMembers.length > 0) {
      initialBoardMembers.forEach(item => {
        const docRef = doc(db, 'estates', estateId, 'boardMembers', item.id);
        batch.set(docRef, { ...item, estateId });
      });
  }

  if (initialTransactions.length > 0) {
      initialTransactions.forEach(item => {
        const docRef = doc(collection(db, 'estates', estateId, 'financialTransactions'));
        batch.set(docRef, { ...item, id: docRef.id, estateId });
      });
  }

  if (initialDocuments.length > 0) {
      initialDocuments.forEach(item => {
        const docRef = doc(collection(db, 'estates', estateId, 'documents'));
        batch.set(docRef, { ...item, id: docRef.id, estateId });
      });
  }

  const companyInfoRef = doc(db, 'estates', estateId, 'companyInfo', 'default');
  batch.set(companyInfoRef, { ...initialCompanyInfo, estateId });

  const payrollSettingsRef = doc(db, 'estates', estateId, 'payrollSettings', 'default');
  batch.set(payrollSettingsRef, { ...initialPayrollSettings, estateId });


  await batch.commit();
}
