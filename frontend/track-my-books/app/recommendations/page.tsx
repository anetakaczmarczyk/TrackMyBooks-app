"use client";

import { useState, useEffect } from "react";
import {Navbar} from "@/_components/Navbar";
import { useAuth } from "@/_context/AuthContext";
import {Recommendation} from "@/_components/Recommendation";
import Link from "next/link";
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

    useEffect(() => {
        const getRecommendations = async() =>{

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

        <section className="rec-section">
          <div className="section-header-row">
            <h2 className="section-heading">Selected for You</h2>
          </div>
          <div className="rec-cards">
            {recommendations?.map((r, i) => (
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
