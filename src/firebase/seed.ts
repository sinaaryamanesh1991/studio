'use client';

import { collection, doc, writeBatch, Firestore } from 'firebase/firestore';
import type { Personnel, Resident, Villa, BoardMember, Transaction, Document, PayrollRecord, WorkLog, CompanyInfo, PayrollSettings } from '@/lib/types';

// Initial Data (was in data.ts)
const initialPersonnel: Omit<Personnel, 'estateId'>[] = [
  { id: 'p001', name: 'رضا', familyName: 'احمدی', nationalId: '1234567890', accountNumber: '1122334455', insuranceNumber: '987654', hireDate: '1400-05-10', phone: '09123456789', position: 'سرایدار', status: 'مشغول کار' },
  { id: 'p002', name: 'سارا', familyName: 'محمدی', nationalId: '0987654321', accountNumber: '5544332211', insuranceNumber: '123456', hireDate: '1401-02-15', phone: '09129876543', position: 'نگهبان', status: 'مشغول کار' },
  { id: 'p003', name: 'علی', familyName: 'حسینی', nationalId: '1122334455', accountNumber: '6677889900', insuranceNumber: '112233', hireDate: '1402-11-20', phone: '09121112233', position: 'خدمات', status: 'مرخصی' },
];

const initialResidents: Omit<Resident, 'estateId'>[] = [
    { id: 'res1', villaId: 'v1', name: 'علی', familyName: 'رضایی', phone: '09121234567', carPlates: '۱۲الف۳۴۵ایران۶۷', villaNumber: 1, status: 'ساکن', isPresent: true },
    { id: 'res2', villaId: 'v2', name: 'مریم', familyName: 'مرادی', phone: '09122345678', carPlates: '۸۹ب۱۲۳ایران۴۵', villaNumber: 2, status: 'ساکن', isPresent: true },
    { id: 'res3', villaId: 'v3', name: 'حسین', familyName: 'کریمی', phone: '09123456789', carPlates: '۲۱ج۷۸۹ایران۱۰', villaNumber: 3, status: 'خالی', isPresent: false },
    { id: 'res4', villaId: 'v4', name: 'فاطمه', familyName: 'صادقی', phone: '09124567890', carPlates: '۵۵د۴۴۴ایران۳۳', villaNumber: 4, status: 'ساکن', isPresent: true },
    { id: 'res5', villaId: 'v5', name: 'محمد', familyName: 'جعفری', phone: '09125678901', carPlates: '۷۷س۶۶۶ایران۵۵', villaNumber: 5, status: 'ساکن', isPresent: true },
    { id: 'res6', villaId: 'v6', name: 'زهرا', familyName: 'کاظمی', phone: '09126789012', carPlates: '۴۳ص۲۲۲ایران۱۱', villaNumber: 6, status: 'خالی', isPresent: false },
    { id: 'res7', villaId: 'v7', name: 'حسن', familyName: 'موسوی', phone: '09127890123', carPlates: '۱۴ط۵۵۵ایران۸۸', villaNumber: 7, status: 'ساکن', isPresent: true },
    { id: 'res8', villaId: 'v8', name: 'نگار', familyName: 'قاسمی', phone: '09128901234', carPlates: '۹۹ع۷۷۷ایران۹۹', villaNumber: 8, status: 'ساکن', isPresent: true },
    { id: 'res9', villaId: 'v9', name: 'کیان', familyName: 'عبداللهی', phone: '09129012345', carPlates: '۱۸ف۱۲۱ایران۲۳', villaNumber: 9, status: 'ساکن', isPresent: true },
    { id: 'res10', villaId: 'v10', name: 'آرش', familyName: 'اسدی', phone: '09120123456', carPlates: '۲۰ق۳۴۳ایران۴۵', villaNumber: 10, status: 'خالی', isPresent: false },
    { id: 'res11', villaId: 'v11', name: 'هستی', familyName: 'لطفی', phone: '09121234567', carPlates: '۲۲ن۵۶۵ایران۶۷', villaNumber: 11, status: 'ساکن', isPresent: true },
    { id: 'res12', villaId: 'v12', name: 'امیر', familyName: 'نوری', phone: '09122345678', carPlates: '۲۴و۷۸۷ایران۸۹', villaNumber: 12, status: 'ساکن', isPresent: true },
    { id: 'res13', villaId: 'v13', name: 'سارا', familyName: 'حیدری', phone: '09123456789', carPlates: '۲۶هـ۹۰۹ایران۱۲', villaNumber: 13, status: 'ساکن', isPresent: true },
    { id: 'res14', villaId: 'v14', name: 'پویا', familyName: 'شریفی', phone: '09124567890', carPlates: '۲۸ی۱۱۱ایران۳۴', villaNumber: 14, status: 'خالی', isPresent: false },
    { id: 'res15', villaId: 'v15', name: 'نیلوفر', familyName: 'ابراهیمی', phone: '09125678901', carPlates: '۳۰الف۲۲۲ایران۵۶', villaNumber: 15, status: 'ساکن', isPresent: true },
    { id: 'res16', villaId: 'v16', name: 'شهریار', familyName: 'صالحی', phone: '09126789012', carPlates: '۳۲ب۳۳۳ایران۷۸', villaNumber: 16, status: 'ساکن', isPresent: true },
    { id: 'res17', villaId: 'v17', name: 'ترانه', familyName: 'رحیمی', phone: '09127890123', carPlates: '۳۴ج۴۴۴ایران۹۰', villaNumber: 17, status: 'ساکن', isPresent: true },
    { id: 'res18', villaId: 'v18', name: 'ماهان', familyName: 'عزیزی', phone: '09128901234', carPlates: '۳۶د۵۵۵ایران۱۲', villaNumber: 18, status: 'خالی', isPresent: false },
    { id: 'res19', villaId: 'v19', name: 'یکتا', familyName: 'کریمی', phone: '09129012345', carPlates: '۳۸س۶۶۶ایران۳۴', villaNumber: 19, status: 'ساکن', isPresent: true },
    { id: 'res20', villaId: 'v20', name: 'بردیا', familyName: 'محمدی', phone: '09120123456', carPlates: '۴۰ص۷۷۷ایران۵۶', villaNumber: 20, status: 'ساکن', isPresent: true },
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
  { id: 'bm1', residentId: 'res1', name: 'علی', familyName: 'رضایی', position: 'مدیرعامل', phone: '09121234567', villaNumber: 1 },
  { id: 'bm2', residentId: 'res5', name: 'محمد', familyName: 'جعفری', position: 'عضو هیئت مدیره', phone: '09125678901', villaNumber: 5 },
  { id: 'bm3', residentId: 'res8', name: 'نگار', familyName: 'قاسمی', position: 'خزانه دار', phone: '09128901234', villaNumber: 8 },
];

const initialTransactions: Omit<Transaction, 'estateId'>[] = [
    { id: 't1', type: 'دریافتی', party: 'ویلا شماره ۱', reason: 'شارژ ماهانه', amount: 500000, date: '1403/04/01' },
    { id: 't2', type: 'پرداختی', party: 'شرکت باغبانی', reason: 'هزینه نگهداری فضای سبز', amount: 1200000, date: '1403/04/05' },
    { id: 't3', type: 'دریافتی', party: 'ویلا شماره ۴', reason: 'شارژ ماهانه', amount: 500000, date: '1403/04/02' },
    { id: 't4', type: 'پرداختی', party: 'رضا احمدی (سرایدار)', reason: 'حقوق تیر ماه', amount: 4500000, date: '1403/04/30' },
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
    const docRef = doc(db, 'estates', estateId, 'residents', item.id);
    batch.set(docRef, { ...item, estateId });
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
