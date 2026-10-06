import { Building2, Car, HardHat, Ship, Wrench, Zap } from 'lucide-react';
import ServiceArt from './ServiceArt.jsx';

const ICONS = { Building2, Ship, HardHat, Zap, Wrench, Car };

export default function ServiceCard({ service, onEnquire }) {
  const Icon = ICONS[service.icon] ?? Building2;

  return (
    <article className="glass group flex h-full flex-col overflow-hidden rounded-2xl transition-colors duration-300 hover:border-gold-400/60">
      <div className="relative aspect-[16/10] overflow-hidden">
        <ServiceArt id={service.id} />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-navy-900/90 to-transparent" aria-hidden="true" />
        <span className="absolute bottom-3 left-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gold-500/50 bg-navy-950/80 text-gold-300">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-2xl leading-snug text-pearl">{service.title}</h3>
        <p className="mt-3 flex-1 text-[0.95rem] leading-relaxed text-mist">{service.description}</p>
        <button
          type="button"
          className="btn-outline mt-6 w-full"
          onClick={() => onEnquire(service.title)}
          aria-label={`Enquire now about ${service.title}`}
        >
          ENQUIRE NOW
        </button>
      </div>
    </article>
  );
}
