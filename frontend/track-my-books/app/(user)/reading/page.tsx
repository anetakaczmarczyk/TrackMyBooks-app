"use client";

import { useState, useEffect, useRef } from "react";
import {Navbar} from "@/_components/Navbar";

const BOOK = {
  id: 3,
  title: "Dune",
  author: "Frank Herbert",
  cover: "https://covers.openlibrary.org/b/id/8758191-L.jpg",
  pages: 688,
  genre: "Sci-Fi",
};

const STATUSES = [
  { id: "reading",   icon: "📖", label: "Czytam teraz"     },
  { id: "read",      icon: "✅", label: "Przeczytana"      },
  { id: "wishlist",  icon: "🔖", label: "Chcę przeczytać" },
  { id: "abandoned", icon: "💤", label: "Porzuć książkę"  },
];

const INITIAL_LOG = [
  { id: 1, date: "25 mar 2026", startPage: 226, endPage: 268, pages: 42, minutes: 65  },
  { id: 2, date: "24 mar 2026", startPage: 198, endPage: 226, pages: 28, minutes: 40  },
  { id: 3, date: "23 mar 2026", startPage: 143, endPage: 198, pages: 55, minutes: 80  },
  { id: 4, date: "22 mar 2026", startPage: 113, endPage: 143, pages: 30, minutes: 48  },
  { id: 5, date: "21 mar 2026", startPage: 52,  endPage: 113, pages: 61, minutes: 90  },
];

const READING_SPEED = 35; // str/h average

function pad(n: number) { return String(n).padStart(2, "0"); }

export default function ReadingPage() {
  const [currentPage, setCurrentPage] = useState(268);
  const [inputPage, setInputPage]     = useState("268");
  const [status, setStatus]           = useState("reading");
  const [log, setLog]                 = useState(INITIAL_LOG);
  const [showLogForm, setShowLogForm] = useState(false);

  // Session timer
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [sessionStartPage, setSessionStartPage] = useState(268);
  const [sessionEndPage, setSessionEndPage]     = useState("268");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Note
  const [note, setNote] = useState("");
  const [savedNotes, setSavedNotes] = useState<{ page: number; text: string }[]>([]);

  // Status confirm modal
  const [confirmStatus, setConfirmStatus] = useState<string | null>(null);

  const pct = Math.round((currentPage / BOOK.pages) * 100);
  const pagesLeft = BOOK.pages - currentPage;
  const hoursLeft = +(pagesLeft / READING_SPEED).toFixed(1);
  const totalPagesRead = log.reduce((s, e) => s + e.pages, 0);
  const avgPerDay = log.length ? Math.round(totalPagesRead / log.length) : 0;

  useEffect(() => {
    if (timerActive) {
      intervalRef.current = setInterval(() => setTimerSeconds(s => s + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerActive]);

  const startSession = () => {
    setSessionStartPage(currentPage);
    setSessionEndPage(String(currentPage));
    setTimerSeconds(0);
    setTimerActive(true);
  };

  const finishSession = () => {
    setTimerActive(false);
    const endP = Math.min(BOOK.pages, Math.max(currentPage, +sessionEndPage || currentPage));
    const pages = endP - sessionStartPage;
    const minutes = Math.round(timerSeconds / 60);
    if (pages > 0 || minutes > 0) {
      const entry = {
        id: Date.now(),
        date: new Date().toLocaleDateString("pl", { day: "numeric", month: "short", year: "numeric" }),
        startPage: sessionStartPage,
        endPage: endP,
        pages,
        minutes,
      };
      setLog(prev => [entry, ...prev]);
      setCurrentPage(endP);
      setInputPage(String(endP));
    }
    setTimerSeconds(0);
    setSessionEndPage(String(currentPage));
  };

  const updatePage = () => {
    const p = Math.min(BOOK.pages, Math.max(0, +inputPage || 0));
    setCurrentPage(p);
    setInputPage(String(p));
    if (p === BOOK.pages) setStatus("read");
  };

  const handleStatusChange = (id: string) => {
    if (id === "abandoned" || id === "read") { setConfirmStatus(id); return; }
    setStatus(id);
  };

  const confirmStatusChange = () => {
    if (!confirmStatus) return;
    setStatus(confirmStatus);
    if (confirmStatus === "read") { setCurrentPage(BOOK.pages); setInputPage(String(BOOK.pages)); }
    setConfirmStatus(null);
  };

  const saveNote = () => {
    if (!note.trim()) return;
    setSavedNotes(prev => [{ page: currentPage, text: note }, ...prev]);
    setNote("");
  };

  return (
    <>
      <Navbar />
      <div className="inner-page">

        {/* ── HEADER ── */}
        <div className="page-header" style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <img src={BOOK.cover} alt={BOOK.title} className="rp-header-cover" />
            <div>
              <div className="page-eyebrow"><span className="eyebrow-line" />Panel czytania<span className="eyebrow-line" /></div>
              <h1 className="page-title" style={{ fontSize: "clamp(28px, 3vw, 42px)", marginBottom: 4 }}>{BOOK.title}</h1>
              <p className="page-subtitle">{BOOK.author} · {BOOK.pages} stron</p>
            </div>
          </div>
          <a href={`/books/${BOOK.id}`} className="bd-author-link" style={{ alignSelf: "flex-end" }}>← Wróć do książki</a>
        </div>

        <div className="rp-layout">

          {/* ── LEFT COLUMN ── */}
          <div className="rp-left">

            {/* Progress card */}
            <div className="stats-card rp-card">
              <h3 className="stats-card-title">Postęp czytania</h3>

              <div className="rp-big-pct">{pct}<span>%</span></div>

              <div className="rp-progress-bar-big">
                <div className="rp-progress-fill-big" style={{ width: `${pct}%` }} />
              </div>

              <div className="rp-progress-meta">
                <span>str. {currentPage}</span>
                <span>{pagesLeft} str. do końca</span>
                <span>str. {BOOK.pages}</span>
              </div>

              {/* Page updater */}
              <div className="rp-page-updater">
                <span className="rp-page-label">Jestem na stronie:</span>
                <div className="rp-page-input-row">
                  <button className="rp-page-step" onClick={() => { const v = Math.max(0, currentPage-1); setCurrentPage(v); setInputPage(String(v)); }}>−</button>
                  <input
                    type="number"
                    className="rp-page-input"
                    value={inputPage}
                    min={0} max={BOOK.pages}
                    onChange={e => setInputPage(e.target.value)}
                    onBlur={updatePage}
                    onKeyDown={e => e.key === "Enter" && updatePage()}
                  />
                  <button className="rp-page-step" onClick={() => { const v = Math.min(BOOK.pages, currentPage+1); setCurrentPage(v); setInputPage(String(v)); }}>+</button>
                  <button className="btn-gold" style={{ padding: "9px 18px", fontSize: 13 }} onClick={updatePage}>Zapisz</button>
                </div>
                {pct === 100 && <p className="rp-congrats">🎉 Brawo! Ukończyłeś tę książkę!</p>}
              </div>
            </div>

            {/* Timer / Session card */}
            <div className="stats-card rp-card">
              <h3 className="stats-card-title">Sesja czytania</h3>

              <div className="rp-timer-display">
                <span className={`rp-timer-digits ${timerActive ? "active" : ""}`}>
                  {pad(Math.floor(timerSeconds / 3600))}:{pad(Math.floor((timerSeconds % 3600) / 60))}:{pad(timerSeconds % 60)}
                </span>
                <div className="rp-timer-status">{timerActive ? "⏱ Sesja trwa…" : "Gotowy do startu"}</div>
              </div>

              {!timerActive ? (
                <button className="btn-submit" style={{ maxWidth: 200 }} onClick={startSession}>
                  ▶ Rozpocznij sesję
                </button>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div className="field">
                    <label style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                      Skończyłem na stronie
                    </label>
                    <div className="input-wrap">
                      <input
                        type="number"
                        value={sessionEndPage}
                        min={sessionStartPage} max={BOOK.pages}
                        onChange={e => setSessionEndPage(e.target.value)}
                        style={{ maxWidth: 120 }}
                      />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button className="btn-submit" style={{ maxWidth: 160 }} onClick={finishSession}>⏹ Zakończ sesję</button>
                    <button className="btn-outline" style={{ maxWidth: 120 }} onClick={() => { setTimerActive(false); setTimerSeconds(0); }}>Anuluj</button>
                  </div>
                  <p className="settings-hint">Start: str. {sessionStartPage}</p>
                </div>
              )}
            </div>

            {/* Status card */}
            <div className="stats-card rp-card">
              <h3 className="stats-card-title">Status książki</h3>
              <div className="rp-status-list">
                {STATUSES.map(s => (
                  <button
                    key={s.id}
                    className={`rp-status-btn ${status === s.id ? "active" : ""}`}
                    onClick={() => handleStatusChange(s.id)}
                  >
                    <span className="rp-status-icon">{s.icon}</span>
                    <span className="rp-status-label">{s.label}</span>
                    {status === s.id && <span className="rp-status-tick">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes card */}
            <div className="stats-card rp-card">
              <h3 className="stats-card-title">Notatki do książki</h3>
              <div className="field">
                <label style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                  Notatka (str. {currentPage})
                </label>
                <textarea
                  className="contact-textarea"
                  placeholder="Myśl, cytat, przemyślenie…"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  rows={3}
                />
              </div>
              <button className="add-btn-sm" style={{ marginTop: 8 }} onClick={saveNote} disabled={!note.trim()}>
                + Zapisz notatkę
              </button>
              {savedNotes.length > 0 && (
                <div className="rp-notes-list">
                  {savedNotes.map((n, i) => (
                    <div className="rp-note-item" key={i}>
                      <span className="rp-note-page">str. {n.page}</span>
                      <p className="rp-note-text">{n.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="rp-right">

            {/* Stats mini */}
            <div className="rp-mini-stats">
              {[
                { val: `${totalPagesRead}`,    lbl: "Stron przeczytanych" },
                { val: `${log.length}`,        lbl: "Sesji łącznie"       },
                { val: `${avgPerDay}`,         lbl: "Śr. stron dziennie"  },
                { val: `~${hoursLeft}h`,       lbl: "Do końca książki"    },
              ].map(s => (
                <div className="rp-mini-stat" key={s.lbl}>
                  <div className="rp-mini-val">{s.val}</div>
                  <div className="rp-mini-lbl">{s.lbl}</div>
                </div>
              ))}
            </div>

            {/* Reading log */}
            <div className="stats-card">
              <div className="section-header-row" style={{ marginBottom: 16 }}>
                <h3 className="stats-card-title" style={{ marginBottom: 0 }}>Dziennik sesji</h3>
                <button className="add-btn-sm" onClick={() => setShowLogForm(v => !v)}>
                  {showLogForm ? "Anuluj" : "+ Dodaj ręcznie"}
                </button>
              </div>

              {showLogForm && (
                <div className="rp-log-form">
                  <div className="rp-log-form-grid">
                    <div className="field">
                      <label>Od strony</label>
                      <div className="input-wrap"><input type="number" placeholder="np. 100" /></div>
                    </div>
                    <div className="field">
                      <label>Do strony</label>
                      <div className="input-wrap"><input type="number" placeholder="np. 150" /></div>
                    </div>
                    <div className="field">
                      <label>Czas (min)</label>
                      <div className="input-wrap"><input type="number" placeholder="np. 45" /></div>
                    </div>
                    <div className="field">
                      <label>Data</label>
                      <div className="input-wrap"><input type="date" defaultValue={new Date().toISOString().split("T")[0]} /></div>
                    </div>
                  </div>
                  <button className="btn-submit" style={{ maxWidth: 160, marginTop: 8 }}>Zapisz wpis</button>
                </div>
              )}

              <div className="rp-log-list">
                {log.map((entry, i) => (
                  <div className="rp-log-row" key={entry.id} style={{ animationDelay: `${i * 0.04}s` }}>
                    <div className="rp-log-dot" />
                    <div className="rp-log-info">
                      <div className="rp-log-pages">
                        str. {entry.startPage} → {entry.endPage}
                        <span className="rp-log-badge">+{entry.pages} str.</span>
                      </div>
                      <div className="rp-log-meta">{entry.date} · {entry.minutes} min · {Math.round(entry.pages / (entry.minutes / 60))} str/h</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly chart */}
            <div className="stats-card">
              <h3 className="stats-card-title">Aktywność (ostatni tydzień)</h3>
              <div className="rp-week-chart">
                {["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nd"].map((day, i) => {
                  const vals = [28, 0, 55, 30, 61, 42, 0];
                  const max  = Math.max(...vals);
                  return (
                    <div className="rp-week-col" key={day}>
                      <div className="rp-week-bar-wrap">
                        <div
                          className="rp-week-bar"
                          style={{ height: max ? `${(vals[i] / max) * 100}%` : "0%" }}
                          title={`${vals[i]} str.`}
                        />
                      </div>
                      <div className="rp-week-val">{vals[i] > 0 ? vals[i] : ""}</div>
                      <div className="rp-week-day">{day}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── CONFIRM MODAL ── */}
        {confirmStatus && (
          <div className="rp-modal-backdrop">
            <div className="rp-modal">
              <h3 className="rp-modal-title">
                {confirmStatus === "abandoned" ? "Porzucić książkę?" : "Oznaczyć jako przeczytaną?"}
              </h3>
              <p className="rp-modal-body">
                {confirmStatus === "abandoned"
                  ? "Książka trafi do sekcji \"Porzucone\". Możesz ją stamtąd przywrócić w dowolnym momencie."
                  : `Strona zostanie ustawiona na ${BOOK.pages}/${BOOK.pages}. Gratulacje!`}
              </p>
              <div className="rp-modal-actions">
                <button className="btn-gold" style={{ padding: "10px 24px" }} onClick={confirmStatusChange}>
                  {confirmStatus === "abandoned" ? "Porzuć" : "Tak, przeczytana!"}
                </button>
                <button className="btn-ghost" onClick={() => setConfirmStatus(null)}>Anuluj</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}