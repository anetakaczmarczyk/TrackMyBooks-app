"use client";

import { useState } from "react";
import {Navbar} from "@/_components/Navbar";

const MOODS = [
  { id: "relax",     emoji: "🌿", label: "Relaks",        desc: "Lekkie, przyjemne czytanie" },
  { id: "adventure", emoji: "⚔️",  label: "Przygoda",      desc: "Akcja i epickie światy" },
  { id: "mind",      emoji: "🧠",  label: "Dla umysłu",   desc: "Nauka i filozofia" },
  { id: "emotion",   emoji: "❤️",  label: "Emocje",        desc: "Poruszające historie" },
  { id: "mystery",   emoji: "🔍",  label: "Tajemnica",     desc: "Kryminały i thrillery" },
  { id: "wonder",    emoji: "✨",  label: "Zachwyt",       desc: "Magia i niesamowitość" },
];

const RECS = [
  {
    id: 1,
    title: "Solaris",
    author: "Stanisław Lem",
    cover: "https://covers.openlibrary.org/b/id/8758191-L.jpg",
    rating: 4.5,
    genre: "Sci-Fi",
    match: 97,
    reason: "Bo przeczytałeś Dune i Fundację — Lem to mistrz filozoficznego sci-fi, który zadaje pytania bez odpowiedzi.",
    tags: ["filozofia", "kosmos", "trudne pytania"],
  },
  {
    id: 2,
    title: "Babel",
    author: "R. F. Kuang",
    cover: "https://covers.openlibrary.org/b/id/13066421-L.jpg",
    rating: 4.6,
    genre: "Fantasy",
    match: 94,
    reason: "Twoje zainteresowanie klasyką i fantasy sprawia, że ta mroczna akademicka historia będzie strzałem w dziesiątkę.",
    tags: ["akademia", "magia", "historia"],
  },
  {
    id: 3,
    title: "Project Hail Mary",
    author: "Andy Weir",
    cover: "https://covers.openlibrary.org/b/id/10509244-L.jpg",
    rating: 4.8,
    genre: "Sci-Fi",
    match: 92,
    reason: "Na podstawie Twoich pięciogwiazdkowych ocen – szukasz nauki połączonej z humorem i napięciem.",
    tags: ["nauka", "humor", "przetrwanie"],
  },
  {
    id: 4,
    title: "The Midnight Library",
    author: "Matt Haig",
    cover: "https://covers.openlibrary.org/b/id/10481085-L.jpg",
    rating: 4.3,
    genre: "Fantasy",
    match: 88,
    reason: "Idealna na czas gdy chcesz czegoś refleksyjnego — opowiada o wyborach i żałowaniu z nutą magii.",
    tags: ["refleksja", "alternatywne życia", "magia"],
  },
  {
    id: 5,
    title: "Sea of Tranquility",
    author: "Emily St. John Mandel",
    cover: "https://covers.openlibrary.org/b/id/12699828-L.jpg",
    rating: 4.4,
    genre: "Sci-Fi",
    match: 85,
    reason: "Łączy podróże w czasie z prozą literacką — perfect dla kogoś kto ceni zarówno styl jak i fabułę.",
    tags: ["czas", "proza", "melancholia"],
  },
  {
    id: 6,
    title: "Tomorrow, and Tomorrow",
    author: "Gabrielle Zevin",
    cover: "https://covers.openlibrary.org/b/id/12993076-L.jpg",
    rating: 4.5,
    genre: "Dramat",
    match: 82,
    reason: "Historia o kreatywności, przyjaźni i miłości — dla kogoś kto lubi wielowarstwowe relacje między postaciami.",
    tags: ["gry", "miłość", "kreatywność"],
  },
];

const FRIENDS_READING = [
  { name: "Marta K.", avatar: "MK", book: "Dune", progress: 68 },
  { name: "Piotr W.", avatar: "PW", book: "Babel", progress: 42 },
  { name: "Anna S.",  avatar: "AS", book: "1984",  progress: 91 },
];

export default function RecommendationsPage() {
  const [activeMood, setActiveMood] = useState<string | null>(null);

  return (
    <>
      <Navbar />

      <div className="inner-page">
        {/* Header */}
        <div className="page-header">
          <div>
            <div className="page-eyebrow">
              <span className="eyebrow-line" />Dla Ciebie
              <span className="eyebrow-line" />
            </div>
            <h1 className="page-title">Rekomendacje</h1>
            <p className="page-subtitle">Spersonalizowane propozycje.</p>
          </div>
        </div>

        {/* Mood picker */}
        <section className="rec-section">
          <h2 className="section-heading">Jak się dziś czujesz?</h2>
          <div className="mood-grid">
            {MOODS.map(m => (
              <button
                key={m.id}
                className={`mood-card ${activeMood === m.id ? "active" : ""}`}
                onClick={() => setActiveMood(activeMood === m.id ? null : m.id)}
              >
                <span className="mood-emoji">{m.emoji}</span>
                <span className="mood-label">{m.label}</span>
                <span className="mood-desc">{m.desc}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="rec-section">
          <div className="section-header-row">
            <h2 className="section-heading">Wybrane dla Ciebie</h2>
          </div>
          <div className="rec-cards">
            {RECS.map((r, i) => (
              <div className="rec-card" key={r.id} style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="rec-match-bar" style={{ width: `${r.match}%` }} />
                <div className="rec-card-inner">
                  <img src={r.cover} alt={r.title} className="rec-cover" />
                  <div className="rec-info">
                    <div className="rec-top">
                      <span className="rec-genre">{r.genre}</span>
                    </div>
                    <div className="rec-title">{r.title}</div>
                    <div className="rec-author">{r.author}</div>
                    <p className="rec-reason">"{r.reason}"</p>
                    <div className="rec-actions">
                      <button className="add-btn-sm">+ Dodaj do biblioteczki</button>
                      <span className="book-star">★ {r.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Friends activity */}
        <section className="rec-section">
          <h2 className="section-heading">Co czytają znajomi</h2>
          <div className="friends-grid">
            {FRIENDS_READING.map(f => (
              <div className="friend-card" key={f.name}>
                <div className="friend-avatar">{f.avatar}</div>
                <div className="friend-info">
                  <div className="friend-name">{f.name}</div>
                  <div className="friend-book">czyta <em>{f.book}</em></div>
                  <div className="friend-progress-wrap">
                    <div className="friend-progress-bar">
                      <div className="friend-progress-fill" style={{ width: `${f.progress}%` }} />
                    </div>
                    <span className="friend-progress-pct">{f.progress}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
