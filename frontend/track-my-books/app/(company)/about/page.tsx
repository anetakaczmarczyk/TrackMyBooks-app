import { Footer } from "@/_components/Footer";
import {Navbar} from "@/_components/Navbar";
import Link from "next/link";


const VALUES = [
  { icon: "📖", title: "Reading as a lifestyle",    desc: "We believe that reading is not a hobby — it's a way to be more human." },
  { icon: "🌿", title: "Free from distractions",             desc: "No ads, no noise. Just you and your books." },
  { icon: "🤝", title: "Community beyond algorithms", desc: "The best recommendations still come from real readers." },
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
            <div className="page-eyebrow"><span className="eyebrow-line" />Our Story<span className="eyebrow-line" /></div>
            <h1 className="about-h1">We built an app,<br />which we ourselves were looking for.</h1>
            <p className="about-lead">
              Track My Books is a tool created by readers for readers.
              We didn't want another review-based service — we wanted a companion
              for the reading journey that truly understands why we read.
            </p>
          </div>
        </div>


        {/* VALUES */}
        <section className="about-section">
          <div className="about-section-eyebrow">Our Values</div>
          <h2 className="about-section-title">Why We Do It Differently</h2>
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
            <h2>Join Us</h2>
            <p>We're waiting for you.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/signup" className="btn-gold btn-lg">Sign Up for Free</Link>
              <Link href="/contact" className="btn-ghost btn-lg">Contact Us</Link>
            </div>
          </div>
        </div>

      </div>
      <Footer />
    </>
  );
}