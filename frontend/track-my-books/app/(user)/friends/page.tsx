"use client";

import { useEffect, useState } from "react";
import {Navbar} from "@/_components/Navbar";
import { Footer } from "@/_components/Footer";
import { ToastContainer } from "@/_components/Toast";
import { FriendsData } from "@/_components/Friends";
import { useToast } from "@/_hooks/useToast";
import { useAuth } from "@/_context/AuthContext";
import { useRouter } from "next/navigation";

const MY_FRIENDS = [
  { id: 1,  name: "Marta Kowalska",   handle: "@marta.czyta",    avatar: "MK", books: 34, mutual: 5,  online: true  },
  { id: 2,  name: "Piotr Wiśniewski", handle: "@piotr_reads",    avatar: "PW", books: 18, mutual: 3,  online: false },
  { id: 3,  name: "Anna Szymańska",   handle: "@ania.biblioteka", avatar: "AS", books: 61, mutual: 8,  online: true  },
  { id: 4,  name: "Tomasz Nowak",     handle: "@tomek_sci_fi",   avatar: "TN", books: 27, mutual: 2,  online: false },
];

const SUGGESTIONS = [
  { id: 5,  name: "Kasia Dąbrowska",  handle: "@kasia.fantasy",  avatar: "KD", books: 45, mutual: 6,  reason: "Czyta podobne gatunki" },
  { id: 6,  name: "Marek Jabłoński",  handle: "@marek.klasyka",  avatar: "MJ", books: 92, mutual: 4,  reason: "Znajomy Marty K." },
  { id: 7,  name: "Zosia Wróbel",     handle: "@zosia_books",    avatar: "ZW", books: 23, mutual: 1,  reason: "W Twojej okolicy" },
  { id: 8,  name: "Bartek Lewandowski",handle:"@bartek.sci",      avatar: "BL", books: 38, mutual: 7,  reason: "Polubił te same książki" },
];

const REQUESTS = [
  { id: 9,  name: "Ola Michalska",    handle: "@ola.reads",      avatar: "OM", books: 15, mutual: 2 },
  { id: 10, name: "Rafał Kaczmarek",  handle: "@rafal.thriller",  avatar: "RK", books: 29, mutual: 5 },
];

const ACTIVITY = [
  { avatar: "MK", name: "Marta K.",  action: 'finished reading', title: "Babel",             time: "2 hours ago" },
  { avatar: "AS", name: "Anna S.",   action: 'rated',          title: "1984",               time: "yesterday"      },
  { avatar: "PW", name: "Piotr W.",  action: 'added to list',   title: "Dune Messiah",       time: "2 days ago"   },
  { avatar: "TN", name: "Tomasz N.", action: 'wrote review', title: "Foundation",         time: "3 days ago"   },
  { avatar: "AS", name: "Anna S.",   action: 'started reading',   title: "Sea of Tranquility", time: "4 days ago"   },
];

const TABS = ["My friends", "Invitations", "Pending", "Friends' Activity"];


export default function FriendsPage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();

  const [tab, setTab]         = useState("My friends");
  const [query, setQuery]     = useState("");
  const [sent, setSent]       = useState<number[]>([]);
  const [accepted, setAccepted] = useState<number[]>([]);
  const [declined, setDeclined] = useState<number[]>([]);
  const [friendsData, setFriendsData] = useState<FriendsData[]>([]);

  const [numberOfInvites, setNumberOfInvites] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) router.push("/");
  }, [user, authLoading, router]);

  useEffect(() => {
    setNumberOfInvites(friendsData.filter(f => f.friendshipStatus === "pending").length);

  }, [friendsData]);

  useEffect(() => {
    const getFriendsData = async () => {
      const res = await fetch("http://localhost:5000/api/user/getFriendsData", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"},
        credentials: "include"
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
      await refreshUser?.();
    } else {
      const message = await response.text();
      addToast(`Failed to send invitation: ${message}`, "error");
    }
  };

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
      await refreshUser?.();
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

    {tab === "Friends' Activity" && (
      <div className="friends-activity">
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
          .slice(0, 10)
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