import { title } from "@/components/primitives";
import { listPublicTournaments } from "@/features/tournaments/server/queries";

export default async function TournamentsPage() {
  const tournaments = await listPublicTournaments();

  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 md:px-6">
      <h1 className={title()}>Torneos</h1>
      {tournaments.length === 0 ? (
        <p className="text-muted">Todavía no hay torneos publicados.</p>
      ) : (
        <ul>
          {tournaments.map((t) => (
            <li key={t.id}>{t.name}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
