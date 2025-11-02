import type { Personnel, Resident, BoardMember, Villa, Transaction, Document, PayrollRecord, CompanyInfo, WorkLog, PayrollSettings } from './types';

export const initialPersonnel: Personnel[] = [
  { id: 'p001', name: 'اسحاق', familyName: '', hireDate: '1403-01-01', phone: '0910-305-3794', position: 'نگهبان', status: 'مشغول کار', nationalId: '', accountNumber: '', insuranceNumber: '' },
  { id: 'p002', name: 'کابچی', familyName: '', hireDate: '1403-01-01', phone: '0911-744-4694', position: 'نگهبان', status: 'مشغول کار', nationalId: '', accountNumber: '', insuranceNumber: '' },
  { id: 'p003', name: 'فرهنگ', familyName: '', hireDate: '1403-01-01', phone: '0933-488-1914', position: 'نگهبان', status: 'مشغول کار', nationalId: '', accountNumber: '', insuranceNumber: '' },
  { id: 'p004', name: 'ناصر', familyName: 'رمضان', hireDate: '1403-01-01', phone: '09', position: 'خدمات', status: 'مشغول کار', nationalId: '', accountNumber: '', insuranceNumber: '' },
  { id: 'p005', name: 'احمدی', familyName: 'گنج', hireDate: '1400-01-01', phone: '09121122387', position: 'مدیر شهرک', status: 'مشغول کار', nationalId: '', accountNumber: '', insuranceNumber: '' },
];

export const initialResidents: Resident[] = [
    { id: 'r001', name: 'علیرضا', familyName: 'عبادی', phone: '09123070435', carPlates: '', villaNumber: 1, status: 'ساکن', isPresent: true },
    { id: 'r002', name: 'شهمیری', familyName: 'احمدی گنج', phone: '09394957877', carPlates: '', villaNumber: 2, status: 'خالی', isPresent: false },
    { id: 'r003', name: 'احمدی', familyName: 'احمدی گنج', phone: '09121148481', carPlates: '', villaNumber: 3, status: 'خالی', isPresent: false },
    { id: 'r004', name: 'احمدی', familyName: 'گنج', phone: '09121122387', carPlates: '', villaNumber: 4, status: 'ساکن', isPresent: true },
    { id: 'r005', name: 'مظفری', familyName: 'منفرد', phone: '09121143803', carPlates: '', villaNumber: 5, status: 'ساکن', isPresent: true },
    { id: 'r006', name: 'احمدی', familyName: 'گنج', phone: '09124772848', carPlates: '', villaNumber: 6, status: 'ساکن', isPresent: true },
    { id: 'r007', name: 'تهرانی', familyName: '', phone: '09124506178', carPlates: '', villaNumber: 7, status: 'ساکن', isPresent: true },
    { id: 'r008', name: 'ظفرمندی', familyName: '', phone: '', carPlates: '', villaNumber: 8, status: 'خالی', isPresent: false },
    { id: 'r009', name: 'مهدی', familyName: 'احمدی گنج', phone: '09121110100', carPlates: '', villaNumber: 9, status: 'خالی', isPresent: false },
    { id: 'r010', name: 'عبدالهی', familyName: '', phone: '09122387053', carPlates: '', villaNumber: 10, status: 'ساکن', isPresent: true },
    { id: 'r011', name: 'نوید', familyName: 'شمار', phone: '09121114885', carPlates: '', villaNumber: 11, status: 'ساکن', isPresent: true },
    { id: 'r012', name: 'جعفری', familyName: '', phone: '09121219871', carPlates: '', villaNumber: 12, status: 'ساکن', isPresent: true },
    { id: 'r013', name: 'دانشور', familyName: '', phone: '09122830616', carPlates: '', villaNumber: 13, status: 'ساکن', isPresent: true },
    { id: 'r014', name: 'مقدادی', familyName: '', phone: '09121162187', carPlates: '', villaNumber: 14, status: 'ساکن', isPresent: true },
    { id: 'r015', name: 'فورادی', familyName: '', phone: '09183344995', carPlates: '', villaNumber: 15, status: 'ساکن', isPresent: true },
    { id: 'r016', name: 'خدیوزاده', familyName: 'قاجار', phone: '09123444541', carPlates: '', villaNumber: 16, status: 'خالی', isPresent: false },
    { id: 'r017', name: 'شجاعی', familyName: '', phone: '09121063777', carPlates: '', villaNumber: 17, status: 'ساکن', isPresent: true },
    { id: 'r018', name: 'روحانی', familyName: '', phone: '09121195271', carPlates: '', villaNumber: 18, status: 'ساکن', isPresent: true },
    { id: 'r019', name: 'هاشمی', familyName: 'جو', phone: '09131112799', carPlates: '', villaNumber: 19, status: 'ساکن', isPresent: true },
    { id: 'r020', name: 'مقصودی', familyName: '', phone: '09119021145', carPlates: '', villaNumber: 20, status: 'خالی', isPresent: false },
];

export const initialBoardMembers: BoardMember[] = [
  { id: 'b001', residentId: 'r004', name: 'احمدی', familyName: 'گنج', position: 'مدیر عامل', phone: '09121122387', villaNumber: 4 },
  { id: 'b002', residentId: 'r005', name: 'مظفری', familyName: 'منفرد', position: 'رئیس هیئت مدیره', phone: '09121143803', villaNumber: 5 },
];

// Updated to be in sync with initialResidents
export const initialVillas: Villa[] = [
  { id: 1, name: 'ویلا ۱', owner: 'علیرضا عبادی', area: 150, residentInfo: 'علیرضا عبادی', phone: '09123070435' },
  { id: 2, name: 'ویلا ۲', owner: 'شهمیری احمدی گنج', area: 200, residentInfo: 'شهمیری احمدی گنج', phone: '09394957877' },
  { id: 3, name: 'ویلا ۳', owner: 'احمدی احمدی گنج', area: 180, residentInfo: 'احمدی احمدی گنج', phone: '09121148481' },
  { id: 4, name: 'ویلا ۴', owner: 'احمدی گنج', area: 220, residentInfo: 'احمدی گنج', phone: '09121122387' },
  { id: 5, name: 'ویلا ۵', owner: 'مظفری منفرد', area: 250, residentInfo: 'مظفری منفرد', phone: '09121143803' },
  { id: 6, name: 'ویلا ۶', owner: 'احمدی گنج', area: 170, residentInfo: 'احمدی گنج', phone: '09124772848' },
  { id: 7, name: 'ویلا ۷', owner: 'تهرانی ', area: 190, residentInfo: 'تهرانی ', phone: '09124506178' },
  { id: 8, name: 'ویلا ۸', owner: 'ظفرمندی ', area: 210, residentInfo: 'ظفرمندی ', phone: '' },
  { id: 9, name: 'ویلا ۹', owner: 'مهدی احمدی گنج', area: 230, residentInfo: 'مهدی احمدی گنج', phone: '09121110100' },
  { id: 10, name: 'ویلا ۱۰', owner: 'عبدالهی ', area: 160, residentInfo: 'عبدالهی ', phone: '09122387053' },
  { id: 11, name: 'ویلا ۱۱', owner: 'نوید شمار', area: 240, residentInfo: 'نوید شمار', phone: '09121114885' },
  { id: 12, name: 'ویلا ۱۲', owner: 'جعفری ', area: 180, residentInfo: 'جعفری ', phone: '09121219871' },
  { id: 13, name: 'ویلا ۱۳', owner: 'دانشور ', area: 200, residentInfo: 'دانشور ', phone: '09122830616' },
  { id: 14, name: 'ویلا ۱۴', owner: 'مقدادی ', area: 220, residentInfo: 'مقدادی ', phone: '09121162187' },
  { id: 15, name: 'ویلا ۱۵', owner: 'فورادی ', area: 250, residentInfo: 'فورادی ', phone: '09183344995' },
  { id: 16, name: 'ویلا ۱۶', owner: 'خدیوزاده قاجار', area: 170, residentInfo: 'خدیوزاده قاجار', phone: '09123444541' },
  { id: 17, name: 'ویلا ۱۷', owner: 'شجاعی ', area: 190, residentInfo: 'شجاعی ', phone: '09121063777' },
  { id: 18, name: 'ویلا ۱۸', owner: 'روحانی ', area: 210, residentInfo: 'روحانی ', phone: '09121195271' },
  { id: 19, name: 'ویلا ۱۹', owner: 'هاشمی جو', area: 230, residentInfo: 'هاشمی جو', phone: '09131112799' },
  { id: 20, name: 'ویلا ۲۰', owner: 'مقصودی ', area: 160, residentInfo: 'مقصودی ', phone: '09119021145' },
].sort((a, b) => a.id - b.id);

export const initialTransactions: Transaction[] = [
  { id: 't001', type: 'دریافتی', party: 'ویلا ۱', reason: 'شارژ ماهانه', amount: 500000, date: '1403-04-01' },
  { id: 't002', type: 'پرداختی', party: 'شرکت باغبانی', reason: 'هزینه های دیگر شهرک', amount: 1200000, date: '1403-04-05' },
  { id: 't003', type: 'پرداختی', party: 'پرسنل', reason: 'حقوق و دستمزد', amount: 8000000, date: '1403-04-30' },
  { id: 't004', type: 'دریافتی', party: 'ویلا ۵', reason: 'شارژ ماهانه', amount: 500000, date: '1403-04-02' },
  { id: 't005', type: 'دریافتی', party: 'صندوق', reason: 'درآمدهای دیگر', amount: 250000, date: '1403-04-10' },
];

export const initialDocuments: Document[] = [
    { id: 'd001', name: 'پروانه ساخت', category: 'شرکت', uploadDate: '1400-01-01', url: '#' },
    { id: 'd002', name: 'قرارداد نگهبانی', category: 'پرسنل', uploadDate: '1402-03-15', url: '#' },
    { id: 'd003', name: 'بیمه آسانسور', category: 'ادارات', uploadDate: '1403-02-20', url: '#' },
];

export const initialPayrollRecords: PayrollRecord[] = [];

export const initialCompanyInfo: CompanyInfo = {
    name: 'شهرک سینا',
    defaultEntryTime: '08:00',
    defaultExitTime: '17:00'
};

export const initialWorkLogs: WorkLog[] = [];

export const initialPayrollSettings: PayrollSettings = {
    baseHourlyRate: 33299, // Based on 1403 labor law (7,166,180 / (44*4.33))
    overtimeMultiplier: 1.4,
};
