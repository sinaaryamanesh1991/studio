export interface Personnel {
  id: string;
  name: string;
  familyName: string;
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
  name: string;
  familyName: string;
  isResident: boolean;
  villaNumber?: number;
  phone: string;
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
