"use client";

import { useState } from "react";

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

const GENRES = ["Klasyka", "Sci-Fi", "Fantasy", "Kryminał", "Romans", "Historia", "Thriller", "Biografia"];

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [agree, setAgree] = useState(false);
  const [step, setStep] = useState(1);

  const toggleGenre = (g: string) =>
    setSelectedGenres(prev =>
      prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]
    );

  const strength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const strengthLabel = ["", "Słabe", "Średnie", "Dobre", "Silne"][strength];
  const strengthColor = ["", "#e05252", "#e09452", "#c9a84c", "#52b788"][strength];

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
              <span className="logo-text">Biblio<span>Track</span></span>
            </a>
            <div className="perks">
              <div>
                <h2 className="perks-heading">
                  Dołącz do<br /><em>społeczności</em><br />czytelników
                </h2>
              </div>
              <div className="perk-item">
                <div className="perk-icon-wrap">📖</div>
                <div className="perk-text">
                  <h3>Nieograniczona biblioteka</h3>
                  <p>Kataloguj tyle książek ile chcesz, bezpłatnie.</p>
                </div>
              </div>
              <div className="perk-item">
                <div className="perk-icon-wrap">🌟</div>
                <div className="perk-text">
                  <h3>Spersonalizowane rekomendacje</h3>
                  <p>AI dobiera tytuły dopasowane do Twojego gustu.</p>
                </div>
              </div>
              <div className="perk-item">
                <div className="perk-icon-wrap">📊</div>
                <div className="perk-text">
                  <h3>Roczne podsumowania</h3>
                  <p>Twoje czytelnicze statystyki i osiągnięcia.</p>
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
                  Krok 1 z 2
                  <span className="eyebrow-line" />
                </div>
                <h1 className="form-title">
                  Stwórz<br /><em>konto</em>
                </h1>
                <p className="form-subtitle">Zarejestruj się i śledź swoją czytelniczą podróż.</p>

                <div className="social-btns">
                  <button className="social-login-btn">
                    <span>G</span> Google
                  </button>
                  <button className="social-login-btn">
                    <span>f</span> Facebook
                  </button>
                </div>

                <div className="divider">
                  <span className="divider-line" />
                  <span className="divider-text">lub podaj dane</span>
                  <span className="divider-line" />
                </div>

                <div className={`field ${focused === "name" ? "active" : ""}`}>
                  <label>Imię i nazwisko</label>
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

                <div className={`field ${focused === "email" ? "active" : ""}`}>
                  <label>Adres e-mail</label>
                  <div className="input-wrap">
                    <input
                      type="email"
                      placeholder="twoj@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onFocus={() => setFocused("email")}
                      onBlur={() => setFocused(null)}
                    />
                    <span className="input-icon">✉</span>
                  </div>
                </div>

                <div className={`field ${focused === "password" ? "active" : ""}`}>
                  <label>Hasło</label>
                  <div className="input-wrap">
                    <input
                      type={showPass ? "text" : "password"}
                      placeholder="Minimum 8 znaków"
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
                  {password && (
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
                  disabled={!name || !email || !password || password.length < 6}
                >
                  Dalej →
                </button>

                <div className="form-footer">
                  Masz już konto?{" "}
                  <a href="/logowanie">Zaloguj się</a>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="step-anim" key="step2">
                <div className="form-eyebrow">
                  <span className="eyebrow-line" />
                  Krok 2 z 2
                  <span className="eyebrow-line" />
                </div>
                <h1 className="form-title">
                  Twoje<br /><em>preferencje</em>
                </h1>
                <p className="form-subtitle">
                  Wybierz ulubione gatunki, aby otrzymywać lepsze rekomendacje.
                </p>

                <span className="genres-label">Ulubione gatunki literackie</span>
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
                    Akceptuję{" "}
                    <a href="#">regulamin serwisu</a>
                    {" "}oraz{" "}
                    <a href="#">politykę prywatności</a>
                    . Wyrażam zgodę na przetwarzanie danych osobowych.
                  </span>
                </div>

                <button
                  className="btn-submit"
                  disabled={!agree}
                >
                  Utwórz konto ✓
                </button>

                <button className="btn-outline" onClick={() => setStep(1)}>
                  ← Wróć
                </button>

                <div className="form-footer">
                  Masz już konto?{" "}
                  <a href="/logowanie">Zaloguj się</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
