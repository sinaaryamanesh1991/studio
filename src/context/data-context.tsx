'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { initialPersonnel, initialResidents, initialBoardMembers, initialVillas, initialTransactions, initialDocuments, initialPayrollRecords } from '@/lib/data';
import type { Personnel, Resident, BoardMember, Villa, Transaction, Document, PayrollRecord } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface AppData {
  personnel: Personnel[];
  residents: Resident[];
  boardMembers: BoardMember[];
  villas: Villa[];
  transactions: Transaction[];
  documents: Document[];
  payrollRecords: PayrollRecord[];
}

interface DataContextType extends AppData {
  setPersonnel: React.Dispatch<React.SetStateAction<Personnel[]>>;
  setResidents: React.Dispatch<React.SetStateAction<Resident[]>>;
  setBoardMembers: React.Dispatch<React.SetStateAction<BoardMember[]>>;
  setVillas: React.Dispatch<React.SetStateAction<Villa[]>>;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  setPayrollRecords: React.Dispatch<React.SetStateAction<PayrollRecord[]>>;
  importData: (file: File) => void;
  exportData: () => void;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const APP_DATA_STORAGE_KEY = 'sina_estate_app_data';

const initialData: AppData = {
    personnel: initialPersonnel,
    residents: initialResidents,
    boardMembers: initialBoardMembers,
    villas: initialVillas,
    transactions: initialTransactions,
    documents: initialDocuments,
    payrollRecords: initialPayrollRecords,
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [villas, setVillas] = useState<Villa[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(APP_DATA_STORAGE_KEY);
      if (storedData) {
        const parsedData: AppData = JSON.parse(storedData);
        setPersonnel(parsedData.personnel || initialPersonnel);
        setResidents(parsedData.residents || initialResidents);
        setBoardMembers(parsedData.boardMembers || initialBoardMembers);
        setVillas(parsedData.villas || initialVillas);
        setTransactions(parsedData.transactions || initialTransactions);
        setDocuments(parsedData.documents || initialDocuments);
        setPayrollRecords(parsedData.payrollRecords || initialPayrollRecords);
      } else {
        // If no data in storage, use initial data
        setPersonnel(initialPersonnel);
        setResidents(initialResidents);
        setBoardMembers(initialBoardMembers);
        setVillas(initialVillas);
        setTransactions(initialTransactions);
        setDocuments(initialDocuments);
        setPayrollRecords(initialPayrollRecords);
      }
    } catch (error) {
        console.error("Failed to load data from localStorage", error);
        // Load initial data in case of error
        setPersonnel(initialPersonnel);
        setResidents(initialResidents);
        setBoardMembers(initialBoardMembers);
        setVillas(initialVillas);
        setTransactions(initialTransactions);
        setDocuments(initialDocuments);
        setPayrollRecords(initialPayrollRecords);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
        try {
            const appData: AppData = { personnel, residents, boardMembers, villas, transactions, documents, payrollRecords };
            localStorage.setItem(APP_DATA_STORAGE_KEY, JSON.stringify(appData));
        } catch (error) {
            console.error("Failed to save data to localStorage", error);
        }
    }
  }, [personnel, residents, boardMembers, villas, transactions, documents, payrollRecords, isLoading]);


  const exportData = useCallback(() => {
    const appData: AppData = { personnel, residents, boardMembers, villas, transactions, documents, payrollRecords };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(appData, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "sina_estate_data.json";
    link.click();
    toast({
      title: "خروجی موفق",
      description: "اطلاعات با موفقیت به صورت فایل JSON ذخیره شد.",
    });
  }, [personnel, residents, boardMembers, villas, transactions, documents, payrollRecords, toast]);

  const importData = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (typeof result !== 'string') {
          throw new Error("File could not be read");
        }
        const parsedData: AppData = JSON.parse(result);
        
        // Basic validation
        if (parsedData.personnel && parsedData.residents && parsedData.villas) {
          setPersonnel(parsedData.personnel);
          setResidents(parsedData.residents);
          setBoardMembers(parsedData.boardMembers || []);
          setVillas(parsedData.villas);
          setTransactions(parsedData.transactions || []);
          setDocuments(parsedData.documents || []);
          setPayrollRecords(parsedData.payrollRecords || []);
          toast({
            title: "بارگذاری موفق",
            description: "اطلاعات با موفقیت از فایل JSON بارگذاری شد.",
          });
        } else {
          throw new Error("Invalid data format");
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "خطا در بارگذاری",
          description: "فایل انتخاب شده معتبر نیست یا فرمت درستی ندارد.",
        });
        console.error("Import error:", error);
      }
    };
    reader.readAsText(file);
  }, [toast]);

  const value = {
    personnel, setPersonnel,
    residents, setResidents,
    boardMembers, setBoardMembers,
    villas, setVillas,
    transactions, setTransactions,
    documents, setDocuments,
    payrollRecords, setPayrollRecords,
    importData, exportData,
    isLoading,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
