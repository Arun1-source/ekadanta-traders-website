import {
  Building2,
  Car,
  HardHat,
  Ship,
  Wrench,
  Zap,
} from 'lucide-react';

const ICONS = {
  Building2,
  Ship,
  HardHat,
  Zap,
  Wrench,
  Car,
};

const SERVICE_IMAGES = {
  'Property Sale & Purchase': '/property-sale-purchase.jpg',
  'Import & Export': '/import-export.jpg',
  Construction: '/construction.jpg',
  'Utility Services': '/utility-services.jpg',
  'Contractor Services': '/contractor-services.jpg',
  'Car Sale & Purchase': '/car-sale-purchase.jpg',
};

export default function ServiceCard({
  service,
  onEnquire,
  onOpenService,
}) {
  const Icon = ICONS[service.icon] ?? Building2;
  const image = SERVICE_IMAGES[service.title];

  const handleOpenService = () => {
    onOpenService?.(service);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleOpenService();
    }
  };

  const handleEnquire = (event) => {
    event.stopPropagation();
    onEnquire(service.title);
  };

  return (
    <article
      className="glass group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:border-gold-400/60 hover:shadow-xl"
      onClick={handleOpenService}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View ${service.title} details`}
    >
      {/* SERVICE IMAGE */}
     <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={image}
          alt={service.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />

        {/* Dark overlay for premium look */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/15 to-transparent"
          aria-hidden="true"
        />

        {/* Service icon */}
        <span className="absolute bottom-4 left-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gold-500/50 bg-navy-950/80 text-gold-300 backdrop-blur">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>

        {/* View more label */}
        <span className="absolute right-4 bottom-4 rounded-full border border-gold-500/40 bg-navy-950/80 px-3 py-1.5 text-xs font-medium tracking-wide text-gold-300 backdrop-blur">
          VIEW MORE →
        </span>
      </div>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-2xl leading-snug text-pearl">
          {service.title}
        </h3>

        <p className="mt-3 flex-1 text-[0.95rem] leading-relaxed text-mist">
          {service.description}
        </p>

        <button
          type="button"
          className="btn-outline mt-6 w-full"
          onClick={handleEnquire}
          aria-label={`Enquire now about ${service.title}`}
        >
          ENQUIRE NOW
        </button>
      </div>
    </article>
  );
}
