"use client";

import { useState } from "react";
import {Navbar} from "@/_components/Navbar";
import { Footer } from "@/_components/Footer";

const TOPICS = [
  "Pytanie ogólne",
  "Problem techniczny",
  "Propozycja funkcji",
  "Współpraca",
  "Prasa i media",
  "Inne",
];

const FAQ = [
  { q: "Czy Track My Books jest darmowy?",              a: "Wszystkie funkcje są całkowicie bezpłatne." },
  { q: "Jak działa system rekomendacji?",               a: "Analizujemy Twoje oceny, gatunki i tempo czytania. Im więcej używasz aplikacji, tym trafniejsze stają się propozycje." },
  { q: "Czy mogę importować dane z Goodreads?",         a: "Chwilowo nie, ale planujemy tę funkcję w przyszłości." },
  { q: "Czy jest aplikacja mobilna?",                   a: "Nie, ale planujemy ją w przyszłości." },
  { q: "Jak długo trwa odpowiedź na zgłoszenie?",       a: "Staramy się odpowiadać w ciągu 24 godzin w dni robocze. Pilne sprawy techniczne rozwiązujemy szybciej." },
];


export default function ContactPage() {
  const [topic, setTopic]     = useState(TOPICS[0]);
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent]       = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSend = () => {
    if (!name || !email || !message) return;
    setSent(true);
  };

  const emailValid = (() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))();

  return (
    <>
      <Navbar />
      <div className="inner-page">

        <div className="page-header">
          <div>
            <div className="page-eyebrow"><span className="eyebrow-line" />Pomoc<span className="eyebrow-line" /></div>
            <h1 className="page-title">Kontakt</h1>
            <p className="page-subtitle">Jesteśmy tu dla Ciebie. Odpiszemy w ciągu 24 godzin.</p>
          </div>
        </div>

        <div className="contact-grid">

          {/* LEFT — form */}
          <div>
            {sent ? (
              <div className="contact-success">
                <span className="contact-success-icon">✓</span>
                <h3>Wiadomość wysłana!</h3>
                <p>Odezwiemy się na adres <strong>{email}</strong> w ciągu 24 godzin.</p>
                <button className="btn-ghost" style={{ marginTop: 20 }} onClick={() => { setSent(false); setName(""); setEmail(""); setMessage(""); }}>
                  Wyślij kolejną
                </button>
              </div>
            ) : (
              <div className="stats-card" style={{ padding: 32 }}>
                <h3 className="stats-card-title">Napisz do nas</h3>

                <div className="field" style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 7 }}>Temat</label>
                  <select
                    className="sort-select"
                    style={{ width: "100%", padding: "12px 16px" }}
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                  >
                    {TOPICS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>

                <div className="contact-row-2">
                  <div className={`field ${focused === "name" ? "active" : ""}`}>
                    <label>Imię i nazwisko</label>
                    <div className="input-wrap">
                      <input type="text" placeholder="Jan Kowalski" value={name}
                        onChange={e => setName(e.target.value)}
                        onFocus={() => setFocused("name")} onBlur={() => setFocused(null)} />
                    </div>
                  </div>
                  <div className={`field ${focused === "email" ? "active" : ""}`}>
                    <label>Adres e-mail</label>
                    <div className="input-wrap">
                      <input type="email" placeholder="twoj@email.com" value={email}
                        onChange={e => setEmail(e.target.value)}
                        onFocus={() => setFocused("email")} onBlur={() => setFocused(null)} />
                    </div>
                  </div>
                </div>

                <div className={`field ${focused === "msg" ? "active" : ""}`}>
                  <label>Wiadomość</label>
                  <textarea
                    className="contact-textarea"
                    placeholder="Opisz szczegółowo swoje pytanie lub problem…"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onFocus={() => setFocused("msg")}
                    onBlur={() => setFocused(null)}
                    rows={6}
                    style={{ borderColor: focused === "msg" ? "rgba(201,168,76,0.5)" : "" }}
                  />
                </div>

                <button
                  className="btn-submit"
                  style={{ marginTop: 8 }}
                  disabled={!name || !email || !message || !emailValid}
                  onClick={handleSend}
                >
                  Wyślij wiadomość →
                </button>
                {!emailValid && email ? (  
                  <div style={{ marginTop: 8, color: "#e05252", fontSize: 12 }}>
                    Proszę podać poprawny adres e-mail.
              </div>
                ) : null}
              </div>
            )}
          </div>

          {/* RIGHT — info + FAQ */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Contact cards */}
            <div className="contact-info-cards">
              {[
                { icon: "📞", label: "Telefon",       val: "+48 123 456 789",       sub: "Pon-Pt, 9:00-17:00" },
                { icon: "✉️", label: "E-mail",         val: "hello@trackmybooks.pl",     sub: "Odpowiadamy w 24h" }
              ].map(c => (
                <div className="contact-info-card" key={c.label}>
                  <span className="contact-info-icon">{c.icon}</span>
                  <div>
                    <div className="contact-info-label">{c.label}</div>
                    <div className="contact-info-val">{c.val}</div>
                    <div className="contact-info-sub">{c.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* FAQ */}
            <div className="stats-card" style={{ padding: 28 }}>
              <h3 className="stats-card-title">Najczęstsze pytania</h3>
              <div className="faq-list">
                {FAQ.map((item, i) => (
                  <div className="faq-item" key={i}>
                    <button
                      className={`faq-q ${openFaq === i ? "open" : ""}`}
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    >
                      <span>{item.q}</span>
                      <span className="faq-chevron">{openFaq === i ? "−" : "+"}</span>
                    </button>
                    {openFaq === i && <p className="faq-a">{item.a}</p>}
                  </div>
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