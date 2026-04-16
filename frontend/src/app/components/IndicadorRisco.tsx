type NivelRisco = 'alto' | 'medio' | 'controlado';

interface IndicadorRiscoProps {
  nivel: NivelRisco;
  label?: string;
}

const cores = {
  alto: 'bg-[#FF3B30] text-white',
  medio: 'bg-[#FF9500] text-white',
  controlado: 'bg-[#34C759] text-white'
};

const labels = {
  alto: 'Alto',
  medio: 'Médio',
  controlado: 'Controlado'
};

export function IndicadorRisco({ nivel, label }: IndicadorRiscoProps) {
  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${cores[nivel]}`}>
      <span className="w-2 h-2 rounded-full bg-current" />
      {label || labels[nivel]}
    </span>
  );
}
