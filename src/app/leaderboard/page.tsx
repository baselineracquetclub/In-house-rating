import { prisma } from "@/lib/db";
import { fmt } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Leaderboard() {
  const players = await prisma.player.findMany({
    where: { isActive: true },
    orderBy: [{ rating: "desc" }, { name: "asc" }],
    take: 50,
    select: { id: true, name: true, rating: true, matchesPlayed: true },
  });

  return (
    <div className="card">
      <h1>Leaderboard</h1>
      <small className="muted">Top 50 active players by current rating.</small>
      <div style={{ height: 10 }} />
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Player</th>
            <th>Rating</th>
            <th>Matches</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p, idx) => (
            <tr key={p.id}>
              <td>{idx + 1}</td>
              <td>{p.name}</td>
              <td>{fmt(p.rating)}</td>
              <td>{p.matchesPlayed}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
