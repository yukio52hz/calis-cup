// §22: puntos según la posición, con la tabla configurada en el torneo.
// Los empates comparten posición y, por lo tanto, puntos.
export type PointsConfig = { pointsByPosition: number[]; pointsBeyond: number };

export function pointsFor(position: number, config: PointsConfig) {
  return config.pointsByPosition[position - 1] ?? config.pointsBeyond;
}
