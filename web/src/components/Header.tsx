import Link from "next/link";
import { getViewer } from "@/lib/viewer";

export function Mark() {
  return (
    <span className="mark" aria-hidden="true"><i className="f" /><i className="k" /></span>
  );
}

export async function Header() {
  const v = await getViewer();
  return (
    <header className="top">
      <div className="wrap">
        <Link href="/" className="brand" aria-label="Shakai Barber Academy home">
          <Mark />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="wordmark" src="/brand/wordmark.png" alt="" width={107} height={15} />
        </Link>
        <nav className="nav">
          <Link href="/library">Lessons</Link>
          {v.signedIn ? <Link href="/account">Account</Link> : <Link href="/login">Sign in</Link>}
          {v.tier !== "pro" && (
            <Link href="/join" className="btn">{v.tier === "free" ? "Join" : "Upgrade"}</Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <span>© {new Date().getFullYear()} Shakai Barber Academy · by Society Barbers</span>
        <nav>
          <Link href="/library">Lessons</Link>
          <Link href="/join">Plans</Link>
          <a href="https://www.instagram.com/shakaiacademy" target="_blank" rel="noopener">Instagram</a>
          <a href="https://www.youtube.com/@shakaiacademy" target="_blank" rel="noopener">YouTube</a>
          <a href="mailto:hello@shakaiacademy.com">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
