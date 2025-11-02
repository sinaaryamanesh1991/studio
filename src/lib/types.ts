export interface Personnel {
  id: string;
  name: string;
  familyName: string;
  nationalId: string;
  accountNumber: string;
  insuranceNumber: string;
  hireDate: string;
  phone: string;
  position: 'سرایدار' | 'خدمات' | 'نگهبان' | 'حسابدار' | 'مدیر شهرک';
  status: 'مشغول کار' | 'اتمام کار' | 'مرخصی' | 'غیبت';
}

export interface Resident {
  id: string;
  name: string;
  familyName: string;
  phone: string;
  carPlates: string;
  villaNumber: number;
  status: 'ساکن' | 'خالی';
  isPresent: boolean;
}

export interface BoardMember {
  id: string;
  residentId: string;
  name: string;
  familyName: string;
  position: string;
  phone: string;
  villaNumber?: number;
}

export interface Villa {
  id: number;
  name: string;
  owner: string;
  area: number;
  residentInfo: string;
  phone: string;
}

export interface Transaction {
  id: string;
  type: 'دریافتی' | 'پرداختی';
  party: string;
  reason: string;
  amount: number;
  date: string;
}

export interface Document {
  id: string;
  name: string;
  category: 'شرکت' | 'طرفین' | 'پرسنل' | 'ادارات';
  uploadDate: string;
  url: string;
}

export interface PayrollRecord {
  id: string;
  personnelId: string;
  personnelName: string;
  calculationDate: string;
  // Inputs
  hourlyRate: number;
  entryTime: string;
  exitTime: string;
  hoursWorked: number;
  overtimeHours: number;
  overtimeMultiplier: number;
  holidayPay: number;
  deductions: number;
  // Outputs
  grossPay: number;
  netPay: number;
  overtimePay: number;
}

export interface CompanyInfo {
    name: string;
    defaultEntryTime: string;
    defaultExitTime: string;
}

export interface WorkLog {
  id: string; // e.g., `p001-2024-07-28`
  personnelId: string;
  date: string; // YYYY-MM-DD
  entryTime: string; // HH:MM
  exitTime: string; // HH:MM
  hoursWorked: number;
}

export interface PayrollSettings {
    baseHourlyRate: number;
    overtimeMultiplier: number;
}
