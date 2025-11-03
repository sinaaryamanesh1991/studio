export interface Personnel {
  id: string;
  name: string;
  familyName: string;
  nationalId: string;
  accountNumber: string;
  insuranceNumber: string;
  hireDate: string; // Keep as string e.g. "1403-01-20"
  phone: string;
  position: 'سرایدار' | 'خدمات' | 'نگهبان' | 'حسابدار' | 'مدیر شهرک';
  status: 'مشغول کار' | 'اتمام کار' | 'مرخصی' | 'غیبت';
  photoUrl?: string;
  estateId: string;
  childrenCount?: number; // Added for payroll calculation
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
  estateId: string;
  villaId: string;
  occupantType: 'owner' | 'tenant';
}

export interface BoardMember {
  id: string;
  residentId: string;
  name: string;
  familyName: string;
  position: string;
  phone: string;
  villaNumber?: number;
  estateId: string;
}

export interface Villa {
  id: string;
  name: string;
  owner: string;
  area: number;
  residentInfo: string;
  phone: string;
  estateId: string;
  villaNumber: number;
  occupantType: 'owner' | 'tenant';
}

export interface Transaction {
  id: string;
  type: 'دریافتی' | 'پرداختی';
  party: string;
  reason: string;
  amount: number;
  date: string;
  estateId: string;
}

export interface Document {
  id: string;
  name: string;
  category: 'شهرک' | 'پرسنل' | 'ساکنین' | 'ویلا';
  uploadDate: string;
  url: string;
  fileName: string;
  relatedEntityId?: string; // e.g., personnelId or residentId
  description?: string; // For 'ویلا' or 'شهرک' categories
  estateId: string;
}

export interface PayrollRecord {
    id: string;
    personnelId: string;
    personnelName: string;
    calculationDate: string;
    estateId: string;
  
    // Inputs
    workLogId: string; // To link to the monthly work log
    
    // Calculated values from WorkLog
    totalHoursWorked: number;
    totalOvertimeHours: number;
    totalHolidayHours: number;
    totalNightWorkHours: number;

    // Allowances
    housingAllowance: number;
    foodAllowance: number;
    childAllowance: number;

    // Payments
    baseSalaryPay: number;
    overtimePay: number;
    holidayPay: number;
    nightWorkPay: number;

    // Deductions
    taxDeduction: number;
    insuranceDeduction: number;
    latenessDeduction: number;
    otherDeductions: number;

    // Summary
    grossPay: number; // Total earnings before any deductions
    netPay: number; // Final take-home pay
}
  

export interface CompanyInfo {
    name: string;
    defaultEntryTime: string;
    defaultExitTime: string;
    estateId: string;
}

export interface WorkLog {
  id: string; // e.g., `p001-2024-07`
  personnelId: string;
  year: number;
  month: number;
  days: {
      day: number;
      entryTime: string; // HH:MM
      exitTime: string; // HH:MM
      hoursWorked: number;
      overtimeHours: number;
      holidayHours: number;
      nightWorkHours: number; // Added for night work
  }[];
  estateId: string;
}

export interface PayrollSettings {
    baseSalaryOfMonth: number;
    overtimeMultiplier: number;
    nightWorkMultiplier: number;
    holidayWorkMultiplier: number;
    
    childAllowance: number;
    housingAllowance: number;
    foodAllowance: number;

    insuranceDeductionPercentage: number; // e.g. 7 for 7%
    
    maxAllowedLateness: number; // in minutes
    latenessPenaltyAmount: number; // deduction amount
    estateId: string;
}


// This type combines all necessary inputs for a payroll calculation.
// It's used by both the AI flow and the reliable TypeScript calculator.
export interface AutomatedPayrollCalculationInput extends Omit<PayrollSettings, 'estateId'>, Omit<CompanyInfo, 'estateId' | 'name'> {
  totalHoursWorked: number;
  totalOvertimeHours: number;
  totalHolidayHours: number;
  totalNightWorkHours: number;
  childrenCount: number;
  otherDeductions: number;
  entryTime: string;
}
