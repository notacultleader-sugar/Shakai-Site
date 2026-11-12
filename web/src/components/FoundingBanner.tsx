import { FOUNDING_LIMIT } from "@/lib/plans";
import { getFoundingSpotsLeft } from "@/lib/viewer";

// "First 500 members keep these prices forever." Disappears once the spots are gone.
export async function FoundingBanner() {
  const left = await getFoundingSpotsLeft();
  if (left === 0) return null;
  const taken = left === null ? 0 : FOUNDING_LIMIT - left;
  return (
    <div className="card glow founding">
      <span className="pill y">Founding member price</span>
      <p className="h3">
        The first {FOUNDING_LIMIT} members <em>lock in these prices forever.</em>
      </p>
      <p className="small muted">Join now and your price never goes up, as long as you stay a member. Prices rise for new members after that.</p>
      {left !== null && (
        <div className="founding-count">
          <div className="bar" aria-hidden="true"><i style={{ width: `${Math.max(2, (taken / FOUNDING_LIMIT) * 100)}%` }} /></div>
          <span className="small"><b>{left}</b> of {FOUNDING_LIMIT} spots left</span>
        </div>
      )}
    </div>
  );
}
