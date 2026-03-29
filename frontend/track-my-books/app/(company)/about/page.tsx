import { Footer } from "@/_components/Footer";
import {Navbar} from "@/_components/Navbar";
import Link from "next/link";


const TEAM = [
  { name: "Aleksandra Wiśniewska", role: "CEO & Co-founder",    avatar: "AW", bio: "Miłośniczka literatury i UX designu. Wcześniej Product Manager w Allegro." },
  { name: "Michał Dąbrowski",      role: "CTO & Co-founder",    avatar: "MD", bio: "Full-stack developer z pasją do budowania produktów, które ludzie naprawdę kochają." },
  { name: "Karolina Nowak",        role: "Head of Design",       avatar: "KN", bio: "Projektuje z myślą o emocjach użytkownika. Autorka naszego systemu designu." },
  { name: "Tomasz Jabłoński",      role: "Lead Engineer",        avatar: "TJ", bio: "Architekt backendu, fan Haskella i kawy specialty." },
  { name: "Marta Zielińska",       role: "Content & Community",  avatar: "MZ", bio: "Kuratorka rekomendacji i głos naszej społeczności. Przeczytała ponad 400 książek." },
  { name: "Bartosz Kowalczyk",     role: "Growth & Marketing",   avatar: "BK", bio: "Łączy dane z kreatywnością. Wcześniej w Booksy i Brainly." },
];

const VALUES = [
  { icon: "📖", title: "Czytanie jako styl życia",    desc: "Wierzymy, że czytanie nie jest hobby — to sposób na bycie bardziej ludzkim." },
  { icon: "🌿", title: "Bez rozpraszaczy",             desc: "Żadnych reklam, żadnego hałasu. Tylko Ty i Twoje książki." },
  { icon: "🤝", title: "Społeczność ponad algorytmy", desc: "Najlepsze rekomendacje wciąż pochodzą od prawdziwych czytelników." },
  { icon: "✦",  title: "Jakość bez kompromisów",      desc: "Każdy detal ma znaczenie — od interfejsu po kurację treści." },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <div className="inner-page">

        {/* HERO */}
        <div className="about-hero">
          <div className="about-hero-bg" />
          <div className="about-hero-content">
            <div className="page-eyebrow"><span className="eyebrow-line" />Nasza historia<span className="eyebrow-line" /></div>
            <h1 className="about-h1">Zbudowaliśmy aplikację,<br />której <em>sami szukaliśmy.</em></h1>
            <p className="about-lead">
              Track My Books to narzędzie stworzone przez czytelnika dla czytelników.
              Nie chcieliśmy kolejnego serwisu z recenzjami — chcieliśmy towarzysza
              czytelniczej podróży, który naprawdę rozumie, dlaczego czytamy.
            </p>
          </div>
        </div>


        {/* VALUES */}
        <section className="about-section">
          <div className="about-section-eyebrow">Nasze wartości</div>
          <h2 className="about-section-title">Dlaczego robimy to inaczej</h2>
          <div className="values-grid">
            {VALUES.map(v => (
              <div className="value-card" key={v.title}>
                <span className="value-icon">{v.icon}</span>
                <h3 className="value-title">{v.title}</h3>
                <p className="value-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="about-cta">
          <div className="about-cta-bg" />
          <div className="about-cta-content">
            <h2>Dołącz do nas</h2>
            <p>Czekamy na Ciebie.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/signup" className="btn-gold btn-lg">Załóż konto za darmo</Link>
              <Link href="/contact" className="btn-ghost btn-lg">Skontaktuj się</Link>
            </div>
          </div>
        </div>

      </div>
      <Footer />
    </>
  );
}