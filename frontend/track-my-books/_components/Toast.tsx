"use client";

import { useEffect } from "react";

// Definicje typów powiadomień wspieranych przez system Toastów
export type ToastType = "success" | "error" | "warning";

export interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

// Kontener renderujący aktualną listę aktywnych powiadomień
// Zarządzanie stanem (dodawanie/usuwanie) odbywa się na poziomie nadrzędnym
export function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: ToastItem[];
  onRemove: (id: number) => void;
}) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <Toast key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}

// Komponent reprezentujący pojedyncze powiadomienie na ekranie
function Toast({
  toast,
  onRemove,
}: {
  toast: ToastItem;
  onRemove: (id: number) => void;
}) {
  // Automatyczne wygaszanie powiadomienia po upływie 4 sekund
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 4000);
    
    // Anuluje zaplanowany timer, chroniąc przed niepotrzebnym wywoływaniem funkcji onRemove dla usuniętych już id
    return () => clearTimeout(timer); 
  }, [toast.id, onRemove]);

  return (
    // Dynamicznie dobieramy klasy CSS pod odpowiedni wygląd powiadomienia (sukces / błąd / ostrzeżenie)
    <div className={`toast toast-${toast.type}`}>
      <span className="toast-icon">
        {toast.type === "success" ? "✓" : toast.type === "error" ? "✕" : "⚠"}
      </span>
      <span className="toast-message">{toast.message}</span>
      <button className="toast-close" onClick={() => onRemove(toast.id)}>×</button>
    </div>
  );
}