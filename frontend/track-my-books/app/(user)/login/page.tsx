"use client";

import Link from "next/dist/client/link";
import { useState } from "react";

const BG_BOOKS = [
  "https://covers.openlibrary.org/b/id/8231856-L.jpg",
  "https://covers.openlibrary.org/b/id/8758191-L.jpg",
  "https://covers.openlibrary.org/b/id/8575708-L.jpg",
  "https://covers.openlibrary.org/b/id/8406786-L.jpg",
  "https://covers.openlibrary.org/b/id/8091022-L.jpg",
  "https://covers.openlibrary.org/b/id/8391619-L.jpg",
  "https://covers.openlibrary.org/b/id/10509244-L.jpg",
  "https://covers.openlibrary.org/b/id/10481085-L.jpg",
  "https://covers.openlibrary.org/b/id/13066421-L.jpg",
  "https://covers.openlibrary.org/b/id/12699828-L.jpg",
  "https://covers.openlibrary.org/b/id/8406782-L.jpg",
  "https://covers.openlibrary.org/b/id/8091016-L.jpg",
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  return (

<div className="page">
        <div className="left-panel">
          <div className="book-wall">
            {BG_BOOKS.map((src, i) => (
              <img key={i} src={src} alt="" />
            ))}
          </div>
          <div className="left-overlay" />
          <div className="left-content">
            <a href="/" className="logo">
              <div className="logo-icon">📚</div>
              <span className="logo-text">Track <span>My</span> Books</span>
            </a>
            <div className="left-quote">
              <span className="quote-mark">"</span>
              <blockquote>
                A reader lives a thousand lives before he dies. The man who never reads lives only one.
              </blockquote>
              <span className="quote-author">— George R.R. Martin</span>
            </div>
          </div>
        </div>

        <div className="right-panel">
          <div className="form-container">
            <div className="form-eyebrow">
              <span className="eyebrow-line" />
              Welcome back
              <span className="eyebrow-line" />
            </div>
            <h1 className="form-title">
              Sign in<br />to <em>Track My Books</em>
            </h1>
            <p className="form-subtitle">
              Continue your reading journey.
            </p>



            <div className="divider">
              <span className="divider-line" />
              <span className="divider-text">Sign in</span>
              <span className="divider-line" />
            </div>

            <div
              className={`field ${focused === "email" ? "active" : ""}`}
            >
              <label>Email address</label>
              <div className="input-wrap">
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                />
                <span className="input-icon">✉</span>
              </div>
            </div>

            <div
              className={`field ${focused === "password" ? "active" : ""}`}
            >
              <label>Password</label>
              <div className="input-wrap">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                />
                <span
                  className="input-icon clickable"
                  onClick={() => setShowPass(v => !v)}
                >
                  {showPass ? "🙈" : "👁"}
                </span>
              </div>
            </div>

            <div className="field-row">
              <label className="remember">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-link">Forgot your password?</a>
            </div>

            <button className="btn-submit">Sign in</button>

            <div className="form-footer">
              Don't have an account?{" "}
              <Link href="/signup">Sign up for free →</Link>
            </div>
          </div>
        </div>
      </div>
  );
}
