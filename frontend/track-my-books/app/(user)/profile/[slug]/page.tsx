"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {Navbar} from "@/_components/Navbar";
import { Footer } from "@/_components/Footer";
import { useAuth } from "@/_context/AuthContext";
import { useRouter } from "next/navigation";
import { User } from "@/_components/User";
import { Review } from "@/_components/Review";
import { LibraryItem } from "@/_components/LibraryItem";
import { Activity } from "@/_components/Activity";


// Dostępne sekcje zakładek profilowych
const PROFILE_TABS = ["Recent", "Reviews", "Activity"];

function Stars({ n }: { n: number }) {
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= n ? "var(--gold)" : "rgba(139,131,120,0.25)", fontSize: 13 }}>★</span>
      ))}
    </span>
  );
}

export default function ProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
    // Wykorzystanie "use(params)", aby asynchronicznie wyciągnąć parametry trasy dynamicznej
    const { slug } = use(params);
    const { user, loading: authLoading, refreshUser } = useAuth();
    const router = useRouter();

    const [tab, setTab] = useState("Recent");
    const [editing, setEditing] = useState(false);
    const [userData, setUserData] = useState<User | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
    const [readingStatuses, setReadingStatuses] =   useState<LibraryItem[]>([]);

    // Blokada dla użytkowników niezalogowanych
    useEffect(() => {
        if (!authLoading && !user) router.push("/");
    }, [user, authLoading, router]);

    // Pobieranie profilu użytkownika na podstawie slug z adresu URL
    useEffect(() => {
        // Porównujemy zalogowanego użytkownika (user.username) ze slugiem w adresie URL
        // Jeśli to ta sama osoba, odblokowujemy przyciski edycji i ustawień (editing === true)
        if (user?.username === slug) setEditing(true);
        
        const getUserProfile = async () => {
            const res = await fetch(`http://localhost:5000/api/user/${slug}`);
            if (res.ok) {
                const data = await res.json();
                setUserData(data.user);
                setReviews(data.reviews);
                setRecentActivity(data.recentActivity);
                setReadingStatuses(data.libraryItems);
            }
            else if (res.status === 404) {
                // Jeśli profil w bazie nie istnieje, przekierowujemy na stronę główną
                router.push("/");
            }
    }
    getUserProfile();
  }, [slug, user]);

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

        <div className="profile-hero">
          <div className="profile-cover-bg" />
          <div className="profile-hero-content">
            <div className="profile-avatar-wrap">
              <div className="profile-avatar">{userData?.name.split(" ").map(n => n.charAt(0).toUpperCase()).join("").slice(0, 2)}</div>
              {editing && (
                <Link className="profile-edit-btn" href="/settings">
                  ✏️ Edit
                </Link>
              )}
            </div>
            <div className="profile-meta">
              <h1 className="profile-name">{userData?.name}</h1>
              <p className="profile-handle">@{userData?.username}</p>
              <p className="profile-bio">
                {userData?.bio}
              </p>
              
              {/* Mapowanie listy ulubionych gatunków, które w bazie zapisane są jako jeden string rozdzielany przecinkami */}
              <div className="profile-chips">
                {userData?.preferred_Genres.split(",").map(g => (
                  <span className="profile-chip" key={g}>
                    {g.trim()}
                  </span>
                ))}
              </div>
            </div>
            <div className="profile-stats-row">
              {[
                { val: readingStatuses.filter(s => s.status === "read").length,  lbl: "Read" },
                { val: readingStatuses.filter(s => s.status === "reading").length,   lbl: "Currently reading" },
                { val: readingStatuses.filter(s => s.status === "wishlist").length,   lbl: "On the list" },
                { val: reviews.length,   lbl: "Reviewed" },
              ].map(s => (
                <div className="profile-stat" key={s.lbl}>
                  <span className="profile-stat-val">{s.val}</span>
                  <span className="profile-stat-lbl">{s.lbl}</span>
                </div>
              ))}
            </div>
          </div>
        </div>


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

        {/* ZAKŁADKA 1: Podsumowanie */}
        {tab === "Recent" && (
          <div className="profile-content">
            <div className="stats-grid-2">
              <div className="stats-card">
                <h3 className="stats-card-title">Recently read</h3>
                <div className="profile-books-row">
                  {readingStatuses
                  .filter(s => s.status === "read")
                  // Sortujemy książki po dacie zakończenia czytania chronologicznie
                  .sort((a, b) => new Date(b.end_Date || "").getTime() - new Date(a.end_Date || "").getTime())
                  .slice(0, 5)
                  .map(b => {
                    const book = b.book.book;
                    return (
                    <div className="profile-book-thumb" key={book.default_Physical_Edition_Id}>
                      <img src={book.cached_Image.url} alt={book.title} />
                      <Stars n={book.rating} />
                    </div>
                  )}
                  )}
                </div>
              </div>


              <div className="stats-card">
                <h3 className="stats-card-title">Reading Goal for 2026</h3>
                <div className="goal-big">
                  <div className="goal-big-number">{readingStatuses.filter(s => s.status === "read").length} <span>/ {userData?.books_Goal}</span></div>
                  <div className="goal-track" style={{ marginTop: 12 }}>
                    <div className="goal-fill" style={{ width: `${Math.min(100, (readingStatuses.filter(s => s.status === "read").length / (userData?.books_Goal || 1)) * 100)}%` }} />
                  </div>
                  <p className="goal-sub" style={{ marginTop: 8 }}>{Math.round((readingStatuses.filter(s => s.status === "read").length / (userData?.books_Goal || 1)) * 100)}% annual goal · {(userData?.books_Goal || 0) - readingStatuses.filter(s => s.status === "read").length < 0 ? 0 : (userData?.books_Goal || 0) - readingStatuses.filter(s => s.status === "read").length} books remaining</p>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* ZAKŁADKA 2: Wykaz napisanych przez tego użytkownika recenzji */}
        {tab === "Reviews" && (
          <div className="profile-content">
            <div className="reviews-list">
              {reviews.map(r => (
                <div className="review-card" key={r.id}>
                  <img src={r.cached_Book?.book.cached_Image?.url} alt={r.cached_Book?.book.title} className="review-cover" />
                  <div className="review-body">
                    <div className="review-top-row">
                      <span className="review-book-title">{r.cached_Book?.book.title}</span>
                      <Stars n={r.rating} />
                      <span className="review-date">{new Date(r.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="review-text">"{r.review_Text}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}



        {/* ZAKŁADKA 3: Historia aktywności powiązanej bezpośrednio z profilem */}
        {tab === "Activity" && (
          <div className="profile-content">
            <div className="activity-feed">
              {recentActivity.map((a, i) => (
                <div className="activity-row" key={i}>
                  <span className="activity-icon">📝</span>
                  {/* Inteligentna personalizacja: jeśli przeglądamy własny profil, w strumieniu aktywności wyświetlamy zaimek "You" zamiast loginu */}
                  <span className="activity-text">{user?.username?.toLowerCase() === slug?.toLowerCase() ? "You" : slug} {a.activity_Type} {a.book_Title}</span>
                <span className="activity-time">{formatTimeAgo(a.timestamp)}</span>
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