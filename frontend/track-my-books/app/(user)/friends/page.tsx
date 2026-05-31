"use client";

import { useEffect, useState } from "react";
import {Navbar} from "@/_components/Navbar";
import { Footer } from "@/_components/Footer";
import { ToastContainer } from "@/_components/Toast";
import { FriendsData } from "@/_components/Friends";
import { useToast } from "@/_hooks/useToast";
import { useAuth } from "@/_context/AuthContext";
import { useRouter } from "next/navigation";

// Definicja zakładek nawigacyjnych w panelu społecznościowym
const TABS = ["My friends", "Invitations", "Pending", "Friends' Activity"];


export default function FriendsPage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();

  const [tab, setTab]         = useState("My friends");
  const [query, setQuery]     = useState("");
  const [friendsData, setFriendsData] = useState<FriendsData[]>([]);


  // Przekierowanie niezalogowanych na stronę główną
  useEffect(() => {
    if (!authLoading && !user) router.push("/");
  }, [user, authLoading, router]);

  // Pobieranie kompletnych informacji społecznościowych: znajomych, zaproszeń oraz ich aktywności
  useEffect(() => {
    const getFriendsData = async () => {
      const res = await fetch("http://localhost:5000/api/user/getFriendsData", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"},
        credentials: "include" // Przesyłanie ciasteczka HttpOnly z tokenem JWT
      });
      if (res.ok) {
        const data = await res.json();
        setFriendsData(data);
      } else {
        console.error("Failed to fetch friends data");
      }
    }
    getFriendsData();
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

  // Funkcja wysyłająca zaproszenie do innego użytkownika na podstawie nazwy profilu
  const sendInvitation = async() => {
    if (!query) {
      addToast("Please enter a username", "warning");
      return;
    }
    else if (query === user?.username) {
      addToast("You cannot invite yourself", "error");
      return;
    }
    const response = await fetch("http://localhost:5000/api/user/sendInvitation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ userUsername: user?.username, friendUsername: query })
    });
    if (response.ok) {
      addToast("Invitation sent!", "success");
      setQuery("");
      await refreshUser?.(); // Odświeżenie sesji użytkownika, aby natychmiast zaktualizować interfejs
    } else {
      const message = await response.text();
      addToast(`Failed to send invitation: ${message}`, "error");
    }
  };

  // Reakcja na zaproszenie przychodzące
  const respondToInvitation = async (friendUsername: string, accept: boolean) => {
    const response = await fetch("http://localhost:5000/api/user/respondToInvitation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ userUsername: user?.username, friendUsername, accept })
    });
    if (response.ok) {
      addToast(`Invitation ${accept ? "accepted" : "declined"}!`, "success");
      await refreshUser?.(); // Aktualizacja stanu aplikacji
    } else {
      const message = await response.text();
      addToast(`Failed to answer invitation: ${message}`, "error");
    }
  };

  const removeFriend = async (friendUsername: string) => {
    const response = await fetch("http://localhost:5000/api/user/removeFriend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ userUsername: user?.username, friendUsername })
    });
    if (response.ok) {
      addToast("Friend removed!", "success");
      await refreshUser?.();
    } else {
      const message = await response.text();
      addToast(`Failed to remove friend: ${message}`, "error");
    }
  };

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
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="inner-page">

        <div className="page-header">
          <div>
            <div className="page-eyebrow"><span className="eyebrow-line" />Community<span className="eyebrow-line" /></div>
            <h1 className="page-title">Friends</h1>
            {/* Szybkie wyliczenie liczby znajomych oraz oczekujących zaproszeń przy użyciu filtrów tablicy */}
            <p className="page-subtitle">{friendsData.filter(f => f.friendshipStatus === "accepted").length} friends · {friendsData.filter(f => f.friendshipStatus === "pending" && !f.isInitiator).length} invitations</p>
          </div>
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="Search user…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") sendInvitation() }}
            />
          </div>
        </div>

        {/* Dynamiczny pasek zakładek profilowych ze wskaźnikami liczby zaproszeń */}
        <div className="profile-tabs" style={{ marginBottom: 32 }}>
          {TABS.map(t => (
            <button
              key={t}
              className={`profile-tab ${tab === t ? "active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t}
              {t === "Invitations" && friendsData.filter(f => f.friendshipStatus === "pending" && !f.isInitiator).length > 0 && (
                <span className="friends-notif-badge">{friendsData.filter(f => f.friendshipStatus === "pending" && !f.isInitiator).length}</span>
              )}
            </button>
          ))}
        </div>

        {/* ZAKŁADKA 1: Lista zaakceptowanych znajomych */}
        {tab === "My friends" && (
          <div className="friends-big-grid">
            {friendsData.filter(f => f.friendshipStatus === "accepted")
              .map(f => (
              <div className="friend-big-card" key={f.username}>
                <div className="fbc-top">
                  <div className="fbc-avatar-wrap">
                    <div className="fbc-avatar">{f.name.split(" ").map(n => n.charAt(0).toUpperCase()).join("").slice(0, 2)}</div>
                  </div>
                  <div className="fbc-info">
                    <div className="fbc-name">{f.name}</div>
                    <div className="fbc-handle">{f.username}</div>
                  </div>
                </div>
                <div className="fbc-stats">
                  <div className="fbc-stat">
                    <span className="fbc-stat-val">{f.readingStatuses.filter(s => s.status === "read").length}</span>
                    <span className="fbc-stat-lbl">books</span>
                  </div>
                  <div className="fbc-stat">
                    <span className="fbc-stat-val">{f.reviews.length}</span>
                    <span className="fbc-stat-lbl">reviews</span>
                  </div>
                </div>
                <div className="fbc-actions">
                  <a href={`/profile/${f.username}`} className="fbc-btn-ghost">View Profile</a>
                  <button className="fbc-btn-remove" onClick={() => removeFriend(f.username)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ZAKŁADKA 2: Zaproszenia przychodzące */}
        {tab === "Invitations" && (
          <div style={{ maxWidth: 560 }}>
            {(friendsData.filter(f => f.friendshipStatus === "pending" && !f.isInitiator).length === 0 ) ? (
              <div className="friends-empty">
                <span className="friends-empty-icon">📬</span>
                <p>No new invitations</p>
              </div>
            ) : (
              friendsData.filter(f => f.friendshipStatus === "pending" && !f.isInitiator).map(f => (
                <div className="request-row" key={f.username}>
                  <div className="fbc-avatar" style={{ width: 48, height: 48, fontSize: 15 }}>{f.name.split(" ").map(n => n.charAt(0).toUpperCase()).join("").slice(0, 2)}</div>
                  <div style={{ flex: 1 }}>
                    <div className="fbc-name">{f.name}</div>
                    <div className="fbc-handle">{f.username} · {f.reviews.length} reviews</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-gold" style={{ padding: "7px 18px", fontSize: 13 }} onClick={() => respondToInvitation(f.username, true)}>Accept</button>
                    <button className="fbc-btn-remove" onClick={() => respondToInvitation(f.username, false)}>Decline</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ZAKŁADKA 3: Zaproszenia wysłane, oczekujące na odpowiedź znajomego */}
        {tab === "Pending" && (
          <div className="friends-big-grid">
            {friendsData.filter(f => f.friendshipStatus === "pending" && f.isInitiator).map(f => (
              <div className="friend-big-card" key={f.username}>
                <div className="fbc-top">
                  <div className="fbc-avatar-wrap">
                    <div className="fbc-avatar">{f.name.split(" ").map(n => n.charAt(0).toUpperCase()).join("").slice(0, 2)}</div>
                  </div>
                  <div className="fbc-info">
                    <div className="fbc-name">{f.name}</div>
                    <div className="fbc-handle">{f.username}</div>
                  </div>
                </div>
                <div className="fbc-stats">
                  <div className="fbc-stat">
                    <span className="fbc-stat-val">{f.readingStatuses.filter(s => s.status === "read").length}</span>
                    <span className="fbc-stat-lbl">books</span>
                  </div>
                  <div className="fbc-stat">
                    <span className="fbc-stat-val">{f.reviews.length}</span>
                    <span className="fbc-stat-lbl">reviews</span>
                  </div>
                </div>
                <div className="fbc-actions">
                  <button className="btn-gold" style={{ padding: "8px 0", fontSize: 13, width: "100%" }} onClick={() => respondToInvitation(f.username, false)}>Cancel Invitation</button>
                </div>
              </div>
            ))}
          </div>
        )}

    {/* ZAKŁADKA 4: Zbiorczy, chronologiczny strumień aktywności wszystkich znajomych */}
    {tab === "Friends' Activity" && (
      <div className="friends-activity">
        {friendsData
          .filter(f => f.friendshipStatus === "accepted")
          // flatMap łączy listy pojedynczych tablic aktywności znajomych w jedną, płaską tablicę nadrzędną
          .flatMap(f => {
            return f.activities.map(a => ({
              ...a,
              friendName: f.name || f.username,
              friendUsername: f.username
            }));
          })
          // Sortowanie całej osi czasu od najświeższych wpisów (chronologia)
          .sort((b, c) => new Date(c.timestamp).getTime() - new Date(b.timestamp).getTime())
          .slice(0, 10) // Wyświetlamy maksymalnie 10 ostatnich wydarzeń
          .map((a, i) => (
            <div className="fbc-activity-row" key={i}>
              <div className="fbc-activity-avatar">
                {a.friendName.split(" ").map(n => n.charAt(0).toUpperCase()).join("").slice(0, 2)}
              </div>
              
              <div className="fbc-activity-text">
                <span className="fbc-activity-name">{a.friendUsername}</span>
                {" "}<span className="fbc-activity-action">{a.activityType}</span>{" "}
                <em className="fbc-activity-book">„{a.bookTitle}“</em>
              </div>

              <span className="activity-time">{formatTimeAgo(a.timestamp)}</span>
            </div>
          ))}
      </div>
    )}

      </div>
      <Footer />
    </>
  );
}