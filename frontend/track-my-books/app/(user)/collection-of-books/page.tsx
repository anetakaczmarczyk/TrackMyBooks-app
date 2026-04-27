"use client";

import { useState } from "react";
import {Navbar} from "@/_components/Navbar";
import { Footer } from "@/_components/Footer";

const STATUSES = ["Czytam teraz", "Przeczytane", "Chcę przeczytać", "Porzucone", "Listy książek"];


// To change later to fetching from API
const LIBRARY: Record<string, {
  id: number; title: string; author: string; cover: string;
  rating?: number; progress?: number; pages: number; addedDate: string;
}[]> = {
  "Czytam teraz": [
    { id: 1, title: "Dune", author: "Frank Herbert", cover: "https://covers.openlibrary.org/b/id/8758191-L.jpg", progress: 62, pages: 688, addedDate: "12 mar 2026" },
    { id: 2, title: "Babel", author: "R. F. Kuang", cover: "https://covers.openlibrary.org/b/id/13066421-L.jpg", progress: 31, pages: 545, addedDate: "20 mar 2026" },
  ],
  "Przeczytane": [
    { id: 3, title: "Mistrz i Małgorzata", author: "Michaił Bułhakow", cover: "https://covers.openlibrary.org/b/id/8231856-L.jpg", rating: 5, pages: 480, addedDate: "1 sty 2026" },
    { id: 4, title: "1984", author: "George Orwell", cover: "https://covers.openlibrary.org/b/id/8575708-L.jpg", rating: 5, pages: 328, addedDate: "15 lut 2026" },
    { id: 5, title: "Fundacja", author: "Isaac Asimov", cover: "https://covers.openlibrary.org/b/id/8391619-L.jpg", rating: 4, pages: 244, addedDate: "28 lut 2026" },
    { id: 6, title: "Project Hail Mary", author: "Andy Weir", cover: "https://covers.openlibrary.org/b/id/10509244-L.jpg", rating: 5, pages: 476, addedDate: "5 mar 2026" },
  ],
  "Chcę przeczytać": [
    { id: 7, title: "Zbrodnia i kara", author: "Fiodor Dostojewski", cover: "https://covers.openlibrary.org/b/id/8091022-L.jpg", pages: 671, addedDate: "8 mar 2026" },
    { id: 8, title: "Sto lat samotności", author: "Gabriel García Márquez", cover: "https://covers.openlibrary.org/b/id/8406786-L.jpg", pages: 417, addedDate: "10 mar 2026" },
    { id: 9, title: "Sea of Tranquility", author: "Emily St. John Mandel", cover: "https://covers.openlibrary.org/b/id/12699828-L.jpg", pages: 272, addedDate: "18 mar 2026" },
  ],
  "Porzucone": [
    { id: 10, title: "Bracia Karamazow", author: "Fiodor Dostojewski", cover: "https://covers.openlibrary.org/b/id/8091016-L.jpg", pages: 796, addedDate: "3 lut 2026" },
  ],
  "Listy książek": [
    { id: 11, title: "Ulubione książki 2025", author: "Mój wybór", cover: "https://covers.openlibrary.org/b/id/11111111-L.jpg", pages: 0, addedDate: "30 gru 2025" },
  ],
};



const STATUS_ICONS: Record<string, string> = {
  "Reading":       "📖",
  "Read":        "✅",
  "Want to Read":    "🔖",
  "Abandoned":          "💤",
  "Book Lists":      "📚",
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
  const [status, setStatus] = useState(STATUSES[0]);
  const books = LIBRARY[status];
  const totalBooks = Object.values(LIBRARY).flat().length;
  const readBooks  = LIBRARY["Przeczytane"].length;

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
              {STATUS_ICONS[s]} {s}
              <span className="lib-tab-count">{LIBRARY[s].length}</span>
            </button>
          ))}
        </div>

        {status === 'Listy książek' ? (
          <div className="profile-content">
            <div className="lists-grid">
              {[
                { name: "Sci-Fi must-read", count: 7, emoji: "🚀" },
                { name: "Classic must-read", count: 12, emoji: "📜" },
                { name: "Recommended for Friends", count: 4, emoji: "🎁" },
              ].map(l => (
                <div className="list-card" key={l.name}>
                  <span className="list-emoji">{l.emoji}</span>
                  <span className="list-name">{l.name}</span>
                  <span className="list-count">{l.count} books</span>
                </div>
              ))}
              <div className="list-card list-add">
                <span className="list-emoji">+</span>
                <span className="list-name">New List</span>
              </div>
            </div>
          </div>
        ) : (
        // {/* Cards */}
        <div className="lib-grid">
          {books.map(book => (
            <div className="lib-card" key={book.id}>
              <div className="lib-cover-wrap">
                <img src={book.cover} alt={book.title} className="lib-cover" />
                {book.progress !== undefined && (
                  <div className="lib-progress-ring">
                    <svg viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2.5" />
                      <circle
                        cx="18" cy="18" r="15"
                        fill="none"
                        stroke="var(--gold)"
                        strokeWidth="2.5"
                        strokeDasharray={`${(book.progress / 100) * 94.2} 94.2`}
                        strokeLinecap="round"
                        transform="rotate(-90 18 18)"
                      />
                    </svg>
                    <span>{book.progress}%</span>
                  </div>
                )}
              </div>

              <div className="lib-info">
                <div className="lib-title">{book.title}</div>
                <div className="lib-author">{book.author}</div>
                <Stars rating={book.rating} />
                {book.progress !== undefined && (
                  <div className="lib-progress-bar-wrap">
                    <div className="lib-progress-bar">
                      <div className="lib-progress-fill" style={{ width: `${book.progress}%` }} />
                    </div>
                    <span className="lib-progress-text">
                      {Math.round(book.pages * book.progress / 100)} / {book.pages} pages
                    </span>
                  </div>
                )}
                <div className="lib-date">Added: {book.addedDate}</div>
              </div>

              <div className="lib-actions">
                <button className="lib-action-btn" title="Edit">✏️</button>
                <button className="lib-action-btn" title="Delete">🗑</button>
              </div>
            </div>
          ))}

          {/* Add placeholder */}
          <div className="lib-card lib-add-card">
            <div className="lib-add-inner">
              <span className="lib-add-icon">+</span>
              <span className="lib-add-label">Add Book</span>
            </div>
          </div>
        </div>
        )}  
      </div>
      <Footer />
    </>
  );
}
