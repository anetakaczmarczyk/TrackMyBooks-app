"use client";

import { useState } from "react";
import Link from "next/link";
import {Navbar} from "@/_components/Navbar";

const SETTING_TABS = [
  { id: "konto",         icon: "👤", label: "Konto"              },
  { id: "haslo",         icon: "🔒", label: "Hasło i bezpieczeństwo" },
  { id: "usuniecie",     icon: "⚠️", label: "Usuń konto"         },
];

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button className={`settings-toggle ${on ? "on" : ""}`} onClick={onChange}>
      <span className="settings-toggle-thumb" />
    </button>
  );
}

function SettingsRow({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="settings-row">
      <div className="settings-row-label-wrap">
        <span className="settings-row-label">{label}</span>
        {sub && <span className="settings-row-sub">{sub}</span>}
      </div>
      <div className="settings-row-control">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState("konto");

  // Konto fields
  const [displayName, setDisplayName] = useState("Adam Kowalski");
  const [handle, setHandle]           = useState("adam.czyta");
  const [email, setEmail]             = useState("adam@email.com");
  const [bio, setBio]                 = useState("Miłośnik sci-fi i klasyki. 📚");
  const [savedKonto, setSavedKonto]   = useState(false);

  // Hasło
  const [currPass, setCurrPass]   = useState("");
  const [newPass, setNewPass]     = useState("");
  const [confPass, setConfPass]   = useState("");
  const [showP, setShowP]         = useState(false);





  const strength = (() => {
    if (!newPass) return 0;
    let s = 1;
    if (newPass.length >= 8) s++;
    if (/[A-Z]/.test(newPass)) s++;
    if (/[0-9]/.test(newPass)) s++;
    if (/[^A-Za-z0-9]/.test(newPass)) s++;
    return s;
  })();
  const strengthColor = ["", "#e05252", "#e09452", "#c9a84c", "#52b788"][strength];
  const strengthLabel = ["", "Słabe", "Średnie", "Dobre", "Silne"][strength];

  return (
    <>
      <Navbar />
      <div className="inner-page">

        <div className="page-header" style={{ marginBottom: 36 }}>
          <div>
            <div className="page-eyebrow"><span className="eyebrow-line" />Zarządzaj kontem<span className="eyebrow-line" /></div>
            <h1 className="page-title">Ustawienia</h1>
          </div>
        </div>

        <div className="settings-layout">

          {/* Sidebar */}
          <aside className="settings-sidebar">
            {SETTING_TABS.map(t => (
              <button
                key={t.id}
                className={`settings-nav-item ${tab === t.id ? "active" : ""} ${t.id === "usuniecie" ? "danger" : ""}`}
                onClick={() => setTab(t.id)}
              >
                <span className="settings-nav-icon">{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </aside>

          {/* Main content */}
          <div className="settings-main">

            {/* ── KONTO ── */}
            {tab === "konto" && (
              <div className="settings-panel">
                <h2 className="settings-panel-title">Informacje o koncie</h2>

                <div className="settings-avatar-row">
                  <div className="settings-avatar">AK</div>
                  <div>
                    <button className="add-btn-sm">Zmień avatar</button>
                    <p className="settings-hint">JPG, PNG, max. 2 MB</p>
                  </div>
                </div>

                <div className="settings-fields-grid">
                  <div className="field active">
                    <label>Imię i nazwisko</label>
                    <div className="input-wrap">
                      <input value={displayName} onChange={e => setDisplayName(e.target.value)} type="text" />
                    </div>
                  </div>
                  <div className="field">
                    <label>Nazwa użytkownika</label>
                    <div className="input-wrap">
                      <input value={handle} disabled type="text" placeholder="@handle" />
                      <span className="input-icon" style={{ right: 14, fontSize: 12 }}>@</span>
                    </div>
                  </div>
                  <div className="field" style={{ gridColumn: "1 / -1" }}>
                    <label>Adres e-mail</label>
                    <div className="input-wrap">
                      <input value={email} onChange={e => setEmail(e.target.value)} type="email" />
                      <span className="input-icon">✉</span>
                    </div>
                  </div>
                  <div className="field" style={{ gridColumn: "1 / -1" }}>
                    <label>Bio</label>
                    <textarea
                      className="contact-textarea"
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      rows={3}
                      maxLength={160}
                    />
                    <p className="settings-hint" style={{ textAlign: "right" }}>{bio.length}/160</p>
                  </div>
                </div>

                <div className="settings-field-group">
                  <div className="settings-group-title">Cel czytelniczy 2026</div>
                  <SettingsRow label="Liczba książek w roku" sub="Używane w statystykach i na profilu">
                    <input type="number" className="settings-number-input" defaultValue={24} min={1} max={365} />
                  </SettingsRow>
                </div>

                {savedKonto && <div className="settings-saved-toast">✓ Zmiany zapisane</div>}
                <button className="btn-submit" style={{ marginTop: 24, maxWidth: 200 }} onClick={() => { setSavedKonto(true); setTimeout(() => setSavedKonto(false), 2500); }}>
                  Zapisz zmiany
                </button>
              </div>
            )}

            {/* ── HASŁO ── */}
            {tab === "haslo" && (
              <div className="settings-panel">
                <h2 className="settings-panel-title">Hasło i bezpieczeństwo</h2>

                <div className="settings-field-group">
                  <div className="settings-group-title">Zmień hasło</div>
                  <div className="field">
                    <label>Obecne hasło</label>
                    <div className="input-wrap">
                      <input type={showP ? "text" : "password"} value={currPass} onChange={e => setCurrPass(e.target.value)} placeholder="••••••••" />
                      <span className="input-icon clickable" onClick={() => setShowP(v => !v)}>{showP ? "🙈" : "👁"}</span>
                    </div>
                  </div>
                  <div className="field">
                    <label>Nowe hasło</label>
                    <div className="input-wrap">
                      <input type={showP ? "text" : "password"} value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Minimum 8 znaków" />
                    </div>
                    {newPass && (
                      <div className="strength-bar" style={{ marginTop: 8 }}>
                        {[1,2,3,4].map(i => (
                          <div key={i} className="strength-seg" style={{ background: i <= strength ? strengthColor : undefined }} />
                        ))}
                        <span className="strength-label" style={{ color: strengthColor }}>{strengthLabel}</span>
                      </div>
                    )}
                  </div>
                  <div className="field">
                    <label>Powtórz nowe hasło</label>
                    <div className="input-wrap">
                      <input type={showP ? "text" : "password"} value={confPass} onChange={e => setConfPass(e.target.value)} placeholder="••••••••" />
                      {confPass && newPass && (
                        <span className="input-icon" style={{ color: confPass === newPass ? "#52b788" : "#e05252" }}>
                          {confPass === newPass ? "✓" : "✗"}
                        </span>
                      )}
                    </div>
                  </div>
                  <button className="btn-submit" style={{ maxWidth: 220 }} disabled={!currPass || !newPass || newPass !== confPass || strength < 2}>
                    Zmień hasło
                  </button>
                </div>
              </div>
            )}



            {/* ── USUŃ KONTO ── */}
            {tab === "usuniecie" && (
              <div className="settings-panel">
                <h2 className="settings-panel-title" style={{ color: "#e05252" }}>Usuń konto</h2>
                <div className="danger-zone">
                  <div className="danger-warning">
                    <span className="danger-icon">⚠️</span>
                    <div>
                      <strong>Ta operacja jest nieodwracalna.</strong>
                      <p>Usunięcie konta spowoduje trwałe usunięcie wszystkich Twoich danych — biblioteczki, recenzji, statystyk i historii czytania. Nie można tego cofnąć.</p>
                    </div>
                  </div>
                  <div className="settings-field-group" style={{ marginTop: 24 }}>
                    <div className="field">
                      <label>Wpisz swoje hasło, aby potwierdzić</label>
                      <div className="input-wrap">
                        <input type="password" placeholder="••••••••" style={{ maxWidth: 320 }} />
                      </div>
                    </div>
                    <div className="field">
                      <label>Wpisz „USUŃ KONTO" aby potwierdzić</label>
                      <div className="input-wrap">
                        <input type="text" placeholder="USUŃ KONTO" style={{ maxWidth: 320 }} />
                      </div>
                    </div>
                    <button className="btn-danger" style={{ marginTop: 8 }}>
                      Trwale usuń konto
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}