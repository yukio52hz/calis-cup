import { Card } from "@/components/ui/card";

export default function EnrollPage() {
  return (
    <div className="flex flex-col gap-4 py-6">
      <h1 className="font-display text-3xl uppercase leading-none">
        Inscripción
      </h1>
      <Card>
        <p className="text-muted">
          El formulario de inscripción con SINPE llega en la Fase 2.
        </p>
      </Card>
    </div>
  );
}
