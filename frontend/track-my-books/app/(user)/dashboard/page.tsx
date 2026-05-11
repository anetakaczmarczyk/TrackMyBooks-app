"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/_components/Navbar";
import { useAuth } from "@/_context/AuthContext";

/* ── Types ── */
interface ReadingBook {
  id: string;
  title: string;
  author: string;
  cover: string;
  progress: number;
  pages: number;
}

interface ActivityItem {
  id: string;
  type: "finished" | "started" | "rated" | "reviewed";
  bookTitle: string;
  friendName: string;
  friendInitials: string;
  time: string;
}

interface DashboardStats {
  booksRead: number;
  pagesThisWeek: number;
  currentStreak: number;
  avgRating: number;
  readingGoal: number;
  readingGoalProgress: number;
}

/* ── Mock fetch (replace with real API calls) ── */
async function fetchDashboard(token: string) {
  // Replace these with your actual endpoints
  const headers = { Authorization: `Bearer ${token}` };

  const [stats, currentlyReading, activity] = await Promise.all([
    fetch("http://localhost:5000/api/dashboard/stats",    { headers }).then(r => r.json()),
    fetch("http://localhost:5000/api/dashboard/reading",  { headers }).then(r => r.json()),
    fetch("http://localhost:5000/api/dashboard/activity", { headers }).then(r => r.json()),
  ]);

  return { stats, currentlyReading, activity };
}

/* ── Helpers ── */
function ProgressRing({ pct }: { pct: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  return (
    <svg width="70" height="70" viewBox="0 0 70 70">
      <circle cx="35" cy="35" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
      <circle
        cx="35" cy="35" r={r}
        fill="none"
        stroke="var(--gold)"
        strokeWidth="4"
        strokeDasharray={`${(pct / 100) * circ} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 35 35)"
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
      <text x="35" y="40" textAnchor="middle" fill="var(--gold-light)" fontSize="13" fontWeight="600">
        {pct}%
      </text>
    </svg>
  );
}

/* ── MOCK data for when API isn't ready ── */
const MOCK_STATS: DashboardStats = {
  booksRead: 11, pagesThisWeek: 214,
  currentStreak: 7, avgRating: 4.6,
  readingGoal: 24, readingGoalProgress: 11,
};
const MOCK_READING: ReadingBook[] = [
  { id: "1", title: "Dune", author: "Frank Herbert", cover: "https://covers.openlibrary.org/b/id/8758191-L.jpg", progress: 62, pages: 688 },
  { id: "2", title: "Babel", author: "R. F. Kuang",  cover: "https://covers.openlibrary.org/b/id/13066421-L.jpg", progress: 31, pages: 545 },
];
const MOCK_ACTIVITY: ActivityItem[] = [
  { id: "1", type: "finished", bookTitle: "Project Hail Mary", friendName: "Marta K.",  friendInitials: "MK", time: "2h ago"        },
  { id: "2", type: "rated",    bookTitle: "1984",               friendName: "Anna S.",   friendInitials: "AS", time: "yesterday"     },
  { id: "3", type: "started",  bookTitle: "Sea of Tranquility", friendName: "Piotr W.",  friendInitials: "PW", time: "2 days ago"    },
  { id: "4", type: "reviewed", bookTitle: "Foundation",         friendName: "Tomasz N.", friendInitials: "TN", time: "3 days ago"    },
];

const ACTIVITY_LABELS: Record<ActivityItem["type"], string> = {
  finished: "finished reading",
  started:  "started reading",
  rated:    "rated",
  reviewed: "reviewed",
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats]           = useState<DashboardStats>(MOCK_STATS);
  const [reading, setReading]       = useState<ReadingBook[]>(MOCK_READING);
  const [activity, setActivity]     = useState<ActivityItem[]>(MOCK_ACTIVITY);
  const [dataLoading, setDataLoading] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  // Load dashboard data
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    setDataLoading(true);
    fetchDashboard(token)
      .then(({ stats, currentlyReading, activity }) => {
        if (stats)           setStats(stats);
        if (currentlyReading) setReading(currentlyReading);
        if (activity)        setActivity(activity);
      })
      .catch(() => { /* keep mock data on error */ })
      .finally(() => setDataLoading(false));
  }, [user]);

  if (authLoading || !user) {
    return (
      <><Navbar />
        <div className="inner-page books-loading">
          <div className="books-loading-spinner" />
          <p>Loading…</p>
        </div>
      </>
    );
  }

  const goalPct = Math.round((stats.readingGoalProgress / stats.readingGoal) * 100);
  const initials = user.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      <Navbar />
      <div className="inner-page">

        {/* ── HEADER ── */}
        <div className="dashboard-header">
          <div className="dashboard-welcome">
            <div className="dashboard-avatar">{initials}</div>
            <div>
              <div className="page-eyebrow">
                <span className="eyebrow-line" />Welcome back
                <span className="eyebrow-line" />
              </div>
              <h1 className="page-title" style={{ marginBottom: 4 }}>
                {user.name.split(" ")[0]}
              </h1>
              <p className="page-subtitle">Here's what's happening with your reading.</p>
            </div>
          </div>
          <Link href="/library" className="btn-gold btn-lg">+ Add book</Link>
        </div>

        {/* ── KPI CARDS ── */}
        <div className="kpi-row" style={{ marginBottom: 28 }}>
          {[
            { val: stats.booksRead,       label: "Books read this year", sub: "Goal: " + stats.readingGoal },
            { val: stats.pagesThisWeek,   label: "Pages this week",      sub: "Keep it up!"               },
            { val: stats.currentStreak + "d", label: "Current streak",   sub: "days in a row"             },
            { val: stats.avgRating,       label: "Average rating",       sub: "from rated books"          },
          ].map(k => (
            <div className="kpi-card" key={k.label}>
              <div className="kpi-value">{k.val}</div>
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-sub">{k.sub}</div>
            </div>
          ))}
        </div>

        <div className="dashboard-grid">

          {/* ── LEFT COLUMN ── */}
          <div className="dashboard-left">

            {/* Currently reading */}
            <div className="stats-card">
              <div className="section-header-row" style={{ marginBottom: 20 }}>
                <h2 className="stats-card-title" style={{ marginBottom: 0 }}>Currently Reading</h2>
                <Link href="/library" className="see-all">View library →</Link>
              </div>

              {reading.length === 0 ? (
                <div className="books-empty" style={{ padding: "32px 0" }}>
                  <span className="books-empty-icon">📖</span>
                  <p>You're not reading anything right now.</p>
                  <Link href="/books" className="add-btn-sm" style={{ textDecoration: "none", textAlign: "center" }}>
                    Browse books
                  </Link>
                </div>
              ) : (
                <div className="dashboard-reading-list">
                  {reading.map(book => {
                    const pct = Math.round((book.progress / book.pages) * 100);
                    return (
                      <div className="dashboard-reading-item" key={book.id}>
                        <img src={book.cover} alt={book.title} className="dashboard-reading-cover" />
                        <div className="dashboard-reading-info">
                          <div className="dashboard-reading-title">{book.title}</div>
                          <div className="dashboard-reading-author">{book.author}</div>
                          <div className="dashboard-reading-progress-wrap">
                            <div className="lib-progress-bar">
                              <div className="lib-progress-fill" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="lib-progress-text">
                              p. {book.progress} / {book.pages} · {pct}%
                            </span>
                          </div>
                        </div>
                        <ProgressRing pct={pct} />
                        <Link
                          href={`/reading/${book.id}`}
                          className="add-btn-sm"
                          style={{ textDecoration: "none", flexShrink: 0 }}
                        >
                          Continue →
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Friends activity */}
            <div className="stats-card">
              <div className="section-header-row" style={{ marginBottom: 20 }}>
                <h2 className="stats-card-title" style={{ marginBottom: 0 }}>Friends Activity</h2>
                <Link href="/friends" className="see-all">See all →</Link>
              </div>
              <div className="activity-feed">
                {activity.map(a => (
                  <div className="activity-row" key={a.id}>
                    <div className="fbc-activity-avatar">{a.friendInitials}</div>
                    <div className="activity-text">
                      <span style={{ color: "var(--text)", fontWeight: 500 }}>{a.friendName}</span>
                      {" "}{ACTIVITY_LABELS[a.type]}{" "}
                      <em style={{ color: "var(--gold)", fontStyle: "normal" }}>"{a.bookTitle}"</em>
                    </div>
                    <span className="activity-time">{a.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="dashboard-right">

            {/* Reading goal */}
            <div className="stats-card">
              <h2 className="stats-card-title">Reading Goal 2026</h2>
              <div className="dashboard-goal">
                <div className="dashboard-goal-ring">
                  <ProgressRing pct={goalPct} />
                </div>
                <div>
                  <div className="dashboard-goal-numbers">
                    {stats.readingGoalProgress}
                    <span> / {stats.readingGoal}</span>
                  </div>
                  <p className="kpi-sub">{goalPct}% of yearly goal</p>
                  <p className="kpi-sub" style={{ marginTop: 4 }}>
                    {stats.readingGoal - stats.readingGoalProgress} books to go
                  </p>
                </div>
              </div>
              <div className="goal-track" style={{ marginTop: 16 }}>
                <div className="goal-fill" style={{ width: `${goalPct}%` }} />
              </div>
              <Link href="/statistics" className="goal-link">Full statistics →</Link>
            </div>

            {/* Quick links */}
            <div className="stats-card">
              <h2 className="stats-card-title">Quick Links</h2>
              <div className="dashboard-quick-links">
                {[
                  { href: "/books",           icon: "🔍", label: "Browse Books"       },
                  { href: "/recommendations", icon: "✨", label: "Recommendations"    },
                  { href: "/statistics",      icon: "📊", label: "Statistics"         },
                  { href: "/friends",         icon: "👥", label: "Friends"            },
                  { href: "/profile",         icon: "👤", label: "Edit Profile"       },
                  { href: "/settings",        icon: "⚙️", label: "Settings"           },
                ].map(l => (
                  <Link key={l.href} href={l.href} className="dashboard-quick-link">
                    <span>{l.icon}</span>
                    <span>{l.label}</span>
                    <span className="dashboard-quick-arrow">→</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Weekly activity heatmap */}
            <div className="stats-card">
              <h2 className="stats-card-title">This Week</h2>
              <div className="rp-week-chart" style={{ height: 100 }}>
                {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((day, i) => {
                  const vals = [28, 0, 55, 30, 61, 42, 0];
                  const max  = Math.max(...vals);
                  return (
                    <div className="rp-week-col" key={day}>
                      <div className="rp-week-bar-wrap">
                        <div
                          className="rp-week-bar"
                          style={{ height: max ? `${(vals[i] / max) * 100}%` : "0%" }}
                          title={`${vals[i]} pages`}
                        />
                      </div>
                      <div className="rp-week-val">{vals[i] > 0 ? vals[i] : ""}</div>
                      <div className="rp-week-day">{day}</div>
                    </div>
                  );
                })}
              </div>
              <p className="kpi-sub" style={{ textAlign: "center", marginTop: 8 }}>
                216 pages this week
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}