"use client";

import { useState } from "react";
import {Navbar} from "@/_components/Navbar";
import { Footer } from "@/_components/Footer";

const TOPICS = [
  "General Question",
  "Technical Issue",
  "Feature Request",
  "Partnership",
  "Press and Media",
  "Other",
];

const FAQ = [
  { q: "Is Track My Books free?",                     a: "All features are completely free." },
  { q: "How does the recommendation system work?",    a: "We analyze your ratings, genres, and reading pace. The more you use the app, the more accurate the suggestions become." },
  { q: "Can I import data from Goodreads?",           a: "Not yet, but we plan to add this feature in the future." },
  { q: "Is there a mobile app?",                      a: "Not yet, but we plan to develop one in the future." },
  { q: "How long does it take to get a response?",    a: "We aim to respond within 24 hours on business days. Urgent technical issues are resolved more quickly." },
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
            <div className="page-eyebrow"><span className="eyebrow-line" />Help<span className="eyebrow-line" /></div>
            <h1 className="page-title">Contact Us</h1>
            <p className="page-subtitle">We're here for you. We'll get back to you within 24 hours.</p>
          </div>
        </div>

        <div className="contact-grid">

          <div>
            {sent ? (
              <div className="contact-success">
                <span className="contact-success-icon">✓</span>
                <h3>Message sent!</h3>
                <p>We'll get back to you at <strong>{email}</strong> within 24 hours.</p>
                <button className="btn-ghost" style={{ marginTop: 20 }} onClick={() => { setSent(false); setName(""); setEmail(""); setMessage(""); }}>
                  Send another message
                </button>
              </div>
            ) : (
              <div className="stats-card" style={{ padding: 32 }}>
                <h3 className="stats-card-title">Write to us</h3>

                <div className="field" style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 7 }}>Topic</label>
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
                    <label>Name and surname</label>
                    <div className="input-wrap">
                      <input type="text" placeholder="John Doe" value={name}
                        onChange={e => setName(e.target.value)}
                        onFocus={() => setFocused("name")} onBlur={() => setFocused(null)} />
                    </div>
                  </div>
                  <div className={`field ${focused === "email" ? "active" : ""}`}>
                    <label>Email address</label>
                    <div className="input-wrap">
                      <input type="email" placeholder="your@email.com" value={email}
                        onChange={e => setEmail(e.target.value)}
                        onFocus={() => setFocused("email")} onBlur={() => setFocused(null)} />
                    </div>
                  </div>
                </div>

                <div className={`field ${focused === "msg" ? "active" : ""}`}>
                  <label>Message</label>
                  <textarea
                    className="contact-textarea"
                    placeholder="Describe your question or problem in detail…"
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
                  Send message →
                </button>
                {!emailValid && email ? (  
                  <div style={{ marginTop: 8, color: "#e05252", fontSize: 12 }}>
                    Please enter a valid email address.
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            <div className="contact-info-cards">
              {[
                { icon: "📞", label: "Phone",       val: "+48 123 456 789",       sub: "Mon-Fri, 9:00-17:00" },
                { icon: "✉️", label: "Email",         val: "hello@trackmybooks.pl",     sub: "We respond within 24h" }
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

            <div className="stats-card" style={{ padding: 28 }}>
              <h3 className="stats-card-title">Most Common Questions</h3>
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