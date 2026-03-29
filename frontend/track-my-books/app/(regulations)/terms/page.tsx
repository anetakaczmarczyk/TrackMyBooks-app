import { Footer } from "@/_components/Footer";
import {Navbar} from "@/_components/Navbar";
import Link from "next/link";
const SECTIONS = [
  {
    title: "1. Postanowienia ogólne",
    content: `Niniejszy Regulamin określa zasady korzystania z serwisu Track My Books, dostępnego pod adresem trackmybooks.pl.

Operatorem Serwisu jest Track My Books sp. z o.o. z siedzibą w Krakowie, ul. Literacka 12/4, 00-000 Kraków, wpisana do Krajowego Rejestru Sądowego pod numerem KRS 0000000000.

Korzystanie z Serwisu oznacza akceptację niniejszego Regulaminu. Jeżeli nie zgadzasz się z jego postanowieniami, prosimy o zaprzestanie korzystania z Serwisu.`,
  },
  {
    title: "2. Definicje",
    content: `Serwis – platforma internetowa Track My Books dostępna pod adresem trackmybooks.pl.

Użytkownik – każda osoba fizyczna posiadająca pełną zdolność do czynności prawnych, która zarejestrowała Konto w Serwisie.

Konto – zbiór zasobów i uprawnień przypisanych Użytkownikowi w ramach Serwisu, identyfikowany adresem e-mail i zabezpieczony hasłem.

Treści Użytkownika – wszelkie materiały zamieszczane przez Użytkownika w Serwisie, w tym recenzje, oceny i listy lektur.`,
  },
  {
    title: "3. Rejestracja i konto",
    content: `Rejestracja w Serwisie jest dobrowolna i bezpłatna. Użytkownik może zarejestrować jedno Konto.

Użytkownik zobowiązany jest do podania prawdziwych danych podczas rejestracji oraz do ich aktualizacji w razie zmiany.

Użytkownik ponosi wyłączną odpowiedzialność za poufność swoich danych dostępowych. O każdym nieautoryzowanym dostępie do Konta należy niezwłocznie poinformować Track My Books.

Track My Books zastrzega sobie prawo do zawieszenia lub usunięcia Konta w przypadku naruszenia Regulaminu.`,
  },
  {
    title: "4. Zasady korzystania z Serwisu",
    content: `Użytkownik zobowiązuje się korzystać z Serwisu zgodnie z obowiązującymi przepisami prawa, normami społecznymi i zasadami współżycia społecznego.

Zabrania się w szczególności: zamieszczania treści bezprawnych, obraźliwych, naruszających prawa własności intelektualnej osób trzecich; prowadzenia działalności spamowej lub phishingowej; podejmowania prób nieuprawnionego dostępu do systemów informatycznych Serwisu; automatycznego pobierania danych z Serwisu bez uprzedniej pisemnej zgody Track My Books.

Track My Books może usuwać Treści Użytkownika naruszające powyższe zasady bez uprzedniego powiadomienia.`,
  },
  {
    title: "5. Prawa własności intelektualnej",
    content: `Wszelkie prawa do Serwisu, w tym prawa autorskie do jego elementów graficznych, oprogramowania i baz danych, należą do Track My Books lub podmiotów, które udzieliły licencji.

Użytkownik udziela Track My Books nieodpłatnej, niewyłącznej, nieograniczonej terytorialnie licencji na korzystanie z Treści Użytkownika w celu świadczenia i promowania usług Serwisu.

Użytkownik zachowuje prawa autorskie do swoich Treści i może je usunąć w dowolnym momencie.`,
  },
  {
    title: "6. Odpowiedzialność",
    content: `Track My Books nie ponosi odpowiedzialności za treści zamieszczane przez Użytkowników.

Serwis dostarczany jest w stanie „takim, jaki jest". Track My Books dokłada wszelkich starań, aby zapewnić jego dostępność i prawidłowe działanie, jednak nie gwarantuje nieprzerwanego dostępu.`,
  },
  {
    title: "7. Zmiany Regulaminu",
    content: `Track My Books zastrzega sobie prawo do zmiany Regulaminu. Użytkownicy zostaną poinformowani o istotnych zmianach drogą e-mailową z co najmniej 14-dniowym wyprzedzeniem.

Dalsze korzystanie z Serwisu po wejściu zmian w życie oznacza ich akceptację. Użytkownik, który nie akceptuje zmian, ma prawo do usunięcia Konta.`,
  },
  {
    title: "8. Postanowienia końcowe",
    content: `Regulamin podlega prawu polskiemu. Wszelkie spory rozstrzygane będą przez sąd właściwy dla siedziby Track My Books, z zastrzeżeniem przepisów o ochronie konsumentów.

W sprawach nieuregulowanych Regulaminem stosuje się przepisy Kodeksu cywilnego oraz ustawy o świadczeniu usług drogą elektroniczną.

Regulamin wchodzi w życie z dniem 1 stycznia 2025 r.`
  },
];

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <div className="inner-page legal-page">
        <div className="legal-header">
          <div className="page-eyebrow"><span className="eyebrow-line" />Dokumenty prawne<span className="eyebrow-line" /></div>
          <h1 className="page-title">Regulamin serwisu</h1>
          <p className="page-subtitle">Obowiązuje od 1 stycznia 2025 r. · Wersja 3.1</p>
          <div className="legal-meta-row">
            <span className="legal-meta-tag">📄 Dokument prawny</span>
            <Link href="/privacy?tab=privacy" className="legal-also-link">Zobacz też: Politykę prywatności →</Link>
          </div>
        </div>

        <div className="legal-layout">
          {/* TOC */}
          <aside className="legal-toc">
            <div className="legal-toc-title">Spis treści</div>
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
              Pytania? <Link href="/contact">Skontaktuj się z nami.</Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}