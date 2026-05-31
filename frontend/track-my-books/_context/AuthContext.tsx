"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@/_components/User";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser?: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider zarządzający globalnym stanem uwierzytelnienia w całej aplikacji Next.js
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Przy pierwszym załadowaniu strony automatycznie sprawdzamy, czy użytkownik ma aktywną sesję
  useEffect(() => {
      fetchCurrentUser().finally(() => setLoading(false));
    }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/user/me", {
        method: "GET",
        // credentials: "include" nakazuje przeglądarce dołączyć bezpieczne ciasteczka (HttpOnly cookie z tokenem JWT)
        // do zapytania cross-origin (z localhost:3000 na backend na porcie 5000)
        credentials: "include",
      });
      if (res.ok){
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    }
  };

  // Umożliwia wymuszenie ponownego pobrania danych o użytkowniku
  const refreshUser = async () => {
    setLoading(true);
    await fetchCurrentUser();
    setLoading(false);
  };

  const logout = async () => {
    try {
      await fetch("http://localhost:5000/api/user/logout", {
        method: "POST",
        credentials: "include", // Również wymagane, aby usunąć ciasteczko sesyjne na porcie 5000
      }).then(() => setUser(null));
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setUser(null);
      // Przekierowanie użytkownika na stronę główną i pełne przeładowanie w celu wyczyszczenia stanów aplikacji
      window.location.href = "/";
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Customowy hook ułatwiający dostęp do danych sesyjnych w każdym komponencie klienckim
// Zabezpieczenie na początku rzuca czytelny błąd, jeśli zapomnimy opakować aplikację w <AuthProvider>
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};