"use client";
import Link from "next/link"
import { useEffect, useState } from "react";

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);
    return (
      <nav className={scrolled ? "scrolled" : ""}>
        <Link href="/" className="logo">
          <div className="logo-icon">📚</div>
          <span className="logo-text">Track <span>My</span> Books</span>
        </Link>
        <ul className="nav-links">
          <li><Link href="/books">Books</Link></li>
          <li><Link href="/recommendations">Recommendations</Link></li>
        </ul>
        <div className="nav-auth">
          <Link className="btn-ghost" href="/login">Login</Link>
          <Link className="btn-gold" href="/signup">Sign Up</Link>
        </div>
      </nav>
    );
}