import React, { createContext, useContext } from 'react';
import { UseFieldArrayAppend, FieldValues, FieldArrayWithId, UseFieldArrayRemove, UseFieldArrayUpdate } from 'react-hook-form';

interface FieldArrayContextType<TFieldValues extends FieldValues> {
  fields: FieldArrayWithId<TFieldValues>[];
  append: UseFieldArrayAppend<TFieldValues>;
  remove: UseFieldArrayRemove;
  update: UseFieldArrayUpdate<TFieldValues>;
}

// Make the context generic
const FieldArrayContext = createContext<FieldArrayContextType<any> | undefined>(undefined);

// Provider component
export const FieldArrayProvider = <TFieldValues extends FieldValues>({
  fields,
  append,
  remove,
  update,
  children,
}: {
  fields: FieldArrayWithId<TFieldValues>[];
  append: UseFieldArrayAppend<TFieldValues>;
  remove: UseFieldArrayRemove;
  update: UseFieldArrayUpdate<TFieldValues>;
  children: React.ReactNode;
}) => {
  return (
    <FieldArrayContext.Provider value={{ fields, append, remove, update}}>
      {children}
    </FieldArrayContext.Provider>
  );
};

// Custom hook to access the context
export const useFieldArrayContext = <TFieldValues extends FieldValues>(): FieldArrayContextType<TFieldValues> => {
  const context = useContext(FieldArrayContext);
  if (!context) {
    throw new Error('useFieldArrayContext must be used within a FieldArrayProvider');
  }
  return context;
};
