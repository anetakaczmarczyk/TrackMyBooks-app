"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/_components/Navbar";
import { useAuth } from "@/_context/AuthContext";
import { Footer } from "@/_components/Footer";
import { Review } from "@/_components/Review";
import { LibraryItem } from "@/_components/LibraryItem";
import { FriendsData } from "@/_components/Friends";

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


export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats]           = useState<DashboardStats>(MOCK_STATS);
  const [reading, setReading]       = useState<LibraryItem[]>([]);
  const [activity, setActivity]     = useState<ActivityItem[]>(MOCK_ACTIVITY);
  const [dataLoading, setDataLoading] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([])
  const [friendsData, setFriendsData] = useState<FriendsData[]>([])

  useEffect(() => {
    if (!authLoading && !user) router.push("/");
  }, [user, authLoading, router]);

  // Load dashboard data
  useEffect(() => {
    const getDashboardData = async() => {
          const res = await fetch(`http://localhost:5000/api/user/getDashboardData/${user?.username}`, {
          method: "GET",
          headers: {
              "Content-Type": "application/json"
          },
          credentials: "include",
      });
      if (!res.ok) {
          console.error("Failed to put session data");
          return;
      }
        const data = await res.json();
        setFriendsData(data.friendsData);
        setReading(data.userReading);
        setReviews(data.userReviews)
    }
    getDashboardData();
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
  function formatTimeAgo(timestamp: string | Date) {
      const ms = Date.now() - new Date(timestamp+"Z").getTime();
      const seconds = Math.floor(ms / 1000);
      
      if (seconds < 60) return `${seconds} s ago`;
      
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes} min ago`;
      
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours} h ago`;
      
      const days = Math.floor(hours / 24);
      return `${days} days ago`;
  }
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
          <Link href="/books" className="btn-gold btn-lg">+ Add book</Link>
        </div>

        {/* ── KPI CARDS ── */}
        <div className="kpi-row" style={{ marginBottom: 28 }}>
          {[
            { val: reading.filter(r => r.status == 'read').length,       label: "Books read this year", sub: "Goal: " + user?.books_Goal },
            { val: (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1),       label: "Average rating",       sub: "from rated books"          },
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

              {reading.filter(r => r.status == 'reading').length === 0 ? (
                <div className="books-empty" style={{ padding: "32px 0" }}>
                  <span className="books-empty-icon">📖</span>
                  <p>You're not reading anything right now.</p>
                  <Link href="/books" className="add-btn-sm" style={{ textDecoration: "none", textAlign: "center" }}>
                    Browse books
                  </Link>
                </div>
              ) : (
                <div className="dashboard-reading-list">
                  {reading
                  .filter(r => r.status == 'reading')
                  .slice(0, 3)
                  .map(reading => {
                    const pct = Math.round((reading.progress / reading.book.book.pages) * 100);
                    return (
                      <div className="dashboard-reading-item" key={reading.book.book.default_Physical_Edition_Id}>
                        <img src={reading.book.book.cached_Image.url} alt={reading.book.book.title} className="dashboard-reading-cover" />
                        <div className="dashboard-reading-info">
                          <div className="dashboard-reading-title">{reading.book.book.title}</div>
                          <div className="dashboard-reading-author">{reading.book.contributions[0].author.name}</div>
                          <div className="dashboard-reading-progress-wrap">
                            <div className="lib-progress-bar">
                              <div className="lib-progress-fill" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="lib-progress-text">
                              p. {reading.progress} / {reading.book.book.pages} · {pct}%
                            </span>
                          </div>
                        </div>
                        <ProgressRing pct={pct} />
                        <Link
                          href={`/reading/${reading.book.book.default_Physical_Edition_Id}`}
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
              {friendsData
                .filter(f => f.friendshipStatus === "accepted")
                .flatMap(f => {
                  return f.activities.map(a => ({
                    ...a,
                    friendName: f.name || f.username,
                    friendUsername: f.username
                  }));
                })
                .sort((b, c) => new Date(c.timestamp).getTime() - new Date(b.timestamp).getTime())
                .slice(0, 4)
                .map((a, index) => (
                  <div className="activity-row" key={index}>
                    <div className="fbc-activity-avatar">{a.friendName.split(" ").map(n => n.charAt(0).toUpperCase()).join("").slice(0, 2)}</div>
                    <div className="activity-text">
                      <span style={{ color: "var(--text)", fontWeight: 500 }}>{a.friendName}</span>
                      {" "}{a.activityType}{" "}
                      <em style={{ color: "var(--gold)", fontStyle: "normal" }}>"{a.bookTitle}"</em>
                    </div>
                    <span className="activity-time">{formatTimeAgo(a.timestamp)}</span>
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
                  <ProgressRing pct={reading.filter(r => r.status == 'read').length / (user?.books_Goal == 0? 1 : user?.books_Goal) * 100} />
                </div>
                <div>
                  <div className="dashboard-goal-numbers">
                    {}
                    <span>{reading.filter(r => r.status == 'read').length} / {user?.books_Goal}</span>
                  </div>
                  <p className="kpi-sub">{reading.filter(r => r.status == 'read').length / (user?.books_Goal == 0? 1 : user?.books_Goal) * 100}% of yearly goal</p>
                  <p className="kpi-sub" style={{ marginTop: 4 }}>
                    { user?.books_Goal || 0 - reading.filter(r => r.status == 'read').length} books to go
                  </p>
                </div>
              </div>
              <div className="goal-track" style={{ marginTop: 16 }}>
                <div className="goal-fill" style={{ width: `${goalPct}%` }} />
              </div>
            </div>

            {/* Quick links */}
            <div className="stats-card">
              <h2 className="stats-card-title">Quick Links</h2>
              <div className="dashboard-quick-links">
                {[
                  { href: "/books",           icon: "🔍", label: "Browse Books"       },
                  { href: "/recommendations", icon: "✨", label: "Recommendations"    },
                  { href: "/library",         icon: "📚", label: "Library"         },
                  { href: "/friends",         icon: "👥", label: "Friends"            },
                  { href: "/profile",         icon: "👤", label: "Profile"       },
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

            
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}