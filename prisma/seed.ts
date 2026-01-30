import { PrismaClient, FormatKind } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Settings (singleton)
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, baseK: 0.8, d: 2.0, rampMatches: 10, minGames: 6 },
  });

  // Default formats
  const defaults = [
    { name: "Timed (final games only)", kind: FormatKind.TIMED, targetGames: null, winBy: 1 },
    { name: "1 set to 4 (win by 2)", kind: FormatKind.ONE_SET, targetGames: 4, winBy: 2 },
    { name: "1 set to 6 (win by 2)", kind: FormatKind.ONE_SET, targetGames: 6, winBy: 2 },
  ];

  for (const f of defaults) {
    await prisma.matchFormat.upsert({
      where: { name: f.name },
      update: { kind: f.kind, targetGames: f.targetGames ?? undefined, winBy: f.winBy },
      create: f,
    });
  }

  // Seed 150 placeholder players if there aren't any
  const count = await prisma.player.count();
  if (count === 0) {
    const players = Array.from({ length: 150 }).map((_, i) => ({
      name: `Player ${String(i + 1).padStart(3, "0")}`,
      rating: 5.0,
      matchesPlayed: 0,
      isActive: true,
    }));
    await prisma.player.createMany({ data: players });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
