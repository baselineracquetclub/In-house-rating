"use client";

import { useEffect, useMemo, useState } from "react";
import { fmt } from "@/lib/utils";

type Player = { id: string; name: string; rating: number; matchesPlayed: number };
type Format = { id: string; name: string; kind: "TIMED" | "ONE_SET"; targetGames: number | null; winBy: number };
type Match = {
  id: string;
  playedAt: string;
  gamesA: number;
  gamesB: number;
  expectedA: number;
  actualA: number;
  deltaA: number;
  playerA: { id: string; name: string };
  playerB: { id: string; name: string };
  format: { id: string; name: string };
};

const LS_FAV = "ih_favorites_v1";
const LS_RECENT = "ih_recents_v1";

function loadIds(key: string): string[] {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}
function saveIds(key: string, ids: string[]) {
  localStorage.setItem(key, JSON.stringify(ids.slice(0, 24)));
}

export default function MatchesPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [formats, setFormats] = useState<Format[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recents, setRecents] = useState<string[]>([]);

  const [playerAId, setPlayerAId] = useState("");
  const [playerBId, setPlayerBId] = useState("");
  const [formatId, setFormatId] = useState("");
  const [gamesA, setGamesA] = useState<number>(0);
  const [gamesB, setGamesB] = useState<number>(0);

  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    const p = await fetch("/api/players", { cache: "no-store" }).then(r => r.json());
    setPlayers(p.players);
    const f = await fetch("/api/formats", { cache: "no-store" }).then(r => r.json());
    setFormats(f.formats);
    const m = await fetch("/api/matches", { cache: "no-store" }).then(r => r.json());
    setMatches(m.matches);
  }

  useEffect(() => {
    load();
    setFavorites(loadIds(LS_FAV));
    setRecents(loadIds(LS_RECENT));
  }, []);

  useEffect(() => {
    if (!formatId && formats.length) setFormatId(formats[0].id);
  }, [formats, formatId]);

  const playerById = useMemo(() => new Map(players.map(p => [p.id, p])), [players]);

  const favoritePlayers = useMemo(
    () => favorites.map(id => playerById.get(id)).filter(Boolean) as Player[],
    [favorites, playerById]
  );
  const recentPlayers = useMemo(
    () => recents.map(id => playerById.get(id)).filter(Boolean) as Player[],
    [recents, playerById]
  );

  function toggleFavorite(id: string) {
    const next = favorites.includes(id) ? favorites.filter(x => x !== id) : [id, ...favorites];
    setFavorites(next);
    saveIds(LS_FAV, next);
  }

  function pushRecent(id: string) {
    const next = [id, ...recents.filter(x => x !== id)];
    setRecents(next);
    saveIds(LS_RECENT, next);
  }

  function pickA(id: string) { setPlayerAId(id); pushRecent(id); }
  function pickB(id: string) { setPlayerBId(id); pushRecent(id); }

  const format = useMemo(() => formats.find(f => f.id === formatId) ?? null, [formats, formatId]);

  async function submit() {
    setErr(null); setMsg(null);
    if (!playerAId || !playerBId) return setErr("Pick both players.");
    if (playerAId === playerBId) return setErr("Players must be different.");
    const res = await fetch("/api/matches", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ playerAId, playerBId, formatId, gamesA: Number(gamesA), gamesB: Number(gamesB) }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setErr(data.error ?? "Failed to save match.");
    setMsg("Match saved. Ratings updated.");
    setGamesA(0); setGamesB(0);
    pushRecent(playerAId); pushRecent(playerBId);
    await load();
  }

  function PlayerChip({ p, onPick, selectedId }: { p: Player; onPick: (id: string) => void; selectedId: string }) {
    const selected = p.id === selectedId;
    return (
      <button
        className={selected ? "" : "secondary"}
        onClick={() => onPick(p.id)}
        style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}
      >
        <span style={{ textAlign: "left" }}>
          <div style={{ fontWeight: 600 }}>{p.name}</div>
          <small className="muted">R {fmt(p.rating)} · {p.matchesPlayed} matches</small>
        </span>
        <span
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(p.id); }}
          className="badge"
          style={{ userSelect: "none" }}
          title="Toggle favorite"
        >
          {favorites.includes(p.id) ? "★" : "☆"}
        </span>
      </button>
    );
  }

  const searchList = useMemo(() => players.slice(0, 150), [players]); // already sorted by rating

  return (
    <div className="row">
      <div className="card">
        <h1>Enter Match</h1>
        <small className="muted">
          Timed: enter final games only. One-set formats enforce target games + win-by. Favorites and recents are stored on this device.
        </small>

        <div style={{ height: 12 }} />

        <div className="row2">
          <div className="card">
            <h3>Player A</h3>
            {favoritePlayers.length > 0 && <small className="muted">Favorites</small>}
            <div className="row" style={{ marginTop: 8 }}>
              {favoritePlayers.slice(0, 6).map(p => (
                <PlayerChip key={p.id} p={p} onPick={pickA} selectedId={playerAId} />
              ))}
            </div>

            {recentPlayers.length > 0 && <div style={{ height: 10 }} />}
            {recentPlayers.length > 0 && <small className="muted">Recents</small>}
            <div className="row" style={{ marginTop: 8 }}>
              {recentPlayers.slice(0, 6).map(p => (
                <PlayerChip key={p.id} p={p} onPick={pickA} selectedId={playerAId} />
              ))}
            </div>

            <div style={{ height: 10 }} />
            <small className="muted">Search</small>
            <select value={playerAId} onChange={(e) => pickA(e.target.value)}>
              <option value="">Select Player A…</option>
              {searchList.map(p => (
                <option key={p.id} value={p.id}>{p.name} (R {fmt(p.rating)})</option>
              ))}
            </select>
          </div>

          <div className="card">
            <h3>Player B</h3>
            {favoritePlayers.length > 0 && <small className="muted">Favorites</small>}
            <div className="row" style={{ marginTop: 8 }}>
              {favoritePlayers.slice(0, 6).map(p => (
                <PlayerChip key={p.id} p={p} onPick={pickB} selectedId={playerBId} />
              ))}
            </div>

            {recentPlayers.length > 0 && <div style={{ height: 10 }} />}
            {recentPlayers.length > 0 && <small className="muted">Recents</small>}
            <div className="row" style={{ marginTop: 8 }}>
              {recentPlayers.slice(0, 6).map(p => (
                <PlayerChip key={p.id} p={p} onPick={pickB} selectedId={playerBId} />
              ))}
            </div>

            <div style={{ height: 10 }} />
            <small className="muted">Search</small>
            <select value={playerBId} onChange={(e) => pickB(e.target.value)}>
              <option value="">Select Player B…</option>
              {searchList.map(p => (
                <option key={p.id} value={p.id}>{p.name} (R {fmt(p.rating)})</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ height: 12 }} />

        <div className="row3">
          <div>
            <small className="muted">Format</small>
            <select value={formatId} onChange={(e) => setFormatId(e.target.value)}>
              {formats.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
            {format && (
              <div style={{ marginTop: 6 }}>
                <span className="badge">
                  {format.kind === "TIMED" ? "TIMED" : `ONE_SET to ${format.targetGames} (win by ${format.winBy})`}
                </span>
              </div>
            )}
          </div>
          <div>
            <small className="muted">Games A</small>
            <input type="number" value={gamesA} onChange={(e) => setGamesA(Number(e.target.value))} />
          </div>
          <div>
            <small className="muted">Games B</small>
            <input type="number" value={gamesB} onChange={(e) => setGamesB(Number(e.target.value))} />
          </div>
        </div>

        <div style={{ height: 12 }} />
        <button onClick={submit}>Save match + update ratings</button>

        {msg && <div style={{ marginTop: 10 }}><small className="muted">{msg}</small></div>}
        {err && <div style={{ marginTop: 10 }}><small className="muted">{err}</small></div>}
      </div>

      <div className="card">
        <h2>Recent Matches</h2>
        <small className="muted">Last 30 (delta shown from Player A perspective).</small>
        <div style={{ height: 10 }} />
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Match</th>
              <th>Format</th>
              <th>Score</th>
              <th>ΔA</th>
            </tr>
          </thead>
          <tbody>
            {matches.map(m => (
              <tr key={m.id}>
                <td>{new Date(m.playedAt).toLocaleString()}</td>
                <td>{m.playerA.name} vs {m.playerB.name}</td>
                <td>{m.format.name}</td>
                <td>{m.gamesA}-{m.gamesB}</td>
                <td>{fmt(m.deltaA, 3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
