import { Footer } from "@/_components/Footer";
import {Navbar} from "@/_components/Navbar";
import Link from "next/link";
const SECTIONS = [
  {
    title: "1. General Provisions",
    content: `This Terms of Service defines the rules for using the Track My Books service, available at trackmybooks.pl.

The operator of the Service is Track My Books sp. z o.o. with its registered office in Krakow, at 12/4 Literacka Street, 00-000 Krakow, registered in the National Court Register under KRS number 0000000000.

Using the Service means accepting this Terms of Service. If you do not agree with its provisions, please stop using the Service.`,
  },
  {
    title: "2. Definitions",
    content: `Service – the Track My Books website available at trackmybooks.pl.

User – any natural person with full legal capacity who has registered an Account with the Service.

Account – a set of resources and permissions assigned to a User within the Service, identified by an email address and protected by a password.

User Content – any materials posted by a User on the Service, including reviews, ratings and reading lists.`,
  },
  {
    title: "3. Registration and Account",
    content: `Registration in the Service is voluntary and free of charge. Users may register one Account.

Users are obligated to provide truthful information during registration and to update it in case of changes.

Users are solely responsible for the confidentiality of their access data. Any unauthorized access to an Account must be reported to Track My Books immediately.

Track My Books reserves the right to suspend or delete Accounts in case of Regulamin violations.`,
  },
  {
    title: "4. Rules for Using the Service",
    content: `Users are required to use the Service in compliance with applicable laws, social norms, and principles of social coexistence.

Specifically, it is prohibited to: post unlawful content, offensive content, or content that infringes upon the intellectual property rights of third parties; engage in spam or phishing activities; attempt unauthorized access to the Service's information systems; or automatically download data from the Service without prior written consent from Track My Books.

Track My Books may remove User Content that violates the above principles without prior notice.`,
  },
  {
    title: "5. Intellectual Property Rights",
    content: `All rights to the Service, including copyright to its graphic elements, software and databases, belong to Track My Books or the entities that have granted licenses.

Users grant Track My Books a non-exclusive, non-transferable license to use their User Content for the purpose of providing and promoting the Service.

Users retain all intellectual property rights to their User Content and may remove it at any time.`,
  },
  {
    title: "6. Liability",
    content: `Track My Books is not liable for the content posted by Users.

The Service is provided "as is". Track My Books makes every effort to ensure its availability and proper functioning, but does not guarantee uninterrupted access.`,
  },
  {
    title: "7. Changes to the Terms",
    content: `Track My Books reserves the right to change the Terms. Users will be informed of significant changes via email with at least 14 days' advance notice.

Continued use of the Service after the changes take effect constitutes acceptance of the revised Terms. Users who do not accept the changes have the right to delete their Account.`,
  },
  {
    title: "8. Final Provisions",
    content: `The Terms are governed by Polish law. Any disputes will be resolved by the court with jurisdiction over the headquarters of Track My Books, subject to consumer protection regulations.

In matters not covered by the Terms, the applicable provisions of the Civil Code and the Act on Electronic Services will apply.

The Terms enter into force on January 1, 2025.`
  },
];

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <div className="inner-page legal-page">
        <div className="legal-header">
          <div className="page-eyebrow"><span className="eyebrow-line" />Legal Documents<span className="eyebrow-line" /></div>
          <h1 className="page-title">Service Terms</h1>
          <p className="page-subtitle">Effective January 1, 2025 · Version 3.1</p>
          <div className="legal-meta-row">
            <span className="legal-meta-tag">📄 Legal Document</span>
            <Link href="/privacy?tab=privacy" className="legal-also-link">Also see: Privacy Policy →</Link>
          </div>
        </div>

        <div className="legal-layout">
          {/* TOC */}
          <aside className="legal-toc">
            <div className="legal-toc-title">Table of Contents</div>
            <ul className="legal-toc-list">
              {SECTIONS.map(s => (
                <li key={s.title}>
                  <a href={`#${s.title}`} className="legal-toc-link">{s.title}</a>
                </li>
              ))}
            </ul>
          </aside>

          {/* Content */}
          <div className="legal-content">
            {SECTIONS.map(s => (
              <section className="legal-section" key={s.title} id={s.title}>
                <h2 className="legal-section-title">{s.title}</h2>
                <div className="legal-body">
                  {s.content.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}
                </div>
              </section>
            ))}
            <div className="legal-footer-note">
              Questions? <Link href="/contact">Contact us.</Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}