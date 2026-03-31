"use client";

import { useState } from "react";
import Link from "next/link";
import {Navbar} from "@/_components/Navbar";
import { Footer } from "@/_components/Footer";

const RECENT_BOOKS = [
  { id: 1, title: "Dune", author: "Frank Herbert", cover: "https://covers.openlibrary.org/b/id/8758191-L.jpg", rating: 5 },
  { id: 2, title: "1984", author: "George Orwell", cover: "https://covers.openlibrary.org/b/id/8575708-L.jpg", rating: 5 },
  { id: 3, title: "Fundacja", author: "Isaac Asimov", cover: "https://covers.openlibrary.org/b/id/8391619-L.jpg", rating: 4 },
  { id: 4, title: "Project Hail Mary", author: "Andy Weir", cover: "https://covers.openlibrary.org/b/id/10509244-L.jpg", rating: 5 },
];

const REVIEWS = [
  {
    id: 1,
    book: "Project Hail Mary",
    cover: "https://covers.openlibrary.org/b/id/10509244-L.jpg",
    rating: 5,
    date: "5 mar 2026",
    text: "Absolutnie genialna książka. Weir znowu udowadnia, że nauka i humor mogą iść w parze. Zakończenie powaliło mnie na kolana.",
  },
  {
    id: 2,
    book: "Fundacja",
    cover: "https://covers.openlibrary.org/b/id/8391619-L.jpg",
    rating: 4,
    date: "28 lut 2026",
    text: "Klasyk, który wytrzymał próbę czasu. Asimov buduje swój świat z cierpliwością mistrza. Miejscami wolniejsze tempo, ale każda strona ma znaczenie.",
  },
];

const PROFILE_TABS = ["Przegląd", "Recenzje", "Listy", "Aktywność"];

function Stars({ n }: { n: number }) {
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= n ? "var(--gold)" : "rgba(139,131,120,0.25)", fontSize: 13 }}>★</span>
      ))}
    </span>
  );
}

export default function ProfilePage() {
  const [tab, setTab] = useState("Przegląd");
  const editing = false; // For demo purposes, we can toggle this to show/hide the edit button, to change if user is looking at their own profile or someone else's, etc.
  return (
    <>
      <Navbar />

      <div className="inner-page">

        {/* Profile hero */}
        <div className="profile-hero">
          <div className="profile-cover-bg" />
          <div className="profile-hero-content">
            <div className="profile-avatar-wrap">
              <div className="profile-avatar">AK</div>
              {!editing && (
                <Link className="profile-edit-btn" href="/settings">
                  ✏️ Edytuj
                </Link>
              )}
            </div>
            <div className="profile-meta">
              <h1 className="profile-name">Adam Kowalski</h1>
              <p className="profile-handle">@adam.czyta</p>
              <p className="profile-bio">
                Miłośnik sci-fi i klasyki. Czytam żeby żyć więcej niż jedno życie. 📚
              </p>
              <div className="profile-chips">
                <span className="profile-chip">Sci-Fi</span>
                <span className="profile-chip">Klasyka</span>
                <span className="profile-chip">Fantasy</span>
              </div>
            </div>
            <div className="profile-stats-row">
              {[
                { val: "11",  lbl: "Przeczytanych" },
                { val: "2",   lbl: "Czyta teraz"   },
                { val: "3",   lbl: "Na liście"      },
                { val: "9",   lbl: "Ocenionych"     },
              ].map(s => (
                <div className="profile-stat" key={s.lbl}>
                  <span className="profile-stat-val">{s.val}</span>
                  <span className="profile-stat-lbl">{s.lbl}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          {PROFILE_TABS.map(t => (
            <button
              key={t}
              className={`profile-tab ${tab === t ? "active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {/* TAB: Przegląd */}
        {tab === "Przegląd" && (
          <div className="profile-content">
            <div className="stats-grid-2">
              {/* Recently read */}
              <div className="stats-card">
                <h3 className="stats-card-title">Ostatnio przeczytane</h3>
                <div className="profile-books-row">
                  {RECENT_BOOKS.map(b => (
                    <div className="profile-book-thumb" key={b.id}>
                      <img src={b.cover} alt={b.title} />
                      <Stars n={b.rating} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Reading goal */}
              <div className="stats-card">
                <h3 className="stats-card-title">Cel na 2026</h3>
                <div className="goal-big">
                  <div className="goal-big-number">11 <span>/ 24</span></div>
                  <div className="goal-track" style={{ marginTop: 12 }}>
                    <div className="goal-fill" style={{ width: "46%" }} />
                  </div>
                  <p className="goal-sub" style={{ marginTop: 8 }}>46% celu rocznego · pozostało 13 książek</p>
                  <Link href="/statistics" className="goal-link">Zobacz pełne statystyki →</Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: Recenzje */}
        {tab === "Recenzje" && (
          <div className="profile-content">
            <div className="reviews-list">
              {REVIEWS.map(r => (
                <div className="review-card" key={r.id}>
                  <img src={r.cover} alt={r.book} className="review-cover" />
                  <div className="review-body">
                    <div className="review-top-row">
                      <span className="review-book-title">{r.book}</span>
                      <Stars n={r.rating} />
                      <span className="review-date">{r.date}</span>
                    </div>
                    <p className="review-text">"{r.text}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: Listy */}
        {tab === "Listy" && (
          <div className="profile-content">
            <div className="lists-grid">
              {[
                { name: "Sci-Fi must-read", count: 7, emoji: "🚀" },
                { name: "Klasyka do śmierci", count: 12, emoji: "📜" },
                { name: "Polecam znajomym", count: 4, emoji: "🎁" },
              ].map(l => (
                <div className="list-card" key={l.name}>
                  <span className="list-emoji">{l.emoji}</span>
                  <span className="list-name">{l.name}</span>
                  <span className="list-count">{l.count} książek</span>
                </div>
              ))}
              <div className="list-card list-add">
                <span className="list-emoji">+</span>
                <span className="list-name">Nowa lista</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB: Aktywność */}
        {tab === "Aktywność" && (
          <div className="profile-content">
            <div className="activity-feed">
              {[
                { icon: "✅", text: 'Dodałeś "Babel" do przeczytanych', time: "2 godz. temu" },
                { icon: "⭐", text: 'Oceniłeś "Project Hail Mary" na 5/5', time: "wczoraj" },
                { icon: "💬", text: 'Napisałeś recenzję "Fundacji"', time: "28 lut" },
                { icon: "🔖", text: 'Dodałeś "Zbrodnia i kara" do listy życzeń', time: "25 lut" },
                { icon: "📖", text: 'Zacząłeś czytać "Dune"', time: "12 mar" },
              ].map((a, i) => (
                <div className="activity-row" key={i}>
                  <span className="activity-icon">{a.icon}</span>
                  <span className="activity-text">{a.text}</span>
                  <span className="activity-time">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
