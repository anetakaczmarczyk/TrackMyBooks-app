"use client";

import { useState } from "react";
import {Navbar} from "@/_components/Navbar";
import { BookByIdResponse, Book, GenreTag } from "@/_components/bookInterface";


const REVIEWS = [
  { id: 1, user: "Marta K.", avatar: "MK", rating: 5, date: "12 mar 2026", text: "Absolutnie przełomowa lektura. Herbert stworzył świat tak szczegółowy i przekonujący, że czytając miałam wrażenie, że czuję piasek Arrakis między palcami. Polityka, ekologia, religia — wszystko splecione w jedno arcydzieło.", likes: 34 },
  { id: 2, user: "Tomasz N.", avatar: "TN", rating: 5, date: "28 lut 2026", text: "Jedna z tych książek, które zmieniają sposób patrzenia na literaturę SF. Pierwsze 100 stron wymaga cierpliwości, ale potem nie można oderwać się od czytania.", likes: 21 },
  { id: 3, user: "Anna S.", avatar: "AS", rating: 4, date: "15 sty 2026", text: "Genialna, choć wymagająca. Słownik na końcu jest niezbędny. Warto jednak przez to przebrnąć — nagroda jest niesamowita.", likes: 18 },
];

const STATUSES = [
  { id: "reading",   icon: "📖", label: "Reading",       color: "var(--gold)"  },
  { id: "read",      icon: "✅", label: "Read",         color: "#52b788"      },
  { id: "wishlist",  icon: "🔖", label: "Wishlist",    color: "#4a90d9"      },
  { id: "abandoned", icon: "💤", label: "Abandoned",           color: "var(--text-muted)" },
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

export default function BookDetail({bookbyId}: { bookbyId: BookByIdResponse }) {
  const [status, setStatus]         = useState<string | null>("reading");
  const [progress, setProgress]     = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [activeTab, setActiveTab]   = useState("opis");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [liked, setLiked]           = useState<number[]>([]);

  const progressPct = bookbyId ? Math.round((progress / bookbyId.book.pages) * 100) : 0;
  if (progressPct > bookbyId.book.pages) setProgress(bookbyId.book.pages);

  const handleStatus = (id: string) => {
    if (status === id) { setStatus(null); return; }
    setStatus(id);
    if (id === "read") setProgress(bookbyId.book.pages);
  };
  let tabs = ["opis", "recenzje", "szczegóły"];
  if (bookbyId.book.book_Series.length > 0) tabs.push("seria");

  return (
    <>
      <Navbar />
      <div className="inner-page">

        <div className="book-detail-hero">
          <div className="bdh-bg" />

          <div className="bdh-cover-wrap">
            <img src={bookbyId.book.cached_Image.url} alt={bookbyId.book.title} className="bdh-cover" />
            <div className="bdh-cover-shadow" />
          </div>

          <div className="bdh-meta">
            <div className="bdh-series">
              {bookbyId.book.book_Series[0]?.series.name}
            </div>
            <h1 className="bdh-title">{bookbyId.book.title}</h1>
            {bookbyId.book.description && <p className="bdh-subtitle">{bookbyId.book.description}</p>}
            <a href="#" className="bdh-author">{bookbyId.contributions?.[0]?.author.name || "Unknown Author"}</a>

            <div className="bdh-rating-row">
              <span className="bdh-ratings-count">Hardcover rating:</span>
              <Stars n={bookbyId.book.rating} size={18} />
              <span className="bdh-rating-val">{bookbyId.book.rating.toFixed(2)}</span>
              <span className="bdh-ratings-count">{bookbyId.book.ratings_Count.toLocaleString("pl")} ratings</span>
            </div>

            <div className="bdh-tags">
              <span className="bdh-genre">{bookbyId.book.cached_Tags.Genre?.[0]?.tag || "brak danych"}</span>
              {bookbyId.book.cached_Tags.Genre?.slice(1).map((g: GenreTag) => <span key={g.tag} className="bdh-subgenre">{g.tag}</span>)}
            </div>

            <div className="bdh-details-row">
              <span>📄 {bookbyId.book.pages} pages</span>
              <span>📅 {bookbyId.book.release_Date}</span>
              <span>🌐 {bookbyId.language?.language}</span>
            </div>
            


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

            {status === "reading" && (
              <div className="bdh-progress-box">
                <div className="bdh-progress-header">
                  <span className="bdh-progress-label">Your Progress</span>
                  <a href="/czytanie/3" className="bdh-reading-link">Open Reading Panel →</a>
                </div>
                <div className="bdh-progress-bar-wrap">
                  <div className="bdh-progress-bar">
                    <div className="bdh-progress-fill" style={{ width: `${progressPct}%` }} />
                  </div>
                  <span className="bdh-progress-pct">{progressPct}%</span>
                </div>
                <div className="bdh-progress-pages">
                  <span>str. {progress} / {bookbyId.book.pages}</span>
                  <div className="bdh-page-input-wrap">
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Current Page:</span>
                    <input
                      type="number"
                      className="bdh-page-input"
                      value={progress}
                      min={0} max={bookbyId.book.pages}
                      onChange={e => setProgress(Math.min(bookbyId.book.pages, Math.max(0, +e.target.value)))}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="profile-tabs" style={{ marginBottom: 32, marginTop: 8 }}>
          {tabs.map(t => (
            <button
              key={t}
              className={`profile-tab ${activeTab === t ? "active" : ""}`}
              onClick={() => setActiveTab(t)}
              style={{ textTransform: "capitalize" }}
            >
              {t === "opis" ? "Description" : t === "recenzje" ? `Reviews (${REVIEWS.length})` : t === "szczegóły" ? "Details" :  "Series"}
            </button>
          ))}
        </div>

        <div className="book-detail-body">

          {activeTab === "opis" && (
            <div className="book-detail-main">
              <div className="bd-description">
                {bookbyId.book.description?.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}
              </div>

              <div className="bd-author-box">
                <div className="bd-author-avatar"></div>
                <div>
                  <div className="bd-author-name">{bookbyId.contributions?.[0]?.author?.name || "Unknown author"}</div>
                  <p className="bd-author-bio">{bookbyId.contributions?.[0]?.author?.bio}</p>
                  <a href="#" className="bd-author-link">Show all books →</a>
                </div>
              </div>
            </div>
          )}

          {/* ── RECENZJE ──                 demo, from database*/} 
          {activeTab === "recenzje" && (
            <div className="book-detail-main">

              {/* Rating summary */}
              <div className="bd-rating-summary">
                <div className="bd-rating-big">
                  <span className="bd-rating-number">{bookbyId.book.rating.toFixed(2)}</span>
                  <Stars n={bookbyId.book.rating} size={22} />
                  <span className="bd-rating-count">{bookbyId.book.ratings_Count.toLocaleString("pl")} ocen</span>
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
                <span className="bd-your-rating-label">Your Rating</span>
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
                    {["", "Bad", "Average", "Good", "Great", "Excellent"][userRating]}
                  </span>
                )}
              </div>

              {/* Write review */}
              <button
                className="add-btn-sm"
                style={{ marginBottom: 24 }}
                onClick={() => setShowReviewForm(v => !v)}
              >
                {showReviewForm ? "Cancel" : "✏️ Write a review"}
              </button>

              {showReviewForm && (
                <div className="bd-review-form">
                  <textarea
                    className="contact-textarea"
                    placeholder="Share your opinion about this book…"
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
                    Publish Review
                  </button>
                  {userRating === 0 && <p className="settings-hint" style={{ marginTop: 6 }}>At first, rate the book above.</p>}
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
                      👍 {r.likes + (liked.includes(r.id) ? 1 : 0)} Helpful
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "szczegóły" && (
            <div className="book-detail-main">
              <div className="bd-details-table">
                {[
                  { label: "Title", val: bookbyId.book.title || "brak danych" },
                  { label: "Author",            val: bookbyId.contributions?.[0]?.author?.name || "brak danych" },
                  { label: "Publisher",      val: bookbyId.publisher?.name || "brak danych" },
                  { label: "Publication Year",      val: String(bookbyId.book.release_Date) },
                  { label: "Number of Pages",     val: `${bookbyId.book.pages} pages` },
                  { label: "ISBN",             val: bookbyId.isbn_10 },
                  { label: "Language",            val: bookbyId.language?.language || "brak danych" },
                  { label: "Genre",          val: bookbyId.book.cached_Tags.Genre?.map((g: GenreTag) => g.tag).join(", ") || "brak danych" },
                ].map(r => (
                  <div className="bd-details-row" key={r.label}>
                    <span className="bd-details-label">{r.label}</span>
                    <span className="bd-details-val">{r.val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "seria" && (
            <div className="book-detail-main">
              <div className="bd-series-header">
                <h3 className="bd-series-name">{bookbyId.book.book_Series[0]?.series.name}</h3>
                <span className="bd-series-count">{bookbyId.book.book_Series[0]?.series.books_Count} volumes</span>
              </div>
              <div className="bd-series-list">
                {bookbyId.book.book_Series[0]?.series?.book_Series.map((seriesBook, i) => (
                  <div className={`bd-series-item ${i === 0 ? "current" : ""}`} key={seriesBook.book.title}>
                    <div className="bd-series-num">{i + 1}</div>
                    <div className="bd-series-info">
                      <div className="bd-series-title">{seriesBook.book.title}</div>
                      <div className="bd-series-status">
                        {i === 0 ? <span style={{ color: "var(--gold)", fontSize: 12 }}>📖 Reading</span>
                          : i < 0 ? <span style={{ color: "#52b788", fontSize: 12 }}>✓ Read</span>
                          : <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Not Read</span>}
                      </div>
                    </div>
                    {i !== 0 && (
                      <button className="add-btn-sm" style={{ flexShrink: 0 }}>+ Add</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}