'use client';

import { collection, doc, writeBatch, Firestore } from 'firebase/firestore';
import type { Personnel, Resident, Villa, BoardMember, Transaction, Document, CompanyInfo, PayrollSettings } from '@/lib/types';

const initialPersonnel: Omit<Personnel, 'estateId'>[] = [
    {
      id: 'p101',
      name: 'اسحاق',
      familyName: 'بهادری',
      phone: '09103053794',
      hireDate: '1401-02-15',
      position: 'نگهبان',
      status: 'مشغول کار',
      nationalId: '001002003',
      accountNumber: '123456789',
      insuranceNumber: '987654321',
    },
    {
      id: 'p102',
      name: 'رضا',
      familyName: 'کابچی',
      phone: '09117444694',
      hireDate: '1402-08-20',
      position: 'خدمات',
      status: 'مشغول کار',
      nationalId: '004005006',
      accountNumber: '123123123',
      insuranceNumber: '456456456',
    },
    {
      id: 'p103',
      name: 'علی',
      familyName: 'فرهنگ',
      phone: '09334881914',
      hireDate: '1400-11-01',
      position: 'سرایدار',
      status: 'مشغول کار',
      nationalId: '007008009',
      accountNumber: '789789789',
      insuranceNumber: '321321321',
    },
    {
      id: 'p104',
      name: 'ناصر',
      familyName: 'رمضانی',
      phone: '09120000000', // Placeholder phone number
      hireDate: '1403-01-10',
      position: 'مدیر شهرک',
      status: 'مشغول کار',
      nationalId: '009008007',
      accountNumber: '456789123',
      insuranceNumber: '654987321',
    },
];

// All initial data arrays have been cleared to "raw" the database as requested.
const initialResidents: Omit<Resident, 'estateId'>[] = [];
const initialVillas: Omit<Villa, 'estateId'>[] = [];
const initialBoardMembers: Omit<BoardMember, 'estateId'>[] = [];
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

  // The function will now iterate over empty arrays, effectively not seeding any list data.
  // This provides a clean slate as requested.
  
  initialPersonnel.forEach(item => {
    const docRef = doc(db, 'estates', estateId, 'personnel', item.id);
    batch.set(docRef, { ...item, estateId });
  });

  initialResidents.forEach(item => {
    const docRef = doc(db, 'estates', estateId, 'residents', item.id);
    batch.set(docRef, { ...item, estateId });
  });

  initialVillas.forEach(item => {
    const docRef = doc(db, 'estates', estateId, 'villas', item.id);
    batch.set(docRef, { ...item, estateId });
  });

  initialBoardMembers.forEach(item => {
    const docRef = doc(db, 'estates', estateId, 'boardMembers', item.id);
    batch.set(docRef, { ...item, estateId });
  });

  initialTransactions.forEach(item => {
    const docRef = doc(collection(db, 'estates', estateId, 'financialTransactions'));
    batch.set(docRef, { ...item, id: docRef.id, estateId });
  });

  initialDocuments.forEach(item => {
    const docRef = doc(collection(db, 'estates', estateId, 'documents'));
    batch.set(docRef, { ...item, id: docRef.id, estateId });
  });

  // These single documents can be set with default base values to ensure the app structure holds.
  const companyInfoRef = doc(db, 'estates', estateId, 'companyInfo', 'default');
  batch.set(companyInfoRef, { ...initialCompanyInfo, estateId });

  const payrollSettingsRef = doc(db, 'estates', estateId, 'payrollSettings', 'default');
  batch.set(payrollSettingsRef, { ...initialPayrollSettings, estateId });


  await batch.commit();
}
