"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/_context/AuthContext";

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close dropdown on route change
  useEffect(() => { setDropdownOpen(false); }, [pathname]);

  const links = user ? AUTH_LINKS : GUEST_LINKS;

  // Initials from name
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

      {/* Nav links */}
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

      {/* Right side */}
      <div className="nav-auth">
        {loading ? (
          // Skeleton while checking token
          <div className="nav-skeleton" />
        ) : user ? (
          // ── LOGGED IN ──
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
                {/* User info */}
                <div className="nav-dropdown-header">
                  <div className="nav-dropdown-avatar">{initials}</div>
                  <div>
                    <div className="nav-dropdown-name">{user.name}</div>
                    {/* <div className="nav-dropdown-handle">@{user.handle}</div> */}
                  </div>
                </div>

                <div className="nav-dropdown-divider" />

                {/* Links */}
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
          // ── GUEST ──
          <>
            <Link className="btn-ghost" href="/login">Login</Link>
            <Link className="btn-gold"  href="/signup">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}