"use client";

import { useEffect, useState } from "react";
import {Navbar} from "@/_components/Navbar";
import { useAuth } from "@/_context/AuthContext";
import {Recommendation} from "@/_components/Recommendation";
import Link from "next/link";

// Definicje nastrojów, które po stronie backendu są mapowane na konkretne gatunki literackie i tagi
const MOODS = [
  { id: "relax",     emoji: "🌿", label: "Relax",        desc: "Light and pleasant reading" },
  { id: "adventure", emoji: "⚔️",  label: "Adventure",      desc: "Action and epic worlds" },
  { id: "mind",      emoji: "🧠",  label: "Mind",        desc: "Science and philosophy" },
  { id: "emotion",   emoji: "❤️",  label: "Emotion",        desc: "Moving stories" },
  { id: "mystery",   emoji: "🔍",  label: "Mystery",     desc: "Mysteries and thrillers" },
  { id: "wonder",    emoji: "✨",  label: "Wonder",       desc: "Magic and wonder" },
];

export default function RecommendationsPage() {
  const { user, loading: authLoading, refreshUser } = useAuth();

  const [username, setUsername] = useState<string | null>(null);
  const [activeMood, setActiveMood] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null)

  useEffect(() => {
        setUsername(user?.username || null);
    }, [user, authLoading,]);

    // Reagowanie na zmianę nastroju (activeMood). Przy każdym kliknięciu innej karty nastroju,
    // asynchronicznie dociągamy dopasowane rekomendacje z backendu
    useEffect(() => {
        const getRecommendations = async() => {
              // Przekazanie nazwy użytkownika (username) pozwala backendowi zidentyfikować posiadane przez niego książki
              // i odrzucić je z wyników wyszukiwania, zapobiegając duplikatom rekomendacji
              const res = await fetch(`http://localhost:5000/api/books/getRecommendations?mood=${activeMood}&username=${username}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });
            if (!res.ok) {
                console.error("Failed to fetch reading data");
                return;
            }
            const data = await res.json();;
            setRecommendations(data)
        }
        getRecommendations()
    }, [activeMood]);
  return (
    <>
      <Navbar />

      <div className="inner-page">
        {/* Header */}
        <div className="page-header">
          <div>
            <div className="page-eyebrow">
              <span className="eyebrow-line" />For you, always
              <span className="eyebrow-line" />
            </div>
            <h1 className="page-title">Recommendations</h1>
            <p className="page-subtitle">Personalized suggestions.</p>
          </div>
        </div>

        {/* Mood picker */}
        <section className="rec-section">
          <h2 className="section-heading">How are you feeling today?</h2>
          <br />
          <div className="mood-grid">
            {MOODS.map(m => (
              <button
                key={m.id}
                className={`mood-card ${activeMood === m.id ? "active" : ""}`}
                onClick={() => setActiveMood(m.id)}
              >
                <span className="mood-emoji">{m.emoji}</span>
                <span className="mood-label">{m.label}</span>
                <span className="mood-desc">{m.desc}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Sekcja wyników rekomendacji */}
        <section className="rec-section">
          <div className="section-header-row">
            <h2 className="section-heading">Selected for You</h2>
          </div>
          <div className="rec-cards">
            {recommendations?.map((r, i) => (
              // Wykorzystanie indeksu tablicy "i" do dynamicznego przesunięcia opóźnienia animacji
              // Sprawia to, że karty z książkami ujawniają się płynnie i elegancko jedna po drugiej.
              <div className="rec-card" key={i} style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="rec-card-inner">
                  <img src={r.imageUrl == "" ? undefined : r.imageUrl} alt={r.title} className="rec-cover" />
                  <div className="rec-info">
                    <div className="rec-top">
                      <span className="rec-genre">{r.primaryGenre}</span>
                    </div>
                    <div className="rec-title">{r.title}</div>
                    <div className="rec-author">{r. authorName}</div>
                    <p className="rec-reason">"{r.reason}"</p>
                    <div className="rec-actions">
                      <Link href={`/books/${r.book_Id}`} className="add-btn-sm">Show book</Link>
                      <span className="book-star">★ {r.rating.toFixed(2)}</span>
                    </div>
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