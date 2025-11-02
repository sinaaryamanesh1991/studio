'use client';

import { collection, doc, writeBatch, Firestore } from 'firebase/firestore';
import type { Personnel, Resident, Villa, BoardMember, Transaction, Document, CompanyInfo, PayrollSettings } from '@/lib/types';

// All initial data arrays have been cleared to "raw" the database as requested.
const initialPersonnel: Omit<Personnel, 'estateId'>[] = [];
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
