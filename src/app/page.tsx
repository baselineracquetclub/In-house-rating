export default function Home() {
  return (
    <div className="card">
      <h1>In-House Matchplay Ratings</h1>
      <p style={{ marginTop: 6, color: "#d1d5db", lineHeight: 1.5 }}>
        Enter singles match scores (timed or 1-set formats). Ratings update immediately using a UTR-style
        model: expected % of games vs actual % of games.
      </p>
      <div className="row2" style={{ marginTop: 14 }}>
        <a className="card" href="/matches">
          <h3>Enter a match</h3>
          <small className="muted">Phone-friendly quick entry (recents + favorites).</small>
        </a>
        <a className="card" href="/leaderboard">
          <h3>Leaderboard</h3>
          <small className="muted">Top players by current rating.</small>
        </a>
      </div>
    </div>
  );
}
