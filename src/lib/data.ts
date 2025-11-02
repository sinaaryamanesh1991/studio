import type { Personnel, Resident, BoardMember, Villa, Transaction, Document } from './types';

export const initialPersonnel: Personnel[] = [
  { id: 'p001', name: 'اسحاق', familyName: '', hireDate: '1403-01-01', phone: '0910-305-3794', position: 'نگهبان', status: 'مشغول کار' },
  { id: 'p002', name: 'کابچی', familyName: '', hireDate: '1403-01-01', phone: '0911-744-4694', position: 'نگهبان', status: 'مشغول کار' },
  { id: 'p003', name: 'فرهنگ', familyName: '', hireDate: '1403-01-01', phone: '0933-488-1914', position: 'نگهبان', status: 'مشغول کار' },
  { id: 'p004', name: 'ناصر', familyName: 'رمضان', hireDate: '1403-01-01', phone: '09', position: 'خدمات', status: 'مشغول کار' },
  { id: 'p005', name: 'احمدی', familyName: 'گنج', hireDate: '1400-01-01', phone: '09121122387', position: 'مدیر شهرک', status: 'مشغول کار' },
];

export const initialResidents: Resident[] = [
    { id: 'r001', name: 'علیرضا', familyName: 'عبادی', phone: '09123070435', carPlates: '', villaNumber: 1, status: 'ساکن', isPresent: true },
    { id: 'r002', name: 'احمدی', familyName: 'گنج', phone: '09121143803', carPlates: '', villaNumber: 4, status: 'ساکن', isPresent: true },
    { id: 'r003', name: 'مظفری', familyName: 'منفرد', phone: '09121122387', carPlates: '', villaNumber: 5, status: 'ساکن', isPresent: true },
    { id: 'r004', name: 'احمدی', familyName: 'گنج', phone: '09124772848', carPlates: '', villaNumber: 6, status: 'ساکن', isPresent: true },
    { id: 'r005', name: 'تهرانی', familyName: '', phone: '09124506178', carPlates: '', villaNumber: 7, status: 'ساکن', isPresent: true },
    { id: 'r006', name: 'عبدالهی', familyName: '', phone: '09122387053', carPlates: '', villaNumber: 10, status: 'ساکن', isPresent: true },
    { id: 'r007', name: 'نوید', familyName: 'شمار', phone: '09121114885', carPlates: '', villaNumber: 11, status: 'ساکن', isPresent: true },
    { id: 'r008', name: 'جعفری', familyName: '', phone: '09121219871', carPlates: '', villaNumber: 12, status: 'ساکن', isPresent: true },
    { id: 'r009', name: 'دانشور', familyName: '', phone: '09122830616', carPlates: '', villaNumber: 13, status: 'ساکن', isPresent: true },
    { id: 'r010', name: 'مقدادی', familyName: '', phone: '09121162187', carPlates: '', villaNumber: 14, status: 'ساکن', isPresent: true },
    { id: 'r011', name: 'فورادی', familyName: '', phone: '09183344995', carPlates: '', villaNumber: 15, status: 'ساکن', isPresent: true },
    { id: 'r012', name: 'شجاعی', familyName: '', phone: '09121063777', carPlates: '', villaNumber: 17, status: 'ساکن', isPresent: true },
    { id: 'r013', name: 'روحانی', familyName: '', phone: '09121195271', carPlates: '', villaNumber: 18, status: 'ساکن', isPresent: true },
    { id: 'r014', name: 'هاشمی', familyName: 'جو', phone: '09131112799', carPlates: '', villaNumber: 19, status: 'ساکن', isPresent: true },
    { id: 'r015', name: 'مقصودی', familyName: '', phone: '09119021145', carPlates: '', villaNumber: 20, status: 'خالی', isPresent: false },
];

export const initialBoardMembers: BoardMember[] = [
  { id: 'b001', name: 'احمدی', familyName: 'گنج', isResident: true, villaNumber: 4, phone: '09121122387' },
];

export const initialVillas: Villa[] = [
  { id: 1, name: "ویلا 1", owner: "علیرضا عبادی", area: 150, residentInfo: "علیرضا عبادی", phone: "09123070435" },
  { id: 2, name: "ویلا 2", owner: "شهمیری (احمدی)", area: 200, residentInfo: "شهمیری (احمدی)", phone: "" },
  { id: 3, name: "ویلا 3", owner: "احمدی گنج", area: 180, residentInfo: "احمدی گنج", phone: "09121143803" },
  { id: 4, name: "ویلا 4", owner: "احمدی گنج", area: 220, residentInfo: "احمدی گنج", phone: "09121143803" },
  { id: 5, name: "ویلا 5", owner: "مظفری منفرد", area: 250, residentInfo: "مظفری منفرد", phone: "09121122387" },
  { id: 6, name: "ویلا 6", owner: "احمدی گنج", area: 170, residentInfo: "احمدی گنج", phone: "09124772848" },
  { id: 7, name: "ویلا 7", owner: "تهرانی", area: 190, residentInfo: "تهرانی", phone: "09124506178" },
  { id: 8, name: "ویلا 8", owner: "ظفرمندی", area: 210, residentInfo: "ظفرمندی", phone: "" },
  { id: 9, name: "ویلا 9", owner: "مهدی احمدی گنج", area: 230, residentInfo: "مهدی احمدی گنج", phone: "" },
  { id: 10, name: "ویلا 10", owner: "عبدالهی", area: 160, residentInfo: "عبدالهی", phone: "09122387053" },
  { id: 11, name: "ویلا 11", owner: "نوید شمار", area: 240, residentInfo: "نوید شمار", phone: "09121114885" },
  { id: 12, name: "ویلا 12", owner: "جعفری", area: 180, residentInfo: "جعفری", phone: "09121219871" },
  { id: 13, name: "ویلا 13", owner: "دانشور", area: 200, residentInfo: "دانشور", phone: "09122830616" },
  { id: 14, name: "ویلا 14", owner: "مقدادی", area: 220, residentInfo: "مقدادی", phone: "09121162187" },
  { id: 15, name: "ویلا 15", owner: "فورادی", area: 250, residentInfo: "فورادی", phone: "09183344995" },
  { id: 16, name: "ویلا 16", owner: "خدیوزاده (قاجار)", area: 170, residentInfo: "خدیوزاده (قاجار)", phone: "" },
  { id: 17, name: "ویلا 17", owner: "شجاعی", area: 190, residentInfo: "شجاعی", phone: "09121063777" },
  { id: 18, name: "ویلا 18", owner: "روحانی", area: 210, residentInfo: "روحانی", phone: "09121195271" },
  { id: 19, name: "ویلا 19", owner: "هاشمی جو", area: 230, residentInfo: "هاشمی جو", phone: "09131112799" },
  { id: 20, name: "ویلا 20", owner: "مقصودی", area: 160, residentInfo: "مقصودی", phone: "09119021145" },
];

export const initialTransactions: Transaction[] = [
  { id: 't001', type: 'دریافتی', party: 'ویلا ۱', reason: 'شارژ ماهانه', amount: 500000, date: '1403-04-01' },
  { id: 't002', type: 'پرداختی', party: 'شرکت باغبانی', reason: 'خدمات فضای سبز', amount: 1200000, date: '1403-04-05' },
  { id: 't003', type: 'پرداختی', party: 'علی رضایی', reason: 'حقوق ماهانه', amount: 8000000, date: '1403-04-30' },
];

export const initialDocuments: Document[] = [
    { id: 'd001', name: 'پروانه ساخت', category: 'شرکت', uploadDate: '1400-01-01', url: '#' },
    { id: 'd002', name: 'قرارداد نگهبانی', category: 'پرسنل', uploadDate: '1402-03-15', url: '#' },
    { id: 'd003', name: 'بیمه آسانسور', category: 'ادارات', uploadDate: '1403-02-20', url: '#' },
];
