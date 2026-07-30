type Props = {
  titre: string;
  valeur: number;
  icone: string;
  couleur?: string;
};

export default function StatsCard({ titre, valeur, icone, couleur = "#e94560" }: Props) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">{titre}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-primary">{valeur}</p>
        </div>
        <span aria-hidden="true" className="rounded-xl p-3 text-2xl" style={{ color: couleur, backgroundColor: `${couleur}16` }}>{icone}</span>
      </div>
    </div>
  );
}
