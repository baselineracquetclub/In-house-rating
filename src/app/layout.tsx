import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "In-House Matchplay Ratings",
  description: "UTR-style in-house rating system (singles) with adjustable match formats.",
  manifest: "/manifest.json",
  themeColor: "#0b0b10",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <div className="nav">
            <a href="/">Home</a>
            <a href="/matches">Enter Match</a>
            <a href="/leaderboard">Leaderboard</a>
            <a href="/players">Players</a>
            <a href="/settings">Settings</a>
          </div>
          {children}
          <div style={{ height: 18 }} />
          <small className="muted">
            Tip: On Android Chrome, use <span className="kbd">⋮</span> → <span className="kbd">Add to Home screen</span>.
          </small>
        </div>
      </body>
    </html>
  );
}
