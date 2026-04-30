import BookDetail from "./bookDetail";
import { BookByIdResponse } from "@/_components/bookInterface";


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
    
    return Array.isArray(data) ? (data[0] || null) : (data || null);

  } catch (error) {
    console.error("BŁĄD FETCH w fetchBookByIndex:", error);
    return null;
  }
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = await fetchBookByIndex(parseInt(slug));

  if (!book) return <div className="inner-page">Book not found.</div>;

  return <BookDetail bookbyId={book} />;
}