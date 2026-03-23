import Link from "next/link"

export function Navbar() {
    return (
        <nav>
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/"> <h1>Track My Books</h1></Link>
                <div>
                    <Link href="/books" className="navButton">Books</Link>
                    <Link href="/recommendations" className="navButton">Recommendations</Link>
                </div>
                <div>
                    <Link href="/login" className="navButton">Log in</Link>
                    <Link href="/signup" className="navButton">Sign up</Link>
                </div>
            </div>
        </nav>
    );
}