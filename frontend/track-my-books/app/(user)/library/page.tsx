"use client";

import { useEffect, useState } from "react";
import {Navbar} from "@/_components/Navbar";
import { Footer } from "@/_components/Footer";
import { useAuth } from "@/_context/AuthContext";
import { useRouter } from "next/navigation";
import { LibraryItem } from "@/_components/LibraryItem";

const STATUSES = ["reading", "read", "wishlist", "abandoned"];


const STATUS_ICONS: Record<string, string> = {
  "reading":       "📖",
  "read":        "✅",
  "wishlist":    "🔖",
  "abandoned":          "💤",
};

function Stars({ rating }: { rating?: number }) {
  if (!rating) return null;
  return (
    <div className="lib-stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= rating ? "var(--gold)" : "rgba(139,131,120,0.3)" }}>★</span>
      ))}
    </div>
  );
}

export default function LibraryPage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();

  const [loadingData, setLoadingData] = useState(false);

  const [status, setStatus] = useState(STATUSES[0]);
  const [books, setBooks] = useState<LibraryItem[]>([]);
  const totalBooks = books.length;
  const readBooks  = books.filter(b => b.status === "read").length;

  useEffect(() => {
    if (!authLoading && !user) router.push("/");
  }, [user, authLoading, router]);

    useEffect(() => {
    if (!user) return;
    const fetchLibrary = async () => {
      setLoadingData(true);
      try {
        const response = await fetch(`http://localhost:5000/api/books/getUserReadingStatuses/${user.username}`);
        const data = await response.json();
        setBooks(data);

      } finally {
        setLoadingData(false);
      }
    };
    fetchLibrary();
  }, [user]);


  if (authLoading || !user || loadingData) {
    return (
      <><Navbar />
        <div className="inner-page books-loading">
          <div className="books-loading-spinner" />
          <p>Loading…</p>
        </div>
      </>
    );
  }


  return (
    <>
      <Navbar />

      <div className="inner-page">
        <div className="page-header">
          <div>
            <div className="page-eyebrow">
              <span className="eyebrow-line" />My library, my rules
              <span className="eyebrow-line" />
            </div>
            <h1 className="page-title">My Library</h1>
            <p className="page-subtitle">{totalBooks} books · {readBooks} read</p>
          </div>
        </div>

        {/* Status tabs */}
        <div className="lib-tabs">
          {STATUSES.map(s => (
            <button
              key={s}
              className={`lib-tab ${status === s ? "active" : ""}`}
              onClick={() => setStatus(s)}
            >
              {STATUS_ICONS[s]} {s.charAt(0).toUpperCase() + s.slice(1)}
              <span className="lib-tab-count">{books.filter(b => b.status === s).length}</span>
            </button>
          ))}
        </div>

        <div className="lib-grid">
          {books
          .filter(b => b.status === status)
          .map((status, index) => (
            <div className="lib-card" key={`${status.book.book.default_Physical_Edition_Id}-${index}`}>
              <div className="lib-cover-wrap">
                <img src={status.book.book.cached_Image?.url} alt={status.book.book.title} className="lib-cover" />
                {status.progress !== undefined && (
                  <div className="lib-progress-ring">
                    <svg viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2.5" />
                      <circle
                        cx="18" cy="18" r="15"
                        fill="none"
                        stroke="var(--gold)"
                        strokeWidth="2.5"
                        strokeDasharray={`${(status.progress / status.book.book.pages) * 94.2} 94.2`}
                        strokeLinecap="round"
                        transform="rotate(-90 18 18)"
                      />
                    </svg>
                    <span>{Math.round((status.progress / status.book.book.pages) * 100)}%</span>
                  </div>
                )}
              </div>

              <div className="lib-info">
                <button
                  className="book-title-btn"
                  onClick={() => router.push(`/reading/${status.book.book.default_Physical_Edition_Id}`)}
                >
                  {status.book.book.title}
                </button>
                <div className="lib-author">{status.book.contributions?.[0].author?.name}</div>
                <Stars rating={status.book.book.rating} />
                {status.progress !== undefined && (
                  <div className="lib-progress-bar-wrap">
                    <div className="lib-progress-bar">
                      <div className="lib-progress-fill" style={{ width: `${status.progress/status.book.book.pages * 100}%` }} />
                    </div>
                    <span className="lib-progress-text">
                      {status.progress}  / {status.book.book.pages} pages
                    </span>
                  </div>
                )}
              </div>

            </div>
          ))}

        </div>
        
      </div>
      <Footer />
    </>
  );
}
