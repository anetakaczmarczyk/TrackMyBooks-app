"use client";

import { use, useEffect, useRef, useState } from "react";
import { Navbar } from "@/_components/Navbar";
import { BookByIdResponse, GenreTag } from "@/_components/bookInterface";
import { useAuth } from "@/_context/AuthContext";
import Link from "next/dist/client/link";
import { Review } from "@/_components/Review";
import { useRouter } from "next/navigation";

const STATUSES = [
  { id: "reading",   icon: "📖", label: "Reading",   color: "var(--gold)"       },
  { id: "read",      icon: "✅", label: "Read",       color: "#52b788"           },
  { id: "wishlist",  icon: "🔖", label: "Wishlist",   color: "#4a90d9"           },
  { id: "abandoned", icon: "💤", label: "Abandoned",  color: "var(--text-muted)" },
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

export default function BookDetail({ bookbyId, reviews }: { bookbyId: BookByIdResponse; reviews: Review[] | [] }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // ── Status ──
  const [savedStatus, setSavedStatus]     = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const hasStatusChange = pendingStatus !== savedStatus;


  // ── Reviews ──
  const [progress, setProgress]       = useState(0);
  const [userRating, setUserRating]   = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText]   = useState("");
  const [activeTab, setActiveTab]     = useState("opis");

  const reviewsRating = reviews?.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "N/A";

  const userReview = reviews?.find(r => r.username === user?.username);

  useEffect(() => {
    if (user && !authLoading) {
      const fetchStatus = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/books/readingStatus/${bookbyId.book.default_Physical_Edition_Id}?username=${user.username}`);
          if (response.ok) {
            const data = await response.json();
            setPendingStatus(data[0]?.status || null);
            setSavedStatus(data[0]?.status || null);
            setProgress(data[0]?.progress);
          }
        } catch (error) {
          console.error("Error fetching reading status:", error);
        }
      };
      fetchStatus();
    }
  }, [user, authLoading, bookbyId.book.default_Physical_Edition_Id]);

  useEffect(() => {
    if (userReview) {
      setUserRating(userReview.rating);
      setReviewText(userReview.review_Text);
    }
  }, [userReview]);

  const progressPct = bookbyId ? Math.round((progress / bookbyId.book.pages) * 100) : 0;


  // ── Handlers statusu ──
  const handleStatusClick = (id: string) => {
    setPendingStatus(prev => prev === id ? null : id);
  };

  const saveStatus = async () => {
    setIsSavingStatus(true);
    let progress = 0;
    if (pendingStatus === "read") progress = bookbyId.book.pages;
    try {
      await fetch("http://localhost:5000/api/books/addToReadingStatus", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book_Id: bookbyId.book.default_Physical_Edition_Id,
          username: user?.username,
          status: pendingStatus || "",
          progress
        }),
      });
      setSavedStatus(pendingStatus);
      if (pendingStatus === "read") setProgress(bookbyId.book.pages);
    } catch (e) {
      console.error("Error saving status:", e);
    } finally {
      setIsSavingStatus(false);
    }
  };

  // ── Reviews ──
  const addReview = async () => {
    if (!user) return;
    try {
      const response = await fetch("http://localhost:5000/api/reviews/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book_Id: bookbyId.book.default_Physical_Edition_Id,
          username: user.username,
          rating: userRating,
          review_Text: reviewText,
        }),
      });
      if (response.ok) router.refresh();
    } catch (e) {
      console.error("Error adding review:", e);
    }
  };

  const updateReview = async () => {
    if (!user || !userReview) return;
    try {
      const response = await fetch(`http://localhost:5000/api/reviews/update/${userReview.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: userRating, review_Text: reviewText }),
      });
      if (response.ok) router.refresh();
    } catch (e) {
      console.error("Error updating review:", e);
    }
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
            <div className="bdh-series">{bookbyId.book.book_Series[0]?.series.name}</div>
            <h1 className="bdh-title">{bookbyId.book.title}</h1>
            {bookbyId.book.description && <p className="bdh-subtitle">{bookbyId.book.description}</p>}
            <a href="#" className="bdh-author">{bookbyId.contributions?.[0]?.author.name || "Unknown Author"}</a>

            <div className="bdh-rating-row">
              <span className="bdh-ratings-count">Hardcover rating:</span>
              <Stars n={bookbyId.book.rating} size={18} />
              <span className="bdh-rating-val">{bookbyId.book.rating.toFixed(2)}</span>
              <span className="bdh-ratings-count">{bookbyId.book.ratings_Count.toLocaleString("pl")} ratings</span>
            </div>

            <div className="bdh-rating-row">
              <span className="bdh-ratings-count">TrackMyBooks rating:</span>
              <Stars n={parseFloat(reviewsRating)} size={18} />
              <span className="bdh-rating-val">{reviewsRating}</span>
              <span className="bdh-ratings-count">{reviews.length} ratings</span>
            </div>

            <div className="bdh-tags">
              <span className="bdh-genre">{bookbyId.book.cached_Tags.Genre?.[0]?.tag || "N/A"}</span>
              {bookbyId.book.cached_Tags.Genre?.slice(1).map((g: GenreTag) => (
                <span key={g.tag} className="bdh-subgenre">{g.tag}</span>
              ))}
            </div>

            <div className="bdh-details-row">
              <span>📄 {bookbyId.book.pages} pages</span>
              <span>📅 {bookbyId.book.release_Date}</span>
              <span>🌐 {bookbyId.language?.language}</span>
            </div>

            {user && (
              <>
                {/* ── Statuses ── */}
                <div className="bdh-status-group">
                  {STATUSES.map(s => (
                    <button
                      key={s.id}
                      className={`bdh-status-btn ${pendingStatus === s.id ? "active" : ""}`}
                      style={pendingStatus === s.id
                        ? { borderColor: s.color, color: s.color, background: `${s.color}18` }
                        : {}}
                      onClick={() => handleStatusClick(s.id)}
                    >
                      <span>{s.icon}</span>
                      <span>{s.label}</span>
                      {pendingStatus === s.id && <span className="bdh-status-check">✓</span>}
                    </button>
                  ))}
                </div>

                {hasStatusChange && (
                  <div className="bdh-save-row">
                    <button
                      className="bdh-save-btn"
                      onClick={saveStatus}
                      disabled={isSavingStatus}
                    >
                      {isSavingStatus ? "Saving…" : "Save"}
                    </button>
                    <button
                      className="bdh-cancel-btn"
                      onClick={() =>{ setPendingStatus(savedStatus)}}
                    >
                      Cancel
                    </button>
                  </div>
                )}
                
                {savedStatus === "reading" && (
                  <a href="/czytanie/3" className="bdh-reading-link">Open Reading Panel →</a>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="profile-tabs" style={{ marginBottom: 32, marginTop: 8 }}>
          {tabs.map(t => (
            <button
              key={t}
              className={`profile-tab ${activeTab === t ? "active" : ""}`}
              onClick={() => setActiveTab(t)}
              style={{ textTransform: "capitalize" }}
            >
              {t === "opis" ? "Description"
                : t === "recenzje" ? `Reviews (${reviews?.length || 0})`
                : t === "szczegóły" ? "Details"
                : "Series"}
            </button>
          ))}
        </div>

        <div className="book-detail-body">

          {/* ── Description ── */}
          {activeTab === "opis" && (
            <div className="book-detail-main">
              <div className="bd-description">
                {bookbyId.book.description?.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}
              </div>
              <div className="bd-author-box">
                <div className="bd-author-avatar">
                  {bookbyId.contributions?.[0]?.author?.name.split(" ").map(n => n[0]).join("") || "U"}
                </div>
                <div>
                  <div className="bd-author-name">{bookbyId.contributions?.[0]?.author?.name || "Unknown author"}</div>
                  <p className="bd-author-bio">{bookbyId.contributions?.[0]?.author?.bio}</p>
                  <a href="#" className="bd-author-link">Show all books →</a>
                </div>
              </div>
            </div>
          )}

          {/* ── Reviews ── */}
          {activeTab === "recenzje" && (
            <div className="book-detail-main">
              <div className="bd-rating-summary">
                <div className="bd-rating-big">
                  <span className="bd-rating-number">{reviewsRating}</span>
                  <Stars n={parseFloat(reviewsRating)} size={22} />
                  <span className="bd-rating-count">{reviews?.length || 0} ratings</span>
                </div>
                <div className="bd-rating-bars">
                  {[5,4,3,2,1].map(star => (
                    <RatingBar
                      key={star}
                      label={`${star}★`}
                      pct={reviews?.length > 0
                        ? +((reviews.filter(r => r.rating === star).length / reviews.length) * 100).toFixed(2)
                        : 0}
                    />
                  ))}
                </div>
              </div>

              {user ? (
                <>
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
                        {["","Bad","Average","Good","Great","Excellent"][userRating]}
                      </span>
                    )}
                  </div>

                  {userRating > 0 && (
                    <div className="bd-review-form">
                      <textarea
                        className="contact-textarea"
                        placeholder="Share your opinion about this book…"
                        value={reviewText}
                        onChange={e => setReviewText(e.target.value)}
                        rows={5}
                      />
                      {userReview ? (
                        <button
                          className="btn-submit"
                          style={{ maxWidth: 180, marginTop: 10 }}
                          disabled={userRating === 0}
                          onClick={updateReview}
                        >
                          Update Review
                        </button>
                      ) : (
                        <button
                          className="btn-submit"
                          style={{ maxWidth: 180, marginTop: 10 }}
                          disabled={userRating === 0}
                          onClick={addReview}
                        >
                          Publish Review
                        </button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="bdh-ratings-count" style={{ marginBottom: 24 }}>
                  <p>Please <Link href="#" style={{ color: "var(--gold)" }}>log in</Link> to write a review.</p>
                </div>
              )}

              <div className="bd-reviews-list">
                {reviews?.map(r => (
                  <div className="bd-review-card" key={r.id}>
                    <div className="bd-review-header">
                      <div className="bd-review-avatar">{r.username.charAt(0).toUpperCase()}</div>
                      <div>
                        <div className="bd-review-user">{r.username}</div>
                        <div className="bd-review-meta">
                          <Stars n={r.rating} size={12} />
                          <span className="bd-review-date">{new Date(r.timestamp).toLocaleDateString("pl-PL")}</span>
                        </div>
                      </div>
                    </div>
                    <p className="bd-review-text">{r.review_Text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Details ── */}
          {activeTab === "szczegóły" && (
            <div className="book-detail-main">
              <div className="bd-details-table">
                {[
                  { label: "Title",               val: bookbyId.book.title || "N/A" },
                  { label: "Author",              val: bookbyId.contributions?.[0]?.author?.name || "N/A" },
                  { label: "Publisher",           val: bookbyId.publisher?.name || "N/A" },
                  { label: "Publication Year",    val: String(bookbyId.book.release_Date) },
                  { label: "Number of Pages",     val: `${bookbyId.book.pages} pages` },
                  { label: "ISBN",                val: bookbyId.isbn_10 },
                  { label: "Language",            val: bookbyId.language?.language || "N/A" },
                  { label: "Genre",               val: bookbyId.book.cached_Tags.Genre?.map((g: GenreTag) => g.tag).join(", ") || "N/A" },
                ].map(r => (
                  <div className="bd-details-row" key={r.label}>
                    <span className="bd-details-label">{r.label}</span>
                    <span className="bd-details-val">{r.val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Series ── */}
          {activeTab === "seria" && (
            <div className="book-detail-main">
              <div className="bd-series-header">
                <h3 className="bd-series-name">{bookbyId.book.book_Series[0]?.series.name}</h3>
                <span className="bd-series-count">{bookbyId.book.book_Series[0]?.series.books_Count} volumes</span>
              </div>
              <div className="bd-series-list">
                {bookbyId.book.book_Series[0]?.series?.book_Series.map((seriesBook, i) => (
                  <div
                    className={`bd-series-item ${seriesBook.book.title === bookbyId.book.title ? "current" : ""}`}
                    key={seriesBook.book.title}
                  >
                    <div className="bd-series-num">{i + 1}</div>
                    <div className="bd-series-info">
                      <div className="bd-series-title">{seriesBook.book.title}</div>
                    </div>
                    {seriesBook.book.title !== bookbyId.book.title && (
                      <button
                        className="add-btn-sm"
                        onClick={() => router.push(`/books/${seriesBook.book.default_Physical_Edition_Id}`)}
                        style={{ flexShrink: 0 }}
                      >
                        Details
                      </button>
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