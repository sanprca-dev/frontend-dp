export default function EstadoBadge({ estado }: { estado: string }) {
  const normalized = estado.toUpperCase();
  const className = normalized.includes('PROCESO')
    ? 'status status-progress'
    : normalized.includes('RESPUESTA') || normalized.includes('ATENDIDO')
      ? 'status status-done'
      : 'status status-neutral';
  return <span className={className}>{estado}</span>;
}
