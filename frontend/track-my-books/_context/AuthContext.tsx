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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
      fetchCurrentUser().finally(() => setLoading(false));
    }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/user/me", {
        method: "GET",
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

  const refreshUser = async () => {
    setLoading(true);
    await fetchCurrentUser();
    setLoading(false);
  };

  const logout = async () => {
    try {
      await fetch("http://localhost:5000/api/user/logout", {
        method: "POST",
        credentials: "include",
      }).then(() => setUser(null));
    } catch (err) {
      console.error("Logout failed:", err);
    }finally {
      setUser(null);
      window.location.href = "/";
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};