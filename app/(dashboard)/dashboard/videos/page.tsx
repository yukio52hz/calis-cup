import { title } from "@/components/primitives";

export default function MyVideosPage() {
  return (
    <section className="flex flex-col gap-4 py-8">
      <h1 className={title({ size: "sm" })}>Mis videos</h1>
      <p className="text-muted">Disponible cuando empiece el torneo.</p>
    </section>
  );
}
