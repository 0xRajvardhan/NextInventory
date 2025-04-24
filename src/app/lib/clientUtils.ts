'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export const useEditMode = () => {
  const router = useRouter();
  const pathname = usePathname()
  const searchParams = useSearchParams();

  const editMode = searchParams.get('edit') === "true";
  const createMode = pathname.endsWith('/create');

  const [isEditing, setIsEditing] = useState<boolean>(editMode);
  const [isCreating, setIsCreating] = useState<boolean>(createMode)

  useEffect(() => {
    setIsEditing(editMode);
    setIsCreating(createMode)
  }, [editMode, createMode]);

  const updateUrlForMode = (mode: 'edit' | 'create' | 'none') => {
    const url = new URL(window.location.href);
    if (mode === 'edit') {
      url.searchParams.set('edit', 'true');
      url.searchParams.delete('create');
      setIsEditing(true);
      setIsCreating(false);
    } else if (mode === 'create') {

      url.searchParams.set('create', 'true');
      url.searchParams.delete('edit');
      setIsEditing(false);
      setIsCreating(true);
    } else {
      url.searchParams.delete('edit');
      url.searchParams.delete('create');
      setIsEditing(false);
      setIsCreating(false)
    }
    router.replace(url.toString(), undefined);
  };

  return { isEditing, isCreating, updateUrlForMode };
};


export const handleSave = async <T, R>(data: T, action: (data: T) => Promise<R>) => {
  try {
    const response = await action(data);
    if ((response as any)?.error) {
      // Handle server error
      console.error('Server error:', (response as any).error);
      return (response as any).error;
    } else {
      // Success logic if needed
      return response;
    }
  } catch (error) {
    console.error('Error while submitting form data:', error);
    throw error; // Re-throw the error if needed
  }
};