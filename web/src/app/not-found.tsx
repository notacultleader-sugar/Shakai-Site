import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap">
      <div className="auth">
        <span className="eyebrow"><i />404</span>
        <h1 className="h2">Missed a <em>spot.</em></h1>
        <p className="muted">That page isn&apos;t here. It may have moved.</p>
        <Link className="btn" href="/library">Go to lessons</Link>
      </div>
    </div>
  );
}
