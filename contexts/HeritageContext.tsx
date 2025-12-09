// contexts/HeritageContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { HeritageItem } from '../types';

interface ContextType {
  selectedItem: HeritageItem | null;
  isDetailOpen: boolean;
  setSelectedItem: (item: HeritageItem | null) => void;
  toggleDetail: (item?: HeritageItem) => void;
}

const HeritageContext = createContext<ContextType | undefined>(undefined);

export const HeritageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedItem, setSelectedItem] = useState<HeritageItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const toggleDetail = (item?: HeritageItem) => {
    if (item) {
      setSelectedItem(item);
      setIsDetailOpen(true);
    } else {
      setSelectedItem(null);
      setIsDetailOpen(false);
    }
  };

  return (
    <HeritageContext.Provider value={{ selectedItem, isDetailOpen, setSelectedItem, toggleDetail }}>
      {children}
    </HeritageContext.Provider>
  );
};

export const useHeritage = () => {
  const context = useContext(HeritageContext);
  if (!context) throw new Error('useHeritage must be used within HeritageProvider');
  return context;
};
