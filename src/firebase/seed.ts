'use client';

import { collection, doc, writeBatch, Firestore } from 'firebase/firestore';
import type { Personnel, Resident, Villa, BoardMember, Transaction, Document, CompanyInfo, PayrollSettings } from '@/lib/types';

// All initial data arrays have been cleared as per user request to "raw" the database.
const initialPersonnel: Omit<Personnel, 'estateId'>[] = [];

const initialResidents: Omit<Resident, 'estateId' | 'villaId'>[] = [];

const initialVillas: Omit<Villa, 'estateId'>[] = [];

const initialBoardMembers: Omit<BoardMember, 'estateId'>[] = [];

const initialTransactions: Omit<Transaction, 'estateId'>[] = [];

const initialDocuments: Omit<Document, 'estateId'>[] = [];

const initialCompanyInfo: Omit<CompanyInfo, 'estateId'> = {
    name: '',
    defaultEntryTime: '08:00',
    defaultExitTime: '17:00'
};

const initialPayrollSettings: Omit<PayrollSettings, 'estateId'> = {
    baseHourlyRate: 0,
    overtimeMultiplier: 1.4
};


export async function seedDatabase(db: Firestore, estateId: string) {
  const batch = writeBatch(db);

  // The function will now iterate over empty arrays, effectively not seeding any list data.
  
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

  // Company Info - This can be set with default empty/base values
  const companyInfoRef = doc(db, 'estates', estateId, 'companyInfo', 'default');
  batch.set(companyInfoRef, { ...initialCompanyInfo, estateId, name: 'شهرک شما' });

  // Payroll Settings - This can be set with default empty/base values
  const payrollSettingsRef = doc(db, 'estates', estateId, 'payrollSettings', 'default');
  batch.set(payrollSettingsRef, { ...initialPayrollSettings, estateId });


  await batch.commit();
}
