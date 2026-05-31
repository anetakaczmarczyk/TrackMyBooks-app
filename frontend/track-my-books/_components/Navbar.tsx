"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/_context/AuthContext";

// Definicje linków nawigacyjnych dla gości oraz zalogowanych użytkowników
const GUEST_LINKS = [
  { href: "/books",           label: "Books"           },
  { href: "/recommendations", label: "Recommendations" },
];

const AUTH_LINKS = [
  { href: "/books",           label: "Books"           },
  { href: "/recommendations", label: "Recommendations" },
  { href: "/library",         label: "My Library"      },
];

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const pathname                  = usePathname();
  const [scrolled, setScrolled]   = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Obsługa kliknięć poza menu rozwijanym profilu (Dropdown) - zamyka menu, gdy użytkownik kliknie w dowolne inne miejsce na stronie
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Automatyczne zamykanie menu profilowego przy zmianie podstrony
  useEffect(() => { setDropdownOpen(false); }, [pathname]);

  const links = user ? AUTH_LINKS : GUEST_LINKS;

  // Generowanie maksymalnie dwuliterowego inicjału na potrzeby domyślnego awatara
  const initials = user?.name
    .split(" ")
    .map(w => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "";

  return (
    <nav className={scrolled ? "scrolled" : ""}>
      {/* Logo */}
      <Link href="/" className="logo">
        <div className="logo-icon">📚</div>
        <span className="logo-text">Track <span>My</span> Books</span>
      </Link>

      {/* Dynamiczne renderowanie linków nawigacyjnych */}
      <ul className="nav-links">
        {links.map(l => (
          <li key={l.href}>
            <Link
              href={l.href}
              className={pathname === l.href ? "nav-active" : ""}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Prawa strona nawigacji */}
      <div className="nav-auth">
        {loading ? (
          <div className="nav-skeleton" />
        ) : user ? (
          // ── WIDOK DLA ZALOGOWANEGO UŻYTKOWNIKA ──
          <div className="nav-user-wrap" ref={dropdownRef}>
            <button
              className="nav-user-btn"
              onClick={() => setDropdownOpen(v => !v)}
              aria-expanded={dropdownOpen}
            >
              <div className="nav-avatar">{initials}</div>
              <span className="nav-username">{user.name.split(" ")[0]}</span>
              <span className={`nav-chevron ${dropdownOpen ? "open" : ""}`}>▾</span>
            </button>

            {dropdownOpen && (
              <div className="nav-dropdown">
                {/* Nagłówek menu profilowego */}
                <div className="nav-dropdown-header">
                  <div className="nav-dropdown-avatar">{initials}</div>
                  <div>
                    <div className="nav-dropdown-name">{user.name}</div>
                  </div>
                </div>

                <div className="nav-dropdown-divider" />

                {/* Sekcja linków nawigacyjnych w panelu użytkownika */}
                <Link href="/dashboard"  className="nav-dropdown-item">📊 Dashboard</Link>
                <Link href="/profile"    className="nav-dropdown-item">👤 My Profile</Link>
                <Link href="/library"    className="nav-dropdown-item">📚 My Library</Link>
                <Link href="/friends"    className="nav-dropdown-item">👥 Friends</Link>

                <div className="nav-dropdown-divider" />

                <Link href="/settings"   className="nav-dropdown-item">⚙️ Settings</Link>
                <button
                  className="nav-dropdown-item nav-dropdown-logout"
                  onClick={logout}
                >
                  🚪 Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          // ── WIDOK DLA GOŚCIA ──
          <>
            <Link className="btn-ghost" href="/login">Login</Link>
            <Link className="btn-gold"  href="/signup">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}