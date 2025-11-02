import type { Personnel, Resident, BoardMember, Villa, Transaction, Document } from './types';

export const initialPersonnel: Personnel[] = [
  { id: 'p001', name: 'علی', familyName: 'رضایی', hireDate: '1402-03-15', phone: '09123456789', position: 'نگهبان', status: 'مشغول کار' },
  { id: 'p002', name: 'مریم', familyName: 'محمدی', hireDate: '1401-08-20', phone: '09129876543', position: 'خدمات', status: 'مشغول کار' },
  { id: 'p003', name: 'رضا', familyName: 'حسینی', hireDate: '1403-01-10', phone: '09121112233', position: 'سرایدار', status: 'مشغول کار' },
  { id: 'p004', name: 'سارا', familyName: 'احمدی', hireDate: '1400-11-01', phone: '09124445566', position: 'مدیر شهرک', status: 'اتمام کار' },
];

export const initialResidents: Resident[] = [
    { id: 'r001', name: 'احمد', familyName: 'کریمی', phone: '09125556677', carPlates: '۱۲س۳۴۵ایران۱۱', villaNumber: 101, status: 'ساکن' },
    { id: 'r002', name: 'فاطمه', familyName: 'صادقی', phone: '09128889900', carPlates: '۳۴ب۵۶۷ایران۲۲', villaNumber: 102, status: 'ساکن' },
    { id: 'r003', name: 'حسین', familyName: 'جعفری', phone: '09122223344', carPlates: '۵۶ج۷۸۹ایران۳۳', villaNumber: 201, status: 'غیر ساکن' },
];

export const initialBoardMembers: BoardMember[] = [
  { id: 'b001', name: 'احمد', familyName: 'کریمی', isResident: true, villaNumber: 101, phone: '09125556677' },
  { id: 'b002', name: 'مجید', familyName: 'ابراهیمی', isResident: false, phone: '09120001122' },
];

export const initialVillas: Villa[] = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: `ویلا ${101 + i}`,
    owner: 'مالک ثبت نشده',
    area: Math.floor(Math.random() * 150) + 150,
    residentInfo: 'ساکن ثبت نشده'
}));

export const initialTransactions: Transaction[] = [
  { id: 't001', type: 'دریافتی', party: 'ویلا ۱۰۱', reason: 'شارژ ماهانه', amount: 500000, date: '1403-04-01' },
  { id: 't002', type: 'پرداختی', party: 'شرکت باغبانی', reason: 'خدمات فضای سبز', amount: 1200000, date: '1403-04-05' },
  { id: 't003', type: 'پرداختی', party: 'علی رضایی', reason: 'حقوق ماهانه', amount: 8000000, date: '1403-04-30' },
];

export const initialDocuments: Document[] = [
    { id: 'd001', name: 'پروانه ساخت', category: 'شرکت', uploadDate: '1400-01-01', url: '#' },
    { id: 'd002', name: 'قرارداد نگهبانی', category: 'پرسنل', uploadDate: '1402-03-15', url: '#' },
    { id: 'd003', name: 'بیمه آسانسور', category: 'ادارات', uploadDate: '1403-02-20', url: '#' },
];
