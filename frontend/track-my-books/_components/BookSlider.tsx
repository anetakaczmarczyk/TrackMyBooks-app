import { useState, useRef, useEffect } from "react";
import { BookCard } from "@/_components/BookCard";
import { Book } from "@/_components/bookInterface";

export function Slider({ title, books, badge }: { title: string; books: Book[]; badge?: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const scroll = (dir: "left" | "right") => {
    const t = trackRef.current;
    if (!t) return;
    t.scrollBy({ left: dir === "right" ? 340 : -340, behavior: "smooth" });
  };

  const checkScroll = () => {
    const t = trackRef.current;
    if (!t) return;
    setCanLeft(t.scrollLeft > 10);
    setCanRight(t.scrollLeft + t.clientWidth < t.scrollWidth - 10);
  };

  useEffect(() => {
    const t = trackRef.current;
    if (!t) return;
    t.addEventListener("scroll", checkScroll);
    checkScroll();
    return () => t.removeEventListener("scroll", checkScroll);
  }, []);

  return (
    <section className="slider-section">
      <div className="slider-header">
        <h2 className="slider-title">
          {title}
          {badge && <span className="badge">{badge}</span>}
        </h2>
      </div>
      <div className="slider-wrapper">
        {canLeft && (
          <button className="slider-btn left" onClick={() => scroll("left")}>‹</button>
        )}
        <div className="slider-track" ref={trackRef}>
          {books.map((b, index) => <BookCard key={index} book={b} />)}
        </div>
        {canRight && (
          <button className="slider-btn right" onClick={() => scroll("right")}>›</button>
        )}
      </div>
    </section>
  );
}