"use client";

import { useState } from "react";
import {Navbar} from "@/_components/Navbar";
import { Footer } from "@/_components/Footer";

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
  { avatar: "MK", name: "Marta K.",  action: 'skończyła czytać', title: "Babel",             time: "2 godz. temu" },
  { avatar: "AS", name: "Anna S.",   action: 'oceniła',          title: "1984",               time: "wczoraj"      },
  { avatar: "PW", name: "Piotr W.",  action: 'dodał do listy',   title: "Dune Messiah",       time: "2 dni temu"   },
  { avatar: "TN", name: "Tomasz N.", action: 'napisał recenzję', title: "Foundation",         time: "3 dni temu"   },
  { avatar: "AS", name: "Anna S.",   action: 'zaczęła czytać',   title: "Sea of Tranquility", time: "4 dni temu"   },
];

const TABS = ["Moi znajomi", "Zaproszenia", "Propozycje", "Aktywność znajomych"];

export default function FriendsPage() {
  const [tab, setTab]         = useState("Moi znajomi");
  const [query, setQuery]     = useState("");
  const [sent, setSent]       = useState<number[]>([]);
  const [accepted, setAccepted] = useState<number[]>([]);
  const [declined, setDeclined] = useState<number[]>([]);

  return (
    <>
      <Navbar />
      <div className="inner-page">

        <div className="page-header">
          <div>
            <div className="page-eyebrow"><span className="eyebrow-line" />Społeczność<span className="eyebrow-line" /></div>
            <h1 className="page-title">Znajomi</h1>
            <p className="page-subtitle">{MY_FRIENDS.length} znajomych · {REQUESTS.length} zaproszeń</p>
          </div>
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="Szukaj użytkownika…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs" style={{ marginBottom: 32 }}>
          {TABS.map(t => (
            <button
              key={t}
              className={`profile-tab ${tab === t ? "active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t}
              {t === "Zaproszenia" && REQUESTS.length > 0 && (
                <span className="friends-notif-badge">{REQUESTS.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* MY FRIENDS */}
        {tab === "Moi znajomi" && (
          <div className="friends-big-grid">
            {MY_FRIENDS
              .filter(f => !query || f.name.toLowerCase().includes(query.toLowerCase()))
              .map(f => (
              <div className="friend-big-card" key={f.id}>
                <div className="fbc-top">
                  <div className="fbc-avatar-wrap">
                    <div className="fbc-avatar">{f.avatar}</div>
                    {f.online && <span className="fbc-online" />}
                  </div>
                  <div className="fbc-info">
                    <div className="fbc-name">{f.name}</div>
                    <div className="fbc-handle">{f.handle}</div>
                  </div>
                </div>
                <div className="fbc-stats">
                  <div className="fbc-stat">
                    <span className="fbc-stat-val">{f.books}</span>
                    <span className="fbc-stat-lbl">książek</span>
                  </div>
                  <div className="fbc-stat">
                    <span className="fbc-stat-val">{f.mutual}</span>
                    <span className="fbc-stat-lbl">wspólnych</span>
                  </div>
                </div>
                <div className="fbc-actions">
                  <a href="#" className="fbc-btn-ghost">Zobacz profil</a>
                  <button className="fbc-btn-remove">Usuń</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* REQUESTS */}
        {tab === "Zaproszenia" && (
          <div style={{ maxWidth: 560 }}>
            {REQUESTS.filter(r => !accepted.includes(r.id) && !declined.includes(r.id)).length === 0 ? (
              <div className="friends-empty">
                <span className="friends-empty-icon">📬</span>
                <p>Brak nowych zaproszeń</p>
              </div>
            ) : (
              REQUESTS.filter(r => !accepted.includes(r.id) && !declined.includes(r.id)).map(r => (
                <div className="request-row" key={r.id}>
                  <div className="fbc-avatar" style={{ width: 48, height: 48, fontSize: 15 }}>{r.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div className="fbc-name">{r.name}</div>
                    <div className="fbc-handle">{r.handle} · {r.mutual} wspólnych znajomych</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-gold" style={{ padding: "7px 18px", fontSize: 13 }} onClick={() => setAccepted(p => [...p, r.id])}>Akceptuj</button>
                    <button className="fbc-btn-remove" onClick={() => setDeclined(p => [...p, r.id])}>Odrzuć</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* SUGGESTIONS */}
        {tab === "Propozycje" && (
          <div className="friends-big-grid">
            {SUGGESTIONS.map(s => (
              <div className="friend-big-card" key={s.id}>
                <div className="fbc-top">
                  <div className="fbc-avatar-wrap">
                    <div className="fbc-avatar">{s.avatar}</div>
                  </div>
                  <div className="fbc-info">
                    <div className="fbc-name">{s.name}</div>
                    <div className="fbc-handle">{s.handle}</div>
                  </div>
                </div>
                <div className="fbc-reason">{s.reason}</div>
                <div className="fbc-stats">
                  <div className="fbc-stat">
                    <span className="fbc-stat-val">{s.books}</span>
                    <span className="fbc-stat-lbl">książek</span>
                  </div>
                  <div className="fbc-stat">
                    <span className="fbc-stat-val">{s.mutual}</span>
                    <span className="fbc-stat-lbl">wspólnych</span>
                  </div>
                </div>
                <div className="fbc-actions">
                  {sent.includes(s.id)
                    ? <span className="fbc-sent-label">✓ Wysłano zaproszenie</span>
                    : <button className="btn-gold" style={{ padding: "8px 0", fontSize: 13, width: "100%" }} onClick={() => setSent(p => [...p, s.id])}>+ Zaproś</button>
                  }
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ACTIVITY */}
        {tab === "Aktywność znajomych" && (
          <div className="friends-activity">
            {ACTIVITY.map((a, i) => (
              <div className="fbc-activity-row" key={i}>
                <div className="fbc-activity-avatar">{a.avatar}</div>
                <div className="fbc-activity-text">
                  <span className="fbc-activity-name">{a.name}</span>
                  {" "}<span className="fbc-activity-action">{a.action}</span>{" "}
                  <em className="fbc-activity-book">„{a.title}"</em>
                </div>
                <span className="activity-time">{a.time}</span>
              </div>
            ))}
          </div>
        )}

      </div>
      <Footer />
    </>
  );
}