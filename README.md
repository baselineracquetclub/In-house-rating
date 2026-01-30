# In-House Matchplay Ratings (Next.js + Neon + Vercel)

Singles-only, UTR-style rating updates from final game score. Supports:
- Timed matches (final games only)
- 1 set to 4 (win by 2)
- 1 set to 6 (win by 2)
- Adjustable rating parameters (K, D, ramp, min games)
- Phone-friendly match entry with Favorites + Recents (stored on-device)

## 1) Create a Neon Postgres DB
- Create a Neon project and copy the connection string.

## 2) Set env var
Create a `.env` locally:
```
DATABASE_URL="postgresql://...your neon string...&sslmode=require"
```

## 3) Install + migrate + seed
```
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Open http://localhost:3000

## 4) Deploy to Vercel
- Push this repo to GitHub
- Import repo in Vercel
- Add env var in Vercel Project Settings:
  - DATABASE_URL = your Neon connection string
- Deploy

### Production DB migration + seed
From your local machine (or GitHub Codespaces), with DATABASE_URL set to production:
```
npx prisma migrate deploy
npx prisma db seed
```

## Android use
- Open the deployed site in Chrome
- Tap ⋮ → Add to Home screen

## Notes
- Ratings update immediately when a match is saved.
- The set formats enforce target games + win-by (defaults win-by-2).
- Favorites/Recents are saved in browser localStorage (device-specific).
