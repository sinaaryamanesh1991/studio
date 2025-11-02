'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { initialPersonnel, initialResidents, initialBoardMembers, initialVillas, initialTransactions, initialDocuments } from '@/lib/data';
import type { Personnel, Resident, BoardMember, Villa, Transaction, Document } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface AppData {
  personnel: Personnel[];
  residents: Resident[];
  boardMembers: BoardMember[];
  villas: Villa[];
  transactions: Transaction[];
  documents: Document[];
}

interface DataContextType extends AppData {
  setPersonnel: React.Dispatch<React.SetStateAction<Personnel[]>>;
  setResidents: React.Dispatch<React.SetStateAction<Resident[]>>;
  setBoardMembers: React.Dispatch<React.SetStateAction<BoardMember[]>>;
  setVillas: React.Dispatch<React.SetStateAction<Villa[]>>;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  importData: (file: File) => void;
  exportData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [personnel, setPersonnel] = useState<Personnel[]>(initialPersonnel);
  const [residents, setResidents] = useState<Resident[]>(initialResidents);
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>(initialBoardMembers);
  const [villas, setVillas] = useState<Villa[]>(initialVillas);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const { toast } = useToast();

  const exportData = useCallback(() => {
    const appData: AppData = { personnel, residents, boardMembers, villas, transactions, documents };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(appData, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "sina_estate_data.json";
    link.click();
    toast({
      title: "خروجی موفق",
      description: "اطلاعات با موفقیت به صورت فایل JSON ذخیره شد.",
    });
  }, [personnel, residents, boardMembers, villas, transactions, documents, toast]);

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
    importData, exportData,
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
