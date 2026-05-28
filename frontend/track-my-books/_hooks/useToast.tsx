import { useState, useCallback } from "react";
import { ToastItem, ToastType } from "@/_components/Toast";

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  return { toasts, addToast, removeToast };
}