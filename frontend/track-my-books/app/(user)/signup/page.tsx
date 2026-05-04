"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { User } from "@/_components/User";
import { useRouter } from "next/navigation";

const BG_BOOKS = [
  "https://covers.openlibrary.org/b/id/8758191-L.jpg",
  "https://covers.openlibrary.org/b/id/10509244-L.jpg",
  "https://covers.openlibrary.org/b/id/13066421-L.jpg",
  "https://covers.openlibrary.org/b/id/8231856-L.jpg",
  "https://covers.openlibrary.org/b/id/8406786-L.jpg",
  "https://covers.openlibrary.org/b/id/8575708-L.jpg",
  "https://covers.openlibrary.org/b/id/10481085-L.jpg",
  "https://covers.openlibrary.org/b/id/8091022-L.jpg",
  "https://covers.openlibrary.org/b/id/12699828-L.jpg",
  "https://covers.openlibrary.org/b/id/8406782-L.jpg",
  "https://covers.openlibrary.org/b/id/8091016-L.jpg",
  "https://covers.openlibrary.org/b/id/8391619-L.jpg",
];

const GENRES = ["Classical", "Sci-Fi", "Fantasy", "Crime", "Romance", "History", "Thriller", "Biography", "Philosophy", "Poetry", "Horror", "Non-fiction"];


export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [nick, setNick] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [agree, setAgree] = useState(false);
  const [step, setStep] = useState(1);
  const [emailExists, setEmailExists] = useState(false);
  const [usernameExists, setUsernameExists] = useState(false);

  const toggleGenre = (g: string) =>
    setSelectedGenres(prev =>
      prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]
    );

  const strength = (() => {
    if (!password) return 0;
    let s = 1;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    if (password.length >= 8) s++;
    else s = 0;
    return s;
  })();

  const checkEmailExists = async (email: string) => {
    if (!email) {
      setEmailExists(false);
      return;
    }
    const response = await fetch(`http://localhost:5000/api/user/checkIfEmailIsTaken/${encodeURIComponent(email)}`);
    const data = await response.json();
    setEmailExists(data.taken);
  }

  const checkUsernameExists = async (username: string) => {
    if (!username) {
      setUsernameExists(false);
      return;
    }
    const response = await fetch(`http://localhost:5000/api/user/checkIfUsernameIsTaken/${encodeURIComponent(username)}`);
    const data = await response.json();
    setUsernameExists(data.taken);
  }

  const handleCreateAccount = async () => {
    const newUser: User = {
      name,
      username: nick,
      email,
      password_Hash: password,
      preferred_Genres: selectedGenres.join(","),
      bio: "",
      booksGoal: 0
    };

    const response = await fetch("http://localhost:5000/api/user/createUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser)
    });

    if (!response.ok) {
      alert("Failed to create account.");
    } else {
      alert("Account created successfully!");
      setTimeout(() => {
        router.push("/login");
      }, 1000);
    }
  };
  

  const strengthLabel = ["", "Weak", "Medium", "Strong", "Very Strong"][strength];
  const strengthColor = ["", "#e05252", "#e09452", "#c9a84c", "#52b788"][strength];

  const emailValid = (() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))();
  return (
    

<div className="page">
        {/* LEFT */}
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
            <div className="perks">
              <div>
                <h2 className="perks-heading">
                  Join the<br /><em>community</em><br />of readers
                </h2>
              </div>
              <div className="perk-item">
                <div className="perk-icon-wrap">📖</div>
                <div className="perk-text">
                  <h3>Unlimited Library</h3>
                  <p>Organize as many books as you want, for free.</p>
                </div>
              </div>
              <div className="perk-item">
                <div className="perk-icon-wrap">🌟</div>
                <div className="perk-text">
                  <h3>Personalized Recommendations</h3>
                  <p>Curated titles tailored to your reading preferences.</p>
                </div>
              </div>
              <div className="perk-item">
                <div className="perk-icon-wrap">📊</div>
                <div className="perk-text">
                  <h3>Summaries</h3>
                  <p>Your reading statistics and achievements.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="right-panel">
          <div className="form-container">

            {/* Steps */}
            <div className="steps-indicator">
              <div className={`step-dot ${step >= 1 ? (step > 1 ? "done" : "active") : ""}`}>
                <div className="step-circle">{step > 1 ? "✓" : "1"}</div>
                <span>Konto</span>
              </div>
              <span className={`step-line ${step >= 2 ? "active" : ""}`} />
              <div className={`step-dot ${step >= 2 ? "active" : ""}`}>
                <div className="step-circle">2</div>
                <span>Preferencje</span>
              </div>
            </div>

            {step === 1 && (
              <div className="step-anim" key="step1">
                <div className="form-eyebrow">
                  <span className="eyebrow-line" />
                  Step 1 of 2
                  <span className="eyebrow-line" />
                </div>
                <h1 className="form-title">
                  Create<br /><em>Account</em>
                </h1>
                <p className="form-subtitle">Sign up and track your reading journey.</p>

                <div className="divider">
                  <span className="divider-line" />
                  <span className="divider-text">Provide Information</span>
                  <span className="divider-line" />
                </div>

                <div className={`field ${focused === "name" ? "active" : ""}`}>
                  <label>Full Name</label>
                  <div className="input-wrap">
                    <input
                      type="text"
                      placeholder="Jan Kowalski"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      onFocus={() => setFocused("name")}
                      onBlur={() => setFocused(null)}
                    />
                    <span className="input-icon">👤</span>
                  </div>
                </div>

                <div className={`field ${focused === "name" ? "active" : ""}`}>
                  <label>Username</label>
                  <div className="input-wrap">
                    <input
                      type="text"
                      placeholder="jkowalski"
                      value={nick}
                      onChange={e => setNick(e.target.value)}
                      onFocus={() => setFocused("nick")}
                      onBlur={() => {
                        setFocused(null);
                        checkUsernameExists(nick);
                      }}
                    />
                    <span className="input-icon">👥</span>
                    {usernameExists && (
                      <span className="strength-label" style={{ color: "#e05252" }}>Username is already taken.</span>
                    )}
                  </div>
                </div>

                <div className={`field ${focused === "email" ? "active" : ""}`}>
                  <label>Email Address</label>
                  <div className="input-wrap">
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onFocus={() => setFocused("email")}
                      onBlur={() => {
                        setFocused(null);
                        checkEmailExists(email);
                      }}
                    />
                    <span className="input-icon">✉</span>
                    {emailExists && (
                      <span className="strength-label" style={{ color: "#e05252" }}>Email is already taken.</span>
                    )}
                  </div>
                  {email && (
                    <div >
                      <span className="strength-label" style={{ color: "#e05252" }}>{emailValid ? "" : "Invalid email address"}</span>
                    </div>
                  )}
                  </div>

                <div className={`field ${focused === "password" ? "active" : ""}`}>
                  <label>Password</label>
                  <div className="input-wrap">
                    <input
                      type={showPass ? "text" : "password"}
                      placeholder="Minimum 8 characters"
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
                  {(password && strength > 0) && (
                    <div className="strength-bar">
                      {[1,2,3,4].map(i => (
                        <div
                          key={i}
                          className="strength-seg"
                          style={{ background: i <= strength ? strengthColor : undefined }}
                        />
                      ))}
                      <span className="strength-label" style={{ color: strengthColor }}>
                        {strengthLabel}
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ height: 12 }} />

                <button
                  className="btn-submit"
                  onClick={() => setStep(2)}
                  disabled={!name || !nick || !email || !password || !emailValid || strength < 2 || emailExists || usernameExists}
                >
                  Next →
                </button>

                <div className="form-footer">
                  Already have an account?{" "}
                  <Link href="/login">Log in</Link>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="step-anim" key="step2">
                <div className="form-eyebrow">
                  <span className="eyebrow-line" />
                  Step 2 of 2
                  <span className="eyebrow-line" />
                </div>
                <h1 className="form-title">
                  Your<br /><em>Preferences</em>
                </h1>
                <p className="form-subtitle">
                  Choose your favorite genres to receive better recommendations.
                </p>

                <span className="genres-label">Favorite Literary Genres</span>
                <div className="genres-grid">
                  {GENRES.map(g => (
                    <button
                      key={g}
                      className={`genre-chip ${selectedGenres.includes(g) ? "selected" : ""}`}
                      onClick={() => toggleGenre(g)}
                    >
                      {selectedGenres.includes(g) ? "✓ " : ""}{g}
                    </button>
                  ))}
                </div>

                <div className="checkbox-row">
                  <input
                    type="checkbox"
                    id="agree"
                    checked={agree}
                    onChange={e => setAgree(e.target.checked)}
                  />
                  <span>
                    I accept the{" "}
                    <a href="#">terms of service</a>
                    {" "}and{" "}
                    <a href="#">privacy policy</a>
                    . I consent to the processing of my personal data.
                  </span>
                </div>

                <button
                  className="btn-submit"
                  disabled={!agree}
                  onClick={() => handleCreateAccount()}
                >
                  Create Account ✓
                </button>

                <button className="btn-outline" onClick={() => setStep(1)}>
                  ← Back
                </button>

                <div className="form-footer">
                  Already have an account?{" "}
                  <a href="/login">Log in</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
