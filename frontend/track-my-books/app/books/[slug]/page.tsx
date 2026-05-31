import { Review } from "@/_components/Review";
import BookDetail from "./bookDetail";
import { BookByIdResponse } from "@/_components/bookInterface";

// Funkcja pobierająca szczegółowe dane książki z backendu.
async function fetchBookByIndex(slug: number): Promise<BookByIdResponse | null> {
  try {

    const response = await fetch("http://book-service:5000/api/books/bookById", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId: slug }),
    });

    if (!response.ok) {
      console.warn("API Error:", response.status);
      return null;
    }

    const data = await response.json();
    
    // API Hardcover czasami zwraca tablicę jednoelementową lub płaski obiekt - ujednolicamy strukturę
    return Array.isArray(data) ? (data[0] || null) : (data || null);

  } catch (error) {
    console.error("BŁĄD FETCH w fetchBookByIndex:", error);
    return null;
  }
}

// Pobieranie recenzji powiązanych z książką po stronie serwera
async function fetchBookReviews(externalBookId: number): Promise<Review[] | []> {
  try {
    const response = await fetch(`http://book-service:5000/api/reviews/book/${externalBookId}`);
    if (!response.ok) {
      console.warn("API Error:", response.status);
      return [];
    }
    const data = await response.json();
    return Array.isArray(data) ? data : (data || []);
  } catch (error) {
    console.error("Fetch error in fetchBookReviews:", error);
    return [];
  }
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  const book = await fetchBookByIndex(parseInt(slug));
  const reviews = await fetchBookReviews(parseInt(slug));

  if (!book) return <div className="inner-page">Book not found.</div>;

  // Przekazanie wstępnie przygotowanych danych do interaktywnego komponentu klienckiego
  return <BookDetail bookbyId={book} reviews={reviews} />;
}