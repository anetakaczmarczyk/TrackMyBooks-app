"use client";

import { useState, useEffect, useRef, use } from "react";
import {Navbar} from "@/_components/Navbar";
import {useRouter} from "next/navigation";
import { useAuth } from "@/_context/AuthContext";
import {LibraryItemOnlyId, Session, BookNote} from "@/_components/LibraryItem";
import {BookByIdResponse} from "@/_components/bookInterface";


const STATUSES = [
  { id: "reading",   icon: "📖", label: "Reading"     },
  { id: "read",      icon: "✅", label: "Read"      },
  { id: "wishlist",  icon: "🔖", label: "Wishlist" },
  { id: "abandoned", icon: "💤", label: "Abandoned"  },
];

// Pomocnicza funkcja formatująca liczby do postaci dwucyfrowej
function pad(n: number) { return String(n).padStart(2, "0"); }
export default function ReadingPage({
    params,
    }: {
    params: Promise<{ slug: string }>;
    }) {
    const { slug } = use(params);
    const { user, loading: authLoading, refreshUser } = useAuth();
    const router = useRouter();

    const [bookData, setBookData] = useState<BookByIdResponse | null>(null);
    const [readingStatus, setReadingStatus] = useState<LibraryItemOnlyId | null>(null);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [notes, setNotes] = useState<BookNote[]>([]);
    

  const [currentPage, setCurrentPage] = useState(0);
  const [inputPage, setInputPage]     = useState(268);
  const [status, setStatus]           = useState("reading");
  const [showLogForm, setShowLogForm] = useState(false);

  // Stany stopera sesji czytelniczej
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [sessionStartPage, setSessionStartPage] = useState(268);
  const [sessionEndPage, setSessionEndPage]     = useState("268");

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Stany notatek
  const [note, setNote] = useState("");
  const [savedNotes, setSavedNotes] = useState<{ page: number; text: string }[]>([]);
  const [notePage, setNotePage] = useState<number>(currentPage || 0);

  // Stany ręcznego logowania nowej sesji
  const [startPage, setStartPage] = useState(0);
  const [finishPage, setFinishPage] = useState(0);
  const [logTime, setLogTime] = useState(0);
  const [logDate, setLogDate] = useState(new Date().toISOString().split("T")[0]);


  // Stan modalnego okna potwierdzenia zmiany statusu
  const [confirmStatus, setConfirmStatus] = useState<string | null>(null);

  const pct = Math.round((currentPage / (bookData?.book.pages || 1)) * 100);
  const pagesLeft = (bookData?.book.pages || 1) - currentPage;

    // Słowniki dla dynamicznego tekstu w oknie potwierdzenia statusu
    const modalTitles: { [key: string]: string } = {
        abandoned: "Abandon Book?",
        read: "Mark as Read?",
        reading: "Start Reading Book?",
        wishlist: "Add to Wishlist?"
    };

    const modalBodies: { [key: string]: string } = {
        abandoned: 'Book will be moved to the "Abandoned" section. You can restore it at any time.',
        read: `Page will be set to ${bookData?.book.pages || 1}/${bookData?.book.pages || 1}. Congratulations!`,
        reading: "This book will be added to your currently reading list. Let's track your progress!",
        wishlist: "This book will be saved to your wishlist so you don't forget about it later."
    };

    const modalButtonTexts: { [key: string]: string } = {
        abandoned: "Abandon",
        read: "Yes, Mark as Read!",
        reading: "Start Reading",
        wishlist: "Add to Wishlist"
    };

  // Efekt zarządzający cyklem życia stopera. Automatycznie czyści interwał przy odmontowaniu komponentu
  useEffect(() => {
    if (timerActive) {
      intervalRef.current = setInterval(() => setTimerSeconds(s => s + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerActive]);

    // Ochrona ścieżki przed niezalogowanymi użytkownikami
    useEffect(() => {
        if (!authLoading && !user) router.push("/");
    }, [user, authLoading, router]);

    // Pobranie danych o postępie czytania książki, notatkach i historii sesji powiązanych z tym użytkownikiem
    useEffect(() => {
        if (!user) return;
        const getData = async () => {
            const res = await fetch(`http://localhost:5000/api/books/getReadingData`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ bookId: slug, username: user.username })
            });
            if (!res.ok) {
                console.error("Failed to fetch reading data");
                router.push("/");
                return;
            }
            const data = await res.json();;
            setBookData(data.bookData);
            setReadingStatus(data.reading);
            setSessions(data.readingSessions);
            // Sortujemy notatki rosnąco według numeru strony, ułatwiając czytanie notatek chronologicznie
            setNotes([...data.bookNotes].sort((a: BookNote, b: BookNote) => a.page_Number - b.page_Number));
            setCurrentPage(data.reading.progress);
            setInputPage(data.reading.progress);
        };
        getData();
    }, [user]);

    if (authLoading || !user) {
      return (
        <><Navbar />
          <div className="inner-page books-loading">
            <div className="books-loading-spinner" />
            <p>Loading…</p>
          </div>
        </>
      );
    }

  const startSession = () => {
    setSessionStartPage(currentPage);
    setSessionEndPage(String(currentPage));
    setTimerSeconds(0);
    setTimerActive(true);
  };

  // Zakończenie sesji czytania mierzonej stoperem.
  // Zapisuje sesję w bazie oraz dokonuje aktualizacji postępu (progress) w profilu użytkownika.
  const finishSession = async() => {
    setTimerActive(false);
    const endP = Math.min(bookData?.book.pages || 1, Math.max(currentPage, +sessionEndPage || currentPage));
    const pages = endP - sessionStartPage;
    const minutes = Math.round(timerSeconds / 60);
    
    if (pages > 0 || minutes > 0) {
      // 1. Zapisanie historii sesji
      const res = await fetch(`http://localhost:5000/api/books/createSession`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ readingStatus_Id: readingStatus?.id, pages_Started: sessionStartPage, pages_Finished: endP, duration_Minutes: minutes, log_Date: new Date().toISOString().split("T")[0] })
        });
        if (!res.ok) {
            console.error("Failed to put session data");
            return;
        }

      // 2. Aktualizacja nadrzędnego postępu książki w bibliotece
      const response = await fetch(`http://localhost:5000/api/books/updateProgress`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ book_Id: slug, username: user?.username, progress: finishPage, isFinished: finishPage >= (bookData?.book.pages || 1)})
    });
        if (!response.ok) {
            console.error("Failed to save data");
            return;
        }
        refreshUser?.()
    }
    setTimerSeconds(0);
    setSessionEndPage(String(currentPage));
  };

  // Ręczne logowanie sesji czytania
  const addSession = async()=>{
      const res = await fetch(`http://localhost:5000/api/books/createSession`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ readingStatus_Id: readingStatus?.id, pages_Started: startPage, pages_Finished: finishPage, duration_Minutes: logTime, log_Date: logDate })
    });
    if (!res.ok) {
        console.error("Failed to put session data");
        return;
    }

      const response = await fetch(`http://localhost:5000/api/books/updateProgress`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ book_Id: slug, username: user?.username, progress: finishPage, isFinished: finishPage >= (bookData?.book.pages || 1)})
    });
        if (!response.ok) {
            console.error("Failed to save data");
            return;
        }
    refreshUser?.()
    
  }

  // Szybki zapis aktualnego numeru strony
  const updatePage = async() => {
    const res = await fetch(`http://localhost:5000/api/books/updateProgress`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ book_Id: slug, username: user?.username, progress: Math.min(Number(inputPage), bookData?.book.pages || 1), isFinished: Number(inputPage) >= (bookData?.book.pages || 1)})
    });
        if (!res.ok) {
            console.error("Failed to save data");
            return;
        }
        refreshUser?.()

  };

  // Przechwycenie próby zmiany statusu i otwarcie okna modalnego
  const handleStatusChange = async(id: string) => {
     setConfirmStatus(id);
  };

  // Potwierdzenie zmiany statusu książki
  const confirmStatusChange = async() => {
    if (!confirmStatus) return;
    setStatus(confirmStatus);
    var progress = inputPage;
    if (confirmStatus === "read") {progress = bookData?.book.pages || 1; setCurrentPage(bookData?.book.pages || 1); setInputPage(bookData?.book.pages || 1); }
    else if (confirmStatus === "wishlist"){progress = 0;}
    setConfirmStatus(null);
      const res = await fetch(`http://localhost:5000/api/books/addToReadingStatus`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({username: user?.username, book_id: slug, status: confirmStatus, progress: progress})
    });
        if (!res.ok) {
            console.error("Failed to save data");
            return;
        }
        refreshUser?.()
  };

  const saveNote = async() => {
    if (!note.trim()) return;
    setSavedNotes(prev => [{ page: currentPage, text: note }, ...prev]);
    setNote("");
        const res = await fetch(`http://localhost:5000/api/books/createNote`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({readingStatus_Id: readingStatus?.id, note: note, page_Number: notePage })
    });
        if (!res.ok) {
            console.error("Failed to save data");
            return;
        }
        refreshUser?.()
  };

  return (
    <>
      <Navbar />
      <div className="inner-page">

        <div className="page-header" style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <img src={bookData?.book.cached_Image.url} alt={bookData?.book.title} className="rp-header-cover" />
            <div>
              <div className="page-eyebrow"><span className="eyebrow-line" />Reading panel<span className="eyebrow-line" /></div>
              <h1 className="page-title" style={{ fontSize: "clamp(28px, 3vw, 42px)", marginBottom: 4 }}>{bookData?.book.title}</h1>
              <p className="page-subtitle">{bookData?.contributions?.[0]?.author.name || "Unknown Author"} · {bookData?.book.pages} pages</p>
            </div>
          </div>
          <a href={`/books/${slug}`} className="bd-author-link" style={{ alignSelf: "flex-end" }}>← Return to book</a>
        </div>

        <div className="rp-layout">

          {/* ── LEFT COLUMN ── */}
          <div className="rp-left">

            {/* Progress card */}
            <div className="stats-card rp-card">
              <h3 className="stats-card-title">Reading progress</h3>

              <div className="rp-big-pct">{pct}<span>%</span></div>

              <div className="rp-progress-bar-big">
                <div className="rp-progress-fill-big" style={{ width: `${pct}%` }} />
              </div>

              <div className="rp-progress-meta">
                <span>pg. {currentPage}</span>
                <span>{pagesLeft} pg. left</span>
                <span>pg. {bookData?.book.pages || 1}</span>
              </div>

              {/* Page updater */}
              <div className="rp-page-updater">
                <span className="rp-page-label">I am on page:</span>
                <div className="rp-page-input-row">
                  <button className="rp-page-step" onClick={() => { const v = Math.max(0, currentPage-1); setCurrentPage(v); setInputPage(v); }}>−</button>
                  <input
                    type="number"
                    className="rp-page-input"
                    value={inputPage}
                    min={0} max={bookData?.book.pages || 0}
                    onChange={e => setInputPage(Number(e.target.value))}
                    onBlur={updatePage}
                    onKeyDown={e => e.key === "Enter" && updatePage()}
                  />
                  <button className="rp-page-step" onClick={() => { const v = Math.min(bookData?.book.pages || 1, currentPage+1); setCurrentPage(v); setInputPage(v); }}>+</button>
                  <button className="btn-gold" style={{ padding: "9px 18px", fontSize: 13 }} onClick={updatePage}>Save</button>
                </div>
              </div>
            </div>

            {/* Timer / Session card */}
            <div className="stats-card rp-card">
              <h3 className="stats-card-title">Reading session</h3>

              <div className="rp-timer-display">
                <span className={`rp-timer-digits ${timerActive ? "active" : ""}`}>
                  {pad(Math.floor(timerSeconds / 3600))}:{pad(Math.floor((timerSeconds % 3600) / 60))}:{pad(timerSeconds % 60)}
                </span>
                <div className="rp-timer-status">{timerActive ? "⏱ Session in progress…" : "Ready to start"}</div>
              </div>

          {/* Interfejs dynamiczny dostosowany do stanu stopera */}
          {!timerActive ? (
              (readingStatus?.progress || 0) < (bookData?.book.pages || 1) ? (
                <button className="btn-submit" style={{ maxWidth: 200 }} onClick={startSession}>
                  ▶ Start session
                </button>
              ) : (
                <div className="rp-finished-msg" style={{ color: "var(--gold)", fontWeight: "bold" }}>
                  🎉 You've finished this book!
                </div>
              )
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div className="field">
                  <label style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                    I have finished on page
                  </label>
                  <div className="input-wrap">
                    <input
                      type="number"
                      value={sessionEndPage}
                      min={sessionStartPage} 
                      max={bookData?.book.pages || 1}
                      onChange={e => setSessionEndPage(e.target.value)}
                      style={{ maxWidth: 120 }}
                    />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn-submit" style={{ maxWidth: 160 }} onClick={finishSession}>⏹ Finish session</button>
                  <button className="btn-outline" style={{ maxWidth: 120 }} onClick={() => { setTimerActive(false); setTimerSeconds(0); }}>Cancel</button>
                </div>
                <p className="settings-hint">Start: pg. {sessionStartPage}</p>
              </div>
            )}
            </div>

            {/* Status card */}
            <div className="stats-card rp-card">
              <h3 className="stats-card-title">Book status</h3>
              <div className="rp-status-list">
                {STATUSES.map(s => (
                  <button
                    key={s.id}
                    className={`rp-status-btn ${readingStatus?.status === s.id.toLowerCase() ? "active" : ""}`}
                    onClick={() => handleStatusChange(s.id)}
                  >
                    <span className="rp-status-icon">{s.icon}</span>
                    <span className="rp-status-label">{s.label}</span>
                    {readingStatus?.status === s.id.toLowerCase() && <span className="rp-status-tick">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="rp-right">

            {/* Stats mini */}
            <div className="rp-mini-stats">
              {[
                { val: `${readingStatus?.progress}`,    lbl: "Pages read" },
                { val: `${sessions.length}`,        lbl: "Sessions total"       },
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
                <h3 className="stats-card-title" style={{ marginBottom: 0 }}>Reading Log</h3>
                <button className="add-btn-sm" onClick={() => setShowLogForm(v => !v)}>
                  {showLogForm ? "Cancel" : "+ Add Entry"}
                </button>
              </div>

              {showLogForm && (
                <div className="rp-log-form">
                  <div className="rp-log-form-grid">
                    <div className="field">
                      <label>From page</label>
                      <div className="input-wrap"><input type="number" min="0" max={(readingStatus?.progress || 2) - 1} onChange={(e)=> setStartPage(parseInt(e.target.value))} defaultValue={readingStatus?.progress}  placeholder="e.g., 100" /></div>
                    </div>
                    <div className="field">
                      <label>To page</label>
                      <div className="input-wrap"><input type="number" min="1" max={readingStatus?.progress} onChange={(e)=> setFinishPage(parseInt(e.target.value))} placeholder="e.g., 150" /></div>
                    </div>
                    <div className="field">
                      <label>Time (min)</label>
                      <div className="input-wrap"><input type="number" min="1" onChange={(e)=> setLogTime(parseInt(e.target.value))} placeholder="e.g., 45" /></div>
                    </div>
                    <div className="field">
                      <label>Date</label>
                      <div className="input-wrap"><input type="date" max={new Date().toISOString().split("T")[0] } onChange={(e)=> setLogDate(e.target.value)} defaultValue={new Date().toISOString().split("T")[0]} /></div>
                    </div>
                  </div>
                  <button className="btn-submit" onClick={addSession} style={{ maxWidth: 160, marginTop: 8 }}>Save Entry</button>
                </div>
              )}

              <div className="rp-log-list">
                {sessions.map((entry, i) => (
                  <div className="rp-log-row" key={entry.id} style={{ animationDelay: `${i * 0.04}s` }}>
                    <div className="rp-log-dot" />
                    <div className="rp-log-info">
                      <div className="rp-log-pages">
                        page {entry.pages_Start} → {entry.pages_Finished}
                        <span className="rp-log-badge">+{entry.duration_Minutes} min</span>
                      </div>
                      <div className="rp-log-meta">{new Date(entry.created_At).toISOString().split("T")[0]} · {entry.duration_Minutes} min</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes card */}
            <div className="stats-card rp-card">
              <h3 className="stats-card-title">Notes for the book</h3>
              <div className="field">
                <label style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span>Note on page:</span>
                  <input
                    type="number"
                    value={notePage}
                    min={0}
                    max={bookData?.book.pages || 999}
                    onChange={e => {
                      if (parseInt(e.target.value) > (bookData?.book.pages || 1)){
                        setNotePage(bookData?.book.pages || 1);
                      }
                      else{
                        setNotePage(parseInt(e.target.value))
                      }}}
                    style={{
                      width: "70px",
                      padding: "2px 6px",
                      fontSize: "12px",
                      background: "var(--bg-input, #222)",
                      border: "1px solid var(--border-color, #444)",
                      borderRadius: "4px",
                      color: "var(--text-main, #fff)",
                      textAlign: "center"
                    }}
                  />
                </label>
                <textarea
                  className="contact-textarea"
                  placeholder="Thought, quote, reflection…"
                  value={note}
                  onChange={e => setNote(e.target.value)} 
                  rows={3}
                />
              </div>
              <button className="add-btn-sm" style={{ marginTop: 8 }} onClick={saveNote} disabled={!note.trim()}>
                + Save note
              </button>
              {notes.length > 0 && (
                <div className="rp-notes-list">
                  {notes.map((n, i) => (
                    <div className="rp-note-item" key={i}>
                      <span className="rp-note-page">pg. {n.page_Number}</span>
                      <p className="rp-note-text">{n.note}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Renderowanie warunkowe okna potwierdzenia chroniącego przed utratą danych */}
        {confirmStatus && (
          <div className="rp-modal-backdrop">
            <div className="rp-modal">
              <h3 className="rp-modal-title">
                {modalTitles[confirmStatus] || "Confirm Action"}
              </h3>
              <p className="rp-modal-body">
                {modalBodies[confirmStatus] || "Are you sure you want to perform this action?"}
              </p>
              <div className="rp-modal-actions">
                <button className="btn-gold" style={{ padding: "10px 24px" }} onClick={confirmStatusChange}>
                  {modalButtonTexts[confirmStatus] || "Confirm"}
                </button>
                <button className="btn-ghost" onClick={() => setConfirmStatus(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}