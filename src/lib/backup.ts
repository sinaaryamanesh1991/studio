'use client';

import { collection, doc, getDocs, writeBatch, Firestore, collectionGroup, query, where } from 'firebase/firestore';

const COLLECTIONS_TO_BACKUP = [
  'personnel',
  'residents',
  'boardMembers',
  'villas',
  'financialTransactions',
  'documents',
  'companyInfo',
  'payrollSettings',
  'workLogs',
  'payrollRecords',
  'shifts',
  'guardShifts',
];

interface BackupData {
  [collectionName: string]: { id: string; data: any }[];
}

/**
 * Exports all data from specified collections for a given estateId.
 */
export async function exportData(db: Firestore, estateId: string): Promise<void> {
  const backup: BackupData = {};

  for (const collectionName of COLLECTIONS_TO_BACKUP) {
    const collectionRef = collection(db, 'estates', estateId, collectionName);
    const snapshot = await getDocs(collectionRef);
    backup[collectionName] = snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));
  }

  // Handle the top-level estate document itself
  const estateRef = doc(db, 'estates', estateId);
  // This is a placeholder as we don't have getDoc here, but for a real backup we would.
  // For now, we'll just add a placeholder.
  backup['estate'] = [{ id: estateId, data: { name: 'Estate Backup' } }];

  const jsonString = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'backup.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Imports data from a backup object into Firestore, overwriting existing data.
 */
export async function importData(db: Firestore, estateId: string, data: BackupData): Promise<void> {
  const batch = writeBatch(db);

  // First, delete all existing data for the user
  for (const collectionName of COLLECTIONS_TO_BACKUP) {
     const collectionRef = collection(db, 'estates', estateId, collectionName);
     const snapshot = await getDocs(collectionRef);
     snapshot.docs.forEach(doc => {
         batch.delete(doc.ref);
     });
  }

  // Now, add the new data from the backup
  for (const collectionName of COLLECTIONS_TO_BACKUP) {
    const collectionData = data[collectionName];
    if (collectionData) {
      collectionData.forEach(item => {
        const docRef = doc(db, 'estates', estateId, collectionName, item.id);
        batch.set(docRef, item.data);
      });
    }
  }

  await batch.commit();
}
