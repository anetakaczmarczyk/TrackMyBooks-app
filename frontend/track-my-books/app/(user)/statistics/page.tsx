"use client";

import { Footer } from "@/_components/Footer";
import {Navbar} from "@/_components/Navbar";

const MONTHLY = [
  { month: "Feb", books: 1, pages: 328 },
  { month: "Mar", books: 2, pages: 720 },
  { month: "Apr", books: 1, pages: 244 },
  { month: "May", books: 3, pages: 956 },
  { month: "Jun", books: 2, pages: 804 },
  { month: "Jul", books: 2, pages: 476 },
];

const MAX_PAGES = Math.max(...MONTHLY.map(m => m.pages));

const GENRES_DIST = [
  { name: "Sci-Fi",   count: 5, color: "#4a90d9" },
  { name: "Klasyka",  count: 3, color: "var(--gold)" },
  { name: "Fantasy",  count: 2, color: "#7c5cbf" },
  { name: "Dystopia", count: 1, color: "#52b788" },
];
const TOTAL_GENRE = GENRES_DIST.reduce((s, g) => s + g.count, 0);

const ACHIEVEMENTS = [
  { icon: "🔥", label: "7-Day Streak",     desc: "Read for 7 consecutive days",      unlocked: true  },
  { icon: "📚", label: "First Shelf",  desc: "10 books in your library",    unlocked: true  },
  { icon: "⚡", label: "Quick Reader", desc: "5 books in a month",       unlocked: false },
  { icon: "🌍", label: "Globetrotter",      desc: "Authors from 5 countries",         unlocked: true  },
  { icon: "🏆", label: "Reading Year",    desc: "52 books in a year",          unlocked: false },
  { icon: "💬", label: "Critic",          desc: "10 reviews written",     unlocked: false },
];

const READING_LOG = [
  { date: "25 mar", title: "Dune", pages: 42 },
  { date: "24 mar", title: "Dune", pages: 28 },
  { date: "23 mar", title: "Babel", pages: 55 },
  { date: "22 mar", title: "Babel", pages: 30 },
  { date: "21 mar", title: "Project Hail Mary", pages: 61 },
];

export default function StatsPage() {
  return (
    <>
      <Navbar />

      <div className="inner-page">
        <div className="page-header">
          <div>
            <div className="page-eyebrow">
              <span className="eyebrow-line" />Your Progress
              <span className="eyebrow-line" />
            </div>
            <h1 className="page-title">Statistics</h1>
            <p className="page-subtitle">Your reading year 2026 in numbers.</p>
          </div>
          <div className="stats-year-badge">2026</div>
        </div>

        {/* KPI row */}
        <div className="kpi-row">
          {[
            { value: "11",    label: "Books Read",  sub: "+3 vs last year" },
            { value: "3 528", label: "Pages Read",    sub: "avg. 321/month"  },
            { value: "7",     label: "Days in a Row",            sub: "current streak"      },
            { value: "4,6",   label: "Average Rating",          sub: "out of 9 rated"    },
          ].map(k => (
            <div className="kpi-card" key={k.label}>
              <div className="kpi-value">{k.value}</div>
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-sub">{k.sub}</div>
            </div>
          ))}
        </div>

        <div className="stats-grid-2">
          {/* Bar chart */}
          <div className="stats-card">
            <h3 className="stats-card-title">Pages per Month</h3>
            <div className="bar-chart">
              {MONTHLY.map(m => (
                <div className="bar-col" key={m.month}>
                  <span className="bar-value">{m.pages}</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ height: `${(m.pages / MAX_PAGES) * 100}%` }}
                    />
                  </div>
                  <span className="bar-label">{m.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Genre distribution */}
          <div className="stats-card">
            <h3 className="stats-card-title">Favorite Genres</h3>
            <div className="genre-dist">
              {GENRES_DIST.map(g => (
                <div className="genre-dist-row" key={g.name}>
                  <span className="genre-dist-name">{g.name}</span>
                  <div className="genre-dist-track">
                    <div
                      className="genre-dist-fill"
                      style={{
                        width: `${(g.count / TOTAL_GENRE) * 100}%`,
                        background: g.color,
                      }}
                    />
                  </div>
                  <span className="genre-dist-count">{g.count}</span>
                </div>
              ))}
            </div>

            {/* Goal */}
            <div className="reading-goal">
              <div className="goal-header">
                <span className="goal-label">Annual Goal: 24 Books</span>
                <span className="goal-pct">46%</span>
              </div>
              <div className="goal-track">
                <div className="goal-fill" style={{ width: "46%" }} />
              </div>
              <span className="goal-sub">11 of 24 · 13 books remaining</span>
            </div>
          </div>
        </div>

        <div className="stats-grid-2">
          {/* Achievements */}
          <div className="stats-card">
            <h3 className="stats-card-title">Achievements</h3>
            <div className="achievements-grid">
              {ACHIEVEMENTS.map(a => (
                <div
                  className={`achievement-item ${a.unlocked ? "unlocked" : "locked"}`}
                  key={a.label}
                >
                  <span className="achievement-icon">{a.icon}</span>
                  <span className="achievement-label">{a.label}</span>
                  <span className="achievement-desc">{a.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reading log */}
          <div className="stats-card">
            <h3 className="stats-card-title">Reading Log</h3>
            <div className="reading-log">
              {READING_LOG.map((entry, i) => (
                <div className="log-row" key={i}>
                  <div className="log-dot" />
                  <div className="log-info">
                    <span className="log-title">{entry.title}</span>
                    <span className="log-pages">{entry.pages} pages</span>
                  </div>
                  <span className="log-date">{entry.date}</span>
                </div>
              ))}
            </div>

            {/* Heatmap mini */}
            <div className="heatmap-wrap">
              <div className="heatmap-label">Activity (last 7 weeks)</div>
              <div className="heatmap">
                {Array.from({ length: 49 }).map((_, i) => {
                  const intensity = [0,1,2,3,4,3,2,1,0,2,4,3,1,0,0,1,3,4,2,0,1,2,3,2,1,0,4,3,1,2,4,3,0,1,2,4,3,2,1,0,1,3,4,2,1,0,2,3,4][i] ?? 0;
                  return (
                    <div
                      key={i}
                      className="heatmap-cell"
                      style={{ opacity: intensity === 0 ? 0.08 : 0.2 + intensity * 0.2 }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
