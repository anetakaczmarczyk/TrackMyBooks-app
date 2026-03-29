"use client";

import { use, useState } from "react";
import {Navbar} from "@/_components/Navbar";
import { Footer } from "@/_components/Footer";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const PRIVACY_SECTIONS = [
  {
    title: "1. Administrator danych",
    content: `Administratorem Twoich danych osobowych jest Track My Books sp. z o.o. z siedzibą w Krakowie, ul. Literacka 12/4, 00-000 Kraków (dalej: "Track My Books").

W sprawach dotyczących ochrony danych możesz skontaktować się z naszym Inspektorem Ochrony Danych pod adresem: dpo@trackmybooks.pl.`,
  },
  {
    title: "2. Jakie dane zbieramy",
    content: `Dane podane przez Ciebie: imię i nazwisko, pseudonim, adres e-mail, hasło (przechowywane w formie zahashowanej).

Dane generowane przez Twoje korzystanie z Serwisu: historia czytania, oceny, recenzje, listy lektur, aktywność w Serwisie.

Dane techniczne: adres IP, identyfikator urządzenia, typ przeglądarki, system operacyjny, znaczniki czasu.

Nie zbieramy szczególnych kategorii danych osobowych (np. danych o zdrowiu, przekonaniach religijnych, orientacji seksualnej).`,
  },
  {
    title: "3. Cele i podstawy przetwarzania",
    content: `Świadczenie usług (art. 6 ust. 1 lit. b RODO) – rejestracja, logowanie, personalizacja konta, historia czytania.

Uzasadniony interes Track My Books (art. 6 ust. 1 lit. f RODO) – bezpieczeństwo, zapobieganie nadużyciom, analiza statystyczna w celu ulepszania Serwisu, rekomendacje.

Zgoda użytkownika (art. 6 ust. 1 lit. a RODO) – marketing e-mailowy, pliki cookie analityczne i marketingowe.

Obowiązek prawny (art. 6 ust. 1 lit. c RODO) – przechowywanie danych transakcyjnych wymagane przez przepisy podatkowe i rachunkowe.`,
  },
  {
    title: "4. Udostępnianie danych",
    content: `Twoje dane udostępniamy wyłącznie: zaufanym podwykonawcom (hosting: AWS, analityka: własne serwery EU) na podstawie umów powierzenia; organom państwowym, gdy wymagają tego przepisy prawa; innym użytkownikom – wyłącznie dane widoczne publicznie na Twoim profilu.

Nigdy nie sprzedajemy Twoich danych osobowych.`,
  },
  {
    title: "5. Twoje prawa",
    content: `Masz prawo do: dostępu do swoich danych i otrzymania ich kopii; sprostowania nieprawidłowych lub niepełnych danych; usunięcia danych („prawo do bycia zapomnianym"); ograniczenia przetwarzania; przenoszenia danych; wniesienia sprzeciwu wobec przetwarzania opartego na uzasadnionym interesie; cofnięcia zgody w dowolnym momencie (bez wpływu na zgodność z prawem wcześniejszego przetwarzania); wniesienia skargi do Prezesa UODO.

Aby skorzystać z tych praw, napisz na: privacy@trackmybooks.pl.`,
  },
  {
    title: "6. Okres przechowywania danych",
    content: `Dane konta przechowujemy przez czas trwania umowy o świadczenie usług oraz przez 3 lata po jej zakończeniu (przedawnienie roszczeń).

Dane transakcyjne przez 5 lat (obowiązki podatkowe).

Logi techniczne przez 90 dni.

Możesz usunąć konto w dowolnym momencie z poziomu Ustawień, co spowoduje usunięcie danych z wyjątkiem tych, które musimy zachować ze względu na obowiązki prawne.`,
  },
];

const COOKIE_TYPES = [
  {
    name: "Niezbędne",
    icon: "🔒",
    desc: "Wymagane do działania Serwisu. Nie można ich wyłączyć.",
    examples: ["session_id", "csrf_token", "consent"],
    required: true,
  },
  {
    name: "Analityczne",
    icon: "📊",
    desc: "Pomagają nam rozumieć, jak korzystasz z Serwisu (własna analityka, brak Google Analytics).",
    examples: ["_bt_analytics", "_bt_session_start"],
    required: false,
  },
  {
    name: "Funkcjonalne",
    icon: "⚙️",
    desc: "Zapamiętują Twoje preferencje (motyw, język, sortowanie).",
    examples: ["_bt_prefs", "_bt_theme"],
    required: false,
  },
];

export default function PrivacyPage() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"privacy" | "cookies">(searchParams.get("tab") === "cookies" ? "cookies" : "privacy");
  if (searchParams.get("tab") != tab) {
    setTab(searchParams.get("tab") === "cookies" ? "cookies" : "privacy");
  }

  const [cookiePrefs, setCookiePrefs] = useState<Record<string, boolean>>({
    Analityczne: true, Funkcjonalne: true, Marketingowe: false,
  });

  return (
    <>
      <Navbar />
      <div className="inner-page legal-page">
        <div className="legal-header">
          <div className="page-eyebrow"><span className="eyebrow-line" />Dokumenty prawne<span className="eyebrow-line" /></div>
          <h1 className="page-title">Prywatność & Cookies</h1>
          <p className="page-subtitle">Ostatnia aktualizacja: 1 marca 2026 r.</p>
        </div>

        {/* Doc tab switcher */}
        <div className="legal-doc-tabs">
          <Link href="/privacy?tab=privacy" 
            className={`legal-doc-tab ${tab === "privacy" ? "active" : ""}`}
          >
            🔐 Polityka prywatności
          </Link>
          <Link href="/privacy?tab=cookies" 
            className={`legal-doc-tab ${tab === "cookies" ? "active" : ""}`}
          >
            🍪 Polityka cookies
          </Link>
        </div>

        {/* PRIVACY */}
        {tab === "privacy" && (
          <div className="legal-layout">
            <aside className="legal-toc">
              <div className="legal-toc-title">Spis treści</div>
              <ul className="legal-toc-list">
                {PRIVACY_SECTIONS.map(s => (
                  <li key={s.title}><a href={`#${s.title}`} className="legal-toc-link">{s.title}</a></li>
                ))}
              </ul>
            </aside>
            <div className="legal-content">
              {PRIVACY_SECTIONS.map(s => (
                <section className="legal-section" key={s.title} id={s.title}>
                  <h2 className="legal-section-title">{s.title}</h2>
                  <div className="legal-body">
                    {s.content.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}
                  </div>
                </section>
              ))}
              <div className="legal-footer-note">
                Pytania dotyczące prywatności? <strong>privacy@trackmybooks.pl</strong>
              </div>
            </div>
          </div>
        )}

        {/* COOKIES */}
        {tab === "cookies" && (
          <div className="cookies-layout">
            <div className="stats-card" style={{ padding: 28, marginBottom: 20 }}>
              <h3 className="stats-card-title">Czym są pliki cookie?</h3>
              <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7 }}>
                Pliki cookie to małe pliki tekstowe zapisywane na Twoim urządzeniu przez przeglądarkę.
                Używamy ich, żeby Serwis działał poprawnie, pamiętał Twoje preferencje
                i pomagał nam go ulepszać. Poniżej możesz zarządzać swoją zgodą.
              </p>
            </div>

            <div className="cookies-cards">
              {COOKIE_TYPES.map(c => (
                <div className="cookie-card" key={c.name}>
                  <div className="cookie-card-top">
                    <div className="cookie-card-left">
                      <span className="cookie-icon">{c.icon}</span>
                      <div>
                        <div className="cookie-name">{c.name}</div>
                        <div className="cookie-desc">{c.desc}</div>
                      </div>
                    </div>
                  </div>
                  <div className="cookie-examples">
                    {c.examples.map(e => <code key={e} className="cookie-name-tag">{e}</code>)}
                  </div>
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