"use client";

import { useState } from "react";
import {Navbar} from "@/_components/Navbar";

/* ─── mock data (w prawdziwej apce: params.id → fetch) ─── */
const BOOK = {
  id: 3,
  title: "Dune",
  subtitle: "Kroniki Diuny, tom 1",
  author: "Frank Herbert",
  authorBio: "Frank Herbert (1920–1986) – amerykański pisarz science fiction, autor jednej z najbardziej wpływowych serii w historii gatunku. Przed karierą literacką pracował jako dziennikarz, fotograf i ekolog.",
  cover: "https://covers.openlibrary.org/b/id/8758191-L.jpg",
  rating: 4.8,
  ratingsCount: 12847,
  genre: "Sci-Fi",
  subgenres: ["Space Opera", "Polityka", "Ekologia", "Filozofia"],
  pages: 688,
  year: 1965,
  publisher: "Chilton Books",
  isbn: "978-0-441-17271-9",
  language: "Angielski (PL: Rebis)",
  description: `Dune to epicki romans science fiction rozgrywający się w odległej przyszłości w feudalnym międzygwiezdnym społeczeństwie, w którym szlacheckie domy kontrolują poszczególne planety.

Główny bohater, młody Paul Atryda, wraz z rodziną przenosi się na pustynną planetę Arrakis – jedyne miejsce we wszechświecie, gdzie wydobywana jest melanż, najcenniejsza substancja w galaktyce, umożliwiająca podróże kosmiczne i przedłużająca życie.

Herbert stworzył dzieło o niespotykanej głębi – politycznej, ekologicznej i duchowej. Dune to jednocześnie thriller polityczny, studium religii, opowieść o ekologii i historia dorastania. Zdobyło Nagrodę Hugo i Nebulę, stając się najlepiej sprzedającą się powieścią SF w historii.`,
  awards: ["Nagroda Hugo (1966)", "Nagroda Nebula (1965)"],
  series: { name: "Kroniki Diuny", position: 1, total: 6 },
  similarBooks: [
    { id: 5, title: "Fundacja",         author: "Isaac Asimov",    cover: "https://covers.openlibrary.org/b/id/8391619-L.jpg",  rating: 4.6 },
    { id: 7, title: "Project Hail Mary", author: "Andy Weir",       cover: "https://covers.openlibrary.org/b/id/10509244-L.jpg", rating: 4.8 },
    { id: 11, title: "Solaris",          author: "Stanisław Lem",   cover: "https://covers.openlibrary.org/b/id/8758191-L.jpg",  rating: 4.5 },
    { id: 4,  title: "1984",             author: "George Orwell",   cover: "https://covers.openlibrary.org/b/id/8575708-L.jpg",  rating: 4.7 },
  ],
};

const REVIEWS = [
  { id: 1, user: "Marta K.", avatar: "MK", rating: 5, date: "12 mar 2026", text: "Absolutnie przełomowa lektura. Herbert stworzył świat tak szczegółowy i przekonujący, że czytając miałam wrażenie, że czuję piasek Arrakis między palcami. Polityka, ekologia, religia — wszystko splecione w jedno arcydzieło.", likes: 34 },
  { id: 2, user: "Tomasz N.", avatar: "TN", rating: 5, date: "28 lut 2026", text: "Jedna z tych książek, które zmieniają sposób patrzenia na literaturę SF. Pierwsze 100 stron wymaga cierpliwości, ale potem nie można oderwać się od czytania.", likes: 21 },
  { id: 3, user: "Anna S.", avatar: "AS", rating: 4, date: "15 sty 2026", text: "Genialna, choć wymagająca. Słownik na końcu jest niezbędny. Warto jednak przez to przebrnąć — nagroda jest niesamowita.", likes: 18 },
];

const STATUSES = [
  { id: "reading",   icon: "📖", label: "Czytam teraz",       color: "var(--gold)"  },
  { id: "read",      icon: "✅", label: "Przeczytana",         color: "#52b788"      },
  { id: "wishlist",  icon: "🔖", label: "Chcę przeczytać",    color: "#4a90d9"      },
  { id: "abandoned", icon: "💤", label: "Porzucona",           color: "var(--text-muted)" },
];

function Stars({ n, size = 14 }: { n: number; size?: number }) {
  return (
    <span style={{ fontSize: size, letterSpacing: 1 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= Math.round(n) ? "var(--gold)" : "rgba(139,131,120,0.3)" }}>★</span>
      ))}
    </span>
  );
}

function RatingBar({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="rating-bar-row">
      <span className="rating-bar-label">{label}</span>
      <div className="rating-bar-track"><div className="rating-bar-fill" style={{ width: `${pct}%` }} /></div>
      <span className="rating-bar-pct">{pct}%</span>
    </div>
  );
}

export default function BookDetailPage() {
  const [status, setStatus]         = useState<string | null>("reading");
  const [progress, setProgress]     = useState(268);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [activeTab, setActiveTab]   = useState("opis");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [liked, setLiked]           = useState<number[]>([]);

  const progressPct = Math.round((progress / BOOK.pages) * 100);

  const handleStatus = (id: string) => {
    if (status === id) { setStatus(null); return; }
    setStatus(id);
    if (id === "read") setProgress(BOOK.pages);
  };

  return (
    <>
      <Navbar />
      <div className="inner-page">

        {/* ── HERO ── */}
        <div className="book-detail-hero">
          <div className="bdh-bg" />

          {/* Cover */}
          <div className="bdh-cover-wrap">
            <img src={BOOK.cover} alt={BOOK.title} className="bdh-cover" />
            <div className="bdh-cover-shadow" />
          </div>

          {/* Meta */}
          <div className="bdh-meta">
            <div className="bdh-series">
              {BOOK.series.name} · Część {BOOK.series.position} z {BOOK.series.total}
            </div>
            <h1 className="bdh-title">{BOOK.title}</h1>
            {BOOK.subtitle && <p className="bdh-subtitle">{BOOK.subtitle}</p>}
            <a href="#" className="bdh-author">{BOOK.author}</a>

            <div className="bdh-rating-row">
              <Stars n={BOOK.rating} size={18} />
              <span className="bdh-rating-val">{BOOK.rating}</span>
              <span className="bdh-ratings-count">{BOOK.ratingsCount.toLocaleString("pl")} ocen</span>
            </div>

            <div className="bdh-tags">
              <span className="bdh-genre">{BOOK.genre}</span>
              {BOOK.subgenres.map(s => <span key={s} className="bdh-subgenre">{s}</span>)}
            </div>

            <div className="bdh-details-row">
              <span>📄 {BOOK.pages} stron</span>
              <span>📅 {BOOK.year}</span>
              <span>🌐 {BOOK.language}</span>
            </div>

            {BOOK.awards.length > 0 && (
              <div className="bdh-awards">
                {BOOK.awards.map(a => <span key={a} className="bdh-award">🏆 {a}</span>)}
              </div>
            )}

            {/* ── STATUS BUTTONS ── */}
            <div className="bdh-status-group">
              {STATUSES.map(s => (
                <button
                  key={s.id}
                  className={`bdh-status-btn ${status === s.id ? "active" : ""}`}
                  style={status === s.id ? { borderColor: s.color, color: s.color, background: `${s.color}18` } : {}}
                  onClick={() => handleStatus(s.id)}
                >
                  <span>{s.icon}</span>
                  <span>{s.label}</span>
                  {status === s.id && <span className="bdh-status-check">✓</span>}
                </button>
              ))}
            </div>

            {/* ── PROGRESS (only when reading) ── */}
            {status === "reading" && (
              <div className="bdh-progress-box">
                <div className="bdh-progress-header">
                  <span className="bdh-progress-label">Twój postęp</span>
                  <a href="/czytanie/3" className="bdh-reading-link">Otwórz panel czytania →</a>
                </div>
                <div className="bdh-progress-bar-wrap">
                  <div className="bdh-progress-bar">
                    <div className="bdh-progress-fill" style={{ width: `${progressPct}%` }} />
                  </div>
                  <span className="bdh-progress-pct">{progressPct}%</span>
                </div>
                <div className="bdh-progress-pages">
                  <span>str. {progress} / {BOOK.pages}</span>
                  <div className="bdh-page-input-wrap">
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Aktualna strona:</span>
                    <input
                      type="number"
                      className="bdh-page-input"
                      value={progress}
                      min={0} max={BOOK.pages}
                      onChange={e => setProgress(Math.min(BOOK.pages, Math.max(0, +e.target.value)))}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="profile-tabs" style={{ marginBottom: 32, marginTop: 8 }}>
          {["opis", "recenzje", "szczegóły", "seria"].map(t => (
            <button
              key={t}
              className={`profile-tab ${activeTab === t ? "active" : ""}`}
              onClick={() => setActiveTab(t)}
              style={{ textTransform: "capitalize" }}
            >
              {t === "opis" ? "Opis" : t === "recenzje" ? `Recenzje (${REVIEWS.length})` : t === "szczegóły" ? "Szczegóły" : "Seria"}
            </button>
          ))}
        </div>

        <div className="book-detail-body">

          {/* ── OPIS ── */}
          {activeTab === "opis" && (
            <div className="book-detail-main">
              <div className="bd-description">
                {BOOK.description.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}
              </div>

              {/* Author box */}
              <div className="bd-author-box">
                <div className="bd-author-avatar">{BOOK.author.split(" ").map(w => w[0]).join("").slice(0, 2)}</div>
                <div>
                  <div className="bd-author-name">{BOOK.author}</div>
                  <p className="bd-author-bio">{BOOK.authorBio}</p>
                  <a href="#" className="bd-author-link">Wszystkie książki autora →</a>
                </div>
              </div>
            </div>
          )}

          {/* ── RECENZJE ── */}
          {activeTab === "recenzje" && (
            <div className="book-detail-main">

              {/* Rating summary */}
              <div className="bd-rating-summary">
                <div className="bd-rating-big">
                  <span className="bd-rating-number">{BOOK.rating}</span>
                  <Stars n={BOOK.rating} size={22} />
                  <span className="bd-rating-count">{BOOK.ratingsCount.toLocaleString("pl")} ocen</span>
                </div>
                <div className="bd-rating-bars">
                  <RatingBar label="5★" pct={72} />
                  <RatingBar label="4★" pct={18} />
                  <RatingBar label="3★" pct={7}  />
                  <RatingBar label="2★" pct={2}  />
                  <RatingBar label="1★" pct={1}  />
                </div>
              </div>

              {/* User's own rating */}
              <div className="bd-your-rating">
                <span className="bd-your-rating-label">Twoja ocena</span>
                <div className="bd-star-picker">
                  {[1,2,3,4,5].map(i => (
                    <button
                      key={i}
                      className="bd-star-btn"
                      style={{ color: i <= (hoverRating || userRating) ? "var(--gold)" : "rgba(139,131,120,0.3)" }}
                      onMouseEnter={() => setHoverRating(i)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setUserRating(i)}
                    >★</button>
                  ))}
                </div>
                {userRating > 0 && (
                  <span className="bd-your-rating-val">
                    {["", "Słaba", "Przeciętna", "Dobra", "Bardzo dobra", "Świetna"][userRating]}
                  </span>
                )}
              </div>

              {/* Write review */}
              <button
                className="add-btn-sm"
                style={{ marginBottom: 24 }}
                onClick={() => setShowReviewForm(v => !v)}
              >
                {showReviewForm ? "Anuluj" : "✏️ Napisz recenzję"}
              </button>

              {showReviewForm && (
                <div className="bd-review-form">
                  <textarea
                    className="contact-textarea"
                    placeholder="Podziel się swoją opinią o tej książce…"
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    rows={5}
                  />
                  <button
                    className="btn-submit"
                    style={{ maxWidth: 180, marginTop: 10 }}
                    disabled={!reviewText || userRating === 0}
                    onClick={() => { setShowReviewForm(false); setReviewText(""); }}
                  >
                    Opublikuj
                  </button>
                  {userRating === 0 && <p className="settings-hint" style={{ marginTop: 6 }}>Najpierw oceń książkę gwiazdkami powyżej.</p>}
                </div>
              )}

              {/* Reviews list */}
              <div className="bd-reviews-list">
                {REVIEWS.map(r => (
                  <div className="bd-review-card" key={r.id}>
                    <div className="bd-review-header">
                      <div className="bd-review-avatar">{r.avatar}</div>
                      <div>
                        <div className="bd-review-user">{r.user}</div>
                        <div className="bd-review-meta">
                          <Stars n={r.rating} size={12} />
                          <span className="bd-review-date">{r.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="bd-review-text">{r.text}</p>
                    <button
                      className="bd-review-like"
                      onClick={() => setLiked(p => p.includes(r.id) ? p.filter(x => x !== r.id) : [...p, r.id])}
                      style={{ color: liked.includes(r.id) ? "var(--gold)" : "var(--text-muted)" }}
                    >
                      👍 {r.likes + (liked.includes(r.id) ? 1 : 0)} Pomocne
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SZCZEGÓŁY ── */}
          {activeTab === "szczegóły" && (
            <div className="book-detail-main">
              <div className="bd-details-table">
                {[
                  { label: "Tytuł oryginalny", val: "Dune" },
                  { label: "Autor",            val: BOOK.author },
                  { label: "Wydawnictwo",      val: BOOK.publisher },
                  { label: "Rok wydania",      val: String(BOOK.year) },
                  { label: "Liczba stron",     val: `${BOOK.pages} str.` },
                  { label: "ISBN",             val: BOOK.isbn },
                  { label: "Język",            val: BOOK.language },
                  { label: "Gatunek",          val: BOOK.genre },
                  { label: "Podgatunki",       val: BOOK.subgenres.join(", ") },
                  { label: "Nagrody",          val: BOOK.awards.join("; ") },
                ].map(r => (
                  <div className="bd-details-row" key={r.label}>
                    <span className="bd-details-label">{r.label}</span>
                    <span className="bd-details-val">{r.val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SERIA ── */}
          {activeTab === "seria" && (
            <div className="book-detail-main">
              <div className="bd-series-header">
                <h3 className="bd-series-name">{BOOK.series.name}</h3>
                <span className="bd-series-count">{BOOK.series.total} tomów</span>
              </div>
              <div className="bd-series-list">
                {["Diuna", "Mesjasz Diuny", "Dzieci Diuny", "Bóg Cesarz Diuny", "Heretycy Diuny", "Kapitularz Diuny"].map((title, i) => (
                  <div className={`bd-series-item ${i === 0 ? "current" : ""}`} key={title}>
                    <div className="bd-series-num">{i + 1}</div>
                    <div className="bd-series-info">
                      <div className="bd-series-title">{title}</div>
                      <div className="bd-series-status">
                        {i === 0 ? <span style={{ color: "var(--gold)", fontSize: 12 }}>📖 Czytasz</span>
                          : i < 0 ? <span style={{ color: "#52b788", fontSize: 12 }}>✓ Przeczytana</span>
                          : <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Nie przeczytana</span>}
                      </div>
                    </div>
                    {i !== 0 && (
                      <button className="add-btn-sm" style={{ flexShrink: 0 }}>+ Dodaj</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SIDEBAR: Podobne książki ── */}
          <aside className="book-detail-aside">
            <h3 className="bd-aside-title">Podobne książki</h3>
            <div className="bd-similar-list">
              {BOOK.similarBooks.map(b => (
                <a href={`/ksiazki/${b.id}`} className="bd-similar-item" key={b.id}>
                  <img src={b.cover} alt={b.title} className="bd-similar-cover" />
                  <div className="bd-similar-info">
                    <div className="bd-similar-title">{b.title}</div>
                    <div className="bd-similar-author">{b.author}</div>
                    <Stars n={b.rating} size={11} />
                  </div>
                </a>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}